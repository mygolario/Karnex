"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Folder, FolderOpen, Trash2, Search, Plus, 
  History, Film
} from "lucide-react";
import { cn } from "@/lib/utils";

type Script = {
  id: string;
  title: string;
  content: string;
  template: string;
  duration: string;
  audience?: string | null;
  status: string;
  folder: string | null;
  updatedAt: Date | string;
};

interface ScriptVaultProps {
  scripts: Script[];
  onSelect: (script: Script) => void;
  onDelete: (id: string) => void;
  activeScriptId?: string | null;
  onCreateNew: () => void;
}

export function ScriptVault({ 
  scripts, 
  onSelect, 
  onDelete, 
  activeScriptId,
  onCreateNew 
}: ScriptVaultProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  // Group scripts by folder
  const folders = Array.from(
    new Set(scripts.map(s => s.folder).filter(Boolean))
  ) as string[];

  const filteredScripts = scripts.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = selectedFolder === null || s.folder === selectedFolder;
    return matchesSearch && matchesFolder;
  });

  return (
    <div className="space-y-6 flex flex-col h-full">
      {/* Title & New Script button */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold flex items-center gap-2 text-lg text-foreground">
          <History className="text-red-500 w-5 h-5" />
          مخزن سناریوها
        </h3>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={onCreateNew}
          data-tour-id="new-script-btn"
          className="gap-1 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <Plus size={14} />
          اسکریپت جدید
        </Button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="جستجو در سناریوها..." 
          className="pr-9 bg-background/50 border-slate-200"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          dir="rtl"
        />
      </div>

      {/* Folders List */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-muted-foreground block px-1">دسته‌بندی‌ها</span>
        <div className="flex flex-wrap gap-1.5">
          <Badge 
            variant={selectedFolder === null ? "default" : "secondary"}
            className="cursor-pointer font-normal text-xs py-1 px-2.5"
            onClick={() => setSelectedFolder(null)}
          >
            همه اسکریپت‌ها ({scripts.length})
          </Badge>
          {folders.map(folder => {
            const count = scripts.filter(s => s.folder === folder).length;
            return (
              <Badge 
                key={folder}
                variant={selectedFolder === folder ? "default" : "secondary"}
                className="cursor-pointer font-normal text-xs py-1 px-2.5 flex items-center gap-1"
                onClick={() => setSelectedFolder(folder)}
              >
                {selectedFolder === folder ? <FolderOpen size={12} /> : <Folder size={12} />}
                {folder} ({count})
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Scripts Cards List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[480px] scrollbar-thin">
        {filteredScripts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl p-4 bg-muted/20">
            <Film className="mx-auto mb-2 opacity-40 w-8 h-8" />
            <p className="text-xs font-medium">هیچ سناریویی یافت نشد</p>
          </div>
        ) : (
          filteredScripts.map((s) => {
            const date = new Date(s.updatedAt).toLocaleDateString('fa-IR');
            return (
              <Card 
                key={s.id} 
                className={cn(
                  "p-4 cursor-pointer hover:bg-slate-50 transition-all border relative group ring-offset-2 ring-red-500",
                  activeScriptId === s.id && "bg-red-50/20 border-red-200 ring-1"
                )}
                onClick={() => onSelect(s)}
              >
                <div className="flex justify-between items-start mb-2 gap-4">
                  <h4 className="font-bold text-foreground text-sm line-clamp-1 group-hover:text-red-600 transition-colors">
                    {s.title}
                  </h4>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 text-muted-foreground hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 -mt-1 -mr-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(s.id);
                    }}
                  >
                    <Trash2 size={13} />
                  </Button>
                </div>
                
                <p className="text-xs text-zinc-600 line-clamp-2 font-sans opacity-85 mb-3 leading-relaxed">
                  {s.content}
                </p>

                <div className="flex items-center justify-between text-[10px] text-muted-foreground border-t pt-2 border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="text-[9px] font-normal text-muted-foreground py-0.5 px-1 bg-muted/40">
                      {s.template === 'viral-hook' ? 'وایرال' : s.template === 'educational' ? 'آموزشی' : s.template === 'storytelling' ? 'داستانی' : 'فروش'}
                    </Badge>
                    <span className="text-zinc-300">•</span>
                    <span className="font-mono">{s.duration}</span>
                  </div>
                  <span className="font-mono text-zinc-400">{date}</span>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
