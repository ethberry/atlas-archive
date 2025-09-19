import { z } from "zod";

export const validationSchema = z.object({
  email: z.string().email(),
});
