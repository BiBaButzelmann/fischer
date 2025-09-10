import { AppointmentNotification as AppointmentNotification } from "@/email/templates/appointment-notification";
import { sendEmailToAdmin } from "./client";

type AppointmentEmailData = {
  name: string;
  isCancellation: boolean;
  date: string;
  email: string;
  phoneNumber: string;
};

export async function sendSetupHelperAppointmentNotification(
  data: AppointmentEmailData,
) {
  const actionText = data.isCancellation ? "abgesagt" : "wieder angenommen";
  const subject = `Aufbauhelfer ${actionText}: ${data.name}`;

  await sendEmailToAdmin({
    subject: subject,
    react: AppointmentNotification({
      Name: data.name,
      isCanceled: data.isCancellation,
      date: data.date,
      email: data.email,
      phoneNumber: data.phoneNumber,
    }),
  });
}
