"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProject } from "@/contexts/project-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  FileText, Presentation, FileSignature, Mail, Newspaper, Handshake,
  Loader2, Download, Copy, Check, Sparkles, Plus, Trash2, Search,
  ChevronRight, Calendar, MoreVertical
} from "lucide-react";
import { GeneratedDocument } from "@/lib/db";
import { toast } from "sonner";

interface DocumentType {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  allowedTypes: ('startup' | 'traditional' | 'creator')[];
}

const documentTypes: DocumentType[] = [
  { id: "pitch-deck", icon: Presentation, title: "پیچ دک (Pitch Deck)", description: "ارائه استاندارد ۱۰ اسلایدی برای جذب سرمایه‌گذار", color: "from-purple-500 to-pink-500", allowedTypes: ['startup'] },
  { id: "one-pager", icon: FileText, title: "وان پیجر (One Pager)", description: "خلاصه اجرایی یک صفحه‌ای از کل کسب‌وکار", color: "from-blue-500 to-cyan-500", allowedTypes: ['startup', 'traditional'] },
  { id: "proposal", icon: Handshake, title: "پروپوزال همکاری", description: "پیشنهاد همکاری تجاری و B2B برای شرکا", color: "from-emerald-500 to-teal-500", allowedTypes: ['startup', 'traditional', 'creator'] },
  { id: "nda", icon: FileSignature, title: "قرارداد محرمانگی (NDA)", description: "توافق‌نامه عدم افشای اطلاعات محرمانه", color: "from-amber-500 to-orange-500", allowedTypes: ['startup', 'traditional'] },
  { id: "press-release", icon: Newspaper, title: "خبر مطبوعاتی (PR)", description: "اطلاعیه رسمی برای راه‌اندازی محصول یا رویداد", color: "from-rose-500 to-red-500", allowedTypes: ['startup', 'traditional', 'creator'] },
  { id: "investor-email", icon: Mail, title: "ایمیل سرمایه‌گذار", description: "قالب ایمیل Cold Outreach برای ارتباط اولیه", color: "from-indigo-500 to-violet-500", allowedTypes: ['startup'] },
  { id: "brand-guideline", icon: Sparkles, title: "راهنمای برند", description: "سند هویت بصری و کلامی برند شما", color: "from-pink-500 to-rose-500", allowedTypes: ['creator'] },
  { id: "sponsorship-deck", icon: Presentation, title: "دک اسپانسرشیپ", description: "ارائه برای جذب اسپانسر محتوا", color: "from-orange-500 to-red-500", allowedTypes: ['creator'] }
];

