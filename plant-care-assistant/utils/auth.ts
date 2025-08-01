import { createClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "../lib/supabaseServer";
import logger from "@utils/logger";

export async function getUserIdFromSupabase(
  req: Request
): Promise<string | null> {
  // First try to get the token from the Authorization header
  const authHeader = req.headers.get("authorization");
  logger.info(
    "Auth Header:",
    authHeader ? `${authHeader.substring(0, 15)}...` : "null"
  );

  if (authHeader && authHeader.startsWith("Bearer ")) {
    // Extract token
    const token = authHeader.split(" ")[1];
    logger.info("Token extracted, length:", token.length);

    // Create Supabase client (using env variables)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    logger.info("Supabase URL:", supabaseUrl);
    logger.info("Supabase key exists:", !!supabaseKey);

    if (!supabaseUrl || !supabaseKey) {
      logger.error("Missing Supabase credentials in environment variables");
      return null;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user with the token
    try {
      logger.info("Calling supabase.auth.getUser with token");
      const { data, error } = await supabase.auth.getUser(token);
      
      if (error) {
        logger.error("Supabase auth error:", error.message);
        return null;
      }
      
      logger.info("Auth successful, user:", data.user?.id ? `${data.user.id.substring(0, 8)}...` : "null");
      return data.user?.id || null;
    } catch (error) {
      logger.error("Exception in token auth:", error);
      return null;
    }
  }

  // Fallback to cookie-based auth for browser requests
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      logger.info("Cookie auth failed:", error?.message || "No user");
      return null;
    }

    logger.info("Cookie auth successful, user:", user.id ? `${user.id.substring(0, 8)}...` : "null");
    return user.id;
  } catch (error) {
    logger.error("Error with cookie auth:", error);
    return null;
  }
}