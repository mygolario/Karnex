"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  className?: string;
}

export function VoiceInputButton({ onTranscript, disabled, className }: VoiceInputButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "fa-IR"; // Persian

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onTranscript(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setError("خطا در تشخیص صدا");
        setIsListening(false);
        setTimeout(() => setError(null), 3000);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [onTranscript]);

  const toggleListening = () => {
    if (!isSupported || disabled) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setError(null);
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  if (!isSupported) {
    return null; // Don't render if not supported
  }

  return (
    <div className="relative">
      <motion.button
        type="button"
        onClick={toggleListening}
        disabled={disabled}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "p-3 rounded-xl transition-all",
          isListening 
            ? "bg-destructive text-white animate-pulse"
            : "bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        title={isListening ? "توقف ضبط" : "ضبط صدا"}
      >
        <AnimatePresence mode="wait">
          {isListening ? (
            <motion.div
              key="listening"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <MicOff size={20} />
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Mic size={20} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Listening indicator */}
      {isListening && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full mt-2 right-0 flex items-center gap-2 text-xs text-destructive whitespace-nowrap"
        >
          <Loader2 size={12} className="animate-spin" />
          در حال گوش دادن...
        </motion.div>
      )}

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full mt-2 right-0 text-xs text-destructive whitespace-nowrap"
        >
          {error}
        </motion.div>
      )}
    </div>
  );
}
