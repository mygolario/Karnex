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
    
    // Use a ref to keep the instance stable across renders
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (!isSpeechSupported) {
            setIsSupported(false);
            return;
        }

        // Initialize only once
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "fa-IR"; // Persian

        recognition.onresult = (event: any) => {
            let finalTranscript = "";
            let interimTranscript = "";

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const t = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += t;
                } else {
                    interimTranscript += t;
                }
            }

            if (finalTranscript) {
                // Update local transcript state for display
                setTranscript(prev => prev + finalTranscript);
                // Also immediately verify if we want to stream chunks, 
                // but usually we wait for stop.
            } else if (interimTranscript) {
                // Just for display
                setTranscript(prev => {
                    // This creates a visual glitch if we append interim to final in the same state string 
                    // without separating them.
                    // Better approach: keep them separate or just show interim-only if final is empty?
                    // For simplicity in this UI, we just overwrite 'transcript' with valid text? 
                    // No, let's just use the current logic but be careful.
                    // Actually, the previous logic was appending final to state.
                    // Interim updates purely local display if we want.
                    return prev; // We rely on final results mostly for clarity? 
                    // Let's stick to the simpler version: JUST use the interim for live feedback if needed 
                    // but for the final output we want the accumulated finalized text.
                });
                
                // For the "live preview" popup, we essentially want (final + interim).
                // But managing that complexity is tricky. 
                // Let's simplify: Just allow onresult to update a 'liveTranscript' state.
            }
        };

        // We need a specific listener for onresult that handles the state update correctly
        // to avoid closure staleness if we used 'transcript' state inside.
        // But 'setTranscript' with callback is fine.

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error:", event.error);
            if (event.error === "not-allowed") {
                setError("دسترسی به میکروفون داده نشد");
            } else if (event.error === "no-speech") {
                // User was silent, just stop without error usually, or prompt.
                // setError("صدایی شنیده نشد"); 
            } else {
                setError("خطا در تشخیص صدا");
            }
            // If error occurs, we must ensure state sync
            setIsListening(false);
            onListening?.(false);
        };

        recognition.onend = () => {
            // This fires when the engine stops.
            // If we EXPECTED it to be listening (e.g. it stopped due to silence but we want continuous),
            // we could restart. But browsers block auto-restart often.
            // Better to sync state.
            setIsListening(false);
            onListening?.(false);
        };

        recognitionRef.current = recognition;

        return () => {
             // Cleanup on unmount
             if (recognitionRef.current) {
                 recognitionRef.current.abort();
             }
        };
    }, []); // Empty dependency array = init once!

    // We can't use 'transcript' state easily inside onresult because of closure.
    // So we'll redefine the onresult handler every render? No, that breaks the instance.
    // WE need to maintain the current transcript in a ref if we want to append.
    // OR just use functional state updates.
    
    // Refine onresult logic for the Effect:
    useEffect(() => {
        if (!recognitionRef.current) return;
        
        recognitionRef.current.onresult = (event: any) => {
             let finalChunk = "";
             let interimChunk = "";

             for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    finalChunk += event.results[i][0].transcript;
                } else {
                    interimChunk += event.results[i][0].transcript;
                }
             }

             if (finalChunk) {
                 setTranscript(prev => prev + " " + finalChunk); // Append space
             }
             // We could expose interimChunk to UI via another state if we wanted "real-time" visuals
        };
    }, []);


    const startListening = () => {
        if (!recognitionRef.current || disabled) return;
        setError(null);
        setTranscript(""); // Clear previous
        
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
        // State update happens in onend or manual? 
        // Better to set it here purely for immediate UI feedback, 
        // but real "stop" happens in onend. 
        // However, we want to send the message NOW usually?
        // No, we must wait for the final result processing which happens AFTER stop() is called.
        // So we should trigger the "send" logic in 'onend' OR just wait a tiny bit?
        // Actually, if we just call onTranscript with the CURRENT state, we miss the final processing chunk.
        
        // Strategy: 
        // 1. Call .stop()
        // 2. Wait for 'onend' event.
        // 3. In 'onend', read the FINAL transcript and send it.
    };
    
    // We need a way to pass the transcript to the parent when stopped.
    // The problem is 'onend' closes over the 'transcript' state from the initial render (empty).
    // So we use a Ref for the transcript to access it in onend.
    const transcriptRef = useRef("");
    useEffect(() => { transcriptRef.current = transcript; }, [transcript]);

    useEffect(() => {
        if (recognitionRef.current) {
            recognitionRef.current.onend = () => {
                setIsListening(false);
                onListening?.(false);
                
                // Send what we have
                const text = transcriptRef.current;
                if (text && text.trim()) {
                    onTranscript(text.trim());
                }
            };
        }
    }, [onTranscript, onListening]); // Update handler if props change


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
                        className="absolute bottom-full mb-2 right-0 w-64 bg-card border border-border rounded-xl p-3 shadow-xl z-50"
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
                             <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 text-[10px] text-red-500 hover:text-red-600 px-2"
                                onClick={(e) => { e.stopPropagation(); stopListening(); }}
                             >
                                 توقف و ارسال
                             </Button>
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
                        className="absolute bottom-full mb-2 right-0 bg-destructive text-destructive-foreground text-xs px-3 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap z-50"
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
