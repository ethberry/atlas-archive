"use server";

import { captureException } from "@sentry/nextjs";

import { IUserData } from "@/app/saft/interfaces";
import { supabase } from "@/lib/db/supabase.server";
import { Enums } from "@/lib/db/supabase.types";

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

export const getUsersForUpsale = async (
  stage: Enums<"UserStage">,
  days: number,
) => {
  const { data, error } = await supabase
    .from("users")
    .select()
    .eq("stage", stage)
    .lt(
      "updated_at",
      new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
    );

  if (error) {
    console.error(error);
    captureException(error);
    throw error;
  }

  return data;
};

export const updateUserStage = async (
  id: string,
  stage: Enums<"UserStage">,
) => {
  const { data, error } = await supabase
    .from("users")
    .update({
      stage,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error(error);
    captureException(error);
    throw error;
  }

  return data;
};
