import "dotenv/config";
import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { getLogger } from "./lib/logger.js";
import { setReplyHandler } from "./lib/queue.js";
import { initReplyQueue } from "./lib/queueBull.js";
import { getClient } from "./whatsapp/client.js";
import { generateAndSendReply } from "./services/replyPipeline.js";
import sessionRoutes from "./routes/session.js";
import chatsRoutes from "./routes/chats.js";
import styleRoutes from "./routes/style.js";
import importRoutes from "./routes/import.js";
import importedRoutes from "./routes/imported.js";
import analyzeRoutes from "./routes/analyze.js";
import logsRoutes from "./routes/logs.js";
import sendRoutes from "./routes/send.js";

const logger = getLogger("server");
const app = express();
const PORT = config.port;

const processReply = async (job: { chatId: number; waChatId: string; userMessageBody: string }) => {
  const client = getClient();
  if (!client) return;
  await generateAndSendReply(
    client as Parameters<typeof generateAndSendReply>[0],
    job.chatId,
    job.waChatId,
    job.userMessageBody,
    { from: job.waChatId }
  );
};

setReplyHandler(processReply);
if (config.redisUrl) {
  initReplyQueue(async (bullJob) => processReply(bullJob.data));
}

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/session", sessionRoutes);
app.use("/api/chats", chatsRoutes);
app.use("/api/style", styleRoutes);
app.use("/api/import", importRoutes);
app.use("/api/imported", importedRoutes);
app.use("/api/analyze", analyzeRoutes);
app.use("/api/logs", logsRoutes);
app.use("/api/send", sendRoutes);

app.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}`);
});
