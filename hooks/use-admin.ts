"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

/**
 * Admin gate — fetches /api/admin/me (Prisma role === "admin").
 * Never reads ADMIN_EMAILS in the browser.
 */
export function useAdmin() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setIsAdmin(false);
      setChecking(false);
      return;
    }

    let cancelled = false;
    setChecking(true);

    fetch("/api/admin/me")
      .then((r) => (r.ok ? r.json() : { isAdmin: false }))
      .then((data: { isAdmin?: boolean }) => {
        if (!cancelled) setIsAdmin(Boolean(data.isAdmin));
      })
      .catch(() => {
        if (!cancelled) setIsAdmin(false);
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  const protectAdminRoute = () => {
    if (!checking && !isAdmin) {
      toast.error("دسترسی غیرمجاز. این بخش مخصوص مدیریت است.");
      router.push("/dashboard");
    }
  };

  return { isAdmin, checking, protectAdminRoute, user };
}
