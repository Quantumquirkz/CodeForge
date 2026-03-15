"use client";

import { useCallback, useRef, useState } from "react";

export function useWebSpeechAPI() {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<unknown>(null);

  const isSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) &&
    "speechSynthesis" in window;

  const startListening = useCallback((onTranscript: (text: string) => void) => {
    if (!isSupported) return;
    const Rec = (window as unknown as { SpeechRecognition?: new () => SpeechRecognition; webkitSpeechRecognition?: new () => SpeechRecognition }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognition }).webkitSpeechRecognition;
    if (!Rec) return;
    const rec = new Rec();
    rec.lang = "es-ES";
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e: SpeechRecognitionEvent) => {
      const t = e.results[e.results.length - 1][0].transcript;
      if (t) onTranscript(t);
    };
    rec.onend = () => setIsListening(false);
    rec.onerror = () => setIsListening(false);
    rec.start();
    recognitionRef.current = rec;
    setIsListening(true);
  }, [isSupported]);

  const stopListening = useCallback(() => {
    const rec = recognitionRef.current as { stop?: () => void } | null;
    if (rec?.stop) {
      rec.stop();
      recognitionRef.current = null;
      setIsListening(false);
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (!isSupported || !text) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "es-ES";
    window.speechSynthesis.speak(u);
  }, [isSupported]);

  return { isSupported, isListening, startListening, stopListening, speak };
}
