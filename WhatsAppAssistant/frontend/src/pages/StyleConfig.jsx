import { useState, useEffect } from "react";
import { getStyle, updateStyle } from "../api/client";

export default function StyleConfig() {
  const [style, setStyle] = useState({ tone: "friendly", formality: 5, brevity: 5, emoji_policy: "moderate", owner_name: "", signature_phrases: [], writing_rules: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getStyle().then((s) => {
      setStyle({ tone: s.tone || "friendly", formality: s.formality ?? 5, brevity: s.brevity ?? 5, emoji_policy: s.emoji_policy || "moderate", owner_name: s.owner_name || "", signature_phrases: Array.isArray(s.signature_phrases) ? s.signature_phrases : [], writing_rules: Array.isArray(s.writing_rules) ? s.writing_rules : [] });
    }).finally(() => setLoading(false));
  }, []);

  const save = async () => { setSaving(true); try { await updateStyle(style); } finally { setSaving(false); } };

  if (loading) return <p className="text-slate-400">Cargando...</p>;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Estilo</h1>
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 space-y-4 max-w-xl">
        <div><label className="block text-sm text-slate-400">Tu nombre</label><input type="text" value={style.owner_name} onChange={(e) => setStyle((s) => ({ ...s, owner_name: e.target.value }))} className="w-full mt-1 bg-slate-700 border border-slate-600 rounded px-3 py-2" /></div>
        <div><label className="block text-sm text-slate-400">Tono</label><select value={style.tone} onChange={(e) => setStyle((s) => ({ ...s, tone: e.target.value }))} className="w-full mt-1 bg-slate-700 border border-slate-600 rounded px-3 py-2"><option value="friendly">Amigable</option><option value="formal">Formal</option><option value="casual">Casual</option></select></div>
        <div><label className="block text-sm text-slate-400">Formalidad: {style.formality}</label><input type="range" min="1" max="10" value={style.formality} onChange={(e) => setStyle((s) => ({ ...s, formality: Number(e.target.value) }))} className="w-full" /></div>
        <div><label className="block text-sm text-slate-400">Brevedad: {style.brevity}</label><input type="range" min="1" max="10" value={style.brevity} onChange={(e) => setStyle((s) => ({ ...s, brevity: Number(e.target.value) }))} className="w-full" /></div>
        <div><label className="block text-sm text-slate-400">Emojis</label><select value={style.emoji_policy} onChange={(e) => setStyle((s) => ({ ...s, emoji_policy: e.target.value }))} className="w-full mt-1 bg-slate-700 border border-slate-600 rounded px-3 py-2"><option value="none">No</option><option value="moderate">Moderado</option><option value="yes">Sí</option></select></div>
        <button onClick={save} disabled={saving} className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-4 py-2 rounded">{saving ? "Guardando..." : "Guardar"}</button>
      </div>
    </div>
  );
}
