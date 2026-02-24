import { pool } from "../client.js";

export type MessageRole = "user" | "assistant" | "owner";

export type Message = {
  id: number;
  chat_id: number;
  wa_message_id: string | null;
  sender_id: string;
  content: string;
  role: MessageRole;
  timestamp: Date;
  created_at: Date;
};

export async function insertMessage(
  chatId: number,
  waMessageId: string | null,
  senderId: string,
  content: string,
  role: MessageRole,
  timestamp: Date
): Promise<Message> {
  const r = await pool.query<Message>(
    `INSERT INTO messages (chat_id, wa_message_id, sender_id, content, role, timestamp)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, chat_id, wa_message_id, sender_id, content, role, timestamp, created_at`,
    [chatId, waMessageId, senderId, content, role, timestamp]
  );
  return r.rows[0];
}

export async function getRecentMessages(
  chatId: number,
  limit: number
): Promise<Message[]> {
  const r = await pool.query<Message>(
    `SELECT id, chat_id, wa_message_id, sender_id, content, role, timestamp, created_at
     FROM messages WHERE chat_id = $1 ORDER BY timestamp DESC LIMIT $2`,
    [chatId, limit]
  );
  return r.rows.reverse();
}

export async function getMessageById(messageId: number): Promise<Message | null> {
  const r = await pool.query<Message>(
    `SELECT id, chat_id, wa_message_id, sender_id, content, role, timestamp, created_at
     FROM messages WHERE id = $1`,
    [messageId]
  );
  return r.rows[0] ?? null;
}

export async function getPreviousMessageInChat(
  chatId: number,
  beforeTimestamp: Date
): Promise<Message | null> {
  const r = await pool.query<Message>(
    `SELECT id, chat_id, wa_message_id, sender_id, content, role, timestamp, created_at
     FROM messages WHERE chat_id = $1 AND timestamp < $2 ORDER BY timestamp DESC LIMIT 1`,
    [chatId, beforeTimestamp]
  );
  return r.rows[0] ?? null;
}
