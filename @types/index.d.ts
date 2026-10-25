declare global {
  namespace NodeJS {
    interface ProcessEnv {
      BASE_URL: string;
      NEXT_PUBLIC_BASE_URL: string;

      SUPABASE_URL: string;
      SUPABASE_SERVICE_ROLE_KEY: string;

      NEXT_PUBLIC_SUPABASE_URL: string;
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: string;
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
    }
  }
}

export {};
