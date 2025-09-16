import { createClient } from "@supabase/supabase-js";

import type { Database } from "./supabase.types";

export const supabase = createClient<Database>(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);
