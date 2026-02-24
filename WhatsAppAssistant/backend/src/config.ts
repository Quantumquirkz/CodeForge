import "dotenv/config";

export const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 4000,
  databaseUrl: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/whatsapp_assistant",
  redisUrl: process.env.REDIS_URL || "",
  groq: {
    apiKey: process.env.GROQ_API_KEY || "",
    model: process.env.GROQ_MODEL || "llama3-70b-8192",
  },
  jwt: {
    secret: process.env.JWT_SECRET || "change-me-min-32-characters-long",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "change-me-refresh-secret",
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },
  waSessionPath: process.env.WA_SESSION_PATH || "./.wwebjs_auth",
  corsOrigin: process.env.CORS_ORIGIN || "*",
} as const;
