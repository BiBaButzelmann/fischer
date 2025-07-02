import { resend } from "./client";
import { RoleSelectionSummaryMail } from "./templates/roles-selection-summary-mail";
import { Participant } from "@/db/types/participant";
import { Juror } from "@/db/types/juror";
import { MatchEnteringHelper } from "@/db/types/match-entering-helper";
import { Referee } from "@/db/types/referee";
import { SetupHelper } from "@/db/types/setup-helper";
import { RolesData } from "@/db/types/role";

export async function sendRolesSelectionSummaryMail(
  to: string,
  firstName: string,
  roles: RolesData,
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
