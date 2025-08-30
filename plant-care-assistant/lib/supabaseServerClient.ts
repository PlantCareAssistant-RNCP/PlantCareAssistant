import { createClient as supabaseCreateClient } from "@supabase/supabase-js";
import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import logger from "@utils/logger";
import type { CookieOptions } from "@supabase/ssr";

// For direct API access (no auth context needed)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = supabaseCreateClient(supabaseUrl, supabaseAnonKey);

// For server components and API routes (with auth context)
export async function createServerClient() {
  const cookieStore = await cookies();

  return createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: Array<{
            name: string;
            value: string;
            options?: CookieOptions;
          }>
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
            logger.warn("Unable to set cookies in Server Component", {
              error: error instanceof Error ? error.message : String(error),
              cookiesCount: cookiesToSet.length,
              context: "supabase-server-client-alt",
            });
          }
        },
      },
    }
  );
}
