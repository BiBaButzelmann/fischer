import { availableMatchDays } from "@/db/schema/columns.helpers";
import z from "zod";

export const setupHelperFormSchema = z.object({
  preferredMatchDay: z.enum(availableMatchDays, {
    errorMap: () => ({ message: "Bevorzugter Wochentag ist erforderlich" }),
  }),
  secondaryMatchDays: z.array(z.enum(availableMatchDays)),
});
