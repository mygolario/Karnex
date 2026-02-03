"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProject } from "@/contexts/project-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Presentation,
  FileSignature,
  Mail,
  Newspaper,
  Handshake,
  Loader2,
  Download,
  Copy,
  Check,
  Sparkles,
  ChevronLeft,
} from "lucide-react";

interface DocumentType {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  allowedTypes: ('startup' | 'traditional' | 'creator')[];
}

const documentTypes: DocumentType[] = [
  {
    id: "pitch-deck",
    icon: Presentation,
    title: "پیچ دک (Pitch Deck)",
    description: "ارائه استاندارد ۱۰ اسلایدی برای جذب سرمایه‌گذار",
    color: "from-purple-500 to-pink-500",
    allowedTypes: ['startup']
  },
  {
    id: "one-pager",
    icon: FileText,
    title: "وان پیجر (One Pager)",
    description: "خلاصه اجرایی یک صفحه‌ای از کل کسب‌وکار",
    color: "from-blue-500 to-cyan-500",
    allowedTypes: ['startup', 'traditional']
  },
  {
    id: "proposal",
    icon: Handshake,
    title: "پروپوزال همکاری",
    description: "پیشنهاد همکاری تجاری و B2B برای شرکا",
    color: "from-emerald-500 to-teal-500",
    allowedTypes: ['startup', 'traditional', 'creator']
  },
  {
    id: "nda",
    icon: FileSignature,
    title: "قرارداد محرمانگی (NDA)",
    description: "توافق‌نامه عدم افشای اطلاعات محرمانه",
    color: "from-amber-500 to-orange-500",
    allowedTypes: ['startup', 'traditional']
  },
  {
    id: "press-release",
    icon: Newspaper,
    title: "خبر مطبوعاتی (PR)",
    description: "اطلاعیه رسمی برای راه‌اندازی محصول یا رویداد",
    color: "from-rose-500 to-red-500",
    allowedTypes: ['startup', 'traditional', 'creator']
  },
  {
    id: "investor-email",
    icon: Mail,
    title: "ایمیل سرمایه‌گذار",
    description: "قالب ایمیل Cold Outreach برای ارتباط اولیه",
    color: "from-indigo-500 to-violet-500",
    allowedTypes: ['startup']
  },
  {
    id: "brand-guideline",
    icon: Sparkles,
    title: "راهنمای برند",
    description: "سند هویت بصری و کلامی برند شما",
    color: "from-pink-500 to-rose-500",
    allowedTypes: ['creator']
  },
  {
    id: "sponsorship-deck",
    icon: Presentation,
    title: "دک اسپانسرشیپ",
    description: "ارائه برای جذب اسپانسر محتوا",
    color: "from-orange-500 to-red-500",
    allowedTypes: ['creator']
  }
];

export default function DocsPage() {
  const { activeProject: plan } = useProject();
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateDocument = async (docType: string) => {
    if (!plan) return;
    
    setSelectedDoc(docType);
    setIsGenerating(true);
    setGeneratedContent("");

    const prompts: Record<string, string> = {
      "pitch-deck": `Create a 10-slide pitch deck outline for "${plan.projectName}". 
Overview: ${plan.overview}
Audience: ${plan.audience}

Format each slide as:
## اسلاید X: [عنوان]
- نکته ۱
- نکته ۲
- نکته ۳

Include: Problem, Solution, Market, Business Model, Traction, Team, Competition, Roadmap, Financials, Ask.
Respond in Persian.`,

      "one-pager": `Create a one-page executive summary for "${plan.projectName}".
Overview: ${plan.overview}
Audience: ${plan.audience}

Include sections:
- مشکل
- راه‌حل
- بازار هدف
- مدل درآمدی
- تیم
- درخواست

Respond in Persian with Markdown formatting.`,

      "proposal": `Create a partnership proposal for "${plan.projectName}".
Overview: ${plan.overview}

Include:
- معرفی شرکت
- فرصت همکاری
- مزایای مشارکت
- شرایط پیشنهادی
- گام‌های بعدی

Respond in Persian with Markdown.`,

      "nda": `Create an NDA template in Persian for "${plan.projectName}". Include:
- طرفین قرارداد
- تعریف اطلاعات محرمانه
- تعهدات طرفین
- مدت قرارداد
- استثنائات
- جریمه نقض

Use formal legal Persian.`,

      "press-release": `Create a press release for the launch of "${plan.projectName}".
Overview: ${plan.overview}

Format:
- عنوان جذاب
- پاراگراف اول (خلاصه)
- بدنه خبر
- نقل قول مدیرعامل
- درباره شرکت
- اطلاعات تماس

Respond in Persian.`,

      "investor-email": `Create a cold email template to investors for "${plan.projectName}".
Overview: ${plan.overview}

Make it:
- کوتاه (۵ خط)
- جذاب
- با CTA واضح

Respond in Persian.`,
    };

    try {
      const response = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompts[docType] || "Generate a business document in Persian.",
          systemPrompt: "You are a business document writer. Create professional Persian content with Markdown formatting.",
        }),
      });

      const data = await response.json();
      if (data.success && data.content) {
        setGeneratedContent(data.content);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Empty state
  if (!plan) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <FileText size={64} className="mx-auto mb-4 text-muted-foreground/40" />
          <h2 className="text-xl font-bold mb-2">پروژه‌ای انتخاب نشده</h2>
          <p className="text-muted-foreground">ابتدا یک پروژه بسازید.</p>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 pb-12"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
          <FileText size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-foreground">مستندساز</h1>
          <p className="text-muted-foreground">تولید اسناد حرفه‌ای با AI</p>
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {documentTypes
          .filter(doc => !plan?.projectType || doc.allowedTypes.includes(plan.projectType))
          .map((doc) => {
          const isSelected = selectedDoc === doc.id;
          
          return (
            <motion.div
              key={doc.id}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={`p-6 cursor-pointer transition-all ${
                  isSelected ? "ring-2 ring-primary" : "hover:shadow-lg"
                }`}
                onClick={() => generateDocument(doc.id)}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${doc.color} flex items-center justify-center text-white mb-4 shadow-lg`}>
                  <doc.icon size={28} />
                </div>
                <h3 className="font-bold text-lg mb-1">{doc.title}</h3>
                <p className="text-sm text-muted-foreground">{doc.description}</p>
                {isSelected && isGenerating && (
                  <div className="mt-4 flex items-center gap-2 text-primary">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="text-sm">در حال تولید...</span>
                  </div>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Generated Content */}
      <AnimatePresence>
        {generatedContent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Sparkles size={20} className="text-primary" />
                  {documentTypes.find(d => d.id === selectedDoc)?.title}
                </h3>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? "کپی شد" : "کپی"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const blob = new Blob([generatedContent], { type: "text/markdown" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `${selectedDoc}.md`;
                      a.click();
                    }}
                  >
                    <Download size={16} />
                    دانلود
                  </Button>
                </div>
              </div>

              <div className="prose prose-sm max-w-none dark:prose-invert bg-muted/30 rounded-xl p-6 whitespace-pre-wrap leading-8">
                {generatedContent}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
