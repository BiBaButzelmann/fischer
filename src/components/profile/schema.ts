import z from "zod";

export const profileFormDataSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich"),
});

export type ProfileFormData = z.infer<typeof profileFormDataSchema>;
