import crypto from "crypto";

import { EnabledLanguages } from "@/lib/i18n";
import { Enums } from "@/lib/db/supabase.types";

export const createSignature = (body: string, secretKey: string) => {
  return crypto.createHmac("sha512", secretKey).update(body).digest("hex");
};

export enum EmailType {
  EMAIL_VERIFICATION = "EMAIL_VERIFICATION",
  SAFT_CONTRACT = "SAFT_CONTRACT",
  UPSALE_1 = "UPSALE_1",
  UPSALE_2 = "UPSALE_2",
}

export const templateMapping = {
  [EnabledLanguages.EN]: {
    [EmailType.EMAIL_VERIFICATION]: 7373750,
    [EmailType.SAFT_CONTRACT]: 7373752,
    [EmailType.UPSALE_1]: 7373755,
    [EmailType.UPSALE_2]: 7373757,
  },
  [EnabledLanguages.RU]: {
    [EmailType.EMAIL_VERIFICATION]: 7363250,
    [EmailType.SAFT_CONTRACT]: 7363257,
    [EmailType.UPSALE_1]: 7373747,
    [EmailType.UPSALE_2]: 7373748,
  },
};

export const getEmailTemplate = (
  language: Enums<"UserLanguage">,
  type: EmailType,
) => {
  if (process.env.NODE_ENV !== "production") {
    return 7358617;
  }
  return templateMapping[language][type];
};

export const mapSeries = <T>(
  tasks: Array<() => Promise<T>>,
): Promise<Array<T>> => {
  return tasks.reduce(
    (promiseChain, currentTask) => {
      return promiseChain.then((chainResults) =>
        currentTask().then((currentResult) => [...chainResults, currentResult]),
      );
    },
    Promise.resolve([] as Array<T>),
  );
};
