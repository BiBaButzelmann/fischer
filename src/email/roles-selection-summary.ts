import { resend } from "./client";
import { RegistrationRolesData } from "@/db/types/role";
import RoleSelectionSummaryMail from "./templates/roles-selection-summary-mail";

export async function sendRolesSelectionSummaryMail(
  to: string,
  firstName: string,
  roles: RegistrationRolesData,
) {
  let recipientAddress = to;
  if (process.env.NODE_ENV === "development") {
    recipientAddress = "delivered@resend.dev";
  }
  await resend.emails.send({
    from: "klubturnier@hsk1830.de",
    to: recipientAddress,
    subject: "Anmeldebestätigung für das Klubturnier",
    react: RoleSelectionSummaryMail({
      name: firstName,
      roles: roles,
    }),
  });
}
