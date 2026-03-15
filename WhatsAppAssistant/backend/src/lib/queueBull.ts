import Bull from "bull";
import { config } from "../config.js";
import { getLogger } from "./logger.js";
import type { ReplyJob } from "./queue.js";

const logger = getLogger("queue-bull");

const QUEUE_NAME = "whatsapp-reply";

let replyQueue: Bull.Queue<ReplyJob> | null = null;

export function getReplyQueue(): Bull.Queue<ReplyJob> | null {
  return replyQueue;
}

export function initReplyQueue(processor: (job: Bull.Job<ReplyJob>) => Promise<void>): void {
  if (!config.redisUrl) return;
  replyQueue = new Bull<ReplyJob>(QUEUE_NAME, config.redisUrl, {
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: "exponential", delay: 2000 },
      removeOnComplete: 100,
    },
  });
  replyQueue.process(processor);
  replyQueue.on("failed", (job, err) => {
    logger.error("Reply job %s failed after %d attempt(s): %o", job?.id, job?.attemptsMade ?? 0, err);
    try {
      const payloadHash = job?.data ? Buffer.from(JSON.stringify(job.data)).toString("base64").slice(0, 32) : "n/a";
      logger.warn("Failed job details: id=%s payloadHash=%s error=%s", job?.id, payloadHash, err?.message);
    } catch (_) { /* ignore */ }
  });
}

export async function addReplyJob(job: ReplyJob): Promise<void> {
  if (!replyQueue) throw new Error("Redis queue not initialized");
  await replyQueue.add(job);
}
