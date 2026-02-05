import { Card } from "@/components/ui/card";
import { AdminStats } from "@/lib/db";
import { Users, FolderGit2, Banknote, Activity } from "lucide-react";

export function AdminStatsCard({ stats }: { stats: AdminStats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
       <Card className="bg-slate-900 border-slate-800 p-4 relative overflow-hidden group">
         <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors" />
         <div className="relative z-10 flex items-center justify-between">
            <div>
                <p className="text-slate-400 text-xs font-mono mb-1">TOTAL USERS</p>
                <h3 className="text-3xl font-black text-blue-400">{stats.totalUsers}</h3>
            </div>
            <Users className="text-blue-500/50 w-8 h-8" />
         </div>
       </Card>

       <Card className="bg-slate-900 border-slate-800 p-4 relative overflow-hidden group">
         <div className="absolute inset-0 bg-purple-500/5 group-hover:bg-purple-500/10 transition-colors" />
         <div className="relative z-10 flex items-center justify-between">
            <div>
                <p className="text-slate-400 text-xs font-mono mb-1">TOTAL PROJECTS</p>
                <h3 className="text-3xl font-black text-purple-400">{stats.totalProjects}</h3>
            </div>
            <FolderGit2 className="text-purple-500/50 w-8 h-8" />
         </div>
       </Card>

       <Card className="bg-slate-900 border-slate-800 p-4 relative overflow-hidden group">
         <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors" />
         <div className="relative z-10 flex items-center justify-between">
            <div>
                <p className="text-slate-400 text-xs font-mono mb-1">REVENUE (EST)</p>
                <h3 className="text-3xl font-black text-emerald-400">${stats.totalRevenue}</h3>
            </div>
            <Banknote className="text-emerald-500/50 w-8 h-8" />
         </div>
       </Card>
       
       <Card className="bg-slate-900 border-slate-800 p-4 relative overflow-hidden group">
         <div className="absolute inset-0 bg-amber-500/5 group-hover:bg-amber-500/10 transition-colors" />
         <div className="relative z-10 flex items-center justify-between">
            <div>
                <p className="text-slate-400 text-xs font-mono mb-1">ACTIVE SUBS</p>
                <h3 className="text-3xl font-black text-amber-400">{stats.activeSubscriptions}</h3>
            </div>
            <Activity className="text-amber-500/50 w-8 h-8" />
         </div>
       </Card>
    </div>
  );
}
