"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { MessageSquarePlus, Star, Send, X, Check, Loader2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useLocale } from "@/hooks/use-translations";
import { collection, addDoc } from "firebase/firestore";
import { db, appId } from "@/lib/firebase";

export function FeedbackWidget() {
  const { user } = useAuth();
  const { locale, isRTL } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [category, setCategory] = useState<string>("general");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const labels = locale === 'fa' ? {
    sendFeedback: 'ارسال بازخورد',
    title: 'نظر شما مهمه!',
    subtitle: 'کمک کنید کارنکس رو بهتر کنیم',
    placeholder: 'نظر، پیشنهاد یا انتقاد خود را اینجا بنویسید...',
    submitButton: 'ارسال بازخورد',
    thankYou: 'ممنون از شما! 💚',
    thankYouDesc: 'نظر شما ثبت شد و به بهبود کارنکس کمک می‌کنه.',
    errorMessage: 'خطا در ارسال بازخورد. لطفاً دوباره تلاش کنید.',
    categories: [
      { id: "general", label: "کلی" },
      { id: "bug", label: "گزارش باگ" },
      { id: "feature", label: "پیشنهاد قابلیت" },
      { id: "ui", label: "طراحی و ظاهر" },
    ],
  } : {
    sendFeedback: 'Send Feedback',
    title: 'Your Opinion Matters!',
    subtitle: 'Help us improve Karnex',
    placeholder: 'Write your feedback, suggestions, or criticism here...',
    submitButton: 'Submit Feedback',
    thankYou: 'Thank You! 💚',
    thankYouDesc: 'Your feedback has been submitted and will help improve Karnex.',
    errorMessage: 'Error submitting feedback. Please try again.',
    categories: [
      { id: "general", label: "General" },
      { id: "bug", label: "Bug Report" },
      { id: "feature", label: "Feature Request" },
      { id: "ui", label: "Design & UI" },
    ],
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async () => {
    if (rating === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const feedbackData = {
        userId: user?.uid || "anonymous",
        userEmail: user?.email || "anonymous",
        rating,
        category,
        comment: comment.trim(),
        createdAt: new Date().toISOString(),
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
        page: typeof window !== "undefined" ? window.location.pathname : "unknown"
      };

      if (user) {
        const feedbackRef = collection(db, "artifacts", appId, "users", user.uid, "feedback");
        await addDoc(feedbackRef, feedbackData);
      } else {
        const feedbackRef = collection(db, "artifacts", appId, "feedback");
        await addDoc(feedbackRef, feedbackData);
      }
      
      setSubmitted(true);
      setTimeout(() => {
        setIsOpen(false);
        setTimeout(() => {
          setRating(0);
          setComment("");
          setCategory("general");
          setSubmitted(false);
        }, 300);
      }, 2000);
    } catch (err: any) {
      console.error("Error submitting feedback:", err);
      setError(labels.errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const FloatingButton = (
    <button
      onClick={() => setIsOpen(true)}
      className={`fixed bottom-6 ${isRTL ? 'right-6' : 'left-6'} z-50 w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-full shadow-lg shadow-emerald-500/30 flex items-center justify-center hover:scale-110 transition-transform animate-in slide-in-from-bottom-4`}
      title={labels.sendFeedback}
    >
      <MessageSquarePlus size={24} />
    </button>
  );

  const Modal = mounted && isOpen && createPortal(
    <div 
      className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
      onClick={() => setIsOpen(false)}
    >
      <div 
        className="bg-card border border-border rounded-2xl max-w-md w-full relative animate-in zoom-in-95 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <button 
          onClick={() => setIsOpen(false)}
          className={`absolute ${isRTL ? 'left-4' : 'right-4'} top-4 text-muted-foreground hover:text-foreground`}
        >
          <X size={20} />
        </button>

        {!submitted ? (
          <>
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Heart size={28} className="text-white" />
              </div>
              <h2 className="text-xl font-black text-foreground">{labels.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {labels.subtitle}
              </p>
            </div>

            {/* Star Rating */}
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-125"
                >
                  <Star
                    size={36}
                    className={`transition-colors ${
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Category */}
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {labels.categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    category === cat.id
                      ? "bg-primary text-white"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Comment */}
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={labels.placeholder}
              className="w-full h-24 p-3 bg-muted/50 border border-border rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 mb-4"
            />

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 text-center">
                {error}
              </div>
            )}

            {/* Submit */}
            <Button
              variant="gradient"
              className="w-full gap-2"
              onClick={handleSubmit}
              disabled={rating === 0 || loading}
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
              {labels.submitButton}
            </Button>
          </>
        ) : (
          <div className="text-center py-8 animate-in zoom-in-95">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">{labels.thankYou}</h3>
            <p className="text-sm text-muted-foreground">
              {labels.thankYouDesc}
            </p>
          </div>
        )}
      </div>
    </div>,
    document.body
  );

  return (
    <>
      {FloatingButton}
      {Modal}
    </>
  );
}
