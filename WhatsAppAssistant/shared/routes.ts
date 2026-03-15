import { z } from "zod";
import {
  sessionSchema,
  chatSchema,
  chatRulesSchema,
  styleSchema,
  importedChatSchema,
  logSchema,
} from "./schema";

export const errorSchemas = {
  internal: z.object({ message: z.string() }),
};

export const api = {
  session: {
    get: {
      method: "GET" as const,
      path: "/api/session" as const,
      responses: { 200: sessionSchema },
    },
    start: {
      method: "POST" as const,
      path: "/api/session/start" as const,
      responses: { 200: sessionSchema },
    },
    startPairing: {
      method: "POST" as const,
      path: "/api/session/start-pairing" as const,
      input: z.object({ phoneNumber: z.string().min(10, "Número inválido") }),
      responses: { 200: sessionSchema },
    },
    logout: {
      method: "POST" as const,
      path: "/api/session/logout" as const,
      responses: { 200: sessionSchema },
    },
  },
  chats: {
    list: {
      method: "GET" as const,
      path: "/api/chats" as const,
      responses: { 200: z.array(chatSchema) },
    },
    updateRules: {
      method: "PATCH" as const,
      path: "/api/chats/:id/rules" as const,
      input: chatRulesSchema,
      responses: { 200: chatSchema },
    },
  },
  style: {
    get: {
      method: "GET" as const,
      path: "/api/style" as const,
      responses: { 200: styleSchema },
    },
    update: {
      method: "PUT" as const,
      path: "/api/style" as const,
      input: styleSchema.partial(),
      responses: { 200: styleSchema },
    },
  },
  imports: {
    list: {
      method: "GET" as const,
      path: "/api/imported" as const,
      responses: { 200: z.array(importedChatSchema) },
    },
    upload: {
      method: "POST" as const,
      path: "/api/import" as const,
      responses: { 200: importedChatSchema },
    },
  },
  analysis: {
    analyze: {
      method: "POST" as const,
      path: "/api/analyze" as const,
      input: z.object({
        importedChatId: z.number(),
        senderLabel: z.string().optional(),
        query: z.string().min(1, "La consulta no puede estar vacía"),
      }),
      responses: { 200: z.object({ analysis: z.string() }) },
    },
  },
  logs: {
    list: {
      method: "GET" as const,
      path: "/api/logs" as const,
      input: z.object({ limit: z.string().optional() }).optional(),
      responses: { 200: z.array(logSchema) },
    },
  },
  messages: {
    send: {
      method: "POST" as const,
      path: "/api/send" as const,
      input: z.object({
        chatId: z.string().min(1, "El chat ID es requerido"),
        text: z.string().min(1, "El texto no puede estar vacío"),
      }),
      responses: { 200: z.object({ success: z.boolean() }) },
    },
  },
};

export function buildUrl(
  path: string,
  params?: Record<string, string | number>
): string {
  let url = path;
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    }
  }
  return url;
}
