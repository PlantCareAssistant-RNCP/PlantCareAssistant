// lib/supabaseServer.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import logger from "@utils/logger";

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
            logger.warn({
              error: error instanceof Error ? error.message : String(error),
              cookiesCount: cookiesToSet.length,
              context: "supabase-server-client",
              cookieNames: cookiesToSet.map((c) => c.name),
              message: "Unable to set cookies in Server Component",
            });

            if (process.env.NODE_ENV === "development") {
              logger.debug({
                cookies: cookiesToSet.map((c) => ({
                  name: c.name,
                  hasValue: !!c.value,
                  hasOptions: !!c.options,
                })),
                message: "Cookie setting failed details",
              });
            }
          }
        },
      },
    }
  );
}
