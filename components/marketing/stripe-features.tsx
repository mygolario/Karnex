"use client";

import { Brain, Rocket, Target, Users, Zap, BarChart, Smartphone, Globe, Briefcase } from "lucide-react";

interface FeatureCardProps {
  icon: any;
  title: string;
  description: string;
  className?: string;
  color?: string;
}

const FeatureCard = ({ icon: Icon, title, description, className = "", color = "bg-primary" }: FeatureCardProps) => (
  <div className={`p-8 rounded-3xl border border-border/50 hover:border-primary/50 transition-all duration-500 group bg-card hover:shadow-2xl hover:shadow-primary/5 ${className}`}>
    <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center mb-6 text-white shadow-lg group-hover:scale-110 transition-transform`}>
      <Icon className="h-7 w-7" />
    </div>
    <h3 className="text-2xl font-bold mb-3 text-foreground">{title}</h3>
    <p className="text-muted-foreground leading-relaxed text-lg">{description}</p>
  </div>
);

export const StripeFeatures = () => {
  return (
    <section id="features" className="py-24 bg-slate-50/50 dark:bg-slate-900/50">
      <div className="container px-4 md:px-6">
        <div className="text-center max-w-4xl mx-auto mb-20">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-sm">
             قدرتمندترین پلتفرم کارآفرینی
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-foreground">
            همه ابزارها در یک <span className="text-primary relative inline-block">
              جعبه‌ابزار جادویی
              <span className="absolute bottom-0 left-0 w-full h-2 bg-primary/20 -z-10 rounded-full" />
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            از تولید ایده تا جذب سرمایه و مشتری، کارنکس در تمام مراحل همراه شماست تا با اطمینان قدم بردارید.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Big Card 1 */}
            <div className="md:col-span-2 p-8 md:p-12 rounded-[2.5rem] bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-full h-full bg-[url('/noise.svg')] opacity-20 mix-blend-overlay" />
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-1 text-right">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-6">
                            <Brain className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-3xl font-black mb-4">هوش مصنوعی مولد ایده</h3>
                        <p className="text-white/80 text-lg leading-relaxed mb-6">
                            فقط با نوشتن یک جمله ساده، تحلیل کامل بازار، مدل کسب‌وکار، و استراتژی رشد را دریافت کنید. AI ما میلیون‌ها داده را بررسی می‌کند.
                        </p>
                        <ul className="space-y-2">
                             <li className="flex items-center gap-2 text-white/90">
                                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center"><Users size={12} /></div>
                                تحلیل پرسونای مخاطب
                             </li>
                             <li className="flex items-center gap-2 text-white/90">
                                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center"><Target size={12} /></div>
                                تدوین استراتژی ورود به بازار
                             </li>
                        </ul>
                    </div>
                    
                    {/* Visual Element */}
                    <div className="flex-1 relative w-full h-full min-h-[250px]">
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-white/10 rounded-full blur-[80px]" />
                         <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 absolute top-0 left-0 w-full transform rotate-6 group-hover:rotate-3 transition-transform duration-500">
                            <div className="h-2 w-20 bg-white/30 rounded-full mb-3" />
                            <div className="space-y-2">
                                <div className="h-2 w-full bg-white/10 rounded-full" />
                                <div className="h-2 w-5/6 bg-white/10 rounded-full" />
                                <div className="h-2 w-4/6 bg-white/10 rounded-full" />
                            </div>
                         </div>
                    </div>
                </div>
            </div>

            {/* Tall Card */}
            <div className="md:row-span-2 p-8 rounded-[2.5rem] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl flex flex-col items-center text-center relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-500 to-rose-500" />
                 <div className="w-20 h-20 rounded-full bg-pink-50 dark:bg-pink-900/20 text-pink-500 flex items-center justify-center mb-6 mt-8">
                    <Rocket size={40} />
                 </div>
                 <h3 className="text-2xl font-bold mb-4">نقشه راه (Roadmap)</h3>
                 <p className="text-muted-foreground mb-8">
                    مسیر صفر تا صد را با جزئیات کامل ببینید. از ثبت شرکت تا اولین فروش، ما گام‌به‌گام کنار شما هستیم.
                 </p>
                 <div className="mt-auto w-full space-y-4">
                     {[1,2,3].map(i => (
                         <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-right">
                             <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold text-sm">
                                 {i}
                             </div>
                             <div className="h-2 w-20 bg-slate-200 dark:bg-slate-700 rounded-full" />
                         </div>
                     ))}
                 </div>
            </div>

            {/* Standard Card 1 */}
            <FeatureCard 
                icon={Briefcase}
                title="بوم مدل کسب‌وکار"
                description="تولید خودکار Business Model Canvas استاندارد و حرفه‌ای."
                color="bg-emerald-500"
            />

            {/* Standard Card 2 */}
            <FeatureCard 
                icon={BarChart}
                title="تحلیل رقبا"
                description="شناسایی نقاط ضعف و قوت رقبای شما در بازار."
                color="bg-orange-500"
            />
            
            {/* Wide Card */}
            <div className="md:col-span-3 lg:col-span-2 p-8 rounded-[2.5rem] bg-slate-900 text-white shadow-2xl relative overflow-hidden flex items-center justify-between gap-8">
                <div className="relative z-10 max-w-lg">
                    <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                        <Globe className="text-cyan-400" />
                        جهانی فکر کنید
                    </h3>
                    <p className="text-slate-300">
                        کارنکس نه تنها برای بازار ایران، بلکه برای ورود به بازارهای جهانی به شما مشاوره می‌دهد. پشتیبانی از زبان‌های مختلف و ترندهای روز دنیا.
                    </p>
                </div>
                <div className="hidden lg:block relative z-10 w-32 h-32">
                     <div className="absolute inset-0 bg-cyan-500 rounded-full blur-[60px] opacity-20" />
                     <Globe className="w-full h-full text-slate-700 opacity-50 absolute rotate-12" strokeWidth={0.5} />
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};
