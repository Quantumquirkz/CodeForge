import { Router } from "express";
import multer from "multer";
import { parseWhatsAppExport } from "../services/importParser.js";
import { saveImportedChat } from "../db/repositories/imported.js";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const router = Router();

router.post("/", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file || !file.buffer) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }
    const text = file.buffer.toString("utf-8");
    const name = (req.body.name as string) || file.originalname || "imported";
    const { messages, contactName } = parseWhatsAppExport(text);
    const chat = await saveImportedChat(name, file.originalname || null, messages, contactName);
    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: "Import failed" });
  }
});

export default router;
