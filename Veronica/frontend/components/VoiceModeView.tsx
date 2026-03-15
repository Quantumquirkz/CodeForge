"use client";

import { VoiceButton } from "./VoiceButton";

type Props = {
  sendVoice: (audioBase64: string, format?: string) => void;
  sendText?: (text: string) => void;
  lastVoiceOutput: { audio_base64: string; format: string } | null;
  clearVoiceOutput: () => void;
  disabled?: boolean;
  useWebSpeechFallback?: boolean;
};

export function VoiceModeView({ sendVoice, sendText, lastVoiceOutput, clearVoiceOutput, disabled, useWebSpeechFallback }: Props) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        padding: 24,
      }}
    >
      <p style={{ color: "#94a3b8", fontSize: 16, margin: 0 }}>
        Mantén pulsado para hablar. Veronica te responderá con voz.
      </p>
      <VoiceButton
        sendVoice={sendVoice}
        sendText={sendText}
        lastVoiceOutput={lastVoiceOutput}
        clearVoiceOutput={clearVoiceOutput}
        disabled={disabled}
        useWebSpeechFallback={useWebSpeechFallback}
      />
    </div>
  );
}
