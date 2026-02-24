import { pool } from "../client.js";

export type ChatRules = {
  respond: "respond_always" | "on_mention" | "keyword" | "never";
  keyword: string | null;
};

export type Chat = {
  id: number;
  session_id: number;
  wa_chat_id: string;
  name: string | null;
  is_group: boolean;
  rules: ChatRules;
  created_at: Date;
  updated_at: Date;
};

const defaultRules: ChatRules = {
  respond: "respond_always",
  keyword: null,
};

export async function getOrCreateChat(
  sessionId: number,
  waChatId: string,
  name: string | null,
  isGroup: boolean
): Promise<Chat> {
  const existing = await pool.query<Chat>(
    `SELECT id, session_id, wa_chat_id, name, is_group, rules, created_at, updated_at
     FROM chats WHERE session_id = $1 AND wa_chat_id = $2`,
    [sessionId, waChatId]
  );
  if (existing.rows[0]) return existing.rows[0];

  const inserted = await pool.query<Chat>(
    `INSERT INTO chats (session_id, wa_chat_id, name, is_group, rules)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, session_id, wa_chat_id, name, is_group, rules, created_at, updated_at`,
    [sessionId, waChatId, name, isGroup, JSON.stringify(defaultRules)]
  );
  return inserted.rows[0];
}

export async function getChatByWaId(sessionId: number, waChatId: string): Promise<Chat | null> {
  const r = await pool.query<Chat>(
    `SELECT id, session_id, wa_chat_id, name, is_group, rules, created_at, updated_at
     FROM chats WHERE session_id = $1 AND wa_chat_id = $2`,
    [sessionId, waChatId]
  );
  return r.rows[0] ?? null;
}

export async function getChatRules(chatId: number): Promise<ChatRules> {
  const r = await pool.query<{ rules: ChatRules }>(
    "SELECT rules FROM chats WHERE id = $1",
    [chatId]
  );
  if (!r.rows[0]) return defaultRules;
  const rules = r.rows[0].rules;
  return {
    respond: rules?.respond ?? defaultRules.respond,
    keyword: rules?.keyword ?? null,
  };
}

export async function updateChatRules(chatId: number, rules: ChatRules): Promise<void> {
  await pool.query(
    "UPDATE chats SET rules = $1, updated_at = now() WHERE id = $2",
    [JSON.stringify(rules), chatId]
  );
}

export async function listChats(sessionId: number): Promise<Chat[]> {
  const r = await pool.query<Chat>(
    `SELECT id, session_id, wa_chat_id, name, is_group, rules, created_at, updated_at
     FROM chats WHERE session_id = $1 ORDER BY updated_at DESC`,
    [sessionId]
  );
  return r.rows;
}
