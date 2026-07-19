"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FolderPlus, Sparkles } from "lucide-react";
import Link from "next/link";

export function ValidationEmptyHero({
  projectName,
  onStart,
  onFillFromProject,
}: {
  projectName?: string;
  onStart: () => void;
  onFillFromProject?: () => void;
  loading?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 px-4 rounded-xl border border-dashed bg-muted/20 space-y-4">
      <div className="ai-orb flex h-14 w-14 items-center justify-center rounded-2xl">
        <Sparkles className="h-7 w-7 text-white" />
      </div>
      <div className="space-y-2 max-w-md">
        <h3 className="text-lg font-bold">استودیو اعتبارسنجی</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          قبل از ساختن، فرض‌های خطرناک «{projectName || "پروژه‌ات"}» را بکش. در چند
          دقیقه حکم بگیر، بعد با شواهد واقعی جلو برو.
        </p>
        <p className="text-xs text-muted-foreground/80 italic">
          در ۳۰ دقیقه بفهم کدام فرض خطرناک‌ترین است
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Button onClick={onStart} className="gap-2">
          <Sparkles className="h-4 w-4" />
          شروع بریف جدید
        </Button>
        {onFillFromProject && (
          <Button variant="outline" onClick={onFillFromProject}>
            از بوم / پروژه پر کن
          </Button>
        )}
      </div>
    </div>
  );
}

export function ValidationEmptyActions({
  onStart,
  onFillFromProject,
}: {
  onStart: () => void;
  onFillFromProject?: () => void;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      <Button variant="ghost" size="sm" onClick={onStart}>
        ایده جدید را تعریف کن
      </Button>
      {onFillFromProject && (
        <Button variant="ghost" size="sm" onClick={onFillFromProject}>
          ادامه از داده پروژه
        </Button>
      )}
    </div>
  );
}

/** Shown when the user has no project selected. */
export function ValidationNoProject() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="p-8 text-center max-w-md space-y-4">
        <h2 className="text-xl font-bold">ابتدا یک پروژه بسازید</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          برای شروع اعتبارسنجی ایده، یک پروژه استارتاپی در کارنکس بسازید.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button asChild className="gap-2">
            <Link href="/new-project">
              <FolderPlus className="h-4 w-4" />
              ساخت پروژه جدید
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/overview">بازگشت به پیشخوان</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}

/** Shown when the active project is not a startup. */
export function ValidationGate() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="p-8 text-center max-w-md space-y-4">
        <h2 className="text-xl font-bold">اعتبارسنجی ایده — استارتاپ</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          این ابزار مخصوص پروژه‌های استارتاپی است. برای پروژه فعلی، از پیشخوان و
          ابزارهای فعال مسیر خود استفاده کنید.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button asChild>
            <Link href="/dashboard/overview">بازگشت به پیشخوان</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
