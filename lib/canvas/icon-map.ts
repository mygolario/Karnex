import {
  Handshake, Activity, Package, Gem, Heart, Megaphone, Users, PiggyBank, Banknote,
  Star, LayoutGrid, Share2, Sparkles, AlertCircle, Lightbulb, AlertTriangle,
  ShieldCheck, TrendingUp, MessageSquare, Brain, Trophy, BarChart, Briefcase,
  Target, type LucideIcon,
} from "lucide-react";

export const ICON_MAP: Record<string, LucideIcon> = {
  Handshake, Activity, Package, Gem, Heart, Megaphone, Users, PiggyBank, Banknote,
  Star, LayoutGrid, Share2, Sparkles, AlertCircle, Lightbulb, AlertTriangle,
  ShieldCheck, TrendingUp, MessageSquare, Brain, Trophy, BarChart, Briefcase, Target,
};

export function getIcon(name: string): LucideIcon {
  return ICON_MAP[name] || Sparkles;
}
