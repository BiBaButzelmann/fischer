import z from "zod";

// define available match days somewhere to be used in the schema and form
const availableMatchDays = ["tuesday", "thursday", "friday"] as const;

export const registerFormSchema = z.object({
  firstName: z.string().min(1, "Vorname ist erforderlich"),
  lastName: z.string().min(1, "Nachname ist erforderlich"),
  email: z.string().email("Ungültige E-Mail-Adresse"),
  phoneNumber: z.string().min(1, "Telefonnummer ist erforderlich"),

  chessClub: z.string().min(1, "Schachverein ist erforderlich"),
  dwzRating: z
    .number()
    .min(0, "DWZ-Punktzahl muss mindestens 0 sein")
    .optional(),
  fideRating: z
    .number()
    .min(0, "FIDE-Punktzahl muss mindestens 0 sein")
    .optional(),
  fideId: z.string().optional(),

  preferredMatchDay: z.enum(availableMatchDays, {
    errorMap: () => ({ message: "Bevorzugter Spieltag ist erforderlich" }),
  }),
  secondaryMatchDays: z
    .array(z.enum(availableMatchDays))
    .min(1, "Sekundärer Spieltag ist erforderlich"),

  helpAsReferee: z.array(z.enum(availableMatchDays)),
  helpSetupRoom: z.array(z.enum(availableMatchDays)),
  helpEnterMatches: z.boolean().optional(),
  helpAsTournamentJury: z.boolean().optional(),
});
