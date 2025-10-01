import { z } from "zod";

import { SAFT_PACKAGES } from "@/app/saft/constants";

export const emailSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "form.error.email.required")
    .min(5, "form.error.email.tooShort")
    .max(254, "form.error.email.tooLong")
    .email("form.error.email.invalid"),
});

export const validationSchema = emailSchema.extend({
  firstName: z
    .string()
    .trim()
    .min(1, "form.error.firstName.required")
    .min(2, "form.error.firstName.tooShort")
    .max(40, "form.error.firstName.tooLong"),
  lastName: z
    .string()
    .trim()
    .min(1, "form.error.lastName.required")
    .min(2, "form.error.lastName.tooShort")
    .max(40, "form.error.lastName.tooLong"),
  address: z
    .string()
    .trim()
    .min(1, "form.error.address.required")
    .min(5, "form.error.address.tooShort")
    .max(254, "form.error.address.tooLong"),
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
  package: z.number().refine((val) => SAFT_PACKAGES.includes(val), {
    message: `Must be one of ${SAFT_PACKAGES.join(", ")}`,
  }),
});
