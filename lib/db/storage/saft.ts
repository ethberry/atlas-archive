import { captureException } from "@sentry/nextjs";

import { supabase } from "@/lib/db/supabase.server";

export const storeSaftContract = async (fileName: string, blob: Blob) => {
  const { data, error } = await supabase.storage
    .from("saft") // Your bucket name
    .upload(`${fileName}.pdf`, blob, {
      cacheControl: "3600",
      // upsert: true,
      contentType: "application/pdf",
    });

  if (error) {
    captureException(error);
    throw error;
  }

  return data;
};
export const getSaftPublicUrl = (path: string) => {
  const { data } = supabase.storage.from("saft").getPublicUrl(path);

  return data;
};
