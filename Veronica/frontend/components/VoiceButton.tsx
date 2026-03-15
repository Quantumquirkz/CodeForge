"use client";

import { useVoice } from "../hooks/useVoice";
import { useWebSpeechAPI } from "../hooks/useWebSpeechAPI";

type Props = {
  sendVoice: (audioBase64: string, format?: string) => void;
  sendText?: (text: string) => void;
  lastVoiceOutput: { audio_base64: string; format: string } | null;
  clearVoiceOutput: () => void;
  disabled?: boolean;
  useWebSpeechFallback?: boolean;
};

export function VoiceButton({
  sendVoice,
  sendText,
  lastVoiceOutput,
  clearVoiceOutput,
  disabled,
  useWebSpeechFallback = false,
}: Props) {
  const webSpeech = useWebSpeechAPI();
  const serverVoice = useVoice({
    sendVoice,
    lastVoiceOutput,
    clearVoiceOutput,
    useWebSpeechFallback,
  });

  const useFallback = Boolean(useWebSpeechFallback && webSpeech.isSupported && sendText);

  const handleFallbackStart = () => {
    webSpeech.startListening((text) => {
      sendText?.(text);
      webSpeech.stopListening();
    });
  };

  const { isRecording, startListening, stopListening } = useFallback
    ? { isRecording: webSpeech.isListening, startListening: handleFallbackStart, stopListening: webSpeech.stopListening }
    : serverVoice;

  const handlePress = () => {
    if (disabled) return;
    if (isRecording) {
      stopListening();
    } else {
      if (useFallback) handleFallbackStart();
      else startListening();
    }
  };

  return (
    <button
      onClick={handlePress}
      disabled={disabled}
      title={isRecording ? "Detener grabación" : "Hablar"}
      style={{
        width: 48,
        height: 48,
        borderRadius: "50%",
        border: "none",
        background: isRecording ? "#ef4444" : "#3b82f6",
        color: "white",
        cursor: disabled ? "not-allowed" : "pointer",
        fontSize: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {isRecording ? "■" : "🎤"}
    </button>
  );
}
