import { Router } from "express";
import { listChats, updateChatRules, type ChatRules } from "../db/repositories/chats.js";
import { getOrCreateDefaultSession } from "../db/repositories/sessions.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const session = await getOrCreateDefaultSession();
    const chats = await listChats(session.id);
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: "Failed to list chats" });
  }
});

router.patch("/:id/rules", async (req, res) => {
  try {
    const chatId = Number(req.params.id);
    const { respond, keyword } = req.body as { respond?: string; keyword?: string };
    const rules: ChatRules = {
      respond: respond === "never" || respond === "on_mention" || respond === "keyword" ? respond : "respond_always",
      keyword: keyword ?? null,
    };
    await updateChatRules(chatId, rules);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update rules" });
  }
});

export default router;
