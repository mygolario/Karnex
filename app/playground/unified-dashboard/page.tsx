"use client";

import React, { useState } from "react";

// --- ICONS (Inline for stability) ---
const Icons = {
  ShieldAlert: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  Lock: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  Crown: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg>,
  Download: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Check: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="20 6 9 17 4 12"/></svg>,
  Wand2: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H3"/><path d="M21 16h-4"/><path d="M11 3H9"/></svg>
};

// --- MOCK COMPONENTS (In production, import these from their files) ---

const SectionRegenerator = ({ content, onUpdate }: any) => {
  const [loading, setLoading] = useState(false);
  return (
    <button 
      onClick={() => {
        setLoading(true);
        setTimeout(() => {
          onUpdate(content + " (Refined by AI)");
          setLoading(false);
        }, 1000);
      }}
      className="text-xs flex items-center gap-1 text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded transition-colors"
      disabled={loading}
    >
      <Icons.Wand2 className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
      {loading ? "Refining..." : "Refine Section"}
    </button>
  );
};

// --- MAIN DASHBOARD PREVIEW ---

export default function UnifiedDashboardPreview() {
  // DEV TOOLS: State Simulation
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isPro, setIsPro] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  
  // Data State
  const [planData, setPlanData] = useState({
    mission: "Karnex helps Iranian entrepreneurs build businesses with zero capital.",
    marketing: "We will leverage viral social media loops and influencer partnerships on Instagram."
  });

  // Handlers
  const handleExport = () => {
    if (!isPro) {
      setShowUpgradeModal(true);
    } else {
      alert("Downloading PDF... (Feature Unlocked)");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900" dir="rtl">
      
      {/* --- DEV CONTROLS (Remove in Prod) --- */}
      <div className="fixed bottom-4 left-4 bg-black text-white p-4 rounded-lg shadow-2xl z-50 text-xs space-y-2 opacity-90 ltr" dir="ltr">
        <div className="font-bold border-b border-gray-700 pb-1 mb-2">DEV SIMULATION</div>
        <div className="flex items-center justify-between gap-4">
          <span>User Type:</span>
          <button 
            onClick={() => setIsAnonymous(!isAnonymous)} 
            className={`px-2 py-1 rounded ${isAnonymous ? 'bg-amber-500' : 'bg-green-600'}`}
          >
            {isAnonymous ? "Guest (Anon)" : "Registered"}
          </button>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>Subscription:</span>
          <button 
            onClick={() => setIsPro(!isPro)} 
            className={`px-2 py-1 rounded ${!isPro ? 'bg-gray-600' : 'bg-purple-600'}`}
          >
            {isPro ? "PRO Plan" : "Free Tier"}
          </button>
        </div>
      </div>

      {/* --- APP BAR --- */}
      <header className="bg-white border-b h-16 flex items-center justify-between px-6 sticky top-0 z-10">
        <div className="font-bold text-xl text-blue-900">Karnex</div>
        <div className="flex items-center gap-3">
          {!isPro && (
            <button 
              onClick={() => setShowUpgradeModal(true)}
              className="bg-gradient-to-r from-amber-400 to-amber-600 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 hover:shadow-lg transition-all"
            >
              <Icons.Crown className="h-4 w-4" />
              Upgrade to PRO
            </button>
          )}
          <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold">
            {isAnonymous ? "?" : "A"}
          </div>
        </div>
      </header>

      {/* --- CRITICAL: ANONYMOUS WARNING BANNER (Path A) --- */}
      {isAnonymous && (
        <div className="bg-amber-50 border-b border-amber-200 p-3 flex flex-col sm:flex-row items-center justify-between gap-3 px-6 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3 text-amber-800">
            <Icons.ShieldAlert className="h-5 w-5 shrink-0" />
            <span className="text-sm font-medium">
              You are using a temporary guest account. Your business plan will be lost if you close this browser.
            </span>
          </div>
          <button 
            onClick={() => setShowClaimModal(true)}
            className="whitespace-nowrap bg-white border border-amber-300 text-amber-900 px-3 py-1.5 rounded text-sm font-semibold hover:bg-amber-100 transition-colors"
          >
            Save My Progress
          </button>
        </div>
      )}

      <main className="max-w-4xl mx-auto py-8 px-4 space-y-6">
        
        {/* --- HEADER --- */}
        <div className="flex items-end justify-between border-b pb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Business Plan</h1>
            <p className="text-gray-500 mt-1">Project: Persian SaaS Builder</p>
          </div>
          <button 
            onClick={handleExport}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              isPro 
                ? "bg-blue-600 text-white hover:bg-blue-700" 
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isPro ? <Icons.Download className="h-4 w-4" /> : <Icons.Lock className="h-4 w-4" />}
            Export PDF
          </button>
        </div>

        {/* --- EDITABLE SECTIONS (Path C Integration) --- */}
        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
          
          {/* Section 1 */}
          <div className="space-y-2 group">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-800 text-lg">Mission Statement</h3>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <SectionRegenerator 
                  content={planData.mission} 
                  onUpdate={(text: string) => setPlanData({...planData, mission: text})} 
                />
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed p-3 bg-gray-50 rounded-lg border border-transparent hover:border-indigo-100 hover:bg-white transition-all">
              {planData.mission}
            </p>
          </div>

          <div className="h-px bg-gray-100" />

          {/* Section 2 */}
          <div className="space-y-2 group">
             <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-800 text-lg">Marketing Strategy</h3>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <SectionRegenerator 
                  content={planData.marketing} 
                  onUpdate={(text: string) => setPlanData({...planData, marketing: text})} 
                />
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed p-3 bg-gray-50 rounded-lg border border-transparent hover:border-indigo-100 hover:bg-white transition-all">
              {planData.marketing}
            </p>
          </div>

        </div>
      </main>

      {/* --- MODALS --- */}

      {/* 1. UPGRADE MODAL (Path B Trigger) */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="h-16 w-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-600">
              <Icons.Crown className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold">Unlock Professional Features</h2>
            <ul className="text-right space-y-3 bg-gray-50 p-4 rounded-lg text-sm text-gray-700">
              <li className="flex items-center gap-2"><Icons.Check className="h-4 w-4 text-green-600"/> Unlimited AI Regenerations</li>
              <li className="flex items-center gap-2"><Icons.Check className="h-4 w-4 text-green-600"/> Export to PDF (Bank Ready)</li>
              <li className="flex items-center gap-2"><Icons.Check className="h-4 w-4 text-green-600"/> Priority Support</li>
            </ul>
            <div className="pt-2 flex gap-3">
              <button onClick={() => setShowUpgradeModal(false)} className="flex-1 py-3 text-gray-500 hover:bg-gray-100 rounded-xl font-medium">Maybe Later</button>
              <button 
                onClick={() => {
                  alert("Redirecting to /pay/mock...");
                  setShowUpgradeModal(false);
                }} 
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
              >
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. CLAIM ACCOUNT MODAL (Path A Trigger) */}
      {showClaimModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
             <div className="flex items-center gap-2 text-amber-600 mb-2">
                <Icons.ShieldAlert className="h-6 w-6" />
                <h2 className="text-lg font-bold">Save Your Business</h2>
             </div>
             <p className="text-gray-600 text-sm leading-relaxed">
               Create a free account to permanently save your dashboard. If you don't, you will lose access when you leave.
             </p>
             <input type="email" placeholder="Email Address" className="w-full border p-3 rounded-lg text-right" />
             <input type="password" placeholder="Password" className="w-full border p-3 rounded-lg text-right" />
             <div className="pt-2 flex flex-col gap-2">
                <button 
                  onClick={() => {
                    setIsAnonymous(false); // Simulating upgrade
                    setShowClaimModal(false);
                  }}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold"
                >
                  Create Account
                </button>
                <button onClick={() => setShowClaimModal(false)} className="w-full py-2 text-gray-400 text-sm">Cancel</button>
             </div>
           </div>
        </div>
      )}

    </div>
  );
}
