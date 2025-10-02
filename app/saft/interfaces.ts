import type { EnabledLanguages } from "@/lib/i18n";

export interface IVerificationData {
  email: string;
  language: EnabledLanguages;
}

export interface IUserData extends IVerificationData {
  firstName: string;
  lastName: string;
  address: string;
  verificationCode: string;
  consent: boolean;
  nonUsPerson: boolean;
  package: number;
}
