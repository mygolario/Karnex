"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/** Legacy route — redirects to unified onboarding genesis step */
export default function NewProjectRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      await fetch("/api/onboarding/project", { method: "POST" }).catch(() => {});
      router.replace("/onboarding/genesis");
    })();
  }, [router]);

  return (
    <div className="h-screen flex items-center justify-center bg-background" role="status">
      <Loader2 className="animate-spin text-primary w-8 h-8" />
    </div>
  );
}
