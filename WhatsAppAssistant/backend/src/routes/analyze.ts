import { Router } from "express";
import { getImportedMessages } from "../db/repositories/imported.js";
import { getGroqAnalysis } from "../integrations/groqAnalysis.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { importedChatId, senderLabel, query } = req.body as {
      importedChatId: number;
      senderLabel?: string;
      query: string;
    };
    if (!importedChatId || !query) {
      res.status(400).json({ error: "importedChatId and query required" });
      return;
    }
    const messages = await getImportedMessages(importedChatId, senderLabel);
    const text = messages.map((m) => `${m.sender_label}: ${m.content}`).join("\n");
    const analysis = await getGroqAnalysis(query, text);
    res.json({ analysis });
  } catch (err) {
    res.status(500).json({ error: "Analysis failed" });
  }
});

export default router;
