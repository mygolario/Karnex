import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardIcon } from "@/components/ui/card";
import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import { 
  Rocket, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Target, 
  Palette,
  Map,
  TrendingUp,
  Users,
  Clock,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Lightbulb,
  Cpu,
  FileText,
  Star
} from "lucide-react";

export default async function MarketingPage() {
  const t = await getTranslations('landing');
  const locale = await getLocale();
  const isRTL = locale === 'fa';
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <div className="flex min-h-screen flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar />
      
      <main className="flex-1">
        {/* ==================== HERO SECTION ==================== */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-hero" />
          <div className="absolute inset-0 pattern-dots opacity-30" />
          
          {/* Floating Shapes */}
          <div className="absolute top-1/4 right-[10%] w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 left-[10%] w-96 h-96 bg-secondary/15 rounded-full blur-3xl animate-float" style={{ animationDelay: "-3s" }} />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "-6s" }} />
          
          <div className="section-container relative z-10 text-center py-20">
            <div className="max-w-4xl mx-auto space-y-8 stagger-children">
              {/* Beta Badge */}
              <Badge 
                variant="gradient" 
                size="lg" 
                dot 
                dotColor="bg-white animate-pulse"
                className="mx-auto"
              >
                <Sparkles size={14} />
                {t('hero.badge')}
              </Badge>
              
              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-tight">
                <span className="text-foreground">{t('hero.title1')}</span>
                <br />
                <span className="text-gradient">{t('hero.title2')}</span>
              </h1>
              
              {/* Subheadline */}
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                {t('hero.subtitle')}
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/new-project">
                  <Button 
                    variant="gradient" 
                    size="xl" 
                    rounded="full"
                    className="group"
                  >
                    <Rocket size={20} className="group-hover:animate-bounce" />
                    {t('hero.cta')}
                    <ArrowIcon size={18} className="transition-transform group-hover:-translate-x-1" />
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button 
                    variant="glass" 
                    size="xl" 
                    rounded="full"
                  >
                    {t('hero.ctaSecondary')}
                  </Button>
                </Link>
              </div>
              
              {/* Trust Indicator */}
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck size={16} className="text-secondary" />
                <span>{t('hero.trustBadge')}</span>
              </div>
              
              {/* Stats */}
              <div className="flex flex-wrap items-center justify-center gap-8 pt-8 border-t border-border/50 mt-8">
                <div className="text-center">
                  <div className="text-2xl font-black text-gradient">{t('hero.stats.ideas')}</div>
                  <div className="text-sm text-muted-foreground">{t('hero.stats.ideasLabel')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-gradient">{t('hero.stats.time')}</div>
                  <div className="text-sm text-muted-foreground">{t('hero.stats.timeLabel')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-gradient">{t('hero.stats.free')}</div>
                  <div className="text-sm text-muted-foreground">{t('hero.stats.freeLabel')}</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom Gradient Fade */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
        </section>

        {/* ==================== PROBLEM SECTION ==================== */}
        <section className="py-24 relative" id="problems">
          <div className="section-container">
            <div className="text-center mb-16 stagger-children">
              <Badge variant="danger" size="lg" className="mb-4">
                {t('problems.badge')}
              </Badge>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground mb-4">
                {t('problems.title')}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t('problems.subtitle')}
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 stagger-children">
              <Card variant="default" hover="lift" className="text-center">
                <CardIcon variant="primary" className="mx-auto mb-4 h-14 w-14">
                  <TrendingUp size={24} />
                </CardIcon>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {t('problems.noBudget.title')}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t('problems.noBudget.desc')}
                </p>
              </Card>
              <Card variant="default" hover="lift" className="text-center">
                <CardIcon variant="accent" className="mx-auto mb-4 h-14 w-14">
                  <Map size={24} />
                </CardIcon>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {t('problems.noPath.title')}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t('problems.noPath.desc')}
                </p>
              </Card>
              <Card variant="default" hover="lift" className="text-center">
                <CardIcon variant="secondary" className="mx-auto mb-4 h-14 w-14">
                  <Cpu size={24} />
                </CardIcon>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {t('problems.noTech.title')}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t('problems.noTech.desc')}
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* ==================== HOW IT WORKS ==================== */}
        <section className="py-24 bg-muted/30 relative" id="how-it-works">
          <div className="absolute inset-0 pattern-grid opacity-50" />
          
          <div className="section-container relative z-10">
            <div className="text-center mb-16 stagger-children">
              <Badge variant="secondary" size="lg" className="mb-4">
                {t('howItWorks.badge')}
              </Badge>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground mb-4">
                {t('howItWorks.title')}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t('howItWorks.subtitle')}
              </p>
            </div>
            
            <div className="relative">
              {/* Connection Line (Desktop) */}
              <div className="hidden md:block absolute top-24 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-primary via-accent to-secondary opacity-30" />
              
              <div className="grid md:grid-cols-3 gap-8">
                {/* Step 1 */}
                <div className="relative text-center group">
                  <div className="relative mx-auto mb-6">
                    <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white shadow-xl group-hover:shadow-2xl transition-shadow">
                      <Lightbulb size={32} />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-card border-2 border-border rounded-full flex items-center justify-center text-sm font-black text-foreground shadow-md">
                      {t('howItWorks.step1.number')}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    {t('howItWorks.step1.title')}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed max-w-xs mx-auto">
                    {t('howItWorks.step1.desc')}
                  </p>
                </div>
                
                {/* Step 2 */}
                <div className="relative text-center group">
                  <div className="relative mx-auto mb-6">
                    <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-accent to-orange-500 flex items-center justify-center text-white shadow-xl group-hover:shadow-2xl transition-shadow">
                      <Cpu size={32} />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-card border-2 border-border rounded-full flex items-center justify-center text-sm font-black text-foreground shadow-md">
                      {t('howItWorks.step2.number')}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    {t('howItWorks.step2.title')}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed max-w-xs mx-auto">
                    {t('howItWorks.step2.desc')}
                  </p>
                </div>
                
                {/* Step 3 */}
                <div className="relative text-center group">
                  <div className="relative mx-auto mb-6">
                    <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-secondary to-emerald-600 flex items-center justify-center text-white shadow-xl group-hover:shadow-2xl transition-shadow">
                      <FileText size={32} />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-card border-2 border-border rounded-full flex items-center justify-center text-sm font-black text-foreground shadow-md">
                      {t('howItWorks.step3.number')}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    {t('howItWorks.step3.title')}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed max-w-xs mx-auto">
                    {t('howItWorks.step3.desc')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== FEATURES GRID ==================== */}
        <section className="py-24" id="features">
          <div className="section-container">
            <div className="text-center mb-16 stagger-children">
              <Badge variant="info" size="lg" className="mb-4">
                {t('features.badge')}
              </Badge>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground mb-4">
                {t('features.title')}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t('features.subtitle')}
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
              <Card variant="default" hover="lift">
                <CardIcon variant="primary" className="mb-4">
                  <Target size={24} />
                </CardIcon>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {t('features.canvas.title')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t('features.canvas.desc')}
                </p>
              </Card>
              <Card variant="default" hover="lift">
                <CardIcon variant="accent" className="mb-4">
                  <Palette size={24} />
                </CardIcon>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {t('features.brand.title')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t('features.brand.desc')}
                </p>
              </Card>
              <Card variant="default" hover="lift">
                <CardIcon variant="secondary" className="mb-4">
                  <Map size={24} />
                </CardIcon>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {t('features.roadmap.title')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t('features.roadmap.desc')}
                </p>
              </Card>
              <Card variant="default" hover="lift">
                <CardIcon variant="primary" className="mb-4">
                  <TrendingUp size={24} />
                </CardIcon>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {t('features.marketing.title')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t('features.marketing.desc')}
                </p>
              </Card>
              <Card variant="default" hover="lift">
                <CardIcon variant="accent" className="mb-4">
                  <ShieldCheck size={24} />
                </CardIcon>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {t('features.legal.title')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t('features.legal.desc')}
                </p>
              </Card>
              <Card variant="default" hover="lift">
                <CardIcon variant="secondary" className="mb-4">
                  <Users size={24} />
                </CardIcon>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {t('features.assistant.title')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t('features.assistant.desc')}
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* ==================== TRUST SECTION ==================== */}
        <section className="py-24 bg-muted/30">
          <div className="section-container">
            <div className="max-w-3xl mx-auto text-center stagger-children">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-secondary/10 mb-8">
                <ShieldCheck size={40} className="text-secondary" />
              </div>
              
              <h2 className="text-3xl md:text-4xl font-black text-foreground mb-6">
                {t('trust.title')}
              </h2>
              
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                {t('trust.desc')}
              </p>
              
              <div className="flex flex-wrap justify-center gap-4">
                <div className="flex items-center gap-2 text-sm text-foreground bg-card px-4 py-2 rounded-full border border-border">
                  <CheckCircle2 size={16} className="text-secondary" />
                  {t('trust.encryption')}
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground bg-card px-4 py-2 rounded-full border border-border">
                  <CheckCircle2 size={16} className="text-secondary" />
                  {t('trust.cloudStorage')}
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground bg-card px-4 py-2 rounded-full border border-border">
                  <CheckCircle2 size={16} className="text-secondary" />
                  {t('trust.noSharing')}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== CTA SECTION ==================== */}
        <section className="py-24 relative overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-purple-600 to-secondary" />
          <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
          
          {/* Floating Elements */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          
          <div className="section-container relative z-10 text-center">
            <div className="max-w-3xl mx-auto stagger-children">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm mb-6">
                <Star size={14} className="fill-current" />
                {t('cta.badge')}
              </div>
              
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-6">
                {t('cta.title')}
              </h2>
              
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                {t('cta.subtitle')}
              </p>
              
              <Link href="/new-project">
                <Button 
                  size="xl" 
                  rounded="full"
                  className="bg-white text-primary hover:bg-white/90 shadow-2xl"
                >
                  <Rocket size={20} />
                  {t('cta.button')}
                  <ArrowIcon size={18} />
                </Button>
              </Link>
              
              <p className="text-sm text-white/60 mt-6 flex items-center justify-center gap-2">
                <Clock size={14} />
                {t('cta.time')}
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
