import { getLogger } from "../lib/logger.js";
import { insertMessage } from "../db/repositories/messages.js";
import { getGroqReply } from "../integrations/groq.js";

const logger = getLogger("reply-pipeline");

type WaMessage = { from: string };

export async function generateAndSendReply(
  client: { sendMessage: (chatId: string, text: string) => Promise<unknown> },
  chatId: number,
  waChatId: string,
  userMessageBody: string,
  _waMessage: WaMessage
): Promise<void> {
  let replyText: string;
  try {
    replyText = await getGroqReply(chatId, userMessageBody);
  } catch (err) {
    logger.error("Groq reply failed: %o", err);
    replyText = "Lo siento, no pude generar una respuesta ahora.";
  }

  await client.sendMessage(waChatId, replyText);

  await insertMessage(
    chatId,
    null,
    "assistant",
    replyText,
    "assistant",
    new Date()
  );
}
