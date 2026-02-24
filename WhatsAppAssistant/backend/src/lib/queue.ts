import { getLogger } from "./logger.js";
import { config } from "../config.js";

const logger = getLogger("queue");

export type ReplyJob = {
  chatId: number;
  waChatId: string;
  userMessageBody: string;
};

type JobHandler = (job: ReplyJob) => Promise<void>;

let handler: JobHandler | null = null;
const memoryQueue: ReplyJob[] = [];
let processing = false;

async function processMemoryQueue() {
  if (processing || memoryQueue.length === 0) return;
  processing = true;
  const job = memoryQueue.shift();
  if (job && handler) {
    try {
      await handler(job);
    } catch (err) {
      logger.error("Memory queue job failed: %o", err);
    }
  }
  processing = false;
  if (memoryQueue.length > 0) setImmediate(processMemoryQueue);
}

export function setReplyHandler(h: JobHandler) {
  handler = h;
}

export async function addReplyJob(job: ReplyJob): Promise<void> {
  if (config.redisUrl) {
    const { addReplyJob: addBull } = await import("./queueBull.js");
    await addBull(job);
    return;
  }
  memoryQueue.push(job);
  setImmediate(processMemoryQueue);
}
