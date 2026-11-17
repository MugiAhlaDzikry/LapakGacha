import { createBrowserClient } from "@supabase/ssr";
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";

export const DEFAULT_SUPABASE_URL =
  "https://eyizuvrucdjpxfyygynw.supabase.co";
export const DEFAULT_SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_HmwrvSx2wWmlfLmThExubA_vIFOaWWh";

export function getSupabaseConfig(): { url: string; key: string } {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const envKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  const url =
    envUrl && envUrl.startsWith("http") && !envUrl.includes("your-project")
      ? envUrl
      : DEFAULT_SUPABASE_URL;

  const key =
    envKey && !envKey.includes("your-supabase") && envKey.length > 20
      ? envKey
      : DEFAULT_SUPABASE_PUBLISHABLE_KEY;

  return { url, key };
}

export function isSupabaseConfigured(): boolean {
  const { url, key } = getSupabaseConfig();
  return Boolean(url && key && url.startsWith("http") && key.length > 20);
}

export function createClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }
  const { url, key } = getSupabaseConfig();
  return createBrowserClient(url, key);
}

export function createDirectSupabaseClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }
  const { url, key } = getSupabaseConfig();
  return createSupabaseJsClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
