import { sendEmail } from "./client";
import { RolesData } from "@/db/types/role";
import RoleSelectionSummaryMail from "./templates/roles-selection-summary-mail";

export async function sendRolesSelectionSummaryMail(
  to: string,
  firstName: string,
  roles: RolesData,
) {
  await sendEmail({
    to,
    subject: "Anmeldebestätigung für das Klubturnier",
    react: RoleSelectionSummaryMail({
      name: firstName,
      roles: roles,
    }),
  });
}
