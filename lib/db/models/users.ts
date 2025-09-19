"use server";

import { captureException } from "@sentry/nextjs";

import { supabase } from "../supabase.server";

export interface IUserCreateDto {
  email: string;
}

export const createUser = async (user: IUserCreateDto) => {
  const { data, error } = await supabase
    .from("users")
    .insert(user)
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
