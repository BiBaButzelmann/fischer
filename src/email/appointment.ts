import { AppointmentNotification as AppointmentNotification } from "@/email/templates/appointment-notification";
import { sendEmailToAdmin } from "./client";

type AppointmentEmailData = {
  name: string;
  isCancellation: boolean;
  date: string;
  email: string;
  phoneNumber: string;
  role?: "referee" | "setupHelper";
};

export async function sendAppointmentNotification(data: AppointmentEmailData) {
  const roleText = data.role === "referee" ? "Schiedsrichter" : "Aufbauhelfer";
  const actionText = data.isCancellation ? "abgesagt" : "wieder angenommen";
  const subject = `${roleText} ${actionText}: ${data.name}`;

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

export async function sendSetupHelperAppointmentNotification(
  data: AppointmentEmailData,
) {
  return sendAppointmentNotification({ ...data, role: "setupHelper" });
}

export async function sendRefereeAppointmentNotification(
  data: AppointmentEmailData,
) {
  return sendAppointmentNotification({ ...data, role: "referee" });
}
