import { useState, useEffect } from "react";
import { importChat, getImportedChats } from "../api/client";

export default function Import() {
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const [imported, setImported] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);

  useEffect(() => {
    getImportedChats().then(setImported).finally(() => setListLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    try {
      await importChat(file, name || undefined);
      setFile(null);
      setName("");
      setImported(await getImportedChats());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Importar chat</h1>
      <p className="text-slate-400 text-sm">Exporta un chat de WhatsApp (.txt) y súbelo aquí.</p>
      <form onSubmit={handleSubmit} className="bg-slate-800 rounded-lg p-4 border border-slate-700 space-y-3 max-w-md">
        <div>
          <label className="block text-sm text-slate-400">Archivo .txt</label>
          <input type="file" accept=".txt" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="mt-1 block w-full text-sm text-slate-400" />
        </div>
        <div>
          <label className="block text-sm text-slate-400">Nombre (opcional)</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full mt-1 bg-slate-700 border border-slate-600 rounded px-3 py-2" />
        </div>
        <button type="submit" disabled={!file || loading} className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-4 py-2 rounded">
          {loading ? "Importando..." : "Importar"}
        </button>
      </form>
      <section>
        <h2 className="font-semibold mb-2">Importaciones</h2>
        {listLoading ? <p className="text-slate-500">Cargando...</p> : (
          <ul className="space-y-2">
            {imported.length === 0 && <li className="text-slate-500">Ninguna</li>}
            {imported.map((c) => (
              <li key={c.id} className="text-sm text-slate-300">{c.name} — {new Date(c.imported_at).toLocaleString()}</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
