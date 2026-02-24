import { pool } from "../client.js";
import type { PoolClient } from "pg";

export async function insertMessageEmbedding(
  messageId: number,
  embedding: number[],
  model: string,
  client?: PoolClient
): Promise<void> {
  const pg = client ?? pool;
  const vec = `[${embedding.join(",")}]`;
  await pg.query(
    `INSERT INTO message_embeddings (message_id, embedding, model) VALUES ($1, $2::vector, $3)`,
    [messageId, vec, model]
  );
}

export async function searchSimilarOwnerMessages(
  embedding: number[],
  limit: number,
  chatId?: number
): Promise<{ message_id: number; content: string; similarity: number }[]> {
  const vec = `[${embedding.join(",")}]`;
  const query = chatId
    ? `SELECT m.id AS message_id, m.content,
       1 - (e.embedding <=> $1::vector) AS similarity
       FROM message_embeddings e
       JOIN messages m ON m.id = e.message_id
       WHERE m.role = 'owner' AND m.chat_id = $2
       ORDER BY e.embedding <=> $1::vector LIMIT $3`
    : `SELECT m.id AS message_id, m.content,
       1 - (e.embedding <=> $1::vector) AS similarity
       FROM message_embeddings e
       JOIN messages m ON m.id = e.message_id
       WHERE m.role = 'owner'
       ORDER BY e.embedding <=> $1::vector LIMIT $2`;
  const params = chatId ? [vec, chatId, limit] : [vec, limit];
  const r = await pool.query<{ message_id: number; content: string; similarity: number }>(
    query,
    params
  );
  return r.rows;
}
