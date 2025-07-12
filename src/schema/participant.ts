import { DEFAULT_CLUB_KEY } from "@/constants/constants";
import { availableMatchDays } from "@/db/schema/columns.helpers";
import z from "zod";

export const participantFormSchema = z
  .object({
    chessClubType: z.enum([DEFAULT_CLUB_KEY, "other"], {
      errorMap: () => ({ message: "Schachverein ist erforderlich" }),
    }),
    chessClub: z.string().optional(),
    title: z.string().optional(),
    dwzRating: z.coerce
      .number()
      .min(0, "DWZ-Punktzahl muss mindestens 0 sein")
      .optional(),
    fideRating: z.coerce
      .number()
      .min(0, "FIDE-Punktzahl muss mindestens 0 sein")
      .optional(),
    fideId: z.string().optional(),
    nationality: z
      .string()
      .length(3, "3-Buchstaben-Ländercode benötigt")
      .toUpperCase()
      .optional(), // nur vorhanden, wenn Elo eingegeben
    birthYear: z.coerce
      .number()
      .min(1900, "Geburtsjahr muss mindestens 1900 sein")
      .max(
        new Date().getFullYear(),
        "Geburtsjahr kann nicht in der Zukunft liegen",
      )
      .optional(),

    // Will not be used in the form, but can be used in the backend
    zpsClub: z.string().optional(),
    zpsPlayer: z.string().optional(),

    preferredMatchDay: z.enum(availableMatchDays, {
      errorMap: () => ({ message: "Bevorzugter Spieltag ist erforderlich" }),
    }),
    secondaryMatchDays: z.array(z.enum(availableMatchDays)),
    notAvailableDays: z.array(z.date()).max(5, "Maximal 5 Tage").optional(),
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
      if (data.fideRating != null && data.fideRating > 0) {
        return !!data.fideId && data.fideId.trim().length > 0;
      }
      return true;
    },
    {
      message: "FIDE-ID ist erforderlich, wenn Elo angegeben ist",
      path: ["fideId"],
    },
  )
  .refine(
    (data) => {
      if (data.fideRating != null && data.fideRating > 0) {
        return !!data.nationality && data.nationality.trim().length === 3;
      }
      return true;
    },
    {
      message: "Nationalität ist erforderlich, wenn Elo angegeben ist",
      path: ["nationality"],
    },
  )
  .refine(
    (data) => {
      if (data.fideRating != null && data.fideRating > 0) {
        return (
          !!data.birthYear &&
          data.birthYear >= 1900 &&
          data.birthYear <= new Date().getFullYear()
        );
      }
      return true;
    },
    {
      message: "Geburtsjahr ist erforderlich, wenn Elo angegeben ist",
      path: ["birthYear"],
    },
  );
