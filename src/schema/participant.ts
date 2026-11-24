import { CLUBLESS_KEY, DEFAULT_CLUB_KEY } from "@/constants/constants";
import { availableMatchDays } from "@/db/schema/columns.helpers";
import { hasSecondaryMatchDayConflict } from "@/lib/match-days";
import { TITLES } from "@/lib/title";
import {
  getCurrentLocalDateTime,
  isValidDateOnly,
  todayDateOnly,
} from "@/lib/date";
import z from "zod";

const dateOnlySchema = z.string().refine(isValidDateOnly, "Ungültiges Datum");

const ratingSchema = (message: string) =>
  z.number().int().positive(message).optional();

export const participantFormSchema = z
  .object({
    chessClubType: z.enum([DEFAULT_CLUB_KEY, "other", CLUBLESS_KEY], {
      errorMap: () => ({ message: "Schachverein ist erforderlich" }),
    }),
    chessClub: z.string().optional(),
    title: z.enum(TITLES).optional(),
    gender: z.enum(["m", "f"]).optional(),
    dwzRating: ratingSchema("DWZ muss größer als 0 sein"),
    fideRating: ratingSchema("Elo muss größer als 0 sein"),
    fideId: z
      .string()
      .trim()
      .transform((id) => id || undefined)
      .optional(),
    nationality: z
      .string()
      .length(3, "3-Buchstaben-Ländercode benötigt")
      .toUpperCase()
      .optional(),
    birthYear: z.coerce
      .number()
      .min(1900, "Geburtsjahr muss mindestens 1900 sein")
      .refine(
        (y) => y <= getCurrentLocalDateTime().year,
        "Geburtsjahr kann nicht in der Zukunft liegen",
      )
      .optional(),
    birthDate: dateOnlySchema
      .refine(
        (d) => d <= todayDateOnly(),
        "Geburtsdatum kann nicht in der Zukunft liegen",
      )
      .optional(),

    // Will not be used in the form, but can be used in the backend
    dsbPersonId: z.string().optional(),
    zpsClub: z.string().optional(),
    zpsPlayer: z.string().optional(),

    preferredMatchDay: z.enum(availableMatchDays, {
      errorMap: () => ({ message: "Bevorzugter Spieltag ist erforderlich" }),
    }),
    secondaryMatchDays: z.array(z.enum(availableMatchDays)),
    notAvailableDays: z
      .array(dateOnlySchema)
      .max(5, "Maximal 5 Tage")
      .optional(),
    exercisePromotionRight: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.chessClubType === "other") {
        const chessClub = data.chessClub?.trim();
        return !!chessClub && chessClub.length > 0;
      }
      return true;
    },
    {
      message: "Schachverein ist erforderlich",
      path: ["chessClub"],
    },
  )
  .refine(
    (data) => {
      if (data.chessClubType === CLUBLESS_KEY) {
        return data.birthDate != null;
      }
      return true;
    },
    {
      message: "Geburtsdatum ist für vereinslose Spieler erforderlich",
      path: ["birthDate"],
    },
  )
  .refine(
    (data) => {
      if (data.chessClubType === CLUBLESS_KEY) {
        return data.gender != null;
      }
      return true;
    },
    {
      message: "Geschlecht ist für vereinslose Spieler erforderlich",
      path: ["gender"],
    },
  )
  .refine(
    (data) =>
      !hasSecondaryMatchDayConflict(
        data.preferredMatchDay,
        data.secondaryMatchDays,
      ),
    {
      message:
        "Ein Wochentag kann nicht gleichzeitig bevorzugter und alternativer Spieltag sein.",
      path: ["secondaryMatchDays"],
    },
  );

export type ParticipantFormValues = z.infer<typeof participantFormSchema>;
