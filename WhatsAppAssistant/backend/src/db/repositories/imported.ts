import { pool } from "../client.js";
import type { ParsedMessage } from "../../services/importParser.js";

export type ImportedChat = {
  id: number;
  name: string;
  source_file: string | null;
  imported_at: Date;
};

export async function saveImportedChat(
  name: string,
  sourceFile: string | null,
  messages: ParsedMessage[],
  _contactName: string | null
): Promise<ImportedChat> {
  const chat = await pool.query<ImportedChat>(
    `INSERT INTO imported_chats (name, source_file) VALUES ($1, $2)
     RETURNING id, name, source_file, imported_at`,
    [name, sourceFile]
  );
  const chatId = chat.rows[0]!.id;

  for (const msg of messages) {
    const ts = parseExportDate(msg.date, msg.time);
    await pool.query(
      `INSERT INTO imported_messages (imported_chat_id, sender_label, content, timestamp)
       VALUES ($1, $2, $3, $4)`,
      [chatId, msg.sender, msg.content, ts]
    );
  }

  return chat.rows[0]!;
}

function parseExportDate(dateStr: string, timeStr: string): Date {
  const [d, m, y] = dateStr.split("/").map(Number);
  const [h, min, s] = timeStr.split(":").map(Number);
  return new Date(y ?? 0, (m ?? 1) - 1, d ?? 1, h ?? 0, min ?? 0, s ?? 0);
}

export async function listImportedChats(): Promise<ImportedChat[]> {
  const r = await pool.query<ImportedChat>(
    "SELECT id, name, source_file, imported_at FROM imported_chats ORDER BY imported_at DESC"
  );
  return r.rows;
}

export async function getImportedMessages(
  importedChatId: number,
  senderLabel?: string
): Promise<{ sender_label: string; content: string; timestamp: Date }[]> {
  let query = `SELECT sender_label, content, timestamp FROM imported_messages WHERE imported_chat_id = $1`;
  const params: (number | string)[] = [importedChatId];
  if (senderLabel) {
    query += " AND sender_label = $2";
    params.push(senderLabel);
  }
  query += " ORDER BY timestamp";
  const r = await pool.query<{ sender_label: string; content: string; timestamp: Date }>(
    query,
    params
  );
  return r.rows;
}
