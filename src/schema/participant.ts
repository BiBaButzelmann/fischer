import { availableMatchDays } from "@/db/schema/columns.helpers";
import z from "zod";

export const createParticipantFormSchema = z.object({
  chessClub: z.string().min(1, "Schachverein ist erforderlich"),
  dwzRating: z.coerce
    .number()
    .min(0, "DWZ-Punktzahl muss mindestens 0 sein")
    .optional(),
  fideRating: z.coerce
    .number()
    .min(0, "FIDE-Punktzahl muss mindestens 0 sein")
    .optional(),
  fideId: z.string().optional(),

  preferredMatchDay: z.enum(availableMatchDays, {
    errorMap: () => ({ message: "Bevorzugter Spieltag ist erforderlich" }),
  }),
  secondaryMatchDays: z.array(z.enum(availableMatchDays)),
});
