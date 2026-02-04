"use client";

import { useState } from "react";
import { useProject } from "@/contexts/project-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Flame, 
  Target, 
  FlaskConical, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Sparkles,
  ArrowRight,
  Lightbulb
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { IdeaValidationData, ValidationAssumption, ValidationExperiment } from "@/lib/db";

// --- Types ---
// Removed local interfaces in favor of shared types from lib/db

// --- Components ---

const RoastCard = ({ critique }: { critique: IdeaValidationData['critique'] }) => {
  const isPassing = critique.score >= 70;
  
  return (
    <div className="space-y-6">
      {/* Score Header */}
      <Card className={`p-8 text-center border-2 ${isPassing ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
        <div className="mb-4 flexjustify-center">
            <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black ${isPassing ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                {critique.score}
            </div>
        </div>
        <h2 className="text-2xl font-bold mb-2">{isPassing ? "ارزشش رو داره! 🚀" : "نیاز به بازنگری 🚧"}</h2>
        <p className="text-lg text-muted-foreground italic max-w-2xl mx-auto">"{critique.summary}"</p>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 border-red-500/20">
           <h3 className="font-bold flex items-center gap-2 mb-4 text-red-500">
             <Flame size={20} />
             نقاط ضعف اصلی
           </h3>
           <ul className="space-y-3">
             {critique.weaknesses.map((w, i) => (
               <li key={i} className="flex items-start gap-2 text-sm">
                 <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                 {w}
               </li>
             ))}
           </ul>
        </Card>

        <Card className="p-6 border-emerald-500/20">
           <h3 className="font-bold flex items-center gap-2 mb-4 text-emerald-500">
             <CheckCircle2 size={20} />
             نقاط قوت
           </h3>
           <ul className="space-y-3">
             {critique.strengths.map((s, i) => (
               <li key={i} className="flex items-start gap-2 text-sm">
                 <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                 {s}
               </li>
             ))}
           </ul>
        </Card>
      </div>
    </div>
  );
};

const AssumptionsBoard = ({ assumptions }: { assumptions: ValidationAssumption[] }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
          <h3 className="font-bold flex items-center gap-2">
            <ShieldAlert className="text-amber-500" />
            فرضیات کلیدی
          </h3>
          <Badge variant="outline" className="text-amber-500 border-amber-500/20">
             {assumptions.filter(a => a.risk === 'critical').length} ریسک حیاتی
          </Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
         {assumptions.map((bg, i) => (
            <Card key={i} className={`p-4 border-l-4 ${bg.risk === 'critical' ? 'border-l-red-500' : 'border-l-blue-500'}`}>
                <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary" className="text-[10px]">
                        {bg.risk === 'critical' ? 'حیاتی (باید تست شود)' : 'کم اهمیت'}
                    </Badge>
                </div>
                <p className="font-medium">{bg.text}</p>
            </Card>
         ))}
      </div>
      
      <div className="p-4 bg-blue-500/10 rounded-xl text-blue-400 text-sm flex gap-3 items-center">
          <Lightbulb size={18} />
          <span>نکته: برای کاهش ریسک، ابتدا فرضیات قرمز (حیاتی) را تست کنید. اگر این‌ها غلط باشند، کل ایده شکست می‌خورد.</span>
      </div>
    </div>
  );
};

const ExperimentsList = ({ experiments }: { experiments: ValidationExperiment[] }) => {
   return (
     <div className="space-y-6">
        <h3 className="font-bold flex items-center gap-2">
            <FlaskConical className="text-purple-500" />
            پیشنهادات تست ارزان
        </h3>

        <div className="grid gap-6">
            {experiments.map((ex, i) => (
                <Card key={i} className="p-6 relative overflow-hidden group hover:border-purple-500/50 transition-colors">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
                    
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-bold">{ex.title}</h4>
                            <Badge variant="outline" className="bg-background">کم هزینه</Badge>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">روش اجرا</p>
                                <p className="text-sm">{ex.steps}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">معیار موفقیت</p>
                                <p className="text-sm font-medium text-emerald-500">{ex.metric}</p>
                            </div>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
     </div>
   );
};

// --- Page ---

export default function ValidatorPage() {
  const { activeProject, updateActiveProject } = useProject();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<IdeaValidationData | null>(null);
  const [activeTab, setActiveTab] = useState("roast");

  // Load persistence data
  if (activeProject?.ideaValidation && !data) {
     setData(activeProject.ideaValidation);
  }

  const handleValidate = async () => {
    if (!activeProject) return;
    setLoading(true);
    try {
        const res = await fetch("/api/ai-generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                action: "validate-idea",
                projectName: activeProject.projectName,
                businessIdea: activeProject.overview || activeProject.description
            })
        });
        
        const json = await res.json();
        if (json.success && json.validation) {
            const validationData: IdeaValidationData = json.validation;
            setData(validationData);
            
            // Persist to Cloud
            updateActiveProject({ ideaValidation: validationData });
            
            toast.success("تحلیل انجام شد");
        } else {
            toast.error("خطا در تحلیل ایده");
        }
    } catch (e) {
        toast.error("مشکل در ارتباط با سرور");
    } finally {
        setLoading(false);
    }
  };

  if (!activeProject) return <div className="p-10 text-center">پروژه‌ای انتخاب نشده است.</div>;

  return (
    <div className="max-w-5xl mx-auto pb-20">
       {/* Header */}
       <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
                <Target className="text-primary" />
                اعتبارسنجی هوشمند
            </h1>
            <p className="text-muted-foreground">
                تحلیل بی‌رحمانه، شناسایی ریسک‌ها و راهکارهای تست ارزان
            </p>
          </div>
          <Button size="lg" onClick={handleValidate} disabled={loading} variant="shimmer">
             {loading ? <RefreshCw className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
             {data ? "تحلیل مجدد" : "شروع تحلیل"}
          </Button>
       </div>

       {/* Results Area */}
       <AnimatePresence mode="wait">
          {!data && !loading && (
             <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20 border-2 border-dashed rounded-3xl"
             >
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Target size={48} className="text-primary opacity-50" />
                </div>
                <h3 className="text-xl font-bold mb-2">هنوز تحلیلی انجام نشده</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-8">
                    دکمه "شروع تحلیل" را بزنید تا هوش مصنوعی ایده شما را به چالش بکشد و نقاط کور آن را پیدا کند.
                </p>
                <Button onClick={handleValidate} variant="outline">شروع کنید <ArrowRight className="ml-2 w-4 h-4"/></Button>
             </motion.div>
          )}

          {loading && (
             <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-32 text-center"
             >
                 <RefreshCw className="w-16 h-16 animate-spin mx-auto text-primary mb-6" />
                 <h3 className="text-xl font-bold">در حال تفکر عمیق...</h3>
                 <p className="text-muted-foreground">در حال بررسی بازار و پیدا کردن ایرادات...</p>
             </motion.div>
          )}

          {data && !loading && (
              <motion.div
                 key="results"
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
              >
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList className="grid w-full grid-cols-3 mb-8 h-12">
                          <TabsTrigger value="roast" className="text-base">🔥 نقد بی‌رحمانه</TabsTrigger>
                          <TabsTrigger value="assumptions" className="text-base">🛡️ فرضیات و ریسک</TabsTrigger>
                          <TabsTrigger value="experiments" className="text-base">🧪 آزمایشگاه</TabsTrigger>
                      </TabsList>

                      <TabsContent value="roast">
                          <RoastCard critique={data.critique} />
                      </TabsContent>
                      
                      <TabsContent value="assumptions">
                          <AssumptionsBoard assumptions={data.assumptions} />
                      </TabsContent>

                      <TabsContent value="experiments">
                          <ExperimentsList experiments={data.experiments} />
                      </TabsContent>
                  </Tabs>
              </motion.div>
          )}
       </AnimatePresence>
    </div>
  );
}
