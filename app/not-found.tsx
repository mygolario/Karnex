import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-background text-center p-4">
      <div className="relative w-32 h-32 mb-8 animate-bounce">
        <Image
          src="/logo-official.png"
          alt="Karnex Logo"
          fill
          className="object-contain"
        />
      </div>
      
      <h1 className="text-9xl font-black text-primary/20 select-none">404</h1>
      <h2 className="text-3xl font-bold -mt-12 mb-4">صفحه پیدا نشد!</h2>
      <p className="text-muted-foreground max-w-md mb-8">
        متاسفانه صفحه‌ای که به دنبال آن هستید وجود ندارد یا حذف شده است.
      </p>

      <Button asChild size="lg" className="rounded-xl gap-2">
        <Link href="/dashboard">
          بازگشت به داشبورد
          <ArrowLeft size={18} />
        </Link>
      </Button>
    </div>
  );
}
