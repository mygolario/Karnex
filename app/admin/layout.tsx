"use client";

import { useAdmin } from "@/hooks/use-admin";
import { Loader2, ShieldAlert } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin, checking } = useAdmin();
  const router = useRouter();

  useEffect(() => {
    if (!checking && !isAdmin) {
        toast.error("دسترسی غیرمجاز. این منطقه محافظت شده است. 🛡️");
        router.push("/dashboard");
    }
  }, [isAdmin, checking, router]);

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <Loader2 className="animate-spin text-emerald-500 w-12 h-12" />
        <p className="ml-4 font-mono text-emerald-500">Checking Security Clearance...</p>
      </div>
    );
  }

  if (!isAdmin) {
      return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-emerald-500/30">
        <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500 animate-gradient-x" />
        
        {/* Admin Header */}
        <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ShieldAlert className="text-emerald-500 w-6 h-6" />
                    <h1 className="font-bold text-lg tracking-wider text-emerald-400">GOD MODE <span className="text-slate-500 text-xs ml-2 font-mono">v1.0</span></h1>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                    <div>STATUS: <span className="text-emerald-500">SECURE</span></div>
                    <div>USER: <span className="text-emerald-500">KAVEH</span></div>
                </div>
            </div>
        </header>

        <main className="container mx-auto px-4 py-8">
            {children}
        </main>
    </div>
  );
}
