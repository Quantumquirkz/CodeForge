import { Router } from "express";
import QRCode from "qrcode";
import {
  getSessionStatus,
  getCurrentQr,
  getCurrentPairingCode,
  initWhatsAppClient,
  initWhatsAppClientWithPairing,
  destroyClient,
} from "../whatsapp/client.js";
import { getLogger } from "../lib/logger.js";

const logger = getLogger("session-routes");
const router = Router();
const QR_WAIT_MS = 25000;
const QR_POLL_MS = 300;

async function qrToDataUrl(qrRaw: string | null): Promise<string | null> {
  if (!qrRaw) return null;
  try {
    return await QRCode.toDataURL(qrRaw, { margin: 2, width: 256 });
  } catch {
    return qrRaw;
  }
}

async function waitForQr(): Promise<string | null> {
  const deadline = Date.now() + QR_WAIT_MS;
  while (Date.now() < deadline) {
    const qr = getCurrentQr();
    if (qr) return qr;
    await new Promise((r) => setTimeout(r, QR_POLL_MS));
  }
  return null;
}

router.get("/", async (_req, res) => {
  const qrRaw = getCurrentQr();
  const qr = await qrToDataUrl(qrRaw);
  const pairingCode = getCurrentPairingCode();
  res.json({ status: getSessionStatus(), qr, pairingCode });
});

router.post("/start", async (_req, res) => {
  try {
    await initWhatsAppClient();
    const qrRaw = await waitForQr();
    const qr = await qrToDataUrl(qrRaw);
    if (!qrRaw) logger.warn(`QR not received within ${QR_WAIT_MS} ms`);
    res.json({ status: getSessionStatus(), qr, pairingCode: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    logger.error(`Failed to start WhatsApp client: ${message}`);
    if (stack) logger.debug(`Stack: ${stack}`);
    res.status(500).json({
      error: "Failed to start client",
      detail: message,
    });
  }
});

router.post("/start-pairing", async (req, res) => {
  try {
    const phoneNumber = String(req.body?.phoneNumber ?? "").trim();
    if (!phoneNumber || phoneNumber.replace(/\D/g, "").length < 10) {
      res.status(400).json({ error: "Número de teléfono inválido" });
      return;
    }
    await initWhatsAppClientWithPairing(phoneNumber);
    const pairingCode = getCurrentPairingCode();
    res.json({ status: getSessionStatus(), qr: null, pairingCode });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error(`Failed to start pairing: ${message}`);
    res.status(500).json({
      error: "Failed to start pairing",
      detail: message,
    });
  }
});

router.post("/logout", async (_req, res) => {
  try {
    await destroyClient();
    res.json({ status: getSessionStatus() });
  } catch (err) {
    logger.error("Failed to destroy client", { err });
    res.status(500).json({ error: "Failed to logout" });
  }
});

export default router;
