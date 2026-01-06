"use client";

import React, { useState, useEffect } from "react";
// We don't have lucide-react icons physically installed as files, but they are in package.json.
// However, the import path is correct.
import { Loader2, ShieldCheck, CreditCard, CheckCircle2, AlertTriangle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

// --- MOCK SERVICES FOR PREVIEW (Uncomment Real Imports in Production) ---

import { getFirestore, doc, updateDoc, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "@/lib/firebase";

// Real DB Call
const upgradeUserStatus = async (userId: string, planId: string) => {
  const db = getFirestore(app);
  // We assume user profile is at /users/{userId} or we update the plan config
  // The prompt says: "The user document should now have subscriptionStatus: 'pro'"
  const userRef = doc(db, "users", userId);
  
  // Use setDoc with merge to ensure document exists if it doesn't
  await setDoc(userRef, { 
    subscriptionStatus: 'pro',
    subscriptionDate: new Date().toISOString(),
    planId: planId
  }, { merge: true });
};

// --- END MOCKS ---


// --- PLAN DETAILS ---
const PLANS: Record<string, { name: string; price: string }> = {
  'starter': { name: 'طرح رایگان', price: '۰' },
  'pro_monthly': { name: 'اشتراک حرفه‌ای (ماهانه)', price: '۲۹۹,۰۰۰' },
  'pro_yearly': { name: 'اشتراک سالانه (با تخفیف)', price: '۲,۹۹۰,۰۰۰' },
  'business': { name: 'اشتراک تجاری', price: '۲,۹۹۰,۰۰۰' },
};

export default function MockPaymentGateway() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get("planId") || "pro_monthly";
  const planDetails = PLANS[planId] || { name: 'اشتراک ویژه', price: '۲۹۹,۰۰۰' };
  
  const auth = getAuth(app);
  const userId = auth.currentUser?.uid;

  const [status, setStatus] = useState<"input" | "processing" | "success" | "fail">("input");
  const [cardNumber, setCardNumber] = useState("");
  const [cvv, setCvv] = useState("");
  const [expiryM, setExpiryM] = useState("");
  const [expiryY, setExpiryY] = useState("");
  const [trackId, setTrackId] = useState("");

  const handlePayment = async () => {
    if (cardNumber.length < 16 || cvv.length < 3) return;
    
    setStatus("processing");
    
    // Simulate network delay & API call
    setTimeout(async () => {
      try {
        if (userId || true) { // Allow mock without login for demo purposes if needed, but best with user
          // 1. Upgrade User Status (Real)
          if (userId) {
            await upgradeUserStatus(userId, planId);
          }
          
          setTrackId(Math.random().toString().substr(2, 8));
          setStatus("success");
          
          // Redirect back to app after success
          // setTimeout(() => {
          //   router.push(`/dashboard/overview?upgrade=success`);
          // }, 4000); // 4 Seconds to see receipt
        } else {
             console.error("No user found to upgrade");
             setStatus("fail");
        }
      } catch (e) {
        console.error("Payment Error", e);
        setStatus("fail");
      }
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans" dir="rtl">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden border border-gray-200">
        
        {/* Header - Mimicking Shaparak (Iranian Payment Network) */}
        <div className="bg-[#1e40af] p-4 flex justify-between items-center text-white shadow-md">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6" />
            <span className="font-bold text-lg">پرداخت الکترونیک</span>
          </div>
          <div className="flex flex-col items-end">
             <span className="text-[10px] opacity-80 tracking-widest">SHAPARAK</span>
             <div className="flex gap-0.5">
               <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
               <span className="text-[10px]">ایمن</span>
             </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
            <span className="text-gray-500 text-sm">نام پذیرنده</span>
            <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-indigo-100 rounded text-indigo-700 flex items-center justify-center text-xs font-bold">K</div>
                <span className="font-bold text-gray-800">Karnex Inc.</span>
            </div>
          </div>

          <div className="flex justify-between items-center mb-8 bg-gray-50 p-3 rounded-lg border border-gray-100">
            <span className="text-gray-500 text-sm">مبلغ کل</span>
            <div className="text-right">
                <span className="font-bold text-2xl text-green-600">{planDetails.price}</span>
                <span className="text-xs text-gray-400 mr-1">تومان</span>
            </div>
          </div>

          {status === "input" && (
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block text-right">شماره کارت</label>
                <div className="relative">
                  <InputMask 
                    value={cardNumber} 
                    onChange={setCardNumber} 
                    className="w-full text-left p-3 pl-10 border border-gray-300 rounded-md font-mono text-lg tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ltr"
                    placeholder="0000 0000 0000 0000"
                    maxLength={16}
                  />
                  <CreditCard className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  <div className="absolute right-3 top-3.5">
                    {cardNumber.length === 16 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                        <div className="h-5 w-5 border-2 border-gray-200 rounded-full"></div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-1/3 space-y-2">
                  <label className="text-sm font-medium text-gray-700 block text-center">CVV2</label>
                  <input 
                    type="password" 
                    maxLength={4}
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-center p-3 border border-gray-300 rounded-md font-mono focus:ring-2 focus:ring-blue-500 outline-none ltr"
                    placeholder="***"
                  />
                </div>
                <div className="w-2/3 space-y-2">
                  <label className="text-sm font-medium text-gray-700 block text-center">تاریخ انقضا</label>
                  <div className="flex gap-2 items-center ltr">
                    <input 
                        value={expiryY}
                        onChange={(e) => setExpiryY(e.target.value.replace(/\D/g, '').slice(0,2))}
                        className="w-full text-center p-3 border border-gray-300 rounded-md font-mono focus:ring-2 focus:ring-blue-500 outline-none" 
                        placeholder="Year" 
                    />
                    <span className="text-gray-400">/</span>
                    <input 
                        value={expiryM}
                        onChange={(e) => setExpiryM(e.target.value.replace(/\D/g, '').slice(0,2))}
                        className="w-full text-center p-3 border border-gray-300 rounded-md font-mono focus:ring-2 focus:ring-blue-500 outline-none" 
                        placeholder="Month" 
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-3">
                <button 
                    onClick={handlePayment} 
                    disabled={cardNumber.length < 16 || cvv.length < 3}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold h-12 rounded-lg text-lg shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    پرداخت
                </button>
                <button 
                    onClick={() => router.back()} 
                    className="w-full text-red-500 hover:bg-red-50 h-10 rounded-lg text-sm font-medium transition-colors"
                >
                    انصراف
                </button>
              </div>
            </div>
          )}

          {status === "processing" && (
            <div className="flex flex-col items-center justify-center py-10 space-y-6">
              <div className="relative">
                  <div className="h-16 w-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                      <ShieldCheck className="h-6 w-6 text-blue-600" />
                  </div>
              </div>
              <div className="text-center space-y-1">
                  <p className="text-gray-800 font-bold text-lg">در حال پردازش پرداخت...</p>
                  <p className="text-gray-500 text-sm">لطفاً پنجره را نبندید.</p>
              </div>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center animate-in zoom-in duration-300">
               {/* Receipt Header */}
              <div className="w-full bg-green-50 border border-green-100 rounded-t-xl p-6 text-center border-b-2 border-dashed border-b-green-200 relative mb-4">
                 <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-white rounded-full"></div>
                 <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-white rounded-full"></div>
                 
                 <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-3">
                    <CheckCircle2 className="h-8 w-8" />
                 </div>
                 <h3 className="text-xl font-bold text-green-800">تراکنش موفق</h3>
                 <p className="text-green-600 text-sm mt-1">{new Date().toLocaleTimeString('fa-IR')} - {new Date().toLocaleDateString('fa-IR')}</p>
              </div>

               {/* Receipt Details */}
              <div className="w-full space-y-3 text-sm px-2">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                       <span className="text-gray-500">کد رهگیری</span>
                       <span className="font-mono font-bold text-lg tracking-wider">{trackId}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                       <span className="text-gray-500">نام پذیرنده</span>
                       <span className="font-bold">کارنکس (Karnex)</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                       <span className="text-gray-500">محصول</span>
                       <span className="font-bold text-blue-600">{planDetails.name}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                       <span className="text-gray-500">شماره کارت</span>
                       <span className="font-mono text-gray-700" dir="ltr">6037 **** **** {cardNumber.slice(-4)}</span>
                  </div>
                   <div className="flex justify-between items-center pt-1">
                       <span className="text-gray-500">مبلغ پرداخت شده</span>
                       <span className="font-bold text-lg text-green-600">{planDetails.price} ریال</span>
                  </div>
              </div>

              <div className="w-full mt-6 space-y-3">
                 <button 
                   onClick={() => router.push(`/dashboard/overview?upgrade=success`)}
                   className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                 >
                    تکمیل خرید و بازگشت
                 </button>
                 <button 
                   onClick={() => window.print()}
                   className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium py-2 rounded-lg transition-colors text-sm"
                 >
                    چاپ رسید
                 </button>
              </div>
            </div>
          )}
          
          {status === "fail" && (
              <div className="flex flex-col items-center justify-center py-10 space-y-6 animate-in shake">
                <div className="h-20 w-20 bg-red-100 rounded-full flex items-center justify-center text-red-600 shadow-inner">
                  <AlertTriangle className="h-10 w-10" />
                </div>
                <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold text-red-700">پرداخت ناموفق</h3>
                    <p className="text-gray-500 text-sm">اطلاعات کارت را بررسی و مجددا تلاش کنید.</p>
                </div>
                <button 
                    onClick={() => setStatus("input")}
                    className="mt-4 px-6 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors"
                >
                    تلاش مجدد
                </button>
              </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="bg-gray-50 p-3 flex justify-center items-center gap-4 text-[10px] text-gray-400 border-t">
          <span>Powered by Shaparak</span>
          <div className="w-px h-3 bg-gray-300"></div>
          <span>SSL Secured</span>
          <div className="w-px h-3 bg-gray-300"></div>
          <span>24/7 Support</span>
        </div>
      </div>
    </div>
  );
}

// Simple Input helper for masking
function InputMask({ value, onChange, className, placeholder, maxLength }: any) {
  return (
    <input
      type="text"
      // Display formatted value
      {...{value: value.match(new RegExp('.{1,4}', 'g'))?.join(' ') || value}}
      onChange={(e) => {
        let v = e.target.value.replace(/\D/g, '');
        if (maxLength) v = v.slice(0, maxLength);
        // Add simple spacing for credit card readability
        if (v.length > 0) {
            v = v.match(new RegExp('.{1,4}', 'g'))?.join(' ') || v;
        }
        onChange(v.replace(/\s/g, '')); // Pass raw value back
      }}
      className={className}
      placeholder={placeholder}
    />
  );
}
