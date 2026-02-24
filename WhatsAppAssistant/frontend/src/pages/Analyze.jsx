import { useState, useEffect } from "react";
import { getImportedChats, analyzeChat } from "../api/client";

export default function Analyze() {
  const [imported, setImported] = useState([]);
  const [selectedChat, setSelectedChat] = useState("");
  const [query, setQuery] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);

  useEffect(() => {
    getImportedChats()
      .then(setImported)
      .finally(() => setListLoading(false));
  }, []);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!selectedChat || !query.trim()) return;
    setLoading(true);
    setResult("");
    try {
      const { analysis } = await analyzeChat({
        importedChatId: Number(selectedChat),
        query: query.trim(),
      });
      setResult(analysis);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analizar chat</h1>
      <p className="text-slate-400 text-sm">
        Elige un chat importado y una pregunta (ej. &quot;Resume los temas principales&quot;, &quot;¿De qué hablamos más?&quot;).
      </p>

      {listLoading ? (
        <p className="text-slate-500">Cargando chats...</p>
      ) : (
        <form onSubmit={handleAnalyze} className="bg-slate-800 rounded-lg p-4 border border-slate-700 space-y-4 max-w-xl">
          <div>
            <label className="block text-sm text-slate-400">Chat importado</label>
            <select
              value={selectedChat}
              onChange={(e) => setSelectedChat(e.target.value)}
              className="w-full mt-1 bg-slate-700 border border-slate-600 rounded px-3 py-2"
            >
              <option value="">Seleccionar</option>
              {imported.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-400">Pregunta</label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ej: Resume la conversación con los temas principales"
              rows={3}
              className="w-full mt-1 bg-slate-700 border border-slate-600 rounded px-3 py-2"
            />
          </div>
          <button
            type="submit"
            disabled={!selectedChat || !query.trim() || loading}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-4 py-2 rounded"
          >
            {loading ? "Analizando..." : "Analizar"}
          </button>
        </form>
      )}

      {result && (
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 max-w-2xl">
          <h2 className="font-semibold mb-2">Resultado</h2>
          <p className="whitespace-pre-wrap text-slate-300">{result}</p>
        </div>
      )}
    </div>
  );
}
