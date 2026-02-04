"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProject } from "@/contexts/project-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  TrendingUp, Target, FlaskConical, Sparkles, Loader2,
  ArrowUpRight, Plus, Rocket, BarChart2, Lightbulb,
  CheckCircle2, AlertCircle, RefreshCw, Trash2, Edit, Save, X
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid
} from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// --- Types ---

import { FunnelStage, Experiment, NorthStar, GrowthData } from "@/lib/db";
import { toast } from "sonner"; // Assuming sonner is used for notifications



const INITIAL_FUNNEL: FunnelStage[] = [
  { id: 'acquisition', name: 'جذب (Acquisition)', value: 1000, color: '#3b82f6', description: 'بازدیدکنندگان جدید سایت' },
  { id: 'activation', name: 'فعال‌سازی (Activation)', value: 200, color: '#8b5cf6', description: 'ثبت‌نام یا اولین تجربه موفق' },
  { id: 'retention', name: 'بازگشت (Retention)', value: 80, color: '#ec4899', description: 'کاربران فعال بازگشتی' },
  { id: 'revenue', name: 'درآمد (Revenue)', value: 20, color: '#10b981', description: 'مشتریان پرداخت‌کننده' },
  { id: 'referral', name: 'معرفی (Referral)', value: 5, color: '#f59e0b', description: 'دعوت از دوستان' },
];

