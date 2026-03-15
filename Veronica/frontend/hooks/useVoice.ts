"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type UseVoiceOptions = {
  sendVoice: (audioBase64: string, format?: string) => void;
  sendText?: (text: string) => void;
  lastVoiceOutput: { audio_base64: string; format: string } | null;
  clearVoiceOutput: () => void;
  useWebSpeechFallback?: boolean;
};

export function useVoice({
  sendVoice,
  sendText,
  lastVoiceOutput,
  clearVoiceOutput,
  useWebSpeechFallback = false,
}: UseVoiceOptions) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const playAudio = useCallback((audioBase64: string) => {
    const audio = new Audio("data:audio/mp3;base64," + audioBase64);
    setIsPlaying(true);
    audio.onended = () => {
      setIsPlaying(false);
    };
    audio.onerror = () => setIsPlaying(false);
    audio.play();
  }, []);

  useEffect(() => {
    if (lastVoiceOutput?.audio_base64 && !useWebSpeechFallback) {
      playAudio(lastVoiceOutput.audio_base64);
      clearVoiceOutput();
    }
  }, [lastVoiceOutput, playAudio, clearVoiceOutput, useWebSpeechFallback]);

  const startListening = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(",")[1];
          if (base64) sendVoice(base64, "webm");
        };
        reader.readAsDataURL(blob);
      };
      recorder.start(100);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (e) {
      console.error("Microphone access denied:", e);
    }
  }, [sendVoice]);

  const stopListening = useCallback(() => {
    const rec = mediaRecorderRef.current;
    if (rec && rec.state !== "inactive") {
      rec.stop();
      mediaRecorderRef.current = null;
      setIsRecording(false);
    }
  }, []);

  return { isRecording, isPlaying, startListening, stopListening };
}
