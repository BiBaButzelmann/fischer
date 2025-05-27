import z from "zod";

export const createTournamentFormDataSchema = z.object({
  // Turnierinformationen
  clubName: z.string().min(1, "Vereinsname ist erforderlich"),
  tournamentType: z.string().min(1, "Turnierart ist erforderlich"),
  numberOfRounds: z.coerce.number().min(1, "Mindestens 1 Runde erforderlich"),
  startDate: z.string().min(1, "Startdatum ist erforderlich"),
  endDate: z.string().min(1, "Enddatum ist erforderlich"),
  timeLimit: z.string().min(1, "Bedenkzeit ist erforderlich"),
  location: z.string().min(1, "Austragungsort ist erforderlich"),
  allClocksDigital: z.boolean(),
  tieBreakMethod: z.string().min(1, "Feinwertung ist erforderlich"),
  softwareUsed: z.string().min(1, "Verwendete Software ist erforderlich"),
  phone: z.string().min(1, "Telefonnummer ist erforderlich"),
  email: z
    .string()
    .email("Ungültige E-Mail-Adresse")
    .min(1, "E-Mail ist erforderlich"),

  // Organisatorauswahl
  existingOrganizerId: z.string().optional(),

  // Organisatorinformationen
  organizerName: z.string().min(1, "Name des Organisators ist erforderlich"),
  fideId: z.string().min(1, "FIDE-ID ist erforderlich"),
  coLine: z.string().optional(),
  street: z.string().min(1, "Straße ist erforderlich"),
  city: z.string().min(1, "Stadt ist erforderlich"),
  postalCode: z.string().min(1, "Postleitzahl ist erforderlich"),
});

export type CreateTournamentFormData = z.infer<
  typeof createTournamentFormDataSchema
>;
