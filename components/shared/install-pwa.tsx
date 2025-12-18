"use client";

import { useEffect, useState } from "react";
import { Download, Smartphone } from "lucide-react";

export function InstallPwa() {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setSupportsPWA(true);
      setPromptInstall(e);
    };
    
    // Listen for the 'beforeinstallprompt' event
    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const onClick = (evt: any) => {
    evt.preventDefault();
    if (!promptInstall) {
      return;
    }
    promptInstall.prompt();
  };

  if (!supportsPWA) {
    return null; // Don't show anything if already installed or not supported
  }

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-200 hover:shadow-xl transition-all hover:scale-[1.02] group"
    >
      <div className="bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-colors">
        <Smartphone size={20} />
      </div>
      <div className="text-right">
        <div className="text-xs text-blue-100">نسخه موبایل</div>
        <div className="font-bold text-sm">نصب اپلیکیشن</div>
      </div>
      <Download size={16} className="mr-auto opacity-80" />
    </button>
  );
}
