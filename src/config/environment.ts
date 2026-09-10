import { z } from "zod";

const optionalUrl = z.string().url().optional();
const environmentSchema = z.object({
  VITE_SUPABASE_URL: optionalUrl,
  VITE_SUPABASE_ANON_KEY: z.string().min(20).optional(),
});

const parsedEnvironment = environmentSchema.safeParse(import.meta.env);

export const environment = parsedEnvironment.success
  ? parsedEnvironment.data
  : { VITE_SUPABASE_URL: undefined, VITE_SUPABASE_ANON_KEY: undefined };

export const isSupabaseConfigured = Boolean(
  environment.VITE_SUPABASE_URL && environment.VITE_SUPABASE_ANON_KEY,
);
