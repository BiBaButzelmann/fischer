import { availableMatchDays } from "@/db/schema/columns.helpers";
import z from "zod";

export const refereeFormSchema = z.object({
  preferredMatchDay: z.enum(availableMatchDays, {
    errorMap: () => ({ message: "Bevorzugter Wochentag ist erforderlich" }),
  }),
  secondaryMatchDays: z.array(z.enum(availableMatchDays)),
  fideId: z.string().min(1, "FIDE ID ist erforderlich"),
});
