import { z } from "zod";

export const validationSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  address: z.string(),
});
