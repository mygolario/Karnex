"use client";

import React, { useState } from "react";
import { Copy, Check, Smartphone, CreditCard, Layout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface BrandVisualizerProps {
  colors: string[];
  projectName: string;
  fontName: string;
}

export function BrandVisualizer({ colors, projectName, fontName }: BrandVisualizerProps) {
  const [activeTab, setActiveTab] = useState<'card' | 'social' | 'web'>('card');
  const primaryColor = colors[0] || "#3b82f6";
  const secondaryColor = colors[1] || "#8b5cf6";
  const accentColor = colors[2] || "#f43f5e";

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex justify-center">
        <div className="bg-muted p-1 rounded-xl inline-flex">
          <button
            onClick={() => setActiveTab('card')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'card' ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <CreditCard size={16} />
            کارت ویزیت
          </button>
          <button
            onClick={() => setActiveTab('social')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'social' ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Smartphone size={16} />
            اینستاگرام
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="bg-muted/30 border border-dashed border-border rounded-3xl p-8 flex items-center justify-center min-h-[400px]">
        
        {/* Business Card Mockup */}
        {activeTab === 'card' && (
          <div className="relative group perspective-1000">
             {/* Front */}
            <div className="w-[340px] h-[200px] rounded-2xl shadow-2xl overflow-hidden relative transform transition-transform duration-500 hover:rotate-y-12">
              <div 
                className="absolute inset-0"
                style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl mb-3 flex items-center justify-center text-2xl font-bold">
                  {projectName.charAt(0)}
                </div>
                <h2 className="text-2xl font-black mb-1">{projectName}</h2>
                <p className="text-white/80 text-sm">شعار برند شما در اینجا قرار می‌گیرد</p>
              </div>
              
              {/* Decorative circles */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-black/10 rounded-full blur-2xl" />
            </div>
            
            {/* Back (Stacked behind or simplify to just show front nicely) */}
            <div 
              className="absolute top-4 left-4 -z-10 w-[340px] h-[200px] rounded-2xl shadow-lg bg-white overflow-hidden transform rotate-3 opacity-90"
            >
               <div className="p-8 flex flex-col justify-end h-full">
                 <div className="h-2 w-1/3 rounded-full mb-3" style={{ background: primaryColor }} />
                 <div className="h-2 w-1/2 bg-gray-100 rounded-full mb-2" />
                 <div className="h-2 w-1/4 bg-gray-100 rounded-full" />
                 <div className="mt-8 flex justify-between items-center">
                   <div className="text-xs text-gray-400">www.website.com</div>
                   <div className="w-8 h-8 rounded-lg" style={{ background: accentColor }} />
                 </div>
               </div>
            </div>
          </div>
        )}

        {/* Social Post Mockup */}
        {activeTab === 'social' && (
          <div className="w-[300px] bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            {/* Header */}
            <div className="p-3 flex items-center gap-3 border-b border-gray-50">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[2px]">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                   <div className="w-full h-full" style={{ background: primaryColor }} />
                </div>
              </div>
              <span className="text-sm font-bold text-gray-800">{projectName}</span>
            </div>
            
            {/* Image */}
            <div className="aspect-square relative flex items-center justify-center p-8 bg-gray-50">
               <div 
                 className="absolute inset-0 opacity-10"
                 style={{ 
                   backgroundImage: `radial-gradient(circle at 2px 2px, ${secondaryColor} 1px, transparent 0)`,
                   backgroundSize: '20px 20px' 
                 }} 
               />
               
               <div className="relative z-10 text-center bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/50">
                 <h3 className="text-2xl font-black mb-2" style={{ color: primaryColor }}>فروش ویژه</h3>
                 <p className="text-gray-600 text-sm mb-4">بهترین محصولات را از ما بخواهید</p>
                 <button 
                   className="px-6 py-2 rounded-full text-white text-sm font-bold shadow-lg transform hover:scale-105 transition-transform"
                   style={{ background: `linear-gradient(to right, ${primaryColor}, ${accentColor})` }}
                 >
                   خرید کنید
                 </button>
               </div>
            </div>
            
            {/* Footer */}
            <div className="p-3 space-y-2">
              <div className="flex gap-3 text-gray-800">
                <div className="w-6 h-6" /> {/* Heart */}
                <div className="w-6 h-6" /> {/* Comment */}
                <div className="w-6 h-6 ml-auto" /> {/* Save */}
              </div>
              <div className="h-2 w-32 bg-gray-100 rounded-full" />
              <div className="h-2 w-48 bg-gray-100 rounded-full" />
            </div>
          </div>
        )}

      </div>
      
      <p className="text-center text-sm text-muted-foreground">
        پیش‌نمایش زنده بر اساس رنگ‌های برند شما: {colors.join(', ')}
      </p>
    </div>
  );
}
