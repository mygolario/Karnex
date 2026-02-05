"use client";

import { Card } from "@/components/ui/card";
import { SystemLog, getSystemLogs, logSystemEvent } from "@/lib/db";
import { Loader2, Terminal, RefreshCw, Power } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";

export function SystemLogsViewer() {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchLogs = async () => {
    setLoading(true);
    try {
        const data = await getSystemLogs(20); // Top 20
        setLogs(data);
    } catch (error) {
        console.error(error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const initSystem = async () => {
      // Force a log to start the collection if empty
      await logSystemEvent({
          type: 'admin',
          action: 'SYSTEM_INIT',
          details: 'Admin dashboard initialized',
          userId: user?.uid,
          userEmail: user?.email || 'system'
      });
      fetchLogs();
  };

  return (
    <Card className="bg-slate-950 border-slate-800 font-mono text-xs flex flex-col h-[500px]">
        <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 sticky top-0 z-10">
            <h3 className="text-emerald-500 flex items-center gap-2 font-bold">
                <Terminal className="w-4 h-4" />
                SYSTEM_LOGS
            </h3>
            <div className="flex items-center gap-1">
                <Button size="sm" variant="ghost" onClick={initSystem} className="h-6 w-6 p-0 hover:bg-slate-800 text-slate-400 hover:text-blue-400" title="Init Log System">
                    <Power className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="ghost" onClick={fetchLogs} className="h-6 w-6 p-0 hover:bg-slate-800 text-slate-400 hover:text-emerald-400" title="Refresh">
                    <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                </Button>
            </div>
        </div>
        
        <div className="flex-1 overflow-auto p-4 space-y-2 bg-slate-950">
            {logs.map((log) => (
                <div key={log.id} className="flex gap-3 hover:bg-slate-900/50 p-1.5 rounded transition-colors group">
                    <span className="text-slate-600 shrink-0 select-none">
                        {new Date(log.timestamp).toLocaleTimeString([], {hour12: false})}
                    </span>
                    <span className={`uppercase font-bold shrink-0 w-20 ${
                        log.type === 'error' ? 'text-red-500' :
                        log.type === 'auth' ? 'text-blue-500' :
                        log.type === 'admin' ? 'text-purple-500' :
                        'text-emerald-500'
                    }`}>
                        [{log.type}]
                    </span>
                    <div className="flex-1 text-slate-300 break-all">
                        <span className="text-slate-100 font-bold mr-2">{log.action}</span>
                        <span className="text-slate-500">{log.details}</span>
                        {log.userEmail && <span className="text-slate-600 ml-2">&lt;{log.userEmail}&gt;</span>}
                    </div>
                </div>
            ))}
            
            {logs.length === 0 && !loading && (
                <div className="text-slate-600 text-center py-8">
                    // NO SYSTEM LOGS DETECTED //
                </div>
            )}
        </div>
    </Card>
  );
}
