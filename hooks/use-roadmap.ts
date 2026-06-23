"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { toggleStepCompletion, RoadmapStep } from "@/lib/db";

// Types
export interface RoadmapStepObject {
  title: string;
  description?: string;
  estimatedHours?: number | string;
  priority?: "high" | "medium" | "low" | string;
  category?: string;
  status?: "todo" | "in-progress" | "done";
  checklist?: string[];
  tips?: string[];
  resources?: string[];
  dueDate?: string; // ISO date string
}

export type RoadmapPhase = {
  phase: string;
  weekNumber?: number;
  theme?: string;
  steps: (string | RoadmapStepObject)[];
};

export interface UseRoadmapReturn {
  // Data
  plan: any;
  loading: boolean;
  roadmap: RoadmapPhase[];
  completedSteps: string[]; // Legacy support
  
  // Computed
  progressPercent: number;
  totalSteps: number;
  activeWeek: number;
  
  // Actions
  toggleStep: (step: string | RoadmapStepObject) => Promise<void>;
  updateStepStatus: (step: string | RoadmapStepObject, status: "todo" | "in-progress" | "done") => Promise<void>;
  isCompleted: (step: string | RoadmapStepObject) => boolean;
  getStepTitle: (step: string | RoadmapStepObject) => string;
  getStepStatus: (step: string | RoadmapStepObject) => "todo" | "in-progress" | "done";
}

