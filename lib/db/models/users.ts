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
    })
    .select()
    .single();

  if (error) {
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
    captureException(error);
    throw error;
  }

  return data;
};
