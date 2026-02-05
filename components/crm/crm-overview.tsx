"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { CRMService, CRMCustomer, CRMDeal } from "@/lib/services/crm-service";
import { Card } from "@/components/ui/card";
import { StatCard, StatsGrid } from "@/components/ui/stats-grid";
import { SimpleBarChart, SimpleLineChart } from "@/components/ui/charts";
import { Users, TrendingUp, DollarSign, Activity } from "lucide-react";

export function CRMOverview() {
  const { user } = useAuth();
  const { activeProject } = useProject();
  const [stats, setStats] = useState({
    totalCustomers: 0,
    newLeads: 0,
    activeDeals: 0,
    pipelineValue: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !activeProject?.id) return;
      try {
        const [customers, deals] = await Promise.all([
           CRMService.getCustomers(user.uid, activeProject.id),
           CRMService.getDeals(user.uid, activeProject.id)
        ]);

        const cData = customers as CRMCustomer[];
        const dData = deals as CRMDeal[];

        setStats({
          totalCustomers: cData.length,
          newLeads: cData.filter(c => c.lifecycleStage === 'lead').length,
          activeDeals: dData.filter(d => d.stageId !== 'closed-lost' && d.stageId !== 'closed-won').length,
          pipelineValue: dData.reduce((acc, curr) => acc + (curr.value || 0), 0)
        });
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, [user, activeProject]);

  return (
    <div className="space-y-6">
      <StatsGrid columns={4}>
         <StatCard 
            title="کل مشتریان"
            value={stats.totalCustomers}
            icon={Users}
            variant="primary"
            trend={{ value: 12, direction: "up" }}
         />
         <StatCard 
            title="سرنخ‌های جدید"
            value={stats.newLeads}
            icon={Activity}
            variant="accent"
            trend={{ value: 5, direction: "up" }}
         />
         <StatCard 
            title="معاملات فعال"
            value={stats.activeDeals}
            icon={TrendingUp}
            variant="secondary"
         />
         <StatCard 
            title="ارزش پایپ‌لاین"
            value={`${(stats.pipelineValue / 1000000).toFixed(1)}M`}
            icon={DollarSign}
            variant="default"
            footer={<span className="text-xs text-muted-foreground">تومان</span>}
         />
      </StatsGrid>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <Card className="p-6 space-y-4">
            <h3 className="font-bold text-lg">روند جذب مشتری</h3>
            <SimpleBarChart 
               data={[12, 18, 25, 20, 32, 45, 38]} 
               labels={['شهر', 'تیر', 'مرد', 'شهر', 'مهر', 'آبا', 'آذر']}
               height={200}
               color="bg-indigo-500"
            />
         </Card>
         <Card className="p-6 space-y-4">
            <h3 className="font-bold text-lg">فروش ماهانه</h3>
            <SimpleLineChart 
               data={[5, 12, 25, 18, 30, 48, 42, 55]}
               height={200}
               color="#10b981" // emerald
            />
         </Card>
      </div>
    </div>
  );
}
