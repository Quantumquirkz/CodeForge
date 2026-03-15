"use client";

import { useEffect, useRef, useState } from "react";
import { ChatInput } from "./ChatInput";
import { VoiceButton } from "./VoiceButton";
import { VoiceToggle } from "./VoiceToggle";
import { VoiceModeView } from "./VoiceModeView";
import { useWebSocket } from "../hooks/useWebSocket";
import { useWebSpeechAPI } from "../hooks/useWebSpeechAPI";

const useWebSpeechFallback = process.env.NEXT_PUBLIC_VOICE_FALLBACK === "1";

export function ChatWindow() {
  const [voiceMode, setVoiceMode] = useState(false);
  const { messages, connected, send, sendVoice, lastVoiceOutput, clearVoiceOutput } = useWebSocket();
  const webSpeech = useWebSpeechAPI();
  const lastSpokenIdx = useRef(-1);

  useEffect(() => {
    if (!useWebSpeechFallback || !webSpeech.isSupported) return;
    const last = messages.length - 1;
    if (last >= 0 && messages[last].role === "assistant" && last > lastSpokenIdx.current) {
      lastSpokenIdx.current = last;
      webSpeech.speak(messages[last].content);
    }
  }, [messages, useWebSpeechFallback, webSpeech.isSupported, webSpeech.speak]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        maxWidth: 800,
        margin: "0 auto",
        padding: 16,
      }}
    >
      <header
        style={{
          padding: "8px 0",
          borderBottom: "1px solid #334155",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <h1 style={{ margin: 0, fontSize: 24 }}>Veronica</h1>
          <span style={{ fontSize: 12, color: connected ? "#22c55e" : "#ef4444" }}>
            {connected ? "Conectado" : "Desconectado"}
          </span>
        </div>
        <VoiceToggle voiceMode={voiceMode} onToggle={setVoiceMode} />
      </header>

      {voiceMode ? (
        <VoiceModeView
          sendVoice={sendVoice}
          sendText={send}
          lastVoiceOutput={lastVoiceOutput}
          clearVoiceOutput={clearVoiceOutput}
          disabled={!connected}
          useWebSpeechFallback={useWebSpeechFallback}
        />
      ) : (
        <>
          <div style={{ flex: 1, overflow: "auto", padding: "16px 0" }}>
            {messages.length === 0 && (
              <p style={{ color: "#94a3b8", fontSize: 14 }}>
                Di &quot;aprender sobre [tema]&quot; para que Veronica ingiera conocimiento de la web,
                o &quot;crear herramienta que [descripción]&quot; para generar plugins.
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  marginBottom: 12,
                  padding: 12,
                  borderRadius: 8,
                  background: m.role === "user" ? "#1e293b" : "#0f172a",
                  borderLeft: m.role === "user" ? "3px solid #3b82f6" : "3px solid #10b981",
                }}
              >
                <strong>{m.role === "user" ? "Tú" : "Veronica"}</strong>
                <div style={{ marginTop: 4 }}>{m.content}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <VoiceButton
              sendVoice={sendVoice}
              sendText={send}
              lastVoiceOutput={lastVoiceOutput}
              clearVoiceOutput={clearVoiceOutput}
              disabled={!connected}
              useWebSpeechFallback={useWebSpeechFallback}
            />
            <ChatInput onSend={send} disabled={!connected} />
          </div>
        </>
      )}
    </div>
  );
}
