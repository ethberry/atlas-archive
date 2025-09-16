"use server";

import { captureException } from "@sentry/nextjs";

import { supabase } from "../supabase.server";

export interface IWhitelistCreateDto {
  email: string;
}

export const createWhitelist = async (whitelist: IWhitelistCreateDto) => {
  const { data, error } = await supabase
    .from("whitelist")
    .insert(whitelist)
    .select()
    .single();

  if (error) {
    captureException(error);
    throw error;
  }

  return data;
};
