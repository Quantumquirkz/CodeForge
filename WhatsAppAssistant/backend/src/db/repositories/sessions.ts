import { pool } from "../client.js";

export type WhatsAppSession = {
  id: number;
  user_id: number | null;
  session_data: string | null;
  phone_id: string | null;
  status: string;
  last_qr: string | null;
  updated_at: Date;
};

export async function getOrCreateDefaultSession(): Promise<WhatsAppSession> {
  const r = await pool.query<WhatsAppSession>(
    `SELECT id, user_id, session_data, phone_id, status, last_qr, updated_at
     FROM whatsapp_sessions LIMIT 1`
  );
  if (r.rows[0]) return r.rows[0];

  const ins = await pool.query<WhatsAppSession>(
    `INSERT INTO whatsapp_sessions (user_id, status) VALUES (NULL, 'disconnected')
     RETURNING id, user_id, session_data, phone_id, status, last_qr, updated_at`
  );
  return ins.rows[0];
}

export async function updateSessionStatus(
  sessionId: number,
  status: string,
  lastQr: string | null
): Promise<void> {
  await pool.query(
    "UPDATE whatsapp_sessions SET status = $1, last_qr = $2, updated_at = now() WHERE id = $3",
    [status, lastQr, sessionId]
  );
}
