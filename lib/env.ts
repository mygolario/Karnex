import { z } from "zod";

const serverSchema = z.object({
  DATABASE_URL: z.string().min(1).optional(),
  DIRECT_URL: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  OPENROUTER_API_KEY: z.string().min(1).optional(),
  REDIS_URL: z.string().optional(),
  SENTRY_DSN: z.string().url().optional(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  NEXT_PUBLIC_GA_ID: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
});

function validateEnv() {
  const isProd = process.env.NODE_ENV === "production";

  if (typeof window === "undefined") {
    const parsed = serverSchema.safeParse(process.env);
    if (!parsed.success && isProd) {
      console.warn("[env] Server env validation warnings:", parsed.error.flatten().fieldErrors);
    }
  }

  const clientParsed = clientSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  });

  if (!clientParsed.success) {
    console.warn(
      "[env] Missing recommended public env vars:",
      Object.keys(clientParsed.error.flatten().fieldErrors).join(", ")
    );
  }

  return {
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://www.karnex.ir",
    gaId: process.env.NEXT_PUBLIC_GA_ID,
    sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN,
  };
}

export const env = validateEnv();
