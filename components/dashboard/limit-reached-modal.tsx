"use client";

import { useRouter } from 'next/navigation';
import { X, Zap, TrendingUp, AlertTriangle } from 'lucide-react';

interface LimitReachedModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'ai' | 'project';
  used: number;
  limit: number | 'unlimited';
  tier: string;
}

const tierLabels: Record<string, string> = {
  free: 'رایگان',
  plus: 'پلاس',
  pro: 'پرو',
  ultra: 'اولترا',
};

export function LimitReachedModal({
  isOpen,
  onClose,
  type,
  used,
  limit,
  tier,
}: LimitReachedModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const isAI = type === 'ai';
  const title = isAI ? 'محدودیت درخواست AI' : 'محدودیت تعداد پروژه';
  const description = isAI
    ? `شما ${used} از ${limit} درخواست AI ماهانه خود را استفاده کرده‌اید.`
    : `شما ${used} از ${limit} پروژه مجاز خود را ایجاد کرده‌اید.`;

  const handleUpgrade = () => {
    onClose();
    router.push('/pricing');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative mx-4 w-full max-w-md rounded-2xl bg-[#1a1a2e] border border-white/10 p-6 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute left-4 top-4 rounded-lg p-1 text-white/50 hover:bg-white/10 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>

        {/* Icon */}
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 p-4">
            <AlertTriangle className="h-8 w-8 text-amber-400" />
          </div>
        </div>

        {/* Title */}
        <h3 className="mb-2 text-center text-xl font-bold text-white" dir="rtl">
          {title}
        </h3>

        {/* Description */}
        <p className="mb-4 text-center text-sm text-white/60" dir="rtl">
          {description}
        </p>

        {/* Usage bar */}
        <div className="mb-6 rounded-xl bg-white/5 p-4" dir="rtl">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-white/50">مصرف شما</span>
            <span className="font-mono text-white">
              {used} / {limit === 'unlimited' ? '∞' : limit}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-red-500 transition-all duration-500"
              style={{
                width: limit === 'unlimited' ? '0%' : `${Math.min(100, (used / (limit as number)) * 100)}%`,
              }}
            />
          </div>
          <p className="mt-2 text-xs text-white/40">
            پلن فعلی: {tierLabels[tier] || tier}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleUpgrade}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-3 font-bold text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-300 hover:scale-[1.02]"
          >
            <Zap size={18} />
            ارتقا پلن
            <TrendingUp size={16} />
          </button>
          <button
            onClick={onClose}
            className="rounded-xl px-6 py-2 text-sm text-white/50 hover:bg-white/5 hover:text-white/80 transition-colors"
          >
            بعداً
          </button>
        </div>
      </div>
    </div>
  );
}
