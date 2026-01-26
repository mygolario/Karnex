"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { getMediaLibrary, deleteFromMediaLibrary, MediaLibraryItem, MediaCategory } from "@/lib/db";
import {
  Image as ImageIcon,
  Download,
  Trash2,
  Search,
  Filter,
  Loader2,
  Sparkles,
  Copy,
  Check,
  X,
  Palette,
  Grid3X3,
  Package,
  Star,
  Image,
  LayoutGrid
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const CATEGORIES: { id: MediaCategory | 'all'; label: string; icon: any }[] = [
  { id: 'all', label: 'همه', icon: LayoutGrid },
  { id: 'logo', label: 'لوگو', icon: Star },
  { id: 'pattern', label: 'پترن', icon: Grid3X3 },
  { id: 'mockup', label: 'موکاپ', icon: Package },
  { id: 'hero', label: 'هیرو', icon: Image },
  { id: 'color_mood', label: 'رنگ', icon: Palette },
  { id: 'social', label: 'شبکه اجتماعی', icon: ImageIcon },
  { id: 'cover', label: 'کاور', icon: ImageIcon },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1 }
};

export default function MediaLibraryPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<MediaLibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<MediaCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<MediaLibraryItem | null>(null);

  // Fetch media library
  useEffect(() => {
    const fetchMedia = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const mediaItems = await getMediaLibrary(user.uid, {
          category: activeCategory === 'all' ? undefined : activeCategory
        });
        setItems(mediaItems);
      } catch (error) {
        console.error("Failed to fetch media:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMedia();
  }, [user, activeCategory]);

  // Filter by search
  const filteredItems = items.filter(item =>
    item.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.projectName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Copy URL
  const handleCopy = async (item: MediaLibraryItem) => {
    await navigator.clipboard.writeText(item.imageUrl);
    setCopiedId(item.id || null);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Delete
  const handleDelete = async (item: MediaLibraryItem) => {
    if (!user || !item.id) return;
    setDeletingId(item.id);
    try {
      await deleteFromMediaLibrary(user.uid, item.id);
      setItems(prev => prev.filter(i => i.id !== item.id));
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setDeletingId(null);
    }
  };

  // Download
  const handleDownload = (item: MediaLibraryItem) => {
    const link = document.createElement('a');
    link.href = item.imageUrl;
    link.download = `${item.category}-${item.id}.png`;
    link.click();
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-500 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 blur-[100px] rounded-full" />
        <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-pink-500/20 blur-[80px] rounded-full" />
        
        <div className="relative z-10 p-8 md:p-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
              <ImageIcon size={28} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black">کتابخانه رسانه</h1>
              <p className="text-white/70 mt-1">تمام تصاویر تولید شده با هوش مصنوعی</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 mt-6">
            <Badge className="bg-white/10 border-white/20 text-white">
              <Sparkles size={12} className="ml-1" />
              {items.length} تصویر
            </Badge>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-primary text-white shadow-lg shadow-primary/25'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <cat.icon size={16} />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="جستجو در پرامپت‌ها..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mb-4">
            <ImageIcon size={32} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">هنوز تصویری وجود ندارد</h3>
          <p className="text-muted-foreground text-sm max-w-sm">
            برای شروع، به صفحه هویت بصری بروید و تصاویر برند خود را تولید کنید.
          </p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
        >
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              variants={itemVariants}
              layoutId={item.id}
              className="group relative"
            >
              <Card className="overflow-hidden border-white/5 bg-card hover:shadow-xl transition-all duration-300">
                {/* Image */}
                <div 
                  className="aspect-square relative cursor-pointer overflow-hidden"
                  onClick={() => setSelectedItem(item)}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.prompt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Quick Actions */}
                  <div className="absolute bottom-2 left-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleCopy(item); }}
                      className="flex-1 bg-white/90 backdrop-blur text-black p-2 rounded-lg hover:bg-white transition-colors"
                    >
                      {copiedId === item.id ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDownload(item); }}
                      className="flex-1 bg-white/90 backdrop-blur text-black p-2 rounded-lg hover:bg-white transition-colors"
                    >
                      <Download size={14} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(item); }}
                      disabled={deletingId === item.id}
                      className="flex-1 bg-red-500/90 backdrop-blur text-white p-2 rounded-lg hover:bg-red-500 transition-colors disabled:opacity-50"
                    >
                      {deletingId === item.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  </div>
                </div>
                
                {/* Info */}
                <div className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
                      {CATEGORIES.find(c => c.id === item.category)?.label || item.category}
                    </Badge>
                    {item.projectName && (
                      <span className="text-[10px] text-muted-foreground truncate">{item.projectName}</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{item.prompt}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute -top-12 right-0 text-white/70 hover:text-white"
              >
                <X size={28} />
              </button>
              
              <img
                src={selectedItem.imageUrl}
                alt={selectedItem.prompt}
                className="w-full rounded-2xl shadow-2xl"
              />
              
              <div className="mt-4 bg-white/10 backdrop-blur rounded-xl p-4">
                <p className="text-white/90 text-sm mb-3">{selectedItem.prompt}</p>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleCopy(selectedItem)}
                    className="gap-2"
                  >
                    {copiedId === selectedItem.id ? <Check size={14} /> : <Copy size={14} />}
                    کپی لینک
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDownload(selectedItem)}
                    className="gap-2"
                  >
                    <Download size={14} />
                    دانلود
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