export function useRoadmap(): UseRoadmapReturn {
  const { user } = useAuth();
  const { activeProject: plan, loading, updateActiveProject } = useProject();
  
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [activeWeek, setActiveWeek] = useState(1);

  // Compute roadmap dynamically
  const roadmap = useMemo(() => {
    const baseRoadmap = (plan?.roadmap || []) as RoadmapPhase[];
    if (plan?.projectType === 'traditional') {
      const compliancePhase: RoadmapPhase = {
        phase: "الزامات قانونی و مجوزهای کسب‌وکار در ایران",
        weekNumber: 0,
        theme: "قوانین و مجوزها",
        steps: [
          {
            title: "دریافت جواز کسب",
            description: "مجوز رسمی برای فعالیت صنفی در مکان تجاری. از درگاه ملی مجوزها اقدام کنید.",
            estimatedHours: 40,
            priority: "high",
            category: "legal",
            status: "todo",
            checklist: [
              "ثبت درخواست در درگاه ملی مجوزها (mojavez.ir)",
              "ثبت‌نام در سامانه نوین اصناف",
              "ارسال مدارک هویتی و عکس پرسنلی",
              "ارائه سند مالکیت یا اجاره‌نامه با کاربری تجاری/اداری",
              "پرداخت هزینه‌های صنف و صدور جواز"
            ],
            tips: [
              "اجاره‌نامه حتماً کد رهگیری رسمی داشته باشد",
              "از درگاه ملی مجوزها شروع کنید تا فرآیند کوتاه‌تر شود"
            ]
          },
          {
            title: "ثبت‌نام پرونده مالیاتی و کد اقتصادی",
            description: "هر کسب‌وکار فعال موظف به ثبت پرونده مالیاتی در سازمان امور مالیاتی است.",
            estimatedHours: 10,
            priority: "medium",
            category: "legal",
            status: "todo",
            checklist: [
              "ورود به درگاه ملی خدمات الکترونیک مالیاتی (my.tax.gov.ir)",
              "ثبت‌نام اولیه و ایجاد حساب کاربری",
              "تکمیل اطلاعات کسب‌وکار و مکان فعالیت",
              "تایید پرونده و صدور کد اقتصادی",
              "ارائه اظهارنامه مالیاتی سالانه طبق زمان مقرر"
            ],
            tips: [
              "حتی در صورت عدم تراکنش، اظهارنامه ندادن جریمه دارد",
              "از معافیت‌های مالیاتی مربوط به صنف خود آگاه شوید"
            ]
          },
          {
            title: "دریافت کد کارگاهی تأمین اجتماعی",
            description: "برای بیمه کردن کارکنان، باید برای کارگاه یا مغازه کد بیمه تأمین اجتماعی بگیرید.",
            estimatedHours: 20,
            priority: "high",
            category: "legal",
            status: "todo",
            checklist: [
              "مراجعه به سامانه خدمات غیرحضوری تأمین اجتماعی (eservices.tamin.ir)",
              "ارائه جواز کسب و سند مالکیت/اجاره‌نامه",
              "ارسال مدارک هویتی کارفرما",
              "بازرسی محل توسط مامور سازمان تأمین اجتماعی",
              "تخصیص کد کارگاهی و امکان ارسال لیست بیمه ماهانه"
            ],
            tips: [
              "لیست بیمه هر ماه باید تا پایان ماه بعد ارسال و پرداخت شود",
              "بازرسی معمولاً در ساعت کاری انجام می‌شود؛ در محل حضور داشته باشید"
            ]
          },
          {
            title: "دریافت مجوز تابلوی شهرداری و پروانه‌های محلی",
            description: "برای نصب تابلو در فضای عمومی یا تغییرات محلی نیاز به پروانه شهرداری منطقه خود دارید.",
            estimatedHours: 15,
            priority: "medium",
            category: "legal",
            status: "todo",
            checklist: [
              "مراجعه به شهرداری منطقه یا سامانه تهران من (یا شهرداری شهر خود)",
              "ثبت درخواست مجوز نصب تابلو",
              "ارائه طرح و ابعاد تابلو",
              "پرداخت عوارض سالانه تابلوی کسب‌وکار",
              "دریافت برچسب یا تاییدیه رسمی شهرداری"
            ],
            tips: [
              "نصب بدون مجوز تابلو جریمه و احتمال جمع‌آوری توسط شهرداری دارد",
              "ابعاد تابلو نباید از استانداردهای عرض معبر بیشتر باشد"
            ]
          }
        ]
      };
      return [compliancePhase, ...baseRoadmap];
    }
    return baseRoadmap;
  }, [plan?.roadmap, plan?.projectType]);

  // Sync state from plan and computed roadmap
  useEffect(() => {
    if (plan) {
      setCompletedSteps(plan.completedSteps || []);
      
      // Auto-detect active week based on first incomplete step
      if (roadmap && roadmap.length > 0) {
        const currentWeekIdx = roadmap.findIndex((phase: any) =>
          phase.steps.some((s: any) => !plan.completedSteps?.includes(typeof s === 'string' ? s : s.title))
        );
        if (currentWeekIdx >= 0) {
          const phase = roadmap[currentWeekIdx] as RoadmapPhase;
          setActiveWeek(phase.weekNumber !== undefined ? phase.weekNumber : currentWeekIdx + 1);
        }
      }
    }
  }, [plan, roadmap]);

  const getStepTitle = (step: string | RoadmapStepObject): string => {
    return typeof step === 'string' ? step : step.title;
  };

  const isCompleted = (step: string | RoadmapStepObject) => {
    return completedSteps.includes(getStepTitle(step));
  };

  const getStepStatus = (step: string | RoadmapStepObject): "todo" | "in-progress" | "done" => {
    // Priority: if it's in completedSteps, it's done.
    if (isCompleted(step)) return "done";
    if (typeof step !== 'string' && step.status) return step.status;
    return "todo";
  };

  const updateStepStatus = async (step: string | RoadmapStepObject, status: "todo" | "in-progress" | "done") => {
     if (!user || !plan) return;

    const stepName = getStepTitle(step);
    // Logic for legacy array: if status is 'done', add to list. If not, remove.
    // Ideally we should update the actual step object in the roadmap array too, 
    // but for now we sync with the `completedSteps` array for backward compatibility
    const isNowCompleted = status === 'done';
    
    // Optimistic update
    const newCompletedSteps = isNowCompleted 
      ? [...completedSteps, stepName] 
      : completedSteps.filter(s => s !== stepName);
    
    setCompletedSteps(newCompletedSteps);
    
    // Also update the local plan object to reflect status change in UI immediately if using object properties
    // This is complex because we need to find the step in the nested array. 
    // For this MVP, we rely on `completedSteps` array for "done" status,
    // and we might need a local state for "in-progress" if we want to track it without DB changes yet.
    
    updateActiveProject({ completedSteps: newCompletedSteps });

    try {
      await toggleStepCompletion(user.id!, stepName, isNowCompleted, plan.id || 'current');
    } catch (error) {
      console.error("Sync failed", error);
      // Revert on failure
      setCompletedSteps(completedSteps);
      updateActiveProject({ completedSteps: completedSteps });
    }
  };

  // Legacy toggle wrapper
  const toggleStep = async (step: string | RoadmapStepObject) => {
    const current = getStepStatus(step);
    const newStatus = current === 'done' ? 'todo' : 'done';
    await updateStepStatus(step, newStatus);
  };
  
  const totalSteps = useMemo(() => {
    return roadmap.reduce((acc: number, phase: RoadmapPhase) => acc + (phase.steps?.length || 0), 0);
  }, [roadmap]);

  const progressPercent = useMemo(() => {
    if (totalSteps === 0) return 0;
    return Math.round((completedSteps.length / totalSteps) * 100);
  }, [completedSteps.length, totalSteps]);

  return {
    plan,
    loading,
    roadmap,
    completedSteps,
    progressPercent,
    totalSteps,
    activeWeek,
    toggleStep,
    updateStepStatus,
    isCompleted,
    getStepTitle,
    getStepStatus,
  };
}
