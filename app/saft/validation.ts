import { z } from "zod";

import { SAFT_PACKAGES } from "@/app/saft/constants";
import { EnabledLanguages } from "@/lib/i18n";

export const verificationSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, "form.error.email.required")
      .min(5, "form.error.email.tooShort")
      .max(254, "form.error.email.tooLong")
      .email("form.error.email.invalid"),
    language: z.nativeEnum(EnabledLanguages, {
      message: `Must be one of ${Object.keys(EnabledLanguages).join(", ")}`,
    }),
  })
  .strict();

export const validationSchema = verificationSchema
  .extend({
    firstName: z
      .string()
      .trim()
      .min(1, "form.error.firstName.required")
      .min(2, "form.error.firstName.tooShort")
      .max(40, "form.error.firstName.tooLong")
      .regex(/^[A-Z]+(?: [A-Z]+)*$/i, "form.error.firstName.invalidCharacters"),
    lastName: z
      .string()
      .trim()
      .min(1, "form.error.lastName.required")
      .min(2, "form.error.lastName.tooShort")
      .max(40, "form.error.lastName.tooLong")
      .regex(/^[A-Z]+(?: [A-Z]+)*$/i, "form.error.firstName.invalidCharacters"),
    address: z
      .string()
      .trim()
      .min(1, "form.error.address.required")
      .min(5, "form.error.address.tooShort")
      .max(254, "form.error.address.tooLong")
      .regex(
        /^[A-Z0-9,./#-]+(?: [A-Z0-9,./#-]+)*$/i,
        "form.error.firstName.invalidCharacters",
      ),
    verificationCode: z
      .string()
      .min(1, "form.error.verificationCode.required")
      .regex(/^\d{6}$/, "form.error.verificationCode.pattern"),
    consent: z.boolean().refine((val) => val === true, {
      message: "form.error.consent.required",
    }),
    nonUsPerson: z.boolean().refine((val) => val === true, {
      message: "form.error.nonUsPerson.required",
    }),
    package: z
      .number()
      .refine((val) => Object.values(SAFT_PACKAGES).includes(val), {
        message: `Must be one of ${Object.values(SAFT_PACKAGES).join(", ")}`,
      }),
  })
  .strict();
