"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

/** Deduplicate concurrent /api/admin/me probes across sidebar + command + mobile. */
let sharedAdminProbe: {
  userId: string;
  promise: Promise<boolean>;
} | null = null;

function probeIsAdmin(userId: string): Promise<boolean> {
  if (sharedAdminProbe?.userId === userId) {
    return sharedAdminProbe.promise;
  }
  const promise = fetch("/api/admin/me")
    .then(async (r) => {
      if (!r.ok) return false;
      const data = (await r.json()) as { isAdmin?: boolean };
      return Boolean(data.isAdmin);
    })
    .catch(() => false);
  sharedAdminProbe = { userId, promise };
  return promise;
}

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
      sharedAdminProbe = null;
      setIsAdmin(false);
      setChecking(false);
      return;
    }

    let cancelled = false;
    setChecking(true);

    probeIsAdmin(user.id)
      .then((admin) => {
        if (!cancelled) setIsAdmin(admin);
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
