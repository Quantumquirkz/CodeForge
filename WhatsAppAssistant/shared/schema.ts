import { z } from "zod";

export const sessionSchema = z.object({
  status: z.enum(["disconnected", "connecting", "connected"]),
  qr: z.string().nullable(),
  pairingCode: z.string().nullable().optional(),
});

export const chatRulesSchema = z.object({
  respond: z.enum(["respond_always", "on_mention", "keyword", "never"]),
  keyword: z.string().nullable().optional(),
});

export const chatSchema = z.object({
  id: z.union([z.string(), z.number()]),
  session_id: z.union([z.string(), z.number()]),
  wa_chat_id: z.string(),
  name: z.string().nullable(),
  is_group: z.boolean(),
  rules: chatRulesSchema,
});

export const styleSchema = z.object({
  tone: z.string().min(1),
  formality: z.string().min(1),
  brevity: z.string().min(1),
  emoji_policy: z.string(),
  owner_name: z.string().min(1),
  signature_phrases: z.array(z.string()),
  writing_rules: z.array(z.string()),
});

export const importedChatSchema = z.object({
  id: z.number(),
  name: z.string(),
  source_file: z.string(),
  imported_at: z.string(),
});

export const logSchema = z.object({
  id: z.number(),
  chat_id: z.string(),
  chat_name: z.string(),
  sender_id: z.string(),
  content: z.string(),
  role: z.string(),
  timestamp: z.string(),
});

export type Session = z.infer<typeof sessionSchema>;
export type ChatRules = z.infer<typeof chatRulesSchema>;
export type Chat = z.infer<typeof chatSchema>;
export type StyleConfig = z.infer<typeof styleSchema>;
export type ImportedChat = z.infer<typeof importedChatSchema>;
export type LogEntry = z.infer<typeof logSchema>;
