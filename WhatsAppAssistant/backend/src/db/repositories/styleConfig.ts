import { pool } from "../client.js";

export type StyleConfig = {
  id: number;
  user_id: number | null;
  tone: string;
  formality: number;
  brevity: number;
  emoji_policy: string;
  signature_phrases: string[];
  writing_rules: string[];
  owner_name: string | null;
  updated_at: Date;
};

export async function getStyleConfig(): Promise<Partial<StyleConfig>> {
  const r = await pool.query<StyleConfig>(
    "SELECT * FROM style_config ORDER BY id LIMIT 1"
  );
  if (!r.rows[0]) {
    return {
      tone: "friendly",
      formality: 5,
      brevity: 5,
      emoji_policy: "moderate",
      owner_name: null,
      signature_phrases: [],
      writing_rules: [],
    };
  }
  const row = r.rows[0];
  return {
    tone: row.tone,
    formality: row.formality,
    brevity: row.brevity,
    emoji_policy: row.emoji_policy,
    owner_name: row.owner_name,
    signature_phrases: Array.isArray(row.signature_phrases) ? row.signature_phrases : [],
    writing_rules: Array.isArray(row.writing_rules) ? row.writing_rules : [],
  };
}

export async function upsertStyleConfig(
  data: Partial<Omit<StyleConfig, "id" | "updated_at">>
): Promise<StyleConfig> {
  const existing = await pool.query<StyleConfig>("SELECT id FROM style_config LIMIT 1");
  const payload = {
    tone: data.tone ?? "friendly",
    formality: data.formality ?? 5,
    brevity: data.brevity ?? 5,
    emoji_policy: data.emoji_policy ?? "moderate",
    signature_phrases: JSON.stringify(data.signature_phrases ?? []),
    writing_rules: JSON.stringify(data.writing_rules ?? []),
    owner_name: data.owner_name ?? null,
  };

  if (existing.rows[0]) {
    await pool.query(
      `UPDATE style_config SET
        tone = $1, formality = $2, brevity = $3, emoji_policy = $4,
        signature_phrases = $5, writing_rules = $6, owner_name = $7, updated_at = now()
       WHERE id = $8`,
      [
        payload.tone,
        payload.formality,
        payload.brevity,
        payload.emoji_policy,
        payload.signature_phrases,
        payload.writing_rules,
        payload.owner_name,
        existing.rows[0].id,
      ]
    );
    const r = await pool.query<StyleConfig>("SELECT * FROM style_config WHERE id = $1", [
      existing.rows[0].id,
    ]);
    return r.rows[0];
  }

  const ins = await pool.query<StyleConfig>(
    `INSERT INTO style_config (tone, formality, brevity, emoji_policy, signature_phrases, writing_rules, owner_name)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      payload.tone,
      payload.formality,
      payload.brevity,
      payload.emoji_policy,
      payload.signature_phrases,
      payload.writing_rules,
      payload.owner_name,
    ]
  );
  return ins.rows[0];
}
