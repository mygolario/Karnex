"use client";

import { useState, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { savePlanToCloud, BrandKit, BrandMockup, BrandPattern } from "@/lib/db";
import { Palette, Loader2 } from "lucide-react";

// Brand components
import { BrandWizard, WizardData } from "@/components/dashboard/brand/brand-wizard";
import { BrandStudio, TabId, BRAND_TABS } from "@/components/dashboard/brand/brand-studio";
import { OverviewTab, LogoTab } from "@/components/dashboard/brand/tabs";

// Existing components (to be used in tabs)
import { ColorMoodBoard } from "@/components/dashboard/brand/color-mood-board";
import { PatternLibrary } from "@/components/dashboard/brand/pattern-library";
import { MockupGallery } from "@/components/dashboard/brand/mockup-gallery";
import { TypographySection } from "@/components/dashboard/brand/typography-section";

// Simple toast placeholders (replace with a real toast library later)
const toastSuccess = (message: string) => console.log("✅ Success:", message);
const toastError = (message: string) => console.error("❌ Error:", message);

export default function BrandKitPage() {
  const { user } = useAuth();
  const { activeProject: plan, loading, updateActiveProject } = useProject();

  // UI State
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [showWizard, setShowWizard] = useState(false);

  // Generation states
  const [generatingLogo, setGeneratingLogo] = useState<number | null>(null);
  const [generatingMood, setGeneratingMood] = useState(false);
  const [generatingPsychology, setGeneratingPsychology] = useState(false);
  const [generatingPatterns, setGeneratingPatterns] = useState(false);
  const [generatingPatternStyle, setGeneratingPatternStyle] = useState<string | undefined>();
  const [generatingMockups, setGeneratingMockups] = useState(false);
  const [generatingMockupType, setGeneratingMockupType] = useState<string | undefined>();
  const [generatingTypo, setGeneratingTypo] = useState(false);

  // ===== CONTEXT HELPER =====
  const getBusinessContext = useMemo(() => {
    if (!plan) return "";
    return plan.ideaInput || plan.overview || plan.tagline || plan.projectName || "";
  }, [plan]);

  // ===== WIZARD CONTEXT =====
  const getWizardContext = useCallback(() => {
    if (!plan?.brandKit?.wizardData) return getBusinessContext;

    const wd = plan.brandKit.wizardData;
    return `${getBusinessContext}. Industry: ${wd.industry}. Style: ${wd.logoStyle}. Personality: ${wd.brandPersonality?.join(", ")}. Feeling: ${wd.desiredFeeling}. Target: ${wd.targetAudience}`;
  }, [plan, getBusinessContext]);

  // ===== IMAGE GENERATOR =====
  const generateImage = useCallback(async (
    prompt: string,
    type: string,
    subcategory?: string,
    aspectRatio: string = 'square'
  ) => {
    if (!plan || !user) return null;

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          type,
          aspectRatio,
          projectName: plan.projectName,
          brandColors: {
            primary: plan.brandKit.primaryColorHex,
            secondary: plan.brandKit.secondaryColorHex
          },
          ideaInput: getWizardContext(),
          overview: plan.overview
        })
      });

      const data = await response.json();

      if (data.success && data.imageUrl) {
        // Save to media library
        await fetch("/api/media-library", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.uid,
            imageUrl: data.imageUrl,
            prompt: data.prompt || prompt,
            category: type,
            subcategory,
            model: data.model,
            projectId: plan.id,
            projectName: plan.projectName
          })
        });

        return data.imageUrl;
      } else {
        throw new Error(data.error || "Image generation failed");
      }
    } catch (err: any) {
      console.error("Generation error:", err);
      toastError(err.message || "خطا در تولید تصویر");
      return null;
    }
  }, [plan, user, getWizardContext]);

  // ===== BRAND KIT UPDATER =====
  const updateBrandKit = useCallback(async (updates: Partial<BrandKit>) => {
    if (!plan || !user) return;
    const updatedBrandKit = { ...plan.brandKit, ...updates };
    await savePlanToCloud(user.uid, { brandKit: updatedBrandKit }, true, plan.id);
    updateActiveProject({ brandKit: updatedBrandKit });
  }, [plan, user, updateActiveProject]);

  // ===== WIZARD COMPLETION =====
  const handleWizardComplete = async (wizardData: WizardData) => {
    if (!plan || !user) return;

    // Save wizard data
    await updateBrandKit({
      wizardCompleted: true,
      wizardData: {
        ...wizardData,
        completedAt: new Date().toISOString()
      }
    });

    setShowWizard(false);
    toastSuccess("هویت بصری با موفقیت ذخیره شد!");

    // TODO: Trigger full brand generation here
    // For now, just close wizard
  };

  // ===== LOGO GENERATION =====
  const handleGenerateLogo = async (index: number) => {
    if (!plan || !user) return;
    setGeneratingLogo(index);

    try {
      const concept = plan.brandKit.logoConcepts[index];
      const wizardContext = getWizardContext();

      const prompt = `Logo for "${plan.projectName}". ${wizardContext}. Concept: ${concept.conceptName} - ${concept.description}.`;

      const imageUrl = await generateImage(prompt, 'logo', undefined, 'logo');

      if (imageUrl) {
        const updatedConcepts = [...plan.brandKit.logoConcepts];
        updatedConcepts[index] = { ...updatedConcepts[index], imageUrl };
        await updateBrandKit({ logoConcepts: updatedConcepts });
        toastSuccess("لوگو با موفقیت تولید شد!");
      }
    } finally {
      setGeneratingLogo(null);
    }
  };

  // ===== PATTERN HANDLERS =====
  const handleGeneratePatterns = async () => {
    setGeneratingPatterns(true);
    try {
      const styles = ['geometric', 'gradient', 'abstract', 'organic'] as const;
      const patterns = [];

      for (const style of styles) {
        setGeneratingPatternStyle(style);
        const prompt = `${style} seamless pattern for: ${getWizardContext()}`;
        const imageUrl = await generateImage(prompt, 'pattern', style, 'square');
        if (imageUrl) {
          patterns.push({
            id: `${style}-${Date.now()}`,
            name: style,
            style,
            imageUrl,
            prompt
          });
        }
      }

      if (patterns.length > 0) {
        await updateBrandKit({ patterns });
        toastSuccess("پترن‌ها با موفقیت تولید شدند!");
      }
    } finally {
      setGeneratingPatterns(false);
      setGeneratingPatternStyle(undefined);
    }
  };

  const handleGenerateSinglePattern = async (style: string) => {
    setGeneratingPatternStyle(style);
    try {
      const prompt = `${style} seamless pattern for: ${getWizardContext()}`;
      const imageUrl = await generateImage(prompt, 'pattern', style, 'square');
      if (imageUrl) {
        const existingPatterns = plan?.brandKit.patterns || [];
        const newPattern = {
          id: `${style}-${Date.now()}`,
          name: style,
          style: style as any,
          imageUrl,
          prompt
        };
        const updatedPatterns = [
          ...existingPatterns.filter(p => p.style !== style),
          newPattern
        ];
        await updateBrandKit({ patterns: updatedPatterns });
      }
    } finally {
      setGeneratingPatternStyle(undefined);
    }
  };

  // ===== MOCKUP HANDLERS =====
  const handleGenerateAllMockups = async () => {
    setGeneratingMockups(true);
    try {
      const types = ['tshirt', 'mug', 'business_card', 'instagram'] as const;
      const mockups = [];

      for (const type of types) {
        setGeneratingMockupType(type);
        const category: BrandMockup['category'] = ['tshirt', 'mug'].includes(type) ? 'product' :
          ['business_card'].includes(type) ? 'stationery' : 'social';
        const prompt = `${type.replace('_', ' ')} mockup for: ${getWizardContext()}`;
        const imageUrl = await generateImage(prompt, 'mockup', type, 'square');
        if (imageUrl) {
          const newMockup: BrandMockup = { id: `${type}-${Date.now()}`, type, category, imageUrl, prompt };
          mockups.push(newMockup);
        }
      }

      if (mockups.length > 0) {
        await updateBrandKit({ mockups });
        toastSuccess("موکاپ‌ها با موفقیت تولید شدند!");
      }
    } finally {
      setGeneratingMockups(false);
      setGeneratingMockupType(undefined);
    }
  };

  const handleGenerateSingleMockup = async (type: string) => {
    setGeneratingMockupType(type);
    try {
      const category: BrandMockup['category'] = ['tshirt', 'mug', 'tote_bag', 'phone_case'].includes(type) ? 'product'
        : ['letterhead', 'business_card', 'envelope'].includes(type) ? 'stationery'
          : 'social';

      const prompt = `${type.replace('_', ' ')} mockup for: ${getWizardContext()}`;
      const imageUrl = await generateImage(prompt, 'mockup', type, 'square');
      if (imageUrl) {
        const existingMockups = plan?.brandKit.mockups || [];
        const newMockup: BrandMockup = { id: `${type}-${Date.now()}`, type: type as BrandMockup['type'], category, imageUrl, prompt };
        const updatedMockups = [
          ...existingMockups.filter(m => m.type !== type),
          newMockup
        ];
        await updateBrandKit({ mockups: updatedMockups });
      }
    } finally {
      setGeneratingMockupType(undefined);
    }
  };

  // ===== COLOR MOOD HANDLERS =====
  const handleGenerateMood = async () => {
    setGeneratingMood(true);
    try {
      const colors = [plan?.brandKit.primaryColorHex, plan?.brandKit.secondaryColorHex];
      const moodImages = [];

      for (const color of colors) {
        const prompt = `Mood photography in ${color} for: ${getWizardContext()}`;
        const imageUrl = await generateImage(prompt, 'color_mood', color, 'square');
        if (imageUrl) {
          moodImages.push({ color: color!, imageUrl, prompt });
        }
      }

      if (moodImages.length > 0) {
        await updateBrandKit({ colorMoodImages: moodImages });
      }
    } finally {
      setGeneratingMood(false);
    }
  };

  const handleRegeneratePsychology = async () => {
    setGeneratingPsychology(true);
    try {
      const response = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Explain color psychology for: ${getWizardContext()}. Colors: ${plan?.brandKit.primaryColorHex}, ${plan?.brandKit.secondaryColorHex}. Write in Persian, 2-3 sentences.`,
          systemPrompt: "You are a brand psychology expert. Respond only in Persian."
        })
      });
      const data = await response.json();
      if (data.success && data.content) {
        await updateBrandKit({ colorPsychology: data.content });
      }
    } finally {
      setGeneratingPsychology(false);
    }
  };

  // ===== TYPOGRAPHY HANDLER =====
  const handleGenerateTypographySpecimen = async () => {
    setGeneratingTypo(true);
    try {
      const prompt = `Typography poster for "${plan?.projectName}". ${getWizardContext()}`;
      const imageUrl = await generateImage(prompt, 'typography', undefined, 'portrait');
      if (imageUrl) {
        await updateBrandKit({ typographySpecimenUrl: imageUrl });
      }
    } finally {
      setGeneratingTypo(false);
    }
  };

  // ===== LOADING STATE =====
  if (loading || !plan) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6" dir="rtl">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center animate-pulse shadow-2xl shadow-primary/20">
          <Palette size={48} className="text-white" />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-bold mb-2">در حال آماده‌سازی استودیو برند...</h3>
          <p className="text-muted-foreground">لطفاً چند لحظه صبر کنید</p>
        </div>
      </div>
    );
  }

  const brandKit = plan.brandKit;
  const wizardCompleted = brandKit.wizardCompleted;

  // ===== SHOW WIZARD =====
  if (!wizardCompleted || showWizard) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" dir="rtl">
        <div className="w-full max-w-3xl">
          <BrandWizard
            projectName={plan.projectName}
            ideaInput={plan.ideaInput || plan.overview || ""}
            onComplete={handleWizardComplete}
            onSkip={wizardCompleted ? () => setShowWizard(false) : undefined}
          />
        </div>
      </div>
    );
  }

  // ===== CALCULATE COMPLETENESS =====
  const completenessScore = useMemo(() => {
    const items = [
      (brandKit.logoConcepts?.length || 0) > 0,
      !!brandKit.primaryColorHex,
      !!brandKit.suggestedFont,
      (brandKit.patterns?.length || 0) > 0,
      (brandKit.mockups?.length || 0) > 0,
      !!brandKit.brandVoice,
    ];
    return Math.round((items.filter(Boolean).length / items.length) * 100);
  }, [brandKit]);

  // ===== RENDER TAB CONTENT =====
  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <OverviewTab
            brandKit={brandKit}
            projectName={plan.projectName}
            ideaInput={plan.ideaInput}
            onNavigate={setActiveTab}
          />
        );
      case "logo":
        return (
          <LogoTab
            brandKit={brandKit}
            projectName={plan.projectName}
            onGenerateLogo={handleGenerateLogo}
            generatingIndex={generatingLogo}
          />
        );
      case "colors":
        return (
          <ColorMoodBoard
            primaryColor={brandKit.primaryColorHex}
            secondaryColor={brandKit.secondaryColorHex}
            colorPsychology={brandKit.colorPsychology}
            colorMoodImages={brandKit.colorMoodImages}
            onGenerateMood={handleGenerateMood}
            onRegeneratePsychology={handleRegeneratePsychology}
            isGeneratingMood={generatingMood}
            isGeneratingPsychology={generatingPsychology}
          />
        );
      case "typography":
        return (
          <TypographySection
            fontName={brandKit.suggestedFont || "Vazirmatn"}
            projectName={plan.projectName}
            primaryColor={brandKit.primaryColorHex}
            secondaryColor={brandKit.secondaryColorHex}
            specimenUrl={brandKit.typographySpecimenUrl}
            onGenerateSpecimen={handleGenerateTypographySpecimen}
            isGenerating={generatingTypo}
          />
        );
      case "patterns":
        return (
          <PatternLibrary
            patterns={brandKit.patterns}
            primaryColor={brandKit.primaryColorHex}
            secondaryColor={brandKit.secondaryColorHex}
            onGeneratePatterns={handleGeneratePatterns}
            onGenerateSinglePattern={handleGenerateSinglePattern}
            isGenerating={generatingPatterns || !!generatingPatternStyle}
            generatingStyle={generatingPatternStyle}
          />
        );
      case "mockups":
        return (
          <MockupGallery
            mockups={brandKit.mockups}
            projectName={plan.projectName}
            primaryColor={brandKit.primaryColorHex}
            secondaryColor={brandKit.secondaryColorHex}
            onGenerateAllMockups={handleGenerateAllMockups}
            onGenerateSingleMockup={handleGenerateSingleMockup}
            isGenerating={generatingMockups || !!generatingMockupType}
            generatingType={generatingMockupType}
          />
        );
      case "voice":
        return (
          <div className="p-8 text-center text-muted-foreground">
            <p>صدای برند - به زودی...</p>
          </div>
        );
      case "export":
        return (
          <div className="p-8 text-center text-muted-foreground">
            <p>دانلود و خروجی - به زودی...</p>
          </div>
        );
      default:
        return null;
    }
  };

  // ===== MAIN RENDER =====
  return (
    <BrandStudio
      activeTab={activeTab}
      onTabChange={setActiveTab}
      projectName={plan.projectName}
      completenessScore={completenessScore}
      onRerunWizard={() => setShowWizard(true)}
    >
      {renderTabContent()}
    </BrandStudio>
  );
}
