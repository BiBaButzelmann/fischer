import { EntryFeeReminderMail } from "@/email/templates/entry-fee-reminder-mail";
import { resend } from "./client";

export async function sendEntryFeeReminderEmail(
  to: string,
  firstName: string,
  lastName: string,
) {
  let recipientAddress = to;
  if (process.env.NODE_ENV === "development") {
    recipientAddress = "delivered@resend.dev";
  }

  await resend.emails.send({
    from: "klubturnier@hsk1830.de",
    to: recipientAddress,
    subject: "Startgeld HSK-Klubturnier",
    react: EntryFeeReminderMail({
      firstName,
      lastName,
    }),
  });
}
