import z from "zod";

export const profileFormDataSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich"),
  fideId: z.string().min(1, "FIDE Id ist erforderlich"),

  addressCoLine: z.string().optional(),
  adressName: z.string().min(1, "Name ist erforderlich"),
  addressStreet: z.string().min(1, "Straße ist erforderlich"),
  addressCity: z.string().min(1, "Stadt ist erforderlich"),
  addressPostalCode: z.string().min(1, "Postleitzahl ist erforderlich"),
});

export type ProfileFormData = z.infer<typeof profileFormDataSchema>;
