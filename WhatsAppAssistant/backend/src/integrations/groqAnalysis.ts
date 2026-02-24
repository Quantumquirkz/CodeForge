import Groq from "groq-sdk";
import { config } from "../config.js";

let client: Groq | null = null;

function getClient(): Groq {
  if (!client) {
    if (!config.groq.apiKey) throw new Error("GROQ_API_KEY is not set");
    client = new Groq({ apiKey: config.groq.apiKey });
  }
  return client;
}

export async function getGroqAnalysis(userQuery: string, conversationText: string): Promise<string> {
  const groq = getClient();
  const completion = await groq.chat.completions.create({
    model: config.groq.model,
    messages: [
      {
        role: "system",
        content: "Eres un asistente que analiza conversaciones. Responde en español de forma clara y concisa.",
      },
      {
        role: "user",
        content: "Conversación:\n" + conversationText.slice(0, 30000) + "\n\nPregunta del usuario: " + userQuery,
      },
    ],
    max_tokens: 1000,
    temperature: 0.3,
  });
  return completion.choices[0]?.message?.content?.trim() ?? "";
}
