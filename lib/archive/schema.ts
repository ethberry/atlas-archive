import { z } from "zod";

import { KINDS } from "@/lib/archive/kinds";

export const kindSchema = z.enum(KINDS);

export const listRowSchema = z.object({
  id: z.string(),
  kind: kindSchema,
  name: z.string(),
  like_count: z.number(),
});

export const slotSchema = z.tuple([z.number(), z.number()]);

export type ListRow = z.infer<typeof listRowSchema>;