export default function GrowthPage() {
  const { activeProject: plan, updateActiveProject } = useProject();
  
  // State
  const [activeTab, setActiveTab] = useState("strategy");
  const [funnelData, setFunnelData] = useState<FunnelStage[]>(INITIAL_FUNNEL);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [northStar, setNorthStar] = useState<NorthStar | null>(null);
  
  // Load Data from Plan
  useEffect(() => {
    if (plan?.growth) {
      if (plan.growth.funnel) setFunnelData(plan.growth.funnel);
      if (plan.growth.experiments) setExperiments(plan.growth.experiments);
      if (plan.growth.northStar) setNorthStar(plan.growth.northStar);
    }
  }, [plan?.id]); // Only reload if project ID changes

  // Helper to save data
  const saveGrowthData = async (updates: Partial<GrowthData>) => {
    if (!plan) return;
    
    const currentGrowth: GrowthData = plan.growth || {};
    const newGrowth = { ...currentGrowth, ...updates };
    
    // Update Context (Optimistic + Cloud)
    updateActiveProject({ growth: newGrowth });
  };
  
  // Loading States
  const [isGeneratingNSM, setIsGeneratingNSM] = useState(false);
  const [isGeneratingHacks, setIsGeneratingHacks] = useState(false);
  const [hackTargetStage, setHackTargetStage] = useState('activation');

  // Edit State
  const [editingExp, setEditingExp] = useState<Experiment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // --- Calculations ---
  
  const getConversionRate = (index: number) => {
    if (index === 0) return 100;
    const prev = funnelData[index - 1].value;
    const current = funnelData[index].value;
    if (prev === 0) return 0;
    return Math.round((current / prev) * 100);
  };

  // --- Actions ---

  const handleUpdateFunnel = (id: string, newValue: number) => {
    const updatedFunnel = funnelData.map(stage => 
      stage.id === id ? { ...stage, value: newValue } : stage
    );
    setFunnelData(updatedFunnel);
    saveGrowthData({ funnel: updatedFunnel });
  };
  
  const handleDeleteExperiment = (id: string) => {
     const updatedExperiments = experiments.filter(e => e.id !== id);
     setExperiments(updatedExperiments);
     saveGrowthData({ experiments: updatedExperiments });
  };

  const handleSaveExperiment = () => {
    if (!editingExp) return;
    
    // Recalculate ICE Score
    const iceScore = Math.round((editingExp.impact + editingExp.confidence + editingExp.ease) / 3 * 10) / 10;
    const updatedExp = { ...editingExp, iceScore };

    let updatedExperiments: Experiment[];
    if (experiments.find(e => e.id === updatedExp.id)) {
        // Update existing
        updatedExperiments = experiments.map(e => e.id === updatedExp.id ? updatedExp : e);
    } else {
        // Create new
        updatedExperiments = [updatedExp, ...experiments];
    }
    
    setExperiments(updatedExperiments);
    saveGrowthData({ experiments: updatedExperiments });
    
    setEditingExp(null);
    setIsDialogOpen(false);
  };

  const openEditDialog = (exp: Experiment) => {
      setEditingExp(exp);
      setIsDialogOpen(true);
  };

  const openNewDialog = () => {
      setEditingExp({
        id: Math.random().toString(36).substr(2, 9),
        title: "",
        description: "",
        iceScore: 0, impact: 5, confidence: 5, ease: 5,
        stage: hackTargetStage, status: 'idea'
      });
      setIsDialogOpen(true);
  };

  const generateNorthStar = async () => {
    if (!plan) return;
    setIsGeneratingNSM(true);
    try {
      const res = await fetch("/api/ai-generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: 'generate-growth-plan',
          planType: 'north-star',
          projectName: plan.projectName,
          businessIdea: plan.overview
        })
      });
      const data = await res.json();
      if (data.success) {
        const newNSM = {
          metric: data.data.northStarMetric,
          why: data.data.why,
          inputs: data.data.inputMetrics
        };
        setNorthStar(newNSM);
        saveGrowthData({ northStar: newNSM });
      }
    } catch (e) { console.error(e); }
    finally { setIsGeneratingNSM(false); }
  };

  const generateExperiments = async () => {
    if (!plan) return;
    setIsGeneratingHacks(true);
    try {
      const res = await fetch("/api/ai-generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: 'generate-growth-plan',
          planType: 'experiments',
          stage: funnelData.find(f => f.id === hackTargetStage)?.name,
          projectName: plan.projectName,
          businessIdea: plan.overview
        })
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const newHacks: Experiment[] = data.data.map((h: any) => ({
          id: Math.random().toString(36).substr(2, 9),
          title: h.title,
          description: h.description,
          iceScore: h.ice_score || 7,
          impact: 7, confidence: 7, ease: 7, // Default placeholders
          stage: hackTargetStage,
          status: 'idea'
        }));
        
        const updatedExperiments = [...newHacks, ...experiments];
        setExperiments(updatedExperiments);
        saveGrowthData({ experiments: updatedExperiments });
        
        setActiveTab("tactics"); // Switch to experiments tab
      }
    } catch (e) { console.error(e); }
    finally { setIsGeneratingHacks(false); }
  };

  const addManualExperiment = () => {
    const newExp: Experiment = {
        id: Math.random().toString(36).substr(2, 9),
        title: "آزمایش جدید",
        description: "توضیحات آزمایش...",
        iceScore: 5, impact: 5, confidence: 5, ease: 5,
        stage: 'acquisition', status: 'idea'
    };
    const updatedExperiments = [newExp, ...experiments];
    setExperiments(updatedExperiments);
    saveGrowthData({ experiments: updatedExperiments });
  };

  // --- Render ---

  if (!plan) return <div className="p-8 text-center text-muted-foreground">ابتدا پروژه را انتخاب کنید</div>;

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-8">
      
      {/* Header */}
      {/* ... (Header remains same) */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <Rocket size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-foreground">رشدنما (Growth Map)</h1>
            <p className="text-muted-foreground">فرماندهی رشد: استراتژی شمال حقیقی و آزمایش‌های علمی</p>
          </div>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => setExperiments([])} disabled={experiments.length === 0}>
                <RefreshCw size={16} className="mr-2"/> پاکسازی
            </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* ... (TabsList remains same) */}
        <TabsList className="w-full max-w-md mx-auto grid grid-cols-2 mb-8 p-1 bg-muted/50 backdrop-blur-sm border border-border/50 rounded-2xl">
          <TabsTrigger value="strategy" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm">
             <Target size={16} className="ml-2"/> استراتژی & قیف (Strategy)
          </TabsTrigger>
          <TabsTrigger value="tactics" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm">
             <FlaskConical size={16} className="ml-2"/> آزمایشگاه رشد (Experiments)
          </TabsTrigger>
        </TabsList>

        {/* 1. STRATEGY TAB */}
        <TabsContent value="strategy" className="space-y-6 focus-visible:ring-0">
          {/* ... (North Star & Funnel Content remains same) */}
           {/* North Star Section */}
          <div className="grid md:grid-cols-3 gap-6">
             {/* NSM Card */}
             <Card className="md:col-span-1 p-6 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-background border-indigo-500/20 flex flex-col justify-center min-h-[200px] relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Target size={100} />
                </div>
                
                {!northStar ? (
                    <div className="text-center z-10">
                        <Target size={48} className="mx-auto text-indigo-500 mb-4 opacity-80" />
                        <h3 className="font-bold text-lg mb-2">قطب‌نمای شمال (North Star)</h3>
                        <p className="text-sm text-muted-foreground mb-4">تک متریک حیاتی که موفقیت شما را تعریف می‌کند.</p>
                        <Button onClick={generateNorthStar} disabled={isGeneratingNSM} className="w-full bg-indigo-600 hover:bg-indigo-700">
                           {isGeneratingNSM ? <Loader2 className="animate-spin"/> : <Sparkles size={16} className="ml-2"/>}
                           یافتن متریک شمالی
                        </Button>
                    </div>
                ) : (
                    <div className="z-10 animate-in fade-in zoom-in duration-500">
                         <Badge className="mb-2 bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30">North Star Metric</Badge>
                         <h2 className="text-2xl font-black text-indigo-400 mb-2 leading-tight">{northStar.metric}</h2>
                         <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{northStar.why}</p>
                         <div className="space-y-2">
                            {northStar.inputs.map((inp, i) => (
                                <div key={i} className="flex justify-between text-xs bg-background/50 p-2 rounded border border-indigo-500/10">
                                    <span className="opacity-80">{inp.name}</span>
                                    <span className="font-mono text-indigo-400">{inp.target}</span>
                                </div>
                            ))}
                         </div>
                    </div>
                )}
             </Card>

             {/* Funnel Chart */}
             <Card className="md:col-span-2 p-6 border-muted bg-card/50 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-bold flex items-center gap-2">
                           <BarChart2 className="text-blue-500" /> قیف دزدان دریایی (AAARRR)
                        </h3>
                        <p className="text-sm text-muted-foreground">نرخ تبدیل کاربر در هر مرحله را رصد کنید.</p>
                    </div>
                </div>

                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={funnelData} layout="horizontal" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                           <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                           <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                           <Tooltip 
                              cursor={{fill: 'transparent'}}
                              contentStyle={{ borderRadius: '12px', border: 'none', background: '#1e1e2e', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                           />
                           <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={50}>
                              {funnelData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                           </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Funnel Inputs */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-6">
                    {funnelData.map((stage, idx) => (
                        <div key={stage.id} className="text-center p-2 rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="text-xs font-bold mb-1" style={{ color: stage.color }}>{stage.id.toUpperCase()}</div>
                            <input 
                                type="number" 
                                value={stage.value}
                                onChange={(e) => handleUpdateFunnel(stage.id, Number(e.target.value))}
                                className="w-full text-center bg-transparent font-mono text-lg font-bold focus:outline-none border-b border-transparent focus:border-primary"
                            />
                            {idx > 0 && (
                                <div className="text-[10px] sm:text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
                                    <ArrowUpRight size={10} />
                                    {getConversionRate(idx)}%
                                </div>
                            )}
                        </div>
                    ))}
                </div>
             </Card>
          </div>
        </TabsContent>

        {/* 2. TACTICS TAB (EXPERIMENTS) */}
        <TabsContent value="tactics" className="space-y-6 focus-visible:ring-0">
           <div className="flex flex-col md:flex-row gap-4 items-end md:items-center justify-between bg-card p-4 rounded-xl border">
               <div className="space-y-1">
                  <h3 className="font-bold text-lg">موتور تولید آزمایش (Growth Hacks)</h3>
                  <p className="text-sm text-muted-foreground">برای کدام مرحله قیف نیاز به ایده دارید؟</p>
               </div>
               <div className="flex items-center gap-2 w-full md:w-auto">
                  <select 
                    value={hackTargetStage} 
                    onChange={(e) => setHackTargetStage(e.target.value)}
                    className="h-10 rounded-lg bg-muted border-none px-3 text-sm min-w-[140px]"
                  >
                      {funnelData.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                  <Button onClick={generateExperiments} disabled={isGeneratingHacks} className="flex-1 md:flex-none">
                      {isGeneratingHacks ? <Loader2 className="animate-spin"/> : <Sparkles size={16} className="ml-2"/>}
                      تولید ایده
                  </Button>
               </div>
           </div>

           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Add New Card */}
              <button onClick={openNewDialog} className="h-full min-h-[200px] border-2 border-dashed border-muted hover:border-primary/50 hover:bg-muted/5 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <Plus size={24} className="text-muted-foreground" />
                  </div>
                  <span className="font-medium text-muted-foreground">آزمایش دستی جدید</span>
              </button>

              {/* Experiment Cards */}
              <AnimatePresence>
                  {experiments.sort((a,b) => b.iceScore - a.iceScore).map((exp) => (
                      <motion.div 
                        key={exp.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="group relative"
                      >
                          <Card className="p-5 h-full flex flex-col hover:shadow-lg transition-shadow border-t-4 group" style={{ borderTopColor: exp.iceScore > 8 ? '#10b981' : exp.iceScore > 5 ? '#f59e0b' : '#64748b' }}>
                              <div className="flex justify-between items-start mb-3">
                                  <Badge variant="outline" className="text-[10px] uppercase tracking-wider opacity-70">
                                      {funnelData.find(f => f.id === exp.stage)?.name.split(' (')[0]}
                                  </Badge>
                                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                       <button onClick={() => openEditDialog(exp)} className="text-muted-foreground hover:text-primary transition-colors">
                                           <Edit size={14} />
                                       </button>
                                       <button onClick={() => handleDeleteExperiment(exp.id)} className="text-muted-foreground hover:text-red-500 transition-colors">
                                           <Trash2 size={14} />
                                       </button>
                                  </div>
                              </div>
                              
                              <h4 className="font-bold text-lg mb-2 line-clamp-2">{exp.title}</h4>
                              <p className="text-sm text-muted-foreground mb-4 flex-grow line-clamp-3">{exp.description}</p>
                              
                              <div className="grid grid-cols-4 gap-2 text-center text-xs text-muted-foreground border-t pt-3 mt-auto">
                                  <div className="col-span-1 border-r border-border/50">
                                      <div className="font-bold text-lg" style={{ color: exp.iceScore > 8 ? '#10b981' : exp.iceScore > 5 ? '#f59e0b' : '#64748b' }}>{exp.iceScore}</div>
                                      <div>ICE</div>
                                  </div>
                                  <div>
                                      <div className="font-bold text-foreground">{exp.impact}</div>
                                      <div>Impact</div>
                                  </div>
                                  <div>
                                      <div className="font-bold text-foreground">{exp.confidence}</div>
                                      <div>Conf</div>
                                  </div>
                                  <div>
                                       <div className="font-bold text-foreground">{exp.ease}</div>
                                      <div>Ease</div>
                                  </div>
                              </div>
                          </Card>
                      </motion.div>
                  ))}
              </AnimatePresence>
           </div>
        </TabsContent>
      </Tabs>
      
       {/* Edit/Create Dialog */}
       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent dir="rtl">
                <DialogHeader>
                    <DialogTitle>{editingExp?.title ? 'ویرایش آزمایش' : 'آزمایش جدید'}</DialogTitle>
                </DialogHeader>
                {editingExp && (
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>عنوان آزمایش</Label>
                            <Input value={editingExp.title} onChange={(e) => setEditingExp({...editingExp, title: e.target.value})} placeholder="مثال: کمپین ویروسی لینکدین" />
                        </div>
                        <div className="space-y-2">
                            <Label>توضیحات</Label>
                            <Textarea value={editingExp.description} onChange={(e) => setEditingExp({...editingExp, description: e.target.value})} placeholder="جزئیات اجرایی..." />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                             <div className="space-y-2">
                                <Label>تأثیر (Impact)</Label>
                                <Input type="number" min="1" max="10" value={editingExp.impact} onChange={(e) => setEditingExp({...editingExp, impact: Number(e.target.value)})} />
                             </div>
                             <div className="space-y-2">
                                <Label>اطمینان (Confidence)</Label>
                                <Input type="number" min="1" max="10" value={editingExp.confidence} onChange={(e) => setEditingExp({...editingExp, confidence: Number(e.target.value)})} />
                             </div>
                             <div className="space-y-2">
                                <Label>سهولت (Ease)</Label>
                                <Input type="number" min="1" max="10" value={editingExp.ease} onChange={(e) => setEditingExp({...editingExp, ease: Number(e.target.value)})} />
                             </div>
                        </div>
                        <div className="space-y-2">
                            <Label>مرحله قیف</Label>
                             <select 
                                value={editingExp.stage} 
                                onChange={(e) => setEditingExp({...editingExp, stage: e.target.value})}
                                className="w-full h-10 rounded-lg bg-muted border-none px-3 text-sm"
                              >
                                  {funnelData.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                              </select>
                        </div>
                    </div>
                )}
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>انصراف</Button>
                    <Button onClick={handleSaveExperiment}>ذخیره تغییرات</Button>
                </DialogFooter>
            </DialogContent>
       </Dialog>

    </div>
  );
}
