-- Karnex uses Prisma (postgres owner) for all app data access, not the Supabase Data API.
-- Enable RLS with no anon/authenticated policies to block PostgREST exposure.
-- Do NOT FORCE ROW LEVEL SECURITY — that would also block the table owner (Prisma).

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT quote_ident(schemaname) AS sch, quote_ident(tablename) AS tbl
    FROM pg_tables
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE %s.%s ENABLE ROW LEVEL SECURITY', r.sch, r.tbl);
  END LOOP;
END $$;

-- Admin analytics views: enforce invoker privileges/RLS instead of definer bypass
ALTER VIEW public.user_signups_by_day SET (security_invoker = true);
ALTER VIEW public.active_subscriptions_by_plan SET (security_invoker = true);
ALTER VIEW public.payment_transactions_summary SET (security_invoker = true);

-- Defense in depth: revoke table/view grants from API roles
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT quote_ident(schemaname) AS sch, quote_ident(tablename) AS tbl
    FROM pg_tables
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('REVOKE ALL ON TABLE %s.%s FROM anon, authenticated', r.sch, r.tbl);
  END LOOP;

  FOR r IN
    SELECT quote_ident(schemaname) AS sch, quote_ident(viewname) AS vw
    FROM pg_views
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('REVOKE ALL ON TABLE %s.%s FROM anon, authenticated', r.sch, r.vw);
  END LOOP;
END $$;
