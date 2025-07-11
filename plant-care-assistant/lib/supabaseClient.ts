import { createClient as supabaseCreateClient } from "@supabase/supabase-js";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

let _supabaseClient: ReturnType<typeof supabaseCreateClient> | null = null;

// Lazy initialization
export const getSupabaseClient = () => {
  if (!_supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing Supabase environment variables");
    }

    _supabaseClient = supabaseCreateClient(supabaseUrl, supabaseAnonKey);
  }

  return _supabaseClient;
};

// For client components
export const createClient = () => {
  return createClientComponentClient();
};
