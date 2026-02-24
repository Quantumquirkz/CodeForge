import Groq from "groq-sdk";
import { config } from "../config.js";
import { getLogger } from "../lib/logger.js";
import { buildRagContext } from "../services/rag.js";
import { getStyleConfig } from "../db/repositories/styleConfig.js";

const logger = getLogger("groq");

let client: Groq | null = null;

function getClient(): Groq {
  if (!client) {
    if (!config.groq.apiKey) throw new Error("GROQ_API_KEY is not set");
    client = new Groq({ apiKey: config.groq.apiKey });
  }
  return client;
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

async function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function getGroqReply(chatId: number, userMessage: string): Promise<string> {
  const style = await getStyleConfig();
  const ownerName = style.owner_name || "Asistente";

  let systemPrompt: string;
  let userPrompt: string;

  try {
    const rag = await buildRagContext(chatId, userMessage, ownerName);
    systemPrompt = rag.systemPrompt;
    userPrompt = rag.userPrompt;
  } catch (err) {
    logger.warn("RAG context failed, using fallback: %o", err);
    const fallback = await getStyleConfig();
    systemPrompt = buildSystemPrompt(fallback);
    userPrompt = `Usuario: ${userMessage}\n${ownerName}:`;
  }

  const groq = getClient();
  let lastErr: unknown;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const completion = await groq.chat.completions.create({
        model: config.groq.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 500,
        temperature: 0.7,
      });
      const content = completion.choices[0]?.message?.content?.trim();
      if (!content) throw new Error("Empty reply from Groq");
      return content;
    } catch (err) {
      lastErr = err;
      if (attempt < MAX_RETRIES) {
        logger.warn("Groq attempt %s failed, retrying: %o", attempt, err);
        await sleep(RETRY_DELAY_MS * attempt);
      }
    }
  }
  throw lastErr;
}

function buildSystemPrompt(style: {
  tone?: string;
  formality?: number;
  brevity?: number;
  emoji_policy?: string;
  owner_name?: string | null;
  signature_phrases?: string[];
  writing_rules?: string[];
}): string {
  const name = style.owner_name || "el usuario";
  const parts = [
    `Eres un asistente que responde mensajes de WhatsApp imitando el estilo de ${name}.`,
    `Tono: ${style.tone || "friendly"}. Formalidad (1-10): ${style.formality ?? 5}. Brevedad (1-10): ${style.brevity ?? 5}.`,
    `Uso de emojis: ${style.emoji_policy || "moderate"}.`,
  ];
  if (style.signature_phrases?.length) {
    parts.push(`Frases que sueles usar: ${style.signature_phrases.join(", ")}.`);
  }
  if (style.writing_rules?.length) {
    parts.push(`Reglas: ${style.writing_rules.join("; ")}.`);
  }
  parts.push("Responde solo con el texto del mensaje, sin explicaciones ni prefijos.");
  return parts.join("\n");
}
