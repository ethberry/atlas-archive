import { z } from "zod";

export const validationSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email format"),
  address: z.string().min(1, "Address is required"),
  consent: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
});
