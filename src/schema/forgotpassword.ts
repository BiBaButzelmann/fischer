import z from "zod";

export const forgotSchema = z.object({
  email: z.string().email("Ungültige E-Mail-Adresse"),
});

export const resetSchema = z
  .object({
    newPassword: z.string().min(6, "Mindestens 6 Zeichen"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwörter stimmen nicht überein",
  });
