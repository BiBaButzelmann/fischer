import { resend } from "./client";

export async function sendConfirmRegistrationEmail(to: string) {
  let recipientAddress = to;
  if (process.env.NODE_ENV === "development") {
    recipientAddress = "delivered@resend.dev";
  }

  await resend.emails.send({
    from: "noreply@hsk1830.de",
    to: recipientAddress,
    subject: "Bla bla bla",
    html: `<p>Bla bla</p>`,
  });
}
