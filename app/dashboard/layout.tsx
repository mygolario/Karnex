"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AiAssistant } from "@/components/dashboard/ai-assistant";
import { InstallPwa } from "@/components/shared/install-pwa";
import { 
  LayoutDashboard, 
  Map, 
  Palette, 
  LayoutGrid, 
  Megaphone, 
  Settings, 
  Menu, 
  X,
  UserCircle,
  Scale, 
  HelpCircle
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { icon: LayoutDashboard, label: "نمای کلی", href: "/dashboard/overview" },
    { icon: Map, label: "نقشه راه", href: "/dashboard/roadmap" },
    { icon: LayoutGrid, label: "بوم کسب‌وکار", href: "/dashboard/canvas" },
    { icon: Palette, label: "هویت بصری", href: "/dashboard/brand" },
    { icon: Megaphone, label: "بازاریابی", href: "/dashboard/marketing" },
    { icon: Scale, label: "حقوقی و مجوز", href: "/dashboard/legal" },
    { icon: HelpCircle, label: "راهنما", href: "/dashboard/help" },
    { icon: Settings, label: "تنظیمات", href: "/dashboard/settings" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <div className="font-bold text-xl text-blue-600">کارنکس</div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-600">
          {sidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar (Right for RTL) */}
      <aside 
        className={`
          fixed inset-y-0 right-0 z-30 w-64 bg-white border-l border-slate-200 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:sticky md:top-0 md:h-screen shadow-lg md:shadow-none
          ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="h-full flex flex-col">
          {/* Logo Area */}
          <div className="h-16 flex items-center px-6 border-b border-slate-100 bg-slate-50/50">
            <span className="text-2xl font-black text-blue-600 tracking-tighter">کارنکس</span>
            <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full mr-2">BETA</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm
                    ${isActive 
                      ? 'bg-blue-50 text-blue-700 shadow-sm translate-x-[-2px]' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                  `}
                >
                  <item.icon size={20} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* PWA Install Button Area */}
          <div className="px-4 pb-2">
            <InstallPwa />
          </div>

          {/* User Profile Snippet */}
          <div className="p-4 border-t border-slate-100">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <UserCircle className="text-slate-400" size={36} />
              <div className="overflow-hidden">
                <div className="text-sm font-bold text-slate-700 truncate">کاربر مهمان</div>
                <div className="text-xs text-slate-400">طرح رایگان</div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-20 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden relative">
        {children}
      </main>

      {/* The AI Consultant Injection */}
      <AiAssistant />
    </div>
  );
}
