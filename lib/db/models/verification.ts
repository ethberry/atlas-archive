import { captureException } from "@sentry/nextjs";

import { supabase } from "@/lib/db/supabase.server";
import { CODE_TIMEOUT } from "@/app/saft/constants";

export const createVerificationCode = async (email: string) => {
  const { data, error } = await supabase
    .from("email_verification")
    .insert({
      email,
    })
    .select()
    .single();

  if (error) {
    captureException(error);
    throw error;
  }

  return data;
};

export const getVerificationCodeByEmail = async (email: string) => {
  const { data, error } = await supabase
    .from("email_verification")
    .select()
    .eq("email", email)
    .order("created_at", { ascending: false })
    .gte("created_at", new Date(Date.now() - CODE_TIMEOUT).toISOString())
    .limit(1)
    .maybeSingle();

  if (error) {
    captureException(error);
    throw error;
  }

  return data;
};
