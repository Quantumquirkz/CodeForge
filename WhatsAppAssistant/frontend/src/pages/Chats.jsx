import { useState, useEffect } from "react";
import { getChats, updateChatRules } from "../api/client";

export default function Chats() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getChats().then(setChats).finally(() => setLoading(false));
  }, []);

  const handleRuleChange = async (chatId, respond, keyword) => {
    await updateChatRules(chatId, { respond, keyword });
    setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, rules: { ...c.rules, respond, keyword } } : c)));
  };

  if (loading) return <p className="text-slate-400">Cargando...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Chats</h1>
      <p className="text-slate-400 text-sm">Configura cuándo debe responder el bot en cada chat.</p>
      <ul className="space-y-3">
        {chats.length === 0 && <li className="text-slate-500">Aún no hay chats.</li>}
        {chats.map((c) => (
          <li key={c.id} className="bg-slate-800 rounded-lg p-4 border border-slate-700 flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{c.name || c.wa_chat_id}</p>
              <p className="text-sm text-slate-500">{c.is_group ? "Grupo" : "Individual"}</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <label className="text-sm text-slate-400">Responder:</label>
              <select
                value={c.rules?.respond || "respond_always"}
                onChange={(e) => handleRuleChange(c.id, e.target.value, c.rules?.keyword)}
                className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm"
              >
                <option value="respond_always">Siempre</option>
                <option value="on_mention">Solo mención</option>
                <option value="keyword">Palabra clave</option>
                <option value="never">Nunca</option>
              </select>
              {(c.rules?.respond || "") === "keyword" && (
                <input
                  type="text"
                  placeholder="Palabra"
                  value={c.rules?.keyword || ""}
                  onChange={(e) => handleRuleChange(c.id, "keyword", e.target.value)}
                  className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm w-28"
                />
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
