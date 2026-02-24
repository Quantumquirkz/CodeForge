import { getLogger } from "../lib/logger.js";
import { pool } from "../db/client.js";
import { embedText, getEmbeddingModelId } from "../integrations/embeddings.js";
import { insertMessageEmbedding } from "../db/repositories/embeddings.js";

const logger = getLogger("embed-owner");

export async function embedOwnerMessagesSince(minId?: number): Promise<number> {
  const r = await pool.query<{ id: number; content: string }>(
    `SELECT m.id, m.content FROM messages m
     LEFT JOIN message_embeddings e ON e.message_id = m.id
     WHERE m.role = 'owner' AND e.id IS NULL ${minId != null ? "AND m.id >= $1" : ""}
     ORDER BY m.id LIMIT 50`,
    minId != null ? [minId] : []
  );
  const modelId = getEmbeddingModelId();
  let count = 0;
  for (const row of r.rows) {
    try {
      const vec = await embedText(row.content);
      await insertMessageEmbedding(row.id, vec, modelId);
      count++;
    } catch (err) {
      logger.warn("Failed to embed message %s: %o", row.id, err);
    }
  }
  return count;
}

export async function embedSingleOwnerMessage(messageId: number, content: string): Promise<void> {
  try {
    const vec = await embedText(content);
    await insertMessageEmbedding(messageId, vec, getEmbeddingModelId());
  } catch (err) {
    logger.warn("Failed to embed owner message %s: %o", messageId, err);
  }
}
