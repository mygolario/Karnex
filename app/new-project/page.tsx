"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { savePlanToCloud } from "@/lib/db";
import { Loader2, ArrowRight, ArrowLeft, Wallet, Sparkles, Target } from "lucide-react";
import { GenerationLoader } from "@/components/shared/generation-loader";

export default function NewProjectPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Form States
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Data States
  const [idea, setIdea] = useState("");
  const [audience, setAudience] = useState("");
  const [budget, setBudget] = useState("");

  // Navigation Logic
  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const [error, setError] = useState<string | null>(null);

  // The Core Logic: Generate & Save to Cloud
  const handleSubmit = async () => {
    setError(null);
    if (!user) {
      setError("لطفا ابتدا وارد حساب کاربری شوید.");
      return;
    }

    setIsGenerating(true);

    try {
      // 1. Call the AI Brain
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea, audience, budget }),
        // signal: AbortSignal.timeout(60000) <-- Removed to let Server handle timeout via 40s internal logic
      });
      
      const planData = await response.json();

      if (!response.ok) {
         throw new Error(planData.error || 'AI Generation failed');
      }

      // 2. Save to Cloud (Firebase)
      // We wrap this in a timeout so the user isn't stuck if Firestore is slow/blocked
      try {
        const timeoutMs = 5000;
        const savePromise = savePlanToCloud(user.uid, {
            ...planData,
            budget,
            audience,
            ideaInput: idea
        });
        
        const timerPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Cloud Save Timeout")), timeoutMs)
        );

        await Promise.race([savePromise, timerPromise]);
      } catch (saveErr) {
        console.warn("Warning: Cloud save took too long or failed. Proceeding to dashboard anyway.", saveErr);
        // We proceed intentionally so the user feels "progress"
      }

      // 3. Redirect to Dashboard
      router.push('/dashboard/overview');

    } catch (err: any) {
      console.error(err);
      let msg = err.message || "متاسفانه خطایی رخ داد. لطفا دوباره تلاش کنید.";
      if (err.name === 'TimeoutError' || err.name === 'AbortError') {
         msg = "زمان پاسخ‌دهی طولانی شد. لطفا دوباره تلاش کنید.";
      }
      setError(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  // Loading Screen for Auth
  if (isGenerating) {
    return <GenerationLoader />;
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      
      {/* Progress Bar */}
      <div className="w-full max-w-2xl mb-8">
        <div className="flex justify-between text-sm text-slate-500 mb-2 px-1">
          <span>گام {step} از ۳</span>
          <span>ساخت نقشه راه</span>
        </div>
        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 transition-all duration-500 ease-out"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        
        {/* Step 1: The Idea */}
        {step === 1 && (
          <div className="p-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Sparkles size={24} />
              </div>
              <h1 className="text-2xl font-bold text-slate-800">ایده شما چیست؟</h1>
            </div>
            
            <p className="text-slate-500 mb-4">
              اصلاً نگران ادبیات نباشید. خیلی ساده و خودمونی بنویسید که چه چیزی تو ذهنتونه.
            </p>
            
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="مثال: من میخوام یه سرویس غذای خونگی راه بندازم برای دانشجوهایی که وقت آشپزی ندارن..."
              className="w-full h-40 p-4 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all text-lg resize-none placeholder:text-slate-300"
              autoFocus
            />

            <div className="mt-8 flex justify-end">
              <button
                onClick={nextStep}
                disabled={!idea.trim()}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                مرحله بعد
                <ArrowLeft size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: The Audience */}
        {step === 2 && (
          <div className="p-8 animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                <Target size={24} />
              </div>
              <h1 className="text-2xl font-bold text-slate-800">برای چه کسانی؟</h1>
            </div>

            <p className="text-slate-500 mb-6">
              مشتری اصلی شما کیست؟ (مثال: مادران شاغل، گیمرها، مغازه‌دارها)
            </p>

            <input
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="مخاطب هدف خود را بنویسید..."
              className="w-full p-4 rounded-xl border-2 border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-50/50 transition-all text-lg"
              autoFocus
            />

            <div className="mt-8 flex justify-between">
              <button
                onClick={prevStep}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-800 px-4 py-3 font-medium transition-colors"
              >
                <ArrowRight size={20} />
                قبلی
              </button>
              <button
                onClick={nextStep}
                disabled={!audience.trim()}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
              >
                مرحله بعد
                <ArrowLeft size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: The Budget */}
        {step === 3 && (
          <div className="p-8 animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <Wallet size={24} />
              </div>
              <h1 className="text-2xl font-bold text-slate-800">بودجه فعلی شما؟</h1>
            </div>

            <p className="text-slate-500 mb-6">
              این انتخاب به هوش مصنوعی کمک می‌کند تا ابزارهای مناسب جیب شما را پیشنهاد دهد.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'zero', label: 'صفر! (۰ تومان)', sub: 'شروع بدون هزینه', color: 'border-slate-200 hover:border-emerald-500' },
                { id: 'low', label: 'کم', sub: 'زیر ۵ میلیون', color: 'border-slate-200 hover:border-blue-500' },
                { id: 'medium', label: 'متوسط', sub: 'سرمایه دارم', color: 'border-slate-200 hover:border-purple-500' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setBudget(opt.id)}
                  className={`p-4 rounded-xl border-2 text-right transition-all duration-200 ${
                    budget === opt.id 
                      ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200' 
                      : `${opt.color} bg-white hover:bg-slate-50`
                  }`}
                >
                  <div className="font-bold text-lg text-slate-800">{opt.label}</div>
                  <div className="text-sm text-slate-400 mt-1">{opt.sub}</div>
                </button>
              ))}
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 text-right animate-in fade-in slide-in-from-top-2">
                {error === 'OpenRouter API Failed' || error.includes('429') 
                  ? 'سرویس هوش مصنوعی شلوغ است (Rate Limit). لطفا ۳۰ ثانیه دیگر تلاش کنید.' 
                  : error}
              </div>
            )}

            <div className="mt-8 flex justify-between items-center">
              <button
                onClick={prevStep}
                disabled={isGenerating}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-800 px-4 py-3 font-medium transition-colors"
              >
                <ArrowRight size={20} />
                قبلی
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={!budget || isGenerating}
                className="flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-3 rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all disabled:opacity-70 disabled:cursor-wait"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    در حال تفکر...
                  </>
                ) : (
                  <>
                    ساخت پروژه
                    <Sparkles size={20} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
      
      {/* Trust Message */}
      <p className="mt-6 text-slate-400 text-sm flex items-center gap-2">
        <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
        اطلاعات شما در فضای ابری امن ذخیره می‌شود
      </p>
    </div>
  );
}
