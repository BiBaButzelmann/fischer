import { availableMatchDays } from "@/db/schema/columns.helpers";
import z from "zod";

export const createSetupHelperFormSchema = z.object({
  preferredMatchDay: z.enum(availableMatchDays, {
    errorMap: () => ({ message: "Bevorzugter Spieltag ist erforderlich" }),
  }),
  secondaryMatchDays: z.array(z.enum(availableMatchDays)),
});
