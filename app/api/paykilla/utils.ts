import crypto from "crypto";

import { EnabledLanguages } from "@/lib/i18n";

export const createSignature = (body: string, secretKey: string) => {
  return crypto.createHmac("sha512", secretKey).update(body).digest("hex");
};

export enum EmailType {
  EMAIL_VERIFICATION = "EMAIL_VERIFICATION",
  SAFT_CONTRACT = "SAFT_CONTRACT",
  FOLLOW_UP = "FOLLOW_UP",
}

export const templateMapping = {
  [EnabledLanguages.EN]: {
    [EmailType.EMAIL_VERIFICATION]: 7358617,
    [EmailType.SAFT_CONTRACT]: 7358969,
    [EmailType.FOLLOW_UP]: 7358969,
  },
  [EnabledLanguages.RU]: {
    [EmailType.EMAIL_VERIFICATION]: 7358617,
    [EmailType.SAFT_CONTRACT]: 7358969,
    [EmailType.FOLLOW_UP]: 7358969,
  },
};