export default function DocsPage() {
  const { activeProject: plan, updateActiveProject } = useProject();
  
  // State
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'view'>('list');
  const [docs, setDocs] = useState<GeneratedDocument[]>([]);
  const [currentDoc, setCurrentDoc] = useState<GeneratedDocument | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingType, setGeneratingType] = useState<string | null>(null);

  // Load Documents
  useEffect(() => {
    if (plan?.documents) {
      setDocs(plan.documents);
      if (plan.documents.length === 0) setViewMode('create');
    } else {
      setViewMode('create');
    }
  }, [plan?.id]);

  // Actions
  const handleGenerate = async (docType: string) => {
    if (!plan) return;
    setGeneratingType(docType);
    setIsGenerating(true);

    const typeInfo = documentTypes.find(d => d.id === docType);
    const prompts: Record<string, string> = {
      "pitch-deck": `Create a 10-slide pitch deck outline for "${plan.projectName}". Overview: ${plan.overview}. Audience: ${plan.audience}. Respond in Persian Markdown.`,
      "one-pager": `Create a one-page executive summary for "${plan.projectName}". Overview: ${plan.overview}. Respond in Persian Markdown.`,
      "proposal": `Create a partnership proposal for "${plan.projectName}". Overview: ${plan.overview}. Respond in Persian Markdown.`,
      "nda": `Create a formal NDA in Persian for "${plan.projectName}".`,
      "press-release": `Create a press release for "${plan.projectName}". Overview: ${plan.overview}. Respond in Persian.`,
      "investor-email": `Create a cold email to investors for "${plan.projectName}". Keep it short. Respond in Persian.`,
      "brand-guideline": `Create a brand guideline outline for "${plan.projectName}". Respond in Persian.`,
      "sponsorship-deck": `Create a sponsorship deck outline for "${plan.projectName}". Respond in Persian.`
    };

    try {
      const res = await fetch("/api/ai-generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompts[docType] || "Generate a business document in Persian.",
          systemPrompt: "You are a business document writer. Create professional Persian content with Markdown formatting.",
        }),
      });
      const data = await res.json();
      
      if (data.success && data.content) {
        const newDoc: GeneratedDocument = {
          id: Math.random().toString(36).substr(2, 9),
          type: docType,
          title: typeInfo?.title || "سند جدید",
          content: data.content,
          createdAt: new Date().toISOString()
        };
        
        const updatedDocs = [newDoc, ...docs];
        setDocs(updatedDocs);
        updateActiveProject({ documents: updatedDocs });
        
        setCurrentDoc(newDoc);
        setViewMode('view');
        toast.success("سند با موفقیت ایجاد و ذخیره شد");
      }
    } catch (e) {
      toast.error("خطا در تولید سند");
    } finally {
      setIsGenerating(false);
      setGeneratingType(null);
    }
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const updatedDocs = docs.filter(d => d.id !== id);
    setDocs(updatedDocs);
    updateActiveProject({ documents: updatedDocs });
    if (currentDoc?.id === id) {
      setCurrentDoc(null);
      setViewMode('list');
    }
    toast.success("سند حذف شد");
  };

  const filteredDocs = docs.filter(d => d.title.includes(searchQuery));

  if (!plan) return <div className="p-10 text-center">پروژه‌ای انتخاب نشده است.</div>;

  return (
    <div className="flex h-[calc(100vh-100px)] gap-6">
      
      {/* Sidebar List */}
      <div className="w-80 flex flex-col gap-4 shrink-0 transition-all">
        <Button 
            size="lg" 
            className="w-full justify-start gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
            onClick={() => { setViewMode('create'); setCurrentDoc(null); }}
        >
            <Plus size={20} />
            سند جدید
        </Button>

        <div className="relative">
            <Search className="absolute right-3 top-3 text-muted-foreground w-4 h-4" />
            <Input 
                placeholder="جستجو در اسناد..." 
                className="pr-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>

        <div className="flex-1 pr-2 overflow-y-auto custom-scrollbar">
            {filteredDocs.length === 0 ? (
                <div className="text-center text-muted-foreground py-10 opacity-60">
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">سندی یافت نشد</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {filteredDocs.map(doc => (
                        <Card 
                            key={doc.id}
                            className={`p-3 cursor-pointer hover:bg-muted/50 transition-colors flex items-center justify-between group ${currentDoc?.id === doc.id ? 'border-primary ring-1 ring-primary bg-primary/5' : ''}`}
                            onClick={() => { setCurrentDoc(doc); setViewMode('view'); }}
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className={`w-8 h-8 rounded shrink-0 flex items-center justify-center bg-muted text-primary`}>
                                   <FileText size={16} />
                                </div>
                                <div className="truncate">
                                    <h4 className="font-medium text-sm truncate">{doc.title}</h4>
                                    <p className="text-xs text-muted-foreground">{new Date(doc.createdAt).toLocaleDateString('fa-IR')}</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => handleDelete(doc.id, e)}>
                                <Trash2 size={14} className="text-red-500" />
                            </Button>
                        </Card>
                    ))}
                </div>
            )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 h-full overflow-hidden flex flex-col bg-muted/10 rounded-3xl border-2 border-dashed border-muted/50">
        
        {/* VIEW: CREATE NEW */}
        {viewMode === 'create' && (
            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <h2 className="text-2xl font-black mb-2 flex items-center gap-2">
                            <Sparkles className="text-primary" />
                            انتخاب نوع سند
                        </h2>
                        <p className="text-muted-foreground">چه سندی می‌خواهید برای {plan.projectName} بسازید؟</p>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {documentTypes
                        .filter(doc => !plan.projectType || doc.allowedTypes.includes(plan.projectType))
                        .map(doc => (
                            <Card 
                                key={doc.id}
                                className="p-6 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden"
                                onClick={() => handleGenerate(doc.id)}
                            >
                                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${doc.color} opacity-10 rounded-bl-full group-hover:scale-150 transition-transform duration-500`} />
                                
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${doc.color} flex items-center justify-center text-white mb-4 shadow-lg group-hover:shadow-2xl transition-all`}>
                                    {generatingType === doc.id ? <Loader2 className="animate-spin" /> : <doc.icon size={24} />}
                                </div>
                                <h3 className="font-bold text-lg mb-1">{doc.title}</h3>
                                <p className="text-sm text-muted-foreground">{doc.description}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* VIEW: PREVIEW DOC */}
        {viewMode === 'view' && currentDoc && (
             <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                <div className="max-w-3xl mx-auto bg-background rounded-xl border shadow-sm p-10 min-h-[80vh]">
                    <div className="flex items-center justify-between mb-8 pb-4 border-b">
                        <div>
                            <h1 className="text-2xl font-bold mb-1">{currentDoc.title}</h1>
                            <p className="text-xs text-muted-foreground">ایجاد شده در {new Date(currentDoc.createdAt).toLocaleString('fa-IR')}</p>
                        </div>
                        <div className="flex gap-2">
                             <Button variant="outline" size="sm" onClick={() => {
                                 navigator.clipboard.writeText(currentDoc.content);
                                 toast.success("کپی شد");
                             }}>
                                 <Copy size={16} className="mr-2"/>
                                 کپی
                             </Button>
                             <Button variant="outline" size="sm" onClick={() => handleDelete(currentDoc.id)}>
                                 <Trash2 size={16} className="text-red-500 mr-2"/>
                                 حذف
                             </Button>
                        </div>
                    </div>
                    
                    <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap">
                        {currentDoc.content}
                    </div>
                </div>
             </div>
        )}

      </div>
    </div>
  );
}
