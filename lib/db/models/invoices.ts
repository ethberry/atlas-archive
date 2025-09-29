"use server";

import { captureException } from "@sentry/nextjs";

import { supabase } from "@/lib/db/supabase.server";
import { Enums, Tables } from "@/lib/db/supabase.types";

export const createInvoice = async (user: Tables<"users">) => {
  const { data, error } = await supabase
    .from("invoices")
    .insert({
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    captureException(error);
    throw error;
  }

  return data;
};

export const getInvoiceById = async (id: string) => {
  const { data, error } = await supabase
    .from("invoices")
    .select("*, user:users(*)")
    .eq("id", id)
    .single();

  if (error) {
    captureException(error);
    throw error;
  }

  return data;
};

export const updateInvoiceStatus = async (
  id: string,
  status: Enums<"InvoiceStatus">,
) => {
  const { data, error } = await supabase
    .from("invoices")
    .update({
      status,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    captureException(error);
    throw error;
  }

  return data;
};
