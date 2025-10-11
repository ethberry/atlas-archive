"use server";

import { captureException } from "@sentry/nextjs";

import { supabase } from "@/lib/db/supabase.server";
import { Enums } from "@/lib/db/supabase.types";

export const createInvoice = async (user_id: string, amount: number) => {
  const { data, error } = await supabase
    .from("invoices")
    .insert({
      user_id,
      amount,
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

export const getInvoiceById = async (id: string) => {
  const { data, error } = await supabase
    .from("invoices")
    .select("*, user:users(*)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error(error);
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
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) {
    console.error(error);
    captureException(error);
    throw error;
  }

  return data;
};
