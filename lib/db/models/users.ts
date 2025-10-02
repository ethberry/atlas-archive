"use server";

import { captureException } from "@sentry/nextjs";

import { IUserData } from "@/app/saft/interfaces";
import { supabase } from "@/lib/db/supabase.server";

export const createUser = async (user: IUserData) => {
  const { data, error } = await supabase
    .from("users")
    .insert({
      email: user.email,
      first_name: user.firstName,
      last_name: user.lastName,
      address: user.address,
      consent: user.consent,
      non_us_person: user.nonUsPerson,
      language: user.language,
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    captureException(error);
    throw error;
  }

  return data;
};

export const getUserByEmail = async (email: string) => {
  const { data, error } = await supabase
    .from("users")
    .select()
    .eq("email", email)
    .maybeSingle();

  if (error) {
    console.error(error);
    captureException(error);
    throw error;
  }

  return data;
};

export const getUsersForFallowUp = async () => {
  const { data, error } = await supabase
    .from("users")
    .select()
    .eq("stage", "PAID");

  if (error) {
    console.error(error);
    captureException(error);
    throw error;
  }

  return data;
};
