import path from "node:path";
import { EventEmitter } from "node:events";
import { fileURLToPath } from "node:url";
import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  type WASocket,
  type proto,
} from "@whiskeysockets/baileys";
import { config } from "../config.js";
import { getLogger } from "../lib/logger.js";
import { attachMessageHandler } from "../services/messageProcessor.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logger = getLogger("whatsapp");

export type SessionStatus = "disconnected" | "connecting" | "connected";

type QrCallback = (qr: string) => void;
type StatusCallback = (status: SessionStatus) => void;

let sock: WASocket | null = null;
let currentQr: string | null = null;
let currentPairingCode: string | null = null;
let currentStatus: SessionStatus = "disconnected";
const statusListeners = new Set<StatusCallback>();
const qrListeners = new Set<QrCallback>();

function setStatus(status: SessionStatus) {
  if (currentStatus === status) return;
  currentStatus = status;
  statusListeners.forEach((cb) => cb(status));
  logger.info(`Session status: ${status}`);
}

function setQr(qr: string | null) {
  currentQr = qr;
  if (qr) qrListeners.forEach((cb) => cb(qr));
}

function clearPairingState() {
  currentQr = null;
  currentPairingCode = null;
}

export function getSessionStatus(): SessionStatus {
  return currentStatus;
}

export function getCurrentQr(): string | null {
  return currentQr;
}

export function getCurrentPairingCode(): string | null {
  return currentPairingCode;
}

function setPairingCode(code: string | null) {
  currentPairingCode = code;
}

export function onStatusChange(cb: StatusCallback): () => void {
  statusListeners.add(cb);
  return () => statusListeners.delete(cb);
}

export function onQr(cb: QrCallback): () => void {
  qrListeners.add(cb);
  return () => qrListeners.delete(cb);
}

export type BaileysClient = {
  on: (ev: string, fn: (msg: WaMessage) => void) => void;
  sendMessage: (chatId: string, text: string) => Promise<unknown>;
  info?: { wid?: { user?: string } };
};

type WaMessage = {
  from: string;
  fromMe: boolean;
  body: string;
  id: { _serialized?: string };
  timestamp: number;
  chat?: { id?: { _serialized?: string }; name?: string; isGroup?: boolean };
};

/** Baileys socket sets info when connection opens; WASocket types omit it. */
type SocketWithInfo = WASocket & { info?: { id?: string } };

export function getClient(): BaileysClient | null {
  if (!sock) return null;
  const s = sock as SocketWithInfo;
  const info = s.info;
  return {
    on: (ev: string, fn: (msg: WaMessage) => void) => {
      messageEmitter.on(ev, fn);
    },
    sendMessage: (chatId: string, text: string) =>
      sock!.sendMessage(chatId, { text }),
    info: info
      ? {
          wid: {
            user: String(info.id ?? "")
              .split(":")[0] ?? "",
          },
        }
      : undefined,
  };
}

const messageEmitter = new EventEmitter();
messageEmitter.setMaxListeners(20);

function baileysToWaMessage(m: proto.IWebMessageInfo): WaMessage {
  const key = m.key!;
  const remoteJid = key.remoteJid ?? "";
  const participant = key.participant ?? remoteJid;
  const fromMe = key.fromMe ?? false;
  const msgId = key.id ?? "";
  const msg = m.message;
  let body = "";
  if (msg?.conversation) body = msg.conversation;
  else if (msg?.extendedTextMessage?.text) body = msg.extendedTextMessage.text;
  const timestamp = Number(m.messageTimestamp ?? 0);
  const chatId = remoteJid;
  return {
    from: fromMe ? remoteJid : participant,
    fromMe,
    body,
    id: { _serialized: msgId },
    timestamp,
    chat: {
      id: { _serialized: chatId },
      name: m.pushName ?? undefined,
      isGroup: remoteJid.endsWith("@g.us"),
    },
  };
}

async function createSocket(phoneNumber?: string): Promise<WASocket> {
  const backendDir = path.resolve(__dirname, "..", "..");
  const authPath = path.resolve(backendDir, ".baileys_auth");
  const { state, saveCreds } = await useMultiFileAuthState(authPath);
  logger.info(`Baileys auth path: ${authPath}`);

  const socket = makeWASocket({
    auth: state,
    printQRInTerminal: false,
  });

  socket.ev.on("creds.update", saveCreds);

  socket.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      logger.info(`QR received, length=${qr.length}`);
      setQr(qr);
      setStatus("connecting");
    }

    if (connection === "connecting" && phoneNumber && !currentPairingCode) {
      try {
        const code = await socket.requestPairingCode(phoneNumber);
        logger.info(`Pairing code received: ${code}`);
        setPairingCode(code);
        setStatus("connecting");
      } catch (err) {
        logger.error("Pairing code request failed", { err });
      }
    }

    if (connection === "close") {
      clearPairingState();
      setStatus("disconnected");
      const statusCode = (lastDisconnect?.error as { output?: { statusCode?: number } })?.output?.statusCode;
      if (statusCode === DisconnectReason.loggedOut) {
        logger.info("Logged out");
      } else if (statusCode !== DisconnectReason.connectionClosed) {
        logger.warn(`Connection closed: ${statusCode}`);
      }
    }

    if (connection === "open") {
      clearPairingState();
      setStatus("connected");
      const ownerId = (socket as SocketWithInfo).info?.id;
      const ownerNumber: string =
        typeof ownerId === "string"
          ? ownerId.split(":")[0] ?? ""
          : "";
      socket.ev.on("messages.upsert", (data) => {
        if (data.type !== "notify") return;
        for (const m of data.messages) {
          if (!m.message) continue;
          const waMsg = baileysToWaMessage(m);
          if (waMsg.body) messageEmitter.emit("message_create", waMsg);
        }
      });
      const adapter: BaileysClient = {
        on: (ev, fn) => messageEmitter.on(ev, fn),
        sendMessage: (chatId, text) => socket.sendMessage(chatId, { text }),
        info: { wid: { user: ownerNumber } },
      };
      attachMessageHandler(adapter, ownerNumber);
      logger.info("WhatsApp client ready");
    }
  });

  return socket;
}

export async function initWhatsAppClient(): Promise<void> {
  if (sock) return;

  sock = await createSocket();
  setStatus("connecting");
  // QR flow: el socket emitirá QR en connection.update; la ruta usa waitForQr()
}

export async function initWhatsAppClientWithPairing(
  phoneNumber: string
): Promise<void> {
  const normalized = phoneNumber.replace(/\D/g, "");
  if (!normalized || normalized.length < 10) {
    throw new Error("Número de teléfono inválido");
  }

  if (sock) {
    try {
      sock.end(undefined);
    } catch {
      /* ignore */
    }
    sock = null;
  }

  sock = await createSocket(normalized);
  setStatus("connecting");

  const waitForCodeOrConnected = (): Promise<void> =>
    new Promise((resolve, reject) => {
      const check = () => {
        if (currentStatus === "connected") return resolve();
        if (currentPairingCode) return resolve();
        if (currentStatus === "disconnected")
          return reject(new Error("Connection failed"));
        setTimeout(check, 500);
      };
      check();
    });

  await Promise.race([
    waitForCodeOrConnected(),
    new Promise<never>((_, rej) =>
      setTimeout(() => rej(new Error("Timeout esperando código")), 60000)
    ),
  ]);
}

export async function destroyClient(): Promise<void> {
  if (!sock) return;
  try {
    sock.end(undefined);
  } catch {}
  sock = null;
  clearPairingState();
  setStatus("disconnected");
}
