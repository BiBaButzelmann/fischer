import { Role } from "@/db/types/role";
import { resend } from "./client";
import { RoleSelectionSummaryMail } from "./templates/roles-selection-summary-mail";

export async function sendRolesSelectionSummaryMail(
  to: string,
  firstName: string,
  roles: Role[],
) {
  let recipientAddress = to;
  if (process.env.NODE_ENV === "development") {
    recipientAddress = "delivered@resend.dev";
  }
  await resend.emails.send({
    from: "noreply@hsk1830.de",
    to: recipientAddress,
    subject: "Role Selection bla bla",
    react: RoleSelectionSummaryMail({
      name: firstName,
      roles: roles,
    }),
  });
}
