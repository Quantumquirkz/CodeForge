import { Router } from "express";
import { pool } from "../db/client.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const r = await pool.query(
      `SELECT m.id, m.chat_id, c.name AS chat_name, m.sender_id, m.content, m.role, m.timestamp, m.created_at
       FROM messages m
       LEFT JOIN chats c ON c.id = m.chat_id
       ORDER BY m.created_at DESC
       LIMIT $1`,
      [limit]
    );
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to get logs" });
  }
});

export default router;
