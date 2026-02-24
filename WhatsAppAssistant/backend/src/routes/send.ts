import { Router } from "express";
import { getClient } from "../whatsapp/client.js";
import { getChatByWaId } from "../db/repositories/chats.js";
import { getOrCreateDefaultSession } from "../db/repositories/sessions.js";
import { insertMessage } from "../db/repositories/messages.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const client = getClient();
    if (!client) {
      res.status(503).json({ error: "WhatsApp not connected" });
      return;
    }
    const { chatId: waChatId, text } = req.body as { chatId: string; text: string };
    if (!waChatId || !text) {
      res.status(400).json({ error: "chatId and text required" });
      return;
    }
    await client.sendMessage(waChatId, text);
    const session = await getOrCreateDefaultSession();
    const chat = await getChatByWaId(session.id, waChatId);
    if (chat) {
      await insertMessage(chat.id, null, "assistant", text, "assistant", new Date());
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Send failed" });
  }
});

export default router;
