import z from "zod";

export const trainerFormSchema = z.object({
  participating: z.boolean(),
});