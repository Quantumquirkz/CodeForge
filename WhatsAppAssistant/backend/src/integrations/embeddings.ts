import { pipeline } from "@huggingface/transformers";
import { getLogger } from "../lib/logger.js";

const logger = getLogger("embeddings");

const EMBEDDING_DIM = 384;
const MODEL_ID = "Xenova/all-MiniLM-L6-v2";

let extractor: Awaited<ReturnType<typeof pipeline>> | null = null;

async function getExtractor() {
  if (!extractor) {
    logger.info("Loading local embedding model %s...", MODEL_ID);
    extractor = await pipeline("feature-extraction", MODEL_ID, { quantized: true });
  }
  return extractor;
}

export async function embedText(text: string): Promise<number[]> {
  const pipe = await getExtractor();
  const input = text.slice(0, 512).trim() || " ";
  const output = await pipe(input, { pooling: "mean", normalize: true });
  const raw = (output as { data?: ArrayLike<number> })?.data ?? output;
  const arr = Array.from(raw as ArrayLike<number>);
  if (arr.length < EMBEDDING_DIM) throw new Error("Unexpected embedding length");
  return arr.slice(0, EMBEDDING_DIM);
}

export function getEmbeddingDim(): number {
  return EMBEDDING_DIM;
}

export function getEmbeddingModelId(): string {
  return MODEL_ID;
}
