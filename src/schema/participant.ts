import { availableMatchDays } from "@/db/schema/columns.helpers";
import z from "zod";

export const participantFormSchema = z.object({
  chessClub: z.string().min(1, "Schachverein ist erforderlich"),
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

  preferredMatchDay: z.enum(availableMatchDays, {
    errorMap: () => ({ message: "Bevorzugter Spieltag ist erforderlich" }),
  }),
  secondaryMatchDays: z.array(z.enum(availableMatchDays)),
  notAvailableDays: z.array(z.date()).max(14, "Maximal 14 Tage").optional(),
});
