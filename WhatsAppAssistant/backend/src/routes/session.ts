import { Router } from "express";
import QRCode from "qrcode";
import {
  getSessionStatus,
  getCurrentQr,
  initWhatsAppClient,
  destroyClient,
} from "../whatsapp/client.js";
import { getLogger } from "../lib/logger.js";

const logger = getLogger("session-routes");
const router = Router();

router.get("/", async (_req, res) => {
  const qrRaw = getCurrentQr();
  let qr: string | null = null;
  if (qrRaw) {
    try {
      qr = await QRCode.toDataURL(qrRaw);
    } catch {
      qr = qrRaw;
    }
  }
  res.json({ status: getSessionStatus(), qr });
});

router.post("/start", async (_req, res) => {
  try {
    await initWhatsAppClient();
    const qrRaw = getCurrentQr();
    let qr: string | null = null;
    if (qrRaw) {
      try {
        qr = await QRCode.toDataURL(qrRaw);
      } catch {
        qr = qrRaw;
      }
    }
    res.json({ status: getSessionStatus(), qr });
  } catch (err) {
    logger.error("Failed to start WhatsApp client: %o", err);
    res.status(500).json({ error: "Failed to start client" });
  }
});

router.post("/logout", async (_req, res) => {
  try {
    await destroyClient();
    res.json({ status: getSessionStatus() });
  } catch (err) {
    logger.error("Failed to destroy client: %o", err);
    res.status(500).json({ error: "Failed to logout" });
  }
});

export default router;
