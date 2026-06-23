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

export function VoiceInput({ onTranscript, onListening, className, disabled }: VoiceInputProps) {
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(true);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [transcript, setTranscript] = useState("");
    
    // Ref instances
    const recognitionRef = useRef<any>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const transcriptRef = useRef("");

    // Sync transcript state to ref for callbacks
    useEffect(() => {
        transcriptRef.current = transcript;
    }, [transcript]);

    useEffect(() => {
        const hasSpeech = typeof window !== "undefined" && (
            "SpeechRecognition" in window ||
            "webkitSpeechRecognition" in window
        );
        const hasMedia = typeof navigator !== "undefined" && navigator.mediaDevices && typeof MediaRecorder !== "undefined";
        
        setIsSupported(hasSpeech || hasMedia);

        if (!hasSpeech) {
            return;
        }

        // Initialize SpeechRecognition only once if supported
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "fa-IR"; // Persian

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error:", event.error);
            if (event.error === "not-allowed") {
                setError("دسترسی به میکروفون داده نشد");
            } else if (event.error === "no-speech") {
                // Ignore no speech to prevent annoying alerts
            } else {
                setError("خطا در تشخیص صدا");
            }
            setIsListening(false);
            onListening?.(false);
        };

        recognition.onend = () => {
            setIsListening(false);
            onListening?.(false);
        };

        recognitionRef.current = recognition;

        return () => {
             if (recognitionRef.current) {
                 recognitionRef.current.abort();
             }
        };
    }, [onListening]);

    // Set up SpeechRecognition onresult callback
    useEffect(() => {
        if (!recognitionRef.current) return;
        
        recognitionRef.current.onresult = (event: any) => {
             let finalChunk = "";
             for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    finalChunk += event.results[i][0].transcript;
                }
             }

             if (finalChunk) {
                 setTranscript(prev => prev + " " + finalChunk);
             }
        };
    }, []);

    // SpeechRecognition onend sender
    useEffect(() => {
        if (recognitionRef.current) {
            recognitionRef.current.onend = () => {
                setIsListening(false);
                onListening?.(false);
                
                const text = transcriptRef.current;
                if (text && text.trim()) {
                    onTranscript(text.trim());
                }
            };
        }
    }, [onTranscript, onListening]);

    // SpeechRecognition controls
    const startListening = () => {
        if (!recognitionRef.current || disabled) return;
        setError(null);
        setTranscript("");
        
        try {
            recognitionRef.current.start();
            setIsListening(true);
            onListening?.(true);
        } catch (e) {
            console.error("Start error", e);
        }
    };

    const stopListening = () => {
        if (!recognitionRef.current) return;
        recognitionRef.current.stop();
    };

    // Fallback MediaRecorder recording
    const startRecording = async () => {
        if (disabled) return;
        setError(null);
        setTranscript("");
        audioChunksRef.current = [];

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                stream.getTracks().forEach(track => track.stop());

                const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
                
                setIsTranscribing(true);
                setError(null);

                try {
                    const formData = new FormData();
                    formData.append("file", audioBlob, "audio.webm");

                    const res = await fetch("/api/stt", {
                        method: "POST",
                        body: formData
                    });

                    if (!res.ok) {
                        const errorData = await res.json().catch(() => ({}));
                        throw new Error(errorData.error || "خطا در تبدیل صدا به متن");
                    }

                    const data = await res.json();
                    if (data.transcript && data.transcript.trim()) {
                        setTranscript(data.transcript.trim());
                        onTranscript(data.transcript.trim());
                    } else {
                        setError("صدایی تشخیص داده نشد");
                    }
                } catch (err: any) {
                    console.error("STT transcribing error:", err);
                    setError(err.message || "خطا در پردازش صدا");
                } finally {
                    setIsTranscribing(false);
                    setIsListening(false);
                    onListening?.(false);
                }
            };

            mediaRecorder.start();
            setIsListening(true);
            onListening?.(true);
        } catch (err: any) {
            console.error("Microphone access error:", err);
            setError("دسترسی به میکروفون داده نشد یا مسدود است");
            setIsListening(false);
            onListening?.(false);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
        }
    };

    const toggleListening = () => {
        const hasSpeech = typeof window !== "undefined" && (
            "SpeechRecognition" in window ||
            "webkitSpeechRecognition" in window
        );
        if (isListening) {
             if (hasSpeech) {
                 stopListening();
             } else {
                 stopRecording();
             }
        } else {
             if (hasSpeech) {
                 startListening();
             } else {
                 startRecording();
             }
        }
    };

    const stopActiveSession = () => {
        const hasSpeech = typeof window !== "undefined" && (
            "SpeechRecognition" in window ||
            "webkitSpeechRecognition" in window
        );
        if (hasSpeech) {
            stopListening();
        } else {
            stopRecording();
        }
    };

    if (!isSupported) {
        return (
            <Button
                variant="ghost"
                size="icon"
                disabled
                className={cn("text-muted-foreground", className)}
                title="مرورگر شما از ضبط یا تشخیص صدا پشتیبانی نمی‌کند"
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
                disabled={disabled || isTranscribing}
                className={cn(
                    "relative transition-all",
                    isListening && "animate-pulse shadow-lg shadow-red-500/30",
                    isTranscribing && "cursor-not-allowed opacity-80",
                    className
                )}
                title={isListening ? "توقف ضبط" : "ضبط صدا"}
            >
                {isTranscribing ? (
                    <Loader2 size={20} className="animate-spin text-primary" />
                ) : isListening ? (
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
                {(isListening || isTranscribing) && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        className="absolute bottom-full mb-2 right-0 w-64 bg-card border border-border rounded-xl p-3 shadow-xl z-50"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            {isTranscribing ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                                    <span className="text-xs font-bold text-muted-foreground">درحال تبدیل صدا به متن...</span>
                                </>
                            ) : (
                                <>
                                    <motion.div
                                        animate={{ opacity: [0.3, 1, 0.3] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                        className="w-2 h-2 bg-red-500 rounded-full"
                                    />
                                    <span className="text-xs font-bold text-muted-foreground">در حال گوش دادن...</span>
                                </>
                            )}
                        </div>

                        {transcript ? (
                            <p className="text-sm text-foreground leading-6 min-h-[40px]" dir="rtl">
                                {transcript}
                            </p>
                        ) : (
                            <p className="text-sm text-muted-foreground/50 italic" dir="rtl">
                                {isTranscribing ? "درحال ارسال فایل به سرور..." : "صحبت کنید..."}
                            </p>
                        )}
                        
                        {!isTranscribing && (
                            <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
                                 <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-6 text-[10px] text-red-500 hover:text-red-600 px-2"
                                    onClick={(e) => { e.stopPropagation(); stopActiveSession(); }}
                                 >
                                     توقف و ارسال
                                 </Button>
                            </div>
                        )}
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
                        className="absolute bottom-full mb-2 right-0 bg-destructive text-destructive-foreground text-xs px-3 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap z-50"
                        onClick={() => setError(null)}
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
