import { useState, useEffect } from "react";
import { getChats, sendMessage } from "../api/client";

export default function SendManual() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);

  useEffect(() => {
    getChats()
      .then(setChats)
      .finally(() => setListLoading(false));
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!selectedChat || !text.trim()) return;
    setLoading(true);
    try {
      const waChatId = chats.find((c) => c.id === Number(selectedChat))?.wa_chat_id;
      if (!waChatId) throw new Error("Chat no encontrado");
      await sendMessage(waChatId, text.trim());
      setText("");
    } finally {
      setLoading(false);
    }
  };

  if (listLoading) return <p className="text-slate-400">Cargando chats...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Enviar mensaje (pruebas)</h1>
      <p className="text-slate-400 text-sm">
        Envía un mensaje manualmente a un chat. Solo aparecen chats que ya existen en el sistema.
      </p>

      <form onSubmit={handleSend} className="bg-slate-800 rounded-lg p-4 border border-slate-700 space-y-4 max-w-xl">
        <div>
          <label className="block text-sm text-slate-400">Chat</label>
          <select
            value={selectedChat}
            onChange={(e) => setSelectedChat(e.target.value)}
            className="w-full mt-1 bg-slate-700 border border-slate-600 rounded px-3 py-2"
          >
            <option value="">Seleccionar</option>
            {chats.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name || c.wa_chat_id}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-slate-400">Mensaje</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            className="w-full mt-1 bg-slate-700 border border-slate-600 rounded px-3 py-2"
          />
        </div>
        <button
          type="submit"
          disabled={!selectedChat || !text.trim() || loading}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-4 py-2 rounded"
        >
          {loading ? "Enviando..." : "Enviar"}
        </button>
      </form>
    </div>
  );
}
