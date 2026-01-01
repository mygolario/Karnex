"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { getPlanFromCloud, BusinessPlan } from "@/lib/db";
import { Megaphone, TrendingUp, Users, Instagram, Globe, MapPin, Sparkles, Target, Zap } from "lucide-react";
import { Card, CardIcon } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function MarketingPage() {
  const { user } = useAuth();
  const { activeProject: plan, loading } = useProject(); // Use context

  if (loading || !plan) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center animate-pulse">
          <Megaphone size={32} className="text-white" />
        </div>
        <p className="text-muted-foreground">در حال تدوین استراتژی...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-10">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-black text-foreground">بازاریابی و رشد</h1>
          <Badge variant="gradient" size="sm">
            <Sparkles size={12} />
            هوشمند
          </Badge>
        </div>
        <p className="text-muted-foreground">
          موتور جذب مشتری برای: <span className="font-bold text-foreground">{plan.projectName}</span>
        </p>
      </div>

      {/* 1. Growth Tactics */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <CardIcon variant="primary" className="w-10 h-10">
            <TrendingUp size={20} />
          </CardIcon>
          <span className="font-bold text-sm uppercase tracking-wider">استراتژی‌های رشد (Growth Hacking)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plan.marketingStrategy.map((tactic: string, i: number) => (
            <Card 
              key={i} 
              variant="default"
              hover="lift"
              className="flex gap-4"
            >
              <div className="shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-lg">
                  {i + 1}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-bold text-foreground">تکتیک شماره {i + 1}</h4>
                  {i === 0 && (
                    <Badge variant="accent" size="sm">
                      <Zap size={10} />
                      پیشنهادی
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">{tactic}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 2. Competitors (Dynamic) */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <CardIcon variant="secondary" className="w-10 h-10">
            <Users size={20} />
          </CardIcon>
          <span className="font-bold text-sm uppercase tracking-wider">تحلیل رقبا</span>
          <Badge variant="info" size="sm">Dynamic</Badge>
        </div>
        
        <Card variant="default" padding="none" className="overflow-hidden">
          <table className="w-full text-right">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="p-4 font-bold text-foreground text-sm">نوع رقیب</th>
                <th className="p-4 font-bold text-foreground text-sm">نقاط قوت</th>
                <th className="p-4 font-bold text-foreground text-sm">نقاط ضعف</th>
                <th className="p-4 font-bold text-foreground text-sm">کانال اصلی</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {plan.competitors?.map((comp, idx) => (
                <tr key={idx} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-muted to-muted-foreground/10 flex items-center justify-center text-muted-foreground">
                        <Target size={16} />
                      </div>
                      <span className="font-bold text-foreground">{comp.name}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-secondary bg-secondary/10 px-2 py-1 rounded-lg">
                      {comp.strength}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-destructive bg-destructive/10 px-2 py-1 rounded-lg">
                      {comp.weakness}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      {comp.channel.includes('اینستا') ? (
                        <Instagram size={14} className="text-pink-500" />
                      ) : comp.channel.includes('سایت') || comp.channel.includes('اپلیکیشن') ? (
                        <Globe size={14} className="text-primary" />
                      ) : (
                        <MapPin size={14} className="text-accent" />
                      )}
                      {comp.channel}
                    </div>
                  </td>
                </tr>
              ))}

              {/* Fallback if no competitors found (Legacy Plans) */}
              {(!plan.competitors || plan.competitors.length === 0) && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground text-sm">
                    داده‌های رقبا برای این پروژه موجود نیست. (پروژه قدیمی)
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </section>
    </div>
  );
}
