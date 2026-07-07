import { availableMatchDays } from "@/db/schema/columns.helpers";
import { hasSecondaryMatchDayConflict } from "@/lib/match-days";
import z from "zod";

export const refereeFormSchema = z
  .object({
    preferredMatchDay: z.enum(availableMatchDays, {
      errorMap: () => ({ message: "Bevorzugter Spieltag ist erforderlich" }),
    }),
    secondaryMatchDays: z.array(z.enum(availableMatchDays)),
    fideId: z.string().min(1, "FIDE ID ist erforderlich"),
  })
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
