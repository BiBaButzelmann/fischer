import { SetupHelperAppointmentNotification } from "@/email/templates/setup-helper-appointment-notification";
import { sendEmailToAdmin } from "./client";

type SetupHelperAppointmentEmailData = {
  setupHelperName: string;
  isCancellation: boolean;
  date: string;
  email: string;
  phoneNumber: string;
};

export async function sendSetupHelperAppointmentNotification(
  data: SetupHelperAppointmentEmailData,
) {
  const actionText = data.isCancellation ? "abgesagt" : "wieder angenommen";
  const subject = `Aufbauhelfer ${actionText}: ${data.setupHelperName}`;

  await sendEmailToAdmin({
    subject: subject,
    react: SetupHelperAppointmentNotification({
      setupHelperName: data.setupHelperName,
      isCanceled: data.isCancellation,
      date: data.date,
      email: data.email,
      phoneNumber: data.phoneNumber,
    }),
  });
}
