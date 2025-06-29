import z from "zod";

export const matchEnteringHelperFormSchema = z.object({
  numberOfGroupsToEnter: z
    .number()
    .min(1, "Anzahl der Gruppen muss mindestens 1 sein"),
});
