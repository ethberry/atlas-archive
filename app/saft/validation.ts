import { z } from "zod";

import { SAFT_PACKAGES } from "@/app/saft/constants";

export const validationSchema = z.object({
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
  email: z
    .string()
    .trim()
    .min(1, "form.error.email.required")
    .min(5, "form.error.email.tooShort")
    .max(254, "form.error.email.tooLong")
    .email("form.error.email.invalid"),
  address: z
    .string()
    .trim()
    .min(1, "form.error.address.required")
    .min(5, "form.error.address.tooShort")
    .max(40, "form.error.address.tooLong"),
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
