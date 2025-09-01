import { sendEmail } from "./client";
import { PasswordResetMail } from "./templates/password-reset-mail";

export async function sendPasswordResetEmail(
  to: string,
  firstName: string,
  url: string,
) {
  await sendEmail({
    to,
    subject: "Password zurücksetzen",
    react: PasswordResetMail({
      firstName: firstName,
      url: url,
    }),
  });
}
