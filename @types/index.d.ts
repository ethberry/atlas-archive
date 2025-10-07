declare global {
  namespace NodeJS {
    interface ProcessEnv {
      BASE_URL: string;

      SUPABASE_URL: string;
      SUPABASE_ANON_KEY: string;
      SUPABASE_SERVICE_ROLE_KEY: string;

      NEXT_PUBLIC_SUPABASE_URL: string;
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
      NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY: string;

      MAILJET_PUBLIC_KEY: string;
      MAILJET_PRIVATE_KEY: string;
      MAILJET_FROM: string;

      PAYKILLA_API_PUBLIC: string;
      PAYKILLA_API_PRIVATE: string;
      PAYKILLA_WEBHOOK_PUBLIC: string;
      PAYKILLA_WEBHOOK_PRIVATE: string;
    }
  }
}

export {};
