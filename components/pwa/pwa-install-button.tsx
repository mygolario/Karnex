"use client";

import { Download, Smartphone, Loader2 } from "lucide-react";
import { useState } from "react";
import { usePwa } from "@/hooks/use-pwa";
import { cn } from "@/lib/utils";

interface PwaInstallButtonProps {
  className?: string;
  variant?: "default" | "outline" | "banner";
  showLabel?: boolean;
}

export function PwaInstallButton({
  className,
  variant = "default",
  showLabel = true,
}: PwaInstallButtonProps) {
  const { isInstallable, isInstalled, isIOS, promptInstall } = usePwa();
  const [loading, setLoading] = useState(false);

  if (isInstalled) {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400", className)}>
        <Smartphone size={18} />
        {showLabel && <span>اپلیکیشن نصب شده است</span>}
      </div>
    );
  }

  if (isIOS) {
    return null;
  }

  if (!isInstallable) {
    return null;
  }

  const handleInstall = async () => {
    setLoading(true);
    try {
      await promptInstall();
    } finally {
      setLoading(false);
    }
  };

  const baseStyles =
    variant === "banner"
      ? "w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl shadow-lg"
      : variant === "outline"
        ? "flex items-center gap-2 px-4 py-2.5 border border-primary text-primary rounded-xl hover:bg-primary/5"
        : "flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl shadow-lg hover:opacity-90 active:scale-[0.98]";

  return (
    <button
      type="button"
      onClick={handleInstall}
      disabled={loading}
      className={cn(baseStyles, "transition-all mobile-touch-target", className)}
    >
      {loading ? (
        <Loader2 size={20} className="animate-spin" />
      ) : (
        <Download size={20} />
      )}
      {showLabel && (
        <span className="font-bold text-sm">
          {loading ? "در حال نصب..." : "نصب اپلیکیشن کارنکس"}
        </span>
      )}
    </button>
  );
}
