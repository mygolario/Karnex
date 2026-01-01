"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { getPlanFromCloud, toggleStepCompletion, BusinessPlan } from "@/lib/db";
import { Map, CheckCircle2, Circle, Sparkles, Trophy, HelpCircle, Clock, Zap, Lightbulb } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClickExplainer, HoverExplainer } from "@/components/ui/explainer";
import { LearnMore } from "@/components/ui/learn-more";
import { findGuideForStep, featureExplanations } from "@/lib/knowledge-base";

export default function RoadmapPage() {
  const { user } = useAuth();
  const { activeProject: plan, loading } = useProject();
  const router = useRouter();
  
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  // Update completed steps when plan changes
  useEffect(() => {
    if (plan) {
      setCompletedSteps(plan.completedSteps || []);
    }
  }, [plan]);

  // Handle Check/Uncheck
  const handleToggle = async (step: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || !plan) return;

    const isNowCompleted = !completedSteps.includes(step);
    setCompletedSteps(prev => 
      isNowCompleted ? [...prev, step] : prev.filter(s => s !== step)
    );

    try {
      await toggleStepCompletion(user.uid, step, isNowCompleted, plan.id || 'current');
    } catch (error) {
      console.error("Sync failed", error);
    }
  };

  if (loading || !plan) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center animate-pulse">
          <Map size={32} className="text-white" />
        </div>
        <p className="text-muted-foreground">در حال دریافت برنامه...</p>
      </div>
    );
  }

  const totalSteps = plan.roadmap.reduce((acc, phase) => acc + phase.steps.length, 0);
  const progressPercent = Math.round((completedSteps.length / totalSteps) * 100) || 0;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      
      {/* Feature Explanation Banner */}
      <LearnMore title="نقشه راه چیست؟" variant="accent">
        <p className="text-muted-foreground text-sm leading-7 mb-4">
          {featureExplanations.roadmap.description}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Lightbulb size={14} className="text-accent" />
          نکته: روی هر مرحله کلیک کنید تا توضیحات و راهنمای گام به گام را ببینید!
        </div>
      </LearnMore>

      {/* Header & Progress */}
      <Card variant="glass" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        
        <div className="relative flex justify-between items-end mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-black text-foreground">نقشه راه اجرایی</h1>
              <Badge variant="gradient" size="sm">
                <Sparkles size={12} />
                تعاملی
              </Badge>
              <HoverExplainer text="روی هر مرحله کلیک کنید تا راهنمای کامل انجام آن را ببینید" />
            </div>
            <p className="text-muted-foreground">قدم به قدم تا موفقیت</p>
          </div>
          
          <div className="text-left">
            <div className="text-4xl font-black text-gradient mb-1">
              {progressPercent}%
            </div>
            <div className="text-sm text-muted-foreground">
              {completedSteps.length} از {totalSteps} انجام شده
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="relative h-4 w-full bg-muted rounded-full overflow-hidden">
          <div 
            className="absolute inset-y-0 right-0 bg-gradient-to-l from-primary via-purple-500 to-secondary transition-all duration-700 ease-out rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
          <div 
            className="absolute inset-y-0 right-0 bg-gradient-to-l from-white/30 to-transparent animate-pulse rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        
        {progressPercent === 100 && (
          <div className="mt-4 flex items-center gap-2 text-secondary">
            <Trophy size={20} />
            <span className="font-bold">تبریک! شما تمام مراحل را کامل کردید!</span>
          </div>
        )}
      </Card>

      {/* Vertical Timeline */}
      <div className="relative border-r-2 border-border mr-4 md:mr-8 space-y-10 py-4">
        
        {plan.roadmap.map((phase, phaseIndex) => {
          const phaseStepsCompleted = phase.steps.filter((s: string) => completedSteps.includes(s)).length;
          const phaseProgress = Math.round((phaseStepsCompleted / phase.steps.length) * 100);
          
          return (
            <div key={phaseIndex} className="relative pr-8 md:pr-12">
              
              {/* Timeline Marker */}
              <div className={`absolute -right-[11px] top-0 w-5 h-5 rounded-full border-4 border-background shadow-lg z-10 transition-colors ${
                phaseProgress === 100 
                  ? 'bg-secondary' 
                  : phaseProgress > 0 
                    ? 'bg-primary' 
                    : 'bg-muted'
              }`} />
              
              {/* Phase Header */}
              <div className="flex items-center gap-3 mb-4">
                <Badge 
                  variant={phaseProgress === 100 ? "success" : phaseProgress > 0 ? "info" : "muted"} 
                  size="lg"
                >
                  فاز {phaseIndex + 1}
                </Badge>
                <h3 className="text-xl font-bold text-foreground">
                  {phase.phase}
                </h3>
                {phaseProgress === 100 && (
                  <CheckCircle2 size={20} className="text-secondary" />
                )}
              </div>

              {/* Steps Card */}
              <Card variant="default" padding="none" className="overflow-hidden">
                {phase.steps.map((step: string, stepIndex: number) => {
                  const isChecked = completedSteps.includes(step);
                  const guide = findGuideForStep(step);
                  const isExpanded = expandedStep === `${phaseIndex}-${stepIndex}`;
                  
                  return (
                    <div key={stepIndex} className="border-b border-border last:border-0">
                      {/* Step Row */}
                      <div 
                        onClick={() => setExpandedStep(isExpanded ? null : `${phaseIndex}-${stepIndex}`)}
                        className={`
                          group flex items-center gap-4 p-4 cursor-pointer transition-all duration-200
                          ${isChecked 
                            ? 'bg-secondary/5' 
                            : 'hover:bg-primary/5'
                          }
                        `}
                      >
                        {/* Checkbox */}
                        <div 
                          onClick={(e) => handleToggle(step, e)}
                          className={`
                            w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300 shrink-0
                            ${isChecked 
                              ? 'bg-secondary text-white shadow-lg shadow-secondary/25' 
                              : 'bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary'
                            }
                          `}>
                          {isChecked ? (
                            <CheckCircle2 size={18} />
                          ) : (
                            <Circle size={18} />
                          )}
                        </div>
                        
                        {/* Step Text */}
                        <span className={`
                          flex-1 text-base transition-all duration-300 select-none
                          ${isChecked 
                            ? 'text-muted-foreground line-through decoration-muted-foreground/50' 
                            : 'text-foreground'
                          }
                        `}>
                          {step}
                        </span>

                        {/* Guide Indicator */}
                        {guide && (
                          <div className="flex items-center gap-2">
                            <Badge variant="muted" size="sm" className="gap-1">
                              {guide.difficulty === "easy" ? "🟢" : guide.difficulty === "medium" ? "🟡" : "🔴"}
                              {guide.difficulty === "easy" ? "آسان" : guide.difficulty === "medium" ? "متوسط" : "پیشرفته"}
                            </Badge>
                            <Badge variant="muted" size="sm" className="gap-1">
                              <Clock size={10} />
                              {guide.timeEstimate}
                            </Badge>
                            <HelpCircle size={16} className="text-primary" />
                          </div>
                        )}
                      </div>

                      {/* Expanded Guide Section */}
                      {isExpanded && guide && (
                        <div className="px-4 pb-4 bg-muted/30 animate-in slide-in-from-top-2 duration-200">
                          <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
                            {/* Guide Header */}
                            <div className="flex items-start gap-4 mb-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center text-white shrink-0">
                                <Zap size={24} />
                              </div>
                              <div>
                                <h4 className="font-bold text-lg text-foreground">{guide.title}</h4>
                                <p className="text-muted-foreground text-sm leading-6 mt-1">
                                  {guide.description}
                                </p>
                              </div>
                            </div>

                            {/* Steps */}
                            <div className="mb-4">
                              <h5 className="font-bold text-foreground text-sm mb-3">مراحل انجام:</h5>
                              <ol className="space-y-2">
                                {guide.steps.map((s, i) => (
                                  <li key={i} className="flex gap-3">
                                    <span className="w-6 h-6 shrink-0 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold">
                                      {i + 1}
                                    </span>
                                    <span className="text-muted-foreground text-sm leading-6">{s}</span>
                                  </li>
                                ))}
                              </ol>
                            </div>

                            {/* Tools */}
                            {guide.tools && guide.tools.length > 0 && (
                              <div className="mb-4">
                                <h5 className="font-bold text-foreground text-sm mb-3">ابزارهای پیشنهادی:</h5>
                                <div className="flex flex-wrap gap-2">
                                  {guide.tools.map((tool, i) => (
                                    <a 
                                      key={i}
                                      href={tool.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-2 bg-muted hover:bg-muted/80 px-3 py-1.5 rounded-lg text-sm transition-colors"
                                    >
                                      <span className="font-medium text-foreground">{tool.name}</span>
                                      {tool.free && (
                                        <Badge variant="success" size="sm">رایگان</Badge>
                                      )}
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Tips */}
                            {guide.tips && guide.tips.length > 0 && (
                              <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                                <h5 className="font-bold text-accent text-sm mb-2 flex items-center gap-2">
                                  <Lightbulb size={14} />
                                  نکات مهم
                                </h5>
                                <ul className="space-y-1">
                                  {guide.tips.map((tip, i) => (
                                    <li key={i} className="text-sm text-muted-foreground flex gap-2">
                                      <span className="text-accent">•</span>
                                      {tip}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Simple Explanation for Steps without Full Guide */}
                      {isExpanded && !guide && (
                        <div className="px-4 pb-4 bg-muted/30 animate-in slide-in-from-top-2 duration-200">
                          <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
                            <div className="flex items-center gap-3 text-muted-foreground">
                              <Lightbulb size={20} className="text-primary" />
                              <p className="text-sm leading-6">
                                این مرحله را با دقت بخوانید و اقدام کنید. اگر سوالی دارید، از دستیار هوشمند در گوشه پایین صفحه کمک بگیرید!
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
