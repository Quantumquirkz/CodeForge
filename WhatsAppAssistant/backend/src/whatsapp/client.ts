import path from "node:path";
import { createRequire } from "node:module";
import { config } from "../config.js";
import { getLogger } from "../lib/logger.js";
import { attachMessageHandler } from "../services/messageProcessor.js";

const require = createRequire(import.meta.url);
const { Client, LocalAuth } = require("whatsapp-web.js");

const logger = getLogger("whatsapp");

export type SessionStatus = "disconnected" | "connecting" | "connected";

type QrCallback = (qr: string) => void;
type StatusCallback = (status: SessionStatus) => void;

let clientInstance: InstanceType<typeof Client> | null = null;
let currentQr: string | null = null;
let currentStatus: SessionStatus = "disconnected";
const statusListeners: Set<StatusCallback> = new Set();
const qrListeners: Set<QrCallback> = new Set();

function setStatus(status: SessionStatus) {
  if (currentStatus === status) return;
  currentStatus = status;
  statusListeners.forEach((cb) => cb(status));
  logger.info("Session status: %s", status);
}

function setQr(qr: string | null) {
  currentQr = qr;
  if (qr) qrListeners.forEach((cb) => cb(qr));
}

export function getSessionStatus(): SessionStatus {
  return currentStatus;
}

export function getCurrentQr(): string | null {
  return currentQr;
}

export function onStatusChange(cb: StatusCallback): () => void {
  statusListeners.add(cb);
  return () => statusListeners.delete(cb);
}

export function onQr(cb: QrCallback): () => void {
  qrListeners.add(cb);
  return () => qrListeners.delete(cb);
}

export function getClient(): InstanceType<typeof Client> | null {
  return clientInstance;
}

export async function initWhatsAppClient(): Promise<InstanceType<typeof Client>> {
  if (clientInstance) return clientInstance;

  const dataPath = path.resolve(process.cwd(), config.waSessionPath);
  const client = new Client({
    authStrategy: new LocalAuth({ dataPath }),
    puppeteer: {
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
  });

  client.on("qr", (qr: string) => {
    setQr(qr);
    setStatus("connecting");
  });

  client.on("ready", () => {
    setQr(null);
    setStatus("connected");
    const ownerNumber = (client as unknown as { info?: { wid?: { user?: string } } }).info?.wid?.user ?? "";
    attachMessageHandler(client as Parameters<typeof attachMessageHandler>[0], ownerNumber);
    logger.info("WhatsApp client ready");
  });

  client.on("authenticated", () => {
    setQr(null);
    logger.info("WhatsApp authenticated");
  });

  client.on("auth_failure", (msg: string) => {
    setQr(null);
    setStatus("disconnected");
    logger.error("WhatsApp auth failure: %s", msg);
  });

  client.on("disconnected", (reason: string) => {
    setQr(null);
    setStatus("disconnected");
    logger.warn("WhatsApp disconnected: %s", reason);
    setTimeout(() => {
      if (clientInstance && getSessionStatus() === "disconnected") {
        logger.info("Attempting reconnection...");
        client.initialize().catch((err) => logger.error("Reconnect failed: %o", err));
      }
    }, 5000);
  });

  clientInstance = client;
  setStatus("connecting");
  await client.initialize();
  return client;
}

export async function destroyClient(): Promise<void> {
  if (!clientInstance) return;
  try {
    await clientInstance.destroy();
  } finally {
    clientInstance = null;
    setQr(null);
    setStatus("disconnected");
  }
}
