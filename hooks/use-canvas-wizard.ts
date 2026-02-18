"use client";

import { useState, useMemo } from "react";

import { useProject } from "@/contexts/project-context";

// Define the steps for the Business Model Canvas (BMC)
// Order based on standard "Storytelling" flow for BMC:
// Customer Segments -> Value Prop -> Channels -> Relationships -> Revenue -> Key Resources -> Activities -> Partners -> Cost
export const BMC_STEPS = [
  {
    id: "customerSegments",
    title: "مشتریان هدف", // Customer Segments
    question: "چه کسانی مهم‌ترین مشتریان شما هستند؟",
    description: "برای چه کسانی ارزش خلق می‌کنید؟ ویژگی‌های کلیدی آن‌ها چیست؟",
    placeholder: "مثال: دانشجویان، مدیران بازاریابی، کسب‌وکارهای کوچک...",
    color: "purple", // Matching board color
  },
  {
    id: "uniqueValue",
    title: "ارزش پیشنهادی", // Value Propositions
    question: "چه مشکلات یا نیازهایی را برطرف می‌کنید؟",
    description: "چرا مشتریان باید شما را انتخاب کنند؟ محصول یا خدمات شما چه ارزشی دارد؟",
    placeholder: "مثال: صرفه‌جویی در زمان، کاهش هزینه، طراحی بهتر...",
    color: "pink", // Matching board color
  },
  {
    id: "channels",
    title: "کانال‌ها", // Channels
    question: "چگونه به مشتریان دسترسی پیدا می‌کنید؟",
    description: "از چه راه‌هایی محصول یا خدمات خود را به دست مشتری می‌رسانید؟",
    placeholder: "مثال: وب‌سایت، شبکه‌های اجتماعی، فروش مستقیم...",
    color: "orange",
  },
  {
    id: "customerRelations",
    title: "ارتباط با مشتری", // Customer Relationships
    question: "چگونه با مشتریان خود تعامل دارید؟",
    description: "نوع رابطه شما با مشتری چگونه است؟ (شخصی، خودکار، پشتیبانی اختصاصی...)",
    placeholder: "مثال: پشتیبانی آنلاین، ایمیل مارکتینگ، انجمن‌های کاربری...",
    color: "rose", // Matching board color
  },
  {
    id: "revenueStream",
    title: "جریان‌های درآمدی", // Revenue Streams
    question: "مشتریان بابت چه چیزی پول می‌دهند؟",
    description: "مدل درآمدی شما چیست؟ (فروش محصول، اشتراک، تبلیغات...)",
    placeholder: "مثال: اشتراک ماهانه، کارمزد تراکنش، فروش لایسنس...",
    color: "green",
  },
  {
    id: "keyResources",
    title: "منابع کلیدی", // Key Resources
    question: "برای اجرای کار به چه منابعی نیاز دارید؟",
    description: "دارایی‌های فیزیکی، انسانی، یا معنوی که برای خلق ارزش ضروری هستند.",
    placeholder: "مثال: تیم برنامه‌نویسی، دفتر کار، حق اختراع...",
    color: "indigo", // Matching board color
  },
  {
    id: "keyActivities",
    title: "فعالیت‌های کلیدی", // Key Activities
    question: "مهم‌ترین کارهایی که باید انجام دهید چیست؟",
    description: "فعالیت‌های روزمره‌ای که برای بقای کسب‌وکارتان ضروری است.",
    placeholder: "مثال: توسعه محصول، بازاریابی، مدیریت زنجیره تامین...",
    color: "blue",
  },
  {
    id: "keyPartners",
    title: "شرکای کلیدی", // Key Partnerships
    question: "چه کسانی به شما کمک می‌کنند؟",
    description: "تامین‌کنندگان، شرکا یا متحدانی که برای موفقیت به آن‌ها نیاز دارید.",
    placeholder: "مثال: تامین‌کنندگان مواد اولیه، شرکای توزیع، سرمایه‌گذاران...",
    color: "cyan", // Matching board color
  },
  {
    id: "costStructure",
    title: "ساختار هزینه‌ها", // Cost Structure
    question: "مهم‌ترین هزینه‌های کسب‌وکار شما چیست؟",
    description: "هزینه‌های ثابت و متغیری که باید بپردازید.",
    placeholder: "مثال: حقوق پرسنل، اجاره سرور، بودجه تبلیغات...",
    color: "red",
  },
];

export function useCanvasWizard({ onComplete }: { onComplete: (answers: Record<string, string>) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const currentStep = useMemo(() => BMC_STEPS[currentStepIndex], [currentStepIndex]);

  const progress = ((currentStepIndex + 1) / BMC_STEPS.length) * 100;

  const openWizard = () => {
    setIsOpen(true);
    setCurrentStepIndex(0);
    setCurrentInput("");
    setAnswers({});
  };

  const closeWizard = () => {
    setIsOpen(false);
  };

  const nextStep = () => {
    // Save current answer
    const newAnswers = { ...answers };
    if (currentInput.trim()) {
      newAnswers[currentStep.id] = currentInput.trim();
    }
    setAnswers(newAnswers);
    
    if (currentStepIndex < BMC_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
      setCurrentInput("");
    } else {
      // Final step
      onComplete(newAnswers);
      closeWizard();
    }
  };

  const skipStep = () => {
    if (currentStepIndex < BMC_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
      setCurrentInput("");
    } else {
      onComplete(answers); // Pass what we have so far
      closeWizard();
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
      // Optional: restore previous answer if it exists
      // const prevId = BMC_STEPS[currentStepIndex - 1].id;
      // setCurrentInput(answers[prevId] || "");
      setCurrentInput(""); 
    }
  };

  return {
    isOpen,
    currentStep,
    currentStepIndex,
    totalSteps: BMC_STEPS.length,
    progress,
    currentInput,
    setCurrentInput,
    openWizard,
    closeWizard,
    nextStep,
    skipStep,
    prevStep,
  };
}
