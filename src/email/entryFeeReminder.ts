import { EntryFeeReminderMail } from "@/email/templates/entry-fee-reminder-mail";
import { sendEmail } from "./client";

export async function sendEntryFeeReminderEmail(
  to: string,
  firstName: string,
  lastName: string,
) {
  await sendEmail({
    to,
    subject: "Startgeld HSK-Klubturnier",
    react: EntryFeeReminderMail({
      firstName,
      lastName,
    }),
  });
}
