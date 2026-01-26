"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VoiceInputProps {
    onTranscript: (text: string) => void;
    onListening?: (isListening: boolean) => void;
    className?: string;
    disabled?: boolean;
}

// Check if browser supports speech recognition
const isSpeechSupported = typeof window !== "undefined" && (
    "SpeechRecognition" in window ||
    "webkitSpeechRecognition" in window
);

export function VoiceInput({ onTranscript, onListening, className, disabled }: VoiceInputProps) {
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [transcript, setTranscript] = useState("");
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (!isSpeechSupported) {
            setIsSupported(false);
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();

        const recognition = recognitionRef.current;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "fa-IR"; // Persian

        recognition.onresult = (event: any) => {
            let finalTranscript = "";
            let interimTranscript = "";

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }

            if (finalTranscript) {
                setTranscript(prev => prev + finalTranscript);
            } else if (interimTranscript) {
                // Show interim results for feedback
                setTranscript(interimTranscript);
            }
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error:", event.error);
            if (event.error === "not-allowed") {
                setError("دسترسی به میکروفون داده نشد");
            } else if (event.error === "no-speech") {
                setError("صدایی شنیده نشد");
            } else {
                setError("خطا در تشخیص صدا");
            }
            stopListening();
        };

        recognition.onend = () => {
            if (isListening) {
                // Auto-restart if we were listening
                try {
                    recognition.start();
                } catch (e) {
                    stopListening();
                }
            }
        };

        return () => {
            if (recognition) {
                recognition.abort();
            }
        };
    }, [isListening]);

    const startListening = () => {
        if (!recognitionRef.current || disabled) return;

        setError(null);
        setTranscript("");
        setIsListening(true);
        onListening?.(true);

        try {
            recognitionRef.current.start();
        } catch (e) {
            setError("نمی‌تونم میکروفون رو فعال کنم");
            setIsListening(false);
        }
    };

    const stopListening = () => {
        if (!recognitionRef.current) return;

        recognitionRef.current.stop();
        setIsListening(false);
        onListening?.(false);

        // Send final transcript
        if (transcript.trim()) {
            onTranscript(transcript.trim());
        }
        setTranscript("");
    };

    const toggleListening = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    if (!isSupported) {
        return (
            <Button
                variant="ghost"
                size="icon"
                disabled
                className={cn("text-muted-foreground", className)}
                title="مرورگر شما از تشخیص صدا پشتیبانی نمی‌کند"
            >
                <MicOff size={20} />
            </Button>
        );
    }

    return (
        <div className="relative">
            <Button
                variant={isListening ? "destructive" : "ghost"}
                size="icon"
                onClick={toggleListening}
                disabled={disabled}
                className={cn(
                    "relative transition-all",
                    isListening && "animate-pulse shadow-lg shadow-red-500/30",
                    className
                )}
                title={isListening ? "توقف ضبط" : "ضبط صدا"}
            >
                {isListening ? (
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                    >
                        <Mic size={20} className="text-white" />
                    </motion.div>
                ) : (
                    <Mic size={20} />
                )}

                {/* Recording indicator */}
                {isListening && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
                    />
                )}
            </Button>

            {/* Transcript popup */}
            <AnimatePresence>
                {isListening && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        className="absolute bottom-full mb-2 right-0 w-64 bg-card border border-border rounded-xl p-3 shadow-xl"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <motion.div
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="w-2 h-2 bg-red-500 rounded-full"
                            />
                            <span className="text-xs font-bold text-muted-foreground">در حال گوش دادن...</span>
                        </div>

                        {transcript ? (
                            <p className="text-sm text-foreground leading-6 min-h-[40px]" dir="rtl">
                                {transcript}
                            </p>
                        ) : (
                            <p className="text-sm text-muted-foreground/50 italic" dir="rtl">
                                صحبت کنید...
                            </p>
                        )}

                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
                            <span className="text-[10px] text-muted-foreground">کلیک کنید برای ارسال</span>
                            <div className="flex gap-2">
                                <div className="w-1 h-3 bg-primary rounded-full animate-pulse" />
                                <div className="w-1 h-4 bg-primary rounded-full animate-pulse [animation-delay:0.2s]" />
                                <div className="w-1 h-2 bg-primary rounded-full animate-pulse [animation-delay:0.4s]" />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error popup */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-full mb-2 right-0 bg-destructive text-destructive-foreground text-xs px-3 py-2 rounded-lg flex items-center gap-2"
                    >
                        <AlertCircle size={14} />
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Compact voice button for mobile
export function VoiceButton({ onTranscript, isListening, onClick }: {
    onTranscript?: (text: string) => void;
    isListening?: boolean;
    onClick?: () => void;
}) {
    return (
        <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onClick}
            className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                isListening
                    ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                    : "bg-muted hover:bg-muted/80 text-muted-foreground"
            )}
        >
            {isListening ? (
                <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                >
                    <Mic size={24} />
                </motion.div>
            ) : (
                <Mic size={24} />
            )}
        </motion.button>
    );
}
