"use client";

import { useState, KeyboardEvent } from "react";

type Props = {
  onSend: (text: string) => void;
  disabled?: boolean;
};

export function ChatInput({ onSend, disabled }: Props) {
  const [text, setText] = useState("");

  const handleSend = () => {
    const t = text.trim();
    if (!t || disabled) return;
    onSend(t);
    setText("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Escribe un mensaje..."
        disabled={disabled}
        rows={2}
        style={{
          flex: 1,
          padding: 12,
          borderRadius: 8,
          border: "1px solid #334155",
          background: "#1e293b",
          color: "#e2e8f0",
          resize: "none",
        }}
      />
      <button
        onClick={handleSend}
        disabled={disabled || !text.trim()}
        style={{
          padding: "12px 24px",
          borderRadius: 8,
          background: "#3b82f6",
          color: "white",
          border: "none",
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        Enviar
      </button>
    </div>
  );
}
