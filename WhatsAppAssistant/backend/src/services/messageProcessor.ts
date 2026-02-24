import { getLogger } from "../lib/logger.js";
import { getOrCreateDefaultSession } from "../db/repositories/sessions.js";
import {
  getOrCreateChat,
  getChatRules,
  type ChatRules,
} from "../db/repositories/chats.js";
import { insertMessage } from "../db/repositories/messages.js";
import { generateAndSendReply } from "./replyPipeline.js";
import { embedSingleOwnerMessage } from "../jobs/embedOwnerMessages.js";
import { addReplyJob } from "../lib/queue.js";

const logger = getLogger("message-processor");

type WaMessage = {
  from: string;
  fromMe: boolean;
  body: string;
  id: { _serialized?: string };
  timestamp: number;
  chat?: { id?: { _serialized?: string }; name?: string; isGroup?: boolean };
  getContact?: () => Promise<{ pushname?: string }>;
  getMentions?: () => Promise<unknown[]>;
};

function getWaChatId(msg: WaMessage): string {
  const chatId = msg.chat?.id?._serialized ?? msg.chat?.id ?? msg.from;
  return typeof chatId === "string" ? chatId : String(chatId);
}

function isMentionedOrKeyword(
  msg: WaMessage,
  rules: ChatRules,
  ownerNumber: string
): boolean {
  if (rules.respond === "respond_always") return true;
  if (rules.respond === "never") return false;
  const body = (msg.body || "").trim().toLowerCase();
  if (rules.respond === "keyword" && rules.keyword) {
    if (body.includes(rules.keyword.toLowerCase())) return true;
    return false;
  }
  if (rules.respond === "on_mention") {
    return body.includes(`@${ownerNumber}`) || body.includes(ownerNumber);
  }
  return false;
}

export function attachMessageHandler(
  client: {
    on: (ev: string, fn: (msg: WaMessage) => void) => void;
    sendMessage: (chatId: string, text: string) => Promise<unknown>;
    info?: { wid?: { user?: string } };
  },
  ownerNumber: string
): void {
  client.on("message_create", async (msg: WaMessage) => {
    try {
      const body = (msg.body || "").trim();
      if (!body) return;

      const session = await getOrCreateDefaultSession();
      const waChatId = getWaChatId(msg);
      const chatName = msg.chat?.name ?? undefined;
      const isGroup = msg.chat?.isGroup ?? false;

      const chat = await getOrCreateChat(
        session.id,
        waChatId,
        chatName ?? null,
        isGroup
      );

      const msgTimestamp = new Date((msg.timestamp || 0) * 1000);
      const waMsgId = msg.id?._serialized ?? (typeof msg.id === "string" ? msg.id : null);
      const senderId = msg.from;

      if (msg.fromMe) {
        const ownerMsg = await insertMessage(chat.id, waMsgId, senderId, body, "owner", msgTimestamp);
        void embedSingleOwnerMessage(ownerMsg.id, body);
        return;
      }

      await insertMessage(chat.id, waMsgId, senderId, body, "user", msgTimestamp);

      const rules = await getChatRules(chat.id);
      if (rules.respond === "never") return;
      if (!isMentionedOrKeyword(msg, rules, ownerNumber)) return;

      await addReplyJob({ chatId: chat.id, waChatId, userMessageBody: body });
    } catch (err) {
      logger.error("Error processing message: %o", err);
    }
  });
}
