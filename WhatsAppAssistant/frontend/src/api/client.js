const API = "/api";

export async function getSession() {
  const r = await fetch(`${API}/session`);
  if (!r.ok) throw new Error("Session fetch failed");
  return r.json();
}

export async function startSession() {
  const r = await fetch(`${API}/session/start`, { method: "POST" });
  if (!r.ok) throw new Error("Start session failed");
  return r.json();
}

export async function getChats() {
  const r = await fetch(`${API}/chats`);
  if (!r.ok) throw new Error("Chats fetch failed");
  return r.json();
}

export async function updateChatRules(chatId, rules) {
  const r = await fetch(`${API}/chats/${chatId}/rules`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(rules),
  });
  if (!r.ok) throw new Error("Update rules failed");
  return r.json();
}

export async function getStyle() {
  const r = await fetch(`${API}/style`);
  if (!r.ok) throw new Error("Style fetch failed");
  return r.json();
}

export async function updateStyle(data) {
  const r = await fetch(`${API}/style`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error("Update style failed");
  return r.json();
}

export async function importChat(file, name) {
  const form = new FormData();
  form.append("file", file);
  if (name) form.append("name", name);
  const r = await fetch(`${API}/import`, { method: "POST", body: form });
  if (!r.ok) throw new Error("Import failed");
  return r.json();
}

export async function getImportedChats() {
  const r = await fetch(`${API}/imported`);
  if (!r.ok) throw new Error("Imported chats fetch failed");
  return r.json();
}

export async function analyzeChat(body) {
  const r = await fetch(`${API}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error("Analysis failed");
  return r.json();
}

export async function getLogs(limit = 50) {
  const r = await fetch(`${API}/logs?limit=${limit}`);
  if (!r.ok) throw new Error("Logs fetch failed");
  return r.json();
}

export async function sendMessage(chatId, text) {
  const r = await fetch(`${API}/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chatId, text }),
  });
  if (!r.ok) throw new Error("Send failed");
  return r.json();
}
