import { useState, useEffect } from "react";
import { getSession, startSession, getLogs } from "../api/client";

export default function Dashboard() {
  const [session, setSession] = useState({ status: "disconnected", qr: null });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [s, l] = await Promise.all([getSession(), getLogs(30)]);
        if (!cancelled) setSession(s), setLogs(l);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    const t = setInterval(load, 5000);
    return () => { cancelled = true; clearInterval(t); };
  }, []);

  const handleStart = async () => {
    setStarting(true);
    try {
      setSession(await startSession());
    } finally {
      setStarting(false);
    }
  };

  if (loading) return <p className="text-slate-400">Cargando...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <section className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <h2 className="font-semibold mb-2">WhatsApp</h2>
        <p className="text-slate-300">Estado: <span className={session.status === "connected" ? "text-emerald-400" : "text-amber-400"}>{session.status}</span></p>
        {session.status !== "connected" && (
          <div className="mt-3">
            <button onClick={handleStart} disabled={starting} className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-4 py-2 rounded">
              {starting ? "Iniciando..." : "Conectar (QR)"}
            </button>
            {session.qr && (
              <div className="mt-4">
                <p className="text-sm text-slate-400 mb-2">Escanea con WhatsApp:</p>
                <img src={session.qr} alt="QR" className="w-48 h-48 border border-slate-600 rounded" />
              </div>
            )}
          </div>
        )}
      </section>
      <section className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <h2 className="font-semibold mb-2">Últimos mensajes</h2>
        <ul className="space-y-2 max-h-96 overflow-y-auto">
          {logs.length === 0 && <li className="text-slate-500">Sin mensajes</li>}
          {logs.map((m) => (
            <li key={m.id} className="text-sm border-b border-slate-700 pb-2">
              <span className="text-slate-500">{m.chat_name || m.chat_id}</span> [{m.role}]: {String(m.content).slice(0, 80)}{String(m.content).length > 80 ? "…" : ""}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
