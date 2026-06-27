"use client";

import { useState } from "react";
import { useProject } from "@/contexts/project-context";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Lightbulb, Sparkles, TrendingUp, Search, RefreshCw, 
  ThumbsUp, Share2, Youtube, Instagram, Twitter,
  BookOpen, Video, Hash, ArrowRight, Loader2
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { LimitReachedModal } from "@/components/shared/limit-reached-modal";

interface Idea {
  id: string;
  title: string;
  description: string;
  score: number;
  tags: string[];
  platform: "youtube" | "instagram" | "twitter";
  isTrending?: boolean;
}

export default function IdeasPage() {
  const { activeProject: plan } = useProject();
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [showLimitModal, setShowLimitModal] = useState(false);

  // Check project type
  if (plan?.projectType !== "creator") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center max-w-md">
          <Lightbulb size={64} className="mx-auto mb-4 text-muted-foreground/40" />
          <h2 className="text-xl font-bold mb-2">ایده‌یاب محتوا برای تولیدکنندگان محتوا</h2>
          <p className="text-muted-foreground mb-4">
            این امکان فقط برای پروژه‌های Creator فعال است.
          </p>
          <Link href="/dashboard/overview">
            <Button>بازگشت به داشبورد</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const handleGenerateIdeas = async () => {
    if (!topic) {
      toast.error("لطفاً یک موضوع وارد کنید");
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = `Generate 3 creative content ideas about the topic: "${topic}" for Persian-speaking social media creators.
      Return ONLY valid JSON array:
      [
        {
          "title": "Catchy idea title in Persian",
          "description": "Brief explanation in Persian of why this idea works and how to execute it",
          "score": number between 75-98 representing viral potential,
          "tags": ["tag1", "tag2", "tag3"] in Persian,
          "platform": "instagram" | "youtube" | "twitter",
          "isTrending": boolean
        }
      ]`;

      const res = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, systemPrompt: "You are a viral content strategist for Persian social media. Return ONLY valid JSON." })
      });

      if (res.status === 429) {
        setShowLimitModal(true);
        return;
      }

      const data = await res.json();
      if (data.success && data.content) {
        const cleaned = data.content.replace(/```json|```/g, "").trim();
        const parsed: Omit<Idea, 'id'>[] = JSON.parse(cleaned);
        const newIdeas: Idea[] = parsed.map((idea, i) => ({
          ...idea,
          id: `idea-${Date.now()}-${i}`,
        }));
        setIdeas(newIdeas);
        toast.success("ایده‌های جدید پیدا شد!");
      }
    } catch (e) {
      console.error("Failed to generate ideas:", e);
      toast.error("خطا در ارتباط با دستیار کارنکس");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24 md:pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground">موتور ایده‌پرداز AI</h1>
              <p className="text-muted-foreground">کشف ایده‌های وایرال و ترندهای روز</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <Card className="p-8 bg-gradient-to-br from-background to-muted/20 border-primary/10">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-2xl font-bold">درباره چه موضوعی محتوا می‌خوای؟</h2>
          <div className="relative">
             <Input 
               className="h-14 text-lg pr-12 pl-32 rounded-2xl shadow-sm border-2 focus-visible:ring-0 focus-visible:border-primary transition-all"
               placeholder="مثال: هوش مصنوعی، آشپزی، گیمینگ..."
               value={topic}
               onChange={(e) => setTopic(e.target.value)}
               onKeyDown={(e) => e.key === "Enter" && handleGenerateIdeas()}
             />
             <Search className="absolute right-4 top-4 text-muted-foreground" />
             <Button 
               className="absolute left-2 top-2 h-10 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
               onClick={handleGenerateIdeas}
               disabled={isGenerating}
             >
               {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles />}
               {isGenerating ? "در حال فکر..." : "ایده بده"}
             </Button>
          </div>
          <div className="flex flex-wrap justify-center gap-2 text-sm text-muted-foreground">
            <span>ترندهای پیشنهادی:</span>
            {["تکنولوژی", "لایف استایل", "موفقیت", "برنامه‌نویسی"].map(t => (
              <Badge 
                key={t} 
                variant="outline" 
                className="cursor-pointer hover:bg-primary/5 hover:border-primary/30 transition-colors"
                onClick={() => setTopic(t)}
              >
                {t}
              </Badge>
            ))}
          </div>
        </div>
      </Card>

      {/* Results Grid */}
      <AnimatePresence>
        {ideas.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ideas.map((idea, index) => (
              <motion.div
                key={idea.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full flex flex-col p-6 hover:shadow-lg transition-all duration-300 group border-t-4 border-t-primary">
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant={idea.isTrending ? "default" : "secondary"} className={idea.isTrending ? "bg-red-500 hover:bg-red-600" : ""}>
                      {idea.isTrending ? <TrendingUp size={12} className="mr-1" /> : null}
                      {idea.isTrending ? "ترند" : "پیشنهادی"}
                    </Badge>
                    <div className="flex gap-1">
                      {idea.platform === "youtube" && <Youtube className="text-red-500" />}
                      {idea.platform === "instagram" && <Instagram className="text-pink-500" />}
                      {idea.platform === "twitter" && <Twitter className="text-blue-400" />}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                    {idea.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-1">
                    {idea.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {idea.tags.map(tag => (
                      <span key={tag} className="text-xs px-2 py-1 bg-muted rounded-md text-muted-foreground">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground mb-1">پتانسیل وایرال</span>
                      <div className="flex items-center gap-1">
                        <div className="h-2 w-16 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: `${idea.score}%` }} />
                        </div>
                        <span className="text-xs font-bold text-emerald-600">{idea.score}%</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-primary hover:text-primary"
                      onClick={() => {
                        navigator.clipboard.writeText(idea.title);
                        toast.success("ایده کپی شد — در کوپایلت یا تقویم استفاده کن!");
                      }}
                    >
                      استفاده
                      <ArrowRight size={16} />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
      
      {/* Empty State / Hint */}
      {!isGenerating && ideas.length === 0 && (
        <div className="text-center py-12 opacity-50">
          <Sparkles className="mx-auto mb-4 w-12 h-12 text-primary/30" />
          <p className="text-lg font-medium">منتظر چی هستی؟ یه موضوع بنویس تا منفجرش کنیم! 🚀</p>
        </div>
      )}

      <LimitReachedModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        limit={10}
        used={0}
      />
    </div>
  );
}
