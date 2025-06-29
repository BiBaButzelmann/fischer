import z from "zod";

export const jurorFormSchema = z.object({
  participating: z.boolean(),
});
