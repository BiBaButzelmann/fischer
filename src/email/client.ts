import { Resend } from "resend";
import { ReactElement } from "react";

export const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendEmail({
  to,
  subject,
  react,
}: {
  to: string;
  subject: string;
  react: ReactElement;
}) {
  let recipientAddress = to;
  if (process.env.NODE_ENV === "development") {
    recipientAddress = "delivered@resend.dev";
  }

  await resend.emails.send({
    from: "klubturnier@hsk1830.de",
    to: recipientAddress,
    subject,
    react,
  });
}
