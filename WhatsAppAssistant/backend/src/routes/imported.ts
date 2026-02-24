import { Router } from "express";
import { listImportedChats } from "../db/repositories/imported.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const chats = await listImportedChats();
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: "Failed to list imported chats" });
  }
});

export default router;
