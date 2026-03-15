"use client";

type Props = {
  voiceMode: boolean;
  onToggle: (voice: boolean) => void;
};

export function VoiceToggle({ voiceMode, onToggle }: Props) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer" }}>
      <span style={{ color: "#94a3b8" }}>Texto</span>
      <input
        type="checkbox"
        checked={voiceMode}
        onChange={(e) => onToggle(e.target.checked)}
        style={{ width: 18, height: 18, cursor: "pointer" }}
      />
      <span style={{ color: "#94a3b8" }}>Voz</span>
    </label>
  );
}
