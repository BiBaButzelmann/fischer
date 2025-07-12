import { DEFAULT_CLUB_KEY } from "@/constants/constants";
import { availableMatchDays } from "@/db/schema/columns.helpers";
import z from "zod";

export const participantFormSchema = z
  .object({
    chessClubType: z.enum([DEFAULT_CLUB_KEY, "other"], {
      errorMap: () => ({ message: "Schachverein-Typ ist erforderlich" }),
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

    preferredMatchDay: z.enum(availableMatchDays, {
      errorMap: () => ({ message: "Bevorzugter Spieltag ist erforderlich" }),
    }),
    secondaryMatchDays: z.array(z.enum(availableMatchDays)),
    notAvailableDays: z.array(z.date()).max(5, "Maximal 5 Tage").optional(),
  })
  .refine(
    (data) => {
      if (data.chessClubType === DEFAULT_CLUB_KEY) {
        return !!data.chessClub && data.chessClub.trim().length > 0;
      }
      return true;
    },
    {
      message: "Schachverein ist erforderlich",
      path: ["chessClub"],
    },
  );
