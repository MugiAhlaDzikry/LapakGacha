import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  createDirectSupabaseClient,
  getSupabaseConfig,
  isSupabaseConfigured,
} from "./client";

export async function createServerSupabaseClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { url, key } = getSupabaseConfig();

  try {
    const cookieStore = await cookies();

    return createServerClient(url, key, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options: CookieOptions;
          }[]
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignored when called from Server Component
          }
        },
      },
    });
  } catch {
    return createDirectSupabaseClient();
  }
}
