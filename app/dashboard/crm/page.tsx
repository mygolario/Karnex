"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CustomerList } from "@/components/crm/customer-list";
import { PipelineBoard } from "@/components/crm/pipeline-board";
import { CRMOverview } from "@/components/crm/crm-overview";
import { Users, SquareKanban, Megaphone, Activity, TrendingUp } from "lucide-react";

export default function CRMPage() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="max-w-7xl mx-auto pb-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight text-foreground">مدیریت ارتباط با مشتری (CRM)</h1>
        <p className="text-muted-foreground">مدیریت مشتریان، پیگیری معاملات و کمپین‌های هوشمند.</p>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full max-w-2xl grid grid-cols-5 bg-muted/50 p-1 rounded-xl h-12 mb-6">
          <TabsTrigger value="overview" className="rounded-lg gap-2 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all">
             <TrendingUp className="w-4 h-4" />
             <span className="hidden sm:inline font-bold">پیشخوان</span>
          </TabsTrigger>
          <TabsTrigger value="customers" className="rounded-lg gap-2 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline font-bold">مشتریان</span>
          </TabsTrigger>
          <TabsTrigger value="pipeline" className="rounded-lg gap-2 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all">
            <SquareKanban className="w-4 h-4" />
            <span className="hidden sm:inline font-bold">معاملات</span>
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="rounded-lg gap-2 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all">
            <Megaphone className="w-4 h-4" />
            <span className="hidden sm:inline font-bold">کمپین‌ها</span>
          </TabsTrigger>
          <TabsTrigger value="activities" className="rounded-lg gap-2 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all">
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline font-bold">فعالیت‌ها</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
            <CRMOverview />
        </TabsContent>

        <TabsContent value="customers" className="animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
            <CustomerList />
        </TabsContent>

        <TabsContent value="pipeline">
            <PipelineBoard />
        </TabsContent>

        <TabsContent value="campaigns">
            <div className="flex items-center justify-center p-20 border-2 border-dashed border-muted rounded-2xl bg-muted/10">
                 <div className="text-center space-y-2">
                    <Megaphone className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
                    <h3 className="font-bold text-lg text-muted-foreground">کمپین‌ها به زودی...</h3>
                 </div>
            </div>
        </TabsContent>

        <TabsContent value="activities">
             <div className="flex items-center justify-center p-20 border-2 border-dashed border-muted rounded-2xl bg-muted/10">
                 <div className="text-center space-y-2">
                    <Activity className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
                    <h3 className="font-bold text-lg text-muted-foreground">تایم‌لاین فعالیت‌ها به زودی...</h3>
                 </div>
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
