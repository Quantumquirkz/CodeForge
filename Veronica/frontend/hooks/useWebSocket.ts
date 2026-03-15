"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8001/ws/chat";

export type ChatMessage = { role: "user" | "assistant"; content: string };

export function useWebSocket(sessionId = "default") {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const [lastVoiceOutput, setLastVoiceOutput] = useState<{
    audio_base64: string;
    format: string;
  } | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const send = useCallback((text: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ type: "message", text, session_id: sessionId }));
  }, [sessionId]);

  const sendVoice = useCallback(
    (audioBase64: string, format = "webm") => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
      wsRef.current.send(
        JSON.stringify({ type: "voice_input", audio_base64: audioBase64, format, session_id: sessionId })
      );
    },
    [sessionId]
  );

  const clearVoiceOutput = useCallback(() => setLastVoiceOutput(null), []);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;
    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onmessage = (ev) => {
      const data = JSON.parse(ev.data);
      if (data.type === "message" && data.role === "assistant") {
        setMessages((m) => [...m, { role: "assistant", content: data.content }]);
      } else if (data.type === "voice_output") {
        setLastVoiceOutput({ audio_base64: data.audio_base64, format: data.format || "mp3" });
      } else if (data.type === "error") {
        setMessages((m) => [...m, { role: "assistant", content: "Error: " + data.error }]);
      }
    };
    const ping = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: "ping" }));
    }, 25000);
    return () => {
      ws.close();
      clearInterval(ping);
      wsRef.current = null;
    };
  }, [sessionId]);

  const addUserMessage = useCallback((content: string) => {
    setMessages((m) => [...m, { role: "user", content }]);
    send(content);
  }, [send]);

  return { messages, connected, send: addUserMessage, sendVoice, lastVoiceOutput, clearVoiceOutput };
}
