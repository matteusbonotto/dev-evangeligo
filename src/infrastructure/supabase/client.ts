import { createClient } from "@supabase/supabase-js";
import { environment, isSupabaseConfigured } from "../../config/environment";

export const supabaseClient = isSupabaseConfigured
  ? createClient(
      environment.VITE_SUPABASE_URL!,
      environment.VITE_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      },
    )
  : null;
