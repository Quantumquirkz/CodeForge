import { embedText } from "../integrations/embeddings.js";
import { searchSimilarOwnerMessages } from "../db/repositories/embeddings.js";
import {
  getRecentMessages,
  getMessageById,
  getPreviousMessageInChat,
} from "../db/repositories/messages.js";
import { getStyleConfig } from "../db/repositories/styleConfig.js";

const K_SIMILAR = 5;
const RECENT_LIMIT = 20;

export type RagContext = {
  systemPrompt: string;
  userPrompt: string;
};

export async function buildRagContext(
  chatId: number,
  currentMessage: string,
  ownerName: string
): Promise<RagContext> {
  const style = await getStyleConfig();
  const recent = await getRecentMessages(chatId, RECENT_LIMIT);
  const embedding = await embedText(currentMessage);
  const similar = await searchSimilarOwnerMessages(embedding, K_SIMILAR, chatId);

  const systemParts = [
    `Eres un asistente que responde mensajes de WhatsApp imitando el estilo de ${ownerName}.`,
    `Tono: ${style.tone || "friendly"}. Formalidad (1-10): ${style.formality ?? 5}. Brevedad (1-10): ${style.brevity ?? 5}.`,
    `Uso de emojis: ${style.emoji_policy || "moderate"}.`,
  ];
  if (style.signature_phrases?.length) {
    systemParts.push(`Frases que sueles usar: ${style.signature_phrases.join(", ")}.`);
  }
  if (style.writing_rules?.length) {
    systemParts.push(`Reglas: ${style.writing_rules.join("; ")}.`);
  }

  const examples: string[] = [];
  for (const row of similar) {
    const msg = await getMessageById(row.message_id);
    if (!msg) continue;
    const prev = await getPreviousMessageInChat(msg.chat_id, msg.timestamp);
    const trigger = prev?.content ?? "(mensaje anterior)";
    examples.push(`Mensaje original: "${trigger}"\nRespuesta tuya: "${row.content}"`);
  }
  if (examples.length > 0) {
    systemParts.push("");
    systemParts.push("Ejemplos de cómo respondes en situaciones similares:");
    systemParts.push(examples.join("\n\n"));
  }

  systemParts.push("");
  systemParts.push("Responde solo con el texto del mensaje, sin explicaciones ni prefijos.");

  const historyBlock = recent
    .map((m) => {
      const who = m.role === "user" ? "Usuario" : m.role === "owner" ? ownerName : "Asistente";
      return `${who}: ${m.content}`;
    })
    .join("\n");

  const userPrompt = historyBlock
    ? `${historyBlock}\nUsuario: ${currentMessage}\n${ownerName}:`
    : `Usuario: ${currentMessage}\n${ownerName}:`;

  return {
    systemPrompt: systemParts.join("\n"),
    userPrompt,
  };
}
