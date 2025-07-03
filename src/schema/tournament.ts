import z from "zod";

export const createTournamentFormSchema = z.object({
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
  organizerProfileId: z.string().min(1, "Organisator ist erforderlich"),

  // Spielwochen
  selectedCalendarWeeks: z
    .array(
      z.object({
        index: z.number(),
        status: z.enum(["regular", "catch-up"]),
        weekNumber: z.number(),
        tuesday: z.object({
          refereeNeeded: z.boolean(),
        }),
        thursday: z.object({
          refereeNeeded: z.boolean(),
        }),
        friday: z.object({
          refereeNeeded: z.boolean(),
        }),
      }),
    )
    .min(1, "Mindestens eine Spielwoche ist erforderlich"),

  // PGN Viewer Passwort
  pgnViewerPassword: z
    .string()
    .min(6, "PGN Viewer Passwort muss mindestens 6 Zeichen lang sein"),
});
