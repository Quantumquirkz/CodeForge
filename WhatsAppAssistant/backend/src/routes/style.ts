import { Router } from "express";
import { getStyleConfig, upsertStyleConfig } from "../db/repositories/styleConfig.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const style = await getStyleConfig();
    res.json(style);
  } catch (err) {
    res.status(500).json({ error: "Failed to get style config" });
  }
});

router.put("/", async (req, res) => {
  try {
    const body = req.body as Record<string, unknown>;
    const updated = await upsertStyleConfig({
      tone: body.tone as string | undefined,
      formality: body.formality as number | undefined,
      brevity: body.brevity as number | undefined,
      emoji_policy: body.emoji_policy as string | undefined,
      owner_name: body.owner_name as string | undefined,
      signature_phrases: body.signature_phrases as string[] | undefined,
      writing_rules: body.writing_rules as string[] | undefined,
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update style config" });
  }
});

export default router;
