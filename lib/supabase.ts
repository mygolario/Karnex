import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    // During SSR pre-rendering (e.g., /_not-found), env vars may not be available.
    // Return a dummy client that won't crash the build.
    console.warn('Supabase env vars not found — returning placeholder client (SSR build)')
    return createBrowserClient(
      'https://placeholder.supabase.co',
      'placeholder-key',
      { isSingleton: false }
    )
  }

  return createBrowserClient(supabaseUrl, supabaseKey)
}
