"use client";

import { useState } from "react";
import { useProject } from "@/contexts/project-context";
import { useAuth } from "@/contexts/auth-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Download, 
  Loader2, 
  Shield, 
  Users, 
  Building2,
  Check,
  Copy,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentType {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  icon: React.ElementType;
}

const documentTypes: DocumentType[] = [
  {
    id: "nda",
    name: "قرارداد عدم افشا",
    nameEn: "NDA",
    description: "برای محافظت از ایده و اطلاعات محرمانه در مذاکرات",
    icon: Shield
  },
  {
    id: "founders",
    name: "توافق‌نامه شراکت",
    nameEn: "Founders Agreement",
    description: "تعیین سهام، وظایف و قوانین بین بنیان‌گذاران",
    icon: Users
  },
  {
    id: "articles",
    name: "اساسنامه شرکت",
    nameEn: "Articles",
    description: "سند رسمی ثبت شرکت سهامی خاص",
    icon: Building2
  }
];

export function DocumentGenerator() {
  const { activeProject: plan } = useProject();
  const { user } = useAuth();
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generatedDoc, setGeneratedDoc] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (docType: string) => {
    setSelectedDoc(docType);
    setGenerating(true);
    setGeneratedDoc(null);

    try {
      const res = await fetch('/api/generate-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentType: docType,
          projectData: {
            projectName: plan?.projectName,
            founderName: user?.displayName,
            overview: plan?.overview,
            audience: plan?.audience,
            revenueModel: (plan as any)?.leanCanvas?.revenueStreams
          }
        })
      });

      const data = await res.json();
      setGeneratedDoc(data);
    } catch (error) {
      console.error("Document generation error:", error);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedDoc?.fullText) return;

    const blob = new Blob([generatedDoc.fullText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedDoc.nameEn?.replace(/\s+/g, '_') || 'document'}_${plan?.projectName || 'draft'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    if (!generatedDoc?.fullText) return;
    
    try {
      await navigator.clipboard.writeText(generatedDoc.fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
          <FileText size={20} className="text-white" />
        </div>
        <div>
          <h3 className="font-bold text-foreground">اسناد حقوقی خودکار</h3>
          <p className="text-xs text-muted-foreground">تولید پیش‌نویس اسناد با اطلاعات پروژه شما</p>
        </div>
        <Badge variant="gradient" size="sm" className="mr-auto">
          <Sparkles size={10} />
          جدید
        </Badge>
      </div>

      {/* Document Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {documentTypes.map((doc) => {
          const Icon = doc.icon;
          const isSelected = selectedDoc === doc.id;
          
          return (
            <Card
              key={doc.id}
              variant={isSelected ? "default" : "muted"}
              hover="lift"
              className={cn(
                "cursor-pointer transition-all",
                isSelected && "ring-2 ring-primary"
              )}
              onClick={() => !generating && handleGenerate(doc.id)}
            >
              <div className="flex flex-col items-center text-center p-2">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors",
                  isSelected 
                    ? "bg-gradient-to-br from-primary to-purple-600 text-white"
                    : "bg-muted text-muted-foreground"
                )}>
                  {generating && isSelected ? (
                    <Loader2 size={24} className="animate-spin" />
                  ) : (
                    <Icon size={24} />
                  )}
                </div>
                <h4 className="font-bold text-sm text-foreground mb-1">{doc.name}</h4>
                <p className="text-[10px] text-muted-foreground">{doc.description}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Generated Document Preview */}
      {generatedDoc && (
        <Card variant="default" className="animate-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-foreground">{generatedDoc.name}</h4>
              <p className="text-xs text-muted-foreground">تولید شده در {generatedDoc.generatedAt}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="gap-2"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                {copied ? "کپی شد!" : "کپی"}
              </Button>
              <Button
                variant="gradient"
                size="sm"
                onClick={handleDownload}
                className="gap-2"
              >
                <Download size={14} />
                دانلود TXT
              </Button>
            </div>
          </div>

          {/* Document Sections */}
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {generatedDoc.sections?.map((section: any, i: number) => (
              <div key={i} className="border-b border-border/50 pb-4 last:border-0">
                <h5 className="font-bold text-sm text-foreground mb-2 flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                    {i + 1}
                  </div>
                  {section.title}
                </h5>
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-sans leading-6 bg-muted/30 rounded-lg p-3">
                  {section.content}
                </pre>
              </div>
            ))}
          </div>

          {/* Disclaimer */}
          <div className="mt-4 bg-accent/10 rounded-lg p-3 text-xs text-muted-foreground">
            ⚠️ این سند پیش‌نویس است. برای استفاده رسمی، حتماً با یک وکیل مشورت کنید.
          </div>
        </Card>
      )}
    </div>
  );
}
