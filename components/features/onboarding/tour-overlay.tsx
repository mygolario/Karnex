"use client";

import { useTour } from "./tour-context";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function TourOverlay() {
  const { 
    isOpen, 
    currentStep, 
    nextStep, 
    prevStep, 
    skipTour, 
    currentStepIndex, 
    totalSteps
  } = useTour();
  
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  
  // Track window resize to update rect
  useEffect(() => {
    if (!isOpen) return;

    const updateRect = () => {
      if (!currentStep) return;
      const element = document.querySelector(`[data-tour-id="${currentStep.targetId}"]`);
      if (element) {
        // Check if element is actually visible
        const rect = element.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) {
            console.warn("Target has 0 dimensions:", currentStep.targetId);
        }
        setTargetRect(rect);
      } else {
        // Fallback for centered steps (like welcome/finish) if no target found
        // or if targetId is explicitly 'dashboard-root'
        if (currentStep.targetId === 'dashboard-root') {
             // Center of screen pseudo-rect
             const width = 0;
             const height = 0;
             setTargetRect({
                 top: window.innerHeight / 2,
                 left: window.innerWidth / 2,
                 width,
                 height,
                 right: window.innerWidth / 2,
                 bottom: window.innerHeight / 2,
                 x: window.innerWidth / 2,
                 y: window.innerHeight / 2,
                 toJSON: () => {}
             });
        }
      }
    };

    updateRect();
    window.addEventListener("resize", updateRect);
    // Also scroll listener to keep tracking
    window.addEventListener("scroll", updateRect, true);

    // Small delay to ensure rendering if executing fast
    const timer = setTimeout(updateRect, 100);

    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
      clearTimeout(timer);
    };
  }, [isOpen, currentStep]);

  if (!isOpen || !currentStep || !targetRect) return null;

  // Center mode check
  const isCentered = currentStep.targetId === 'dashboard-root';

  // Calculate position for the tooltip card
  // Simple logic: if centered, center it. If not, place based on position preference or default to bottom.
  
  // Robust Positioning Logic (RTL-Safe)
  const getTooltipStyle = () => {
    if (isCentered) {
        return {
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)"
        };
    }

    const CARD_WIDTH = 350;
    const CARD_EST_HEIGHT = 220; // Slightly taller estimate for safety
    const GAP = 24 + (currentStep.offset || 0);
    const SCREEN_PAD = 20;

    // Determine base position from preference
    let pos = currentStep.position || 'bottom';
    
    // Auto-switch for full-height elements (like sidebar) if top/bottom requested
    if ((pos === 'top' || pos === 'bottom') && targetRect.height > window.innerHeight * 0.8) {
        // If element is on the right half, put on left
        if (targetRect.left > window.innerWidth / 2) pos = 'left';
        else pos = 'right';
    }

    let top = 0;
    let left = 0;
    let transform = "";

    // Calculate Top/Left corner of the card explicitly
    switch (pos) {
        case 'left':
            // Card is to the LEFT of the target
            left = targetRect.left - GAP - CARD_WIDTH;
            top = targetRect.top + (targetRect.height / 2) - 60; // Shift UP a bit
            transform = "translate(0, -50%)";
            break;
            
        case 'right':
            // Card is to the RIGHT of the target
            left = targetRect.right + GAP;
            top = targetRect.top + (targetRect.height / 2) - 60; // Shift UP a bit
            transform = "translate(0, -50%)";
            break;

        case 'top':
            // Card is ABOVE the target, centered horizontally
            left = targetRect.left + (targetRect.width / 2) - (CARD_WIDTH / 2);
            top = targetRect.top - GAP - CARD_EST_HEIGHT; // Approximate top edge
            transform = "translate(0, 0)"; // No transform for Y to keep logic simple? Or use Y-100%
            // Actually let's use translate-y only for cleaner center logic
            top = targetRect.top - GAP;
            left = targetRect.left + (targetRect.width / 2) - (CARD_WIDTH / 2);
            transform = "translate(0, -100%)";
            break;

        case 'bottom':
        default:
            // Card is BELOW the target, centered horizontally
            left = targetRect.left + (targetRect.width / 2) - (CARD_WIDTH / 2);
            top = targetRect.bottom + GAP;
            transform = "translate(0, 0)";
            break;
    }

    // --- Comprehensive Safety Clamps ---

    // 1. Horizontal Clamp (Left/Right bounds)
    // We calculate the card's visual edges and push it back on screen
    const visualLeft = left;
    const visualRight = left + CARD_WIDTH;

    if (visualLeft < SCREEN_PAD) {
        left = SCREEN_PAD;
    } else if (visualRight > window.innerWidth - SCREEN_PAD) {
        left = window.innerWidth - SCREEN_PAD - CARD_WIDTH;
    }

    // 2. Vertical Clamp (Top/Bottom bounds)
    // We calculate visual edges based on transform
    let visualTop = top;
    let visualBottom = top + CARD_EST_HEIGHT;

    if (pos === 'left' || pos === 'right') {
        // Centered vertically
        visualTop = top - (CARD_EST_HEIGHT / 2);
        visualBottom = top + (CARD_EST_HEIGHT / 2);
    } else if (pos === 'top') {
        // Shifted up
        visualTop = top - CARD_EST_HEIGHT;
        visualBottom = top;
    }

    if (visualTop < SCREEN_PAD) {
        if (pos === 'left' || pos === 'right') {
             top = SCREEN_PAD + (CARD_EST_HEIGHT / 2);
        } else {
             // For top/bottom, just push it down/up or flip
             // Simple clamp for now:
             top = SCREEN_PAD + CARD_EST_HEIGHT; // Push down (effectively flip logic if needed, but let's clamp)
             if (pos === 'top') {
                 // Convert to bottom-ish behavior or just hard clamp top edge
                 top = targetRect.bottom + GAP; 
                 transform = "translate(0, 0)";
             }
        }
    } else if (visualBottom > window.innerHeight - SCREEN_PAD) {
        if (pos === 'left' || pos === 'right') {
             top = window.innerHeight - SCREEN_PAD - (CARD_EST_HEIGHT / 2);
        } else {
             // Clamp bottom edge
             // If Bottom placement goes off screen, flip to Top
             if (pos === 'bottom') {
                 top = targetRect.top - GAP;
                 transform = "translate(0, -100%)";
             }
        }
    }

    return { top, left, transform };
  };
    
  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden" dir="rtl">
        
      {/* Spotlight Effect using massive box-shadow on a motion div */}
      <motion.div
        className="absolute rounded-xl pointer-events-auto transition-[box-shadow]"
        initial={false}
        animate={{
          top: targetRect.top - 10, // Padding
          left: targetRect.left - 10,
          width: targetRect.width + 20,
          height: targetRect.height + 20,
          // The "Spotlight": A massive shadow that covers the screen
          boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.6)", 
        }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 30
        }}
        style={{
             // Add a subtle glow border manually via box-shadow layer if needed, 
             // but here we rely on the main shadow.
        }}
      >
        {/* We can put a glowing border here if we want extra flair */}
        <div className="absolute inset-0 rounded-xl ring-2 ring-primary/50 animate-pulse" />
      </motion.div>


      {/* Tooltip Card */}
      <AnimatePresence mode="wait">
        <motion.div
            key={currentStep.id + (isOpen ? 'open' : 'closed')}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className={cn(
                "fixed pointer-events-auto w-[350px] bg-card/90 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl",
                // Positioning logic classes could go here, but inline styles are safer for dynamic coords
            )}
            style={getTooltipStyle()}
        >
            {/* Content */}
            <div className="relative">
                <div className="flex justify-between items-start mb-4">
                     <h3 className="text-xl font-bold text-foreground">
                        {currentStep.title}
                     </h3>
                     <button onClick={skipTour} className="text-muted-foreground hover:text-foreground">
                        <X className="w-5 h-5" />
                     </button>
                </div>
                
                <p className="text-muted-foreground leading-relaxed mb-6">
                    {currentStep.description}
                </p>

                {/* Footer Controls */}
                <div className="flex items-center justify-between mt-4">
                     <span className="text-xs font-medium text-muted-foreground">
                        {currentStepIndex + 1} / {totalSteps}
                     </span>
                     
                     <div className="flex gap-2">
                        {currentStepIndex > 0 && (
                            <Button size="sm" variant="ghost" onClick={prevStep}>
                                قبلی
                            </Button>
                        )}
                        
                        <Button size="sm" onClick={nextStep} className="bg-primary hover:bg-primary/90 text-white shadow-glow">
                             {currentStepIndex === totalSteps - 1 ? (
                                <>
                                    پایان
                                    <Check className="mr-2 w-4 h-4" />
                                </>
                             ) : (
                                <>
                                    بعدی
                                    <ArrowLeft className="mr-2 w-4 h-4" />
                                </>
                             )}
                        </Button>
                     </div>
                </div>
            </div>
        </motion.div>
      </AnimatePresence>

    </div>
  );
}
