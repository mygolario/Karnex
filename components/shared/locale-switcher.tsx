"use client";

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { locales, localeMetadata, type Locale } from '@/lib/locale-config';
import { useLocale } from '@/hooks/use-translations';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LocaleSwitcherProps {
  variant?: 'default' | 'minimal' | 'icon';
}

export function LocaleSwitcher({ variant = 'minimal' }: LocaleSwitcherProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { locale: currentLocale } = useLocale();

  const switchLocale = (newLocale: Locale) => {
    // Set cookie
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`; // 1 year
    
    // Refresh the page to apply new locale
    startTransition(() => {
      router.refresh();
    });
  };

  const otherLocale = locales.find(l => l !== currentLocale) as Locale;
  const otherMeta = localeMetadata[otherLocale];

  if (variant === 'icon') {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => switchLocale(otherLocale)}
        disabled={isPending}
        title={`Switch to ${otherMeta.name}`}
      >
        <Globe className="h-4 w-4" />
      </Button>
    );
  }

  if (variant === 'minimal') {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => switchLocale(otherLocale)}
        disabled={isPending}
        className="gap-2"
        title={`Switch to ${otherMeta.name}`}
      >
        <Globe className="h-4 w-4" />
        <span>{otherMeta.nativeName}</span>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {locales.map((locale) => {
        const meta = localeMetadata[locale];
        const isActive = locale === currentLocale;
        
        return (
          <Button
            key={locale}
            variant={isActive ? 'default' : 'outline'}
            size="sm"
            onClick={() => switchLocale(locale)}
            disabled={isPending || isActive}
            className={isActive ? 'cursor-default' : ''}
          >
            {meta.nativeName}
          </Button>
        );
      })}
    </div>
  );
}
