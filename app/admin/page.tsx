"use client";

import { AdminStatsCard } from "@/components/admin/admin-stats";
import { UserList } from "@/components/admin/user-list";
import { SystemLogsViewer } from "@/components/admin/system-logs";
import { useAdmin } from "@/hooks/use-admin";
import { useEffect, useState } from "react";
import { getAllUsersAdmin, getAllProjectsAdmin, AdminStats } from "@/lib/db";
import { CloudCog } from "lucide-react";

export default function AdminPage() {
    const { isAdmin } = useAdmin();
    const [stats, setStats] = useState<AdminStats>({
        totalUsers: 0,
        totalProjects: 0,
        activeSubscriptions: 0,
        totalRevenue: 0
    });

    useEffect(() => {
        if (!isAdmin) return;

        const loadStats = async () => {
            const users = await getAllUsersAdmin();
            const projects = await getAllProjectsAdmin();
            
            setStats({
                totalUsers: users.length,
                totalProjects: projects.length,
                activeSubscriptions: users.filter(u => u.subscription?.status === 'active').length,
                totalRevenue: 0 // Cannot calc easily without payments table
            });
        };
        loadStats();
    }, [isAdmin]);

    if (!isAdmin) return null;

    return (
        <div className="space-y-6">
            {/* Stats Overview */}
            <AdminStatsCard stats={stats} />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* User Database (2/3 width) */}
                <div className="lg:col-span-2">
                    <UserList />
                </div>

                {/* System Logs (1/3 width) */}
                <div className="lg:col-span-1">
                    <SystemLogsViewer />
                </div>
            </div>
            
            <div className="flex items-center justify-center pt-8 text-slate-600 text-xs font-mono gap-2">
                <CloudCog className="w-3 h-3" />
                SYSTEM SECURE • MONITORING ACTIVE • 2MS LATENCY
            </div>
        </div>
    );
}
