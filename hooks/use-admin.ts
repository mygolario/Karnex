"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const ADMIN_EMAILS = ["kavehtkts@gmail.com"];

export function useAdmin() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setChecking(false);
      return;
    }

    if (user.email && ADMIN_EMAILS.includes(user.email)) {
      setIsAdmin(true);
      setChecking(false);
    } else {
      setIsAdmin(false);
      setChecking(false);
      // Optional: Auto redirect if strictly using this hook for protection
      // But we might want to handle redirect in the component
    }
  }, [user, authLoading]);

  const protectAdminRoute = () => {
    if (!checking && !isAdmin) {
       toast.error("دسترسی غیرمجاز. این بخش مخصوص مدیریت است. ⛔");
       router.push("/dashboard");
    }
  };

  return { isAdmin, checking, protectAdminRoute, user };
}
