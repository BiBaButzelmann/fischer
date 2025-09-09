import * as React from "react";

type Props = {
  setupHelperName: string;
  isCanceled: boolean;
  date: string;
  email: string;
  phoneNumber: string;
};

export function SetupHelperAppointmentNotification({
  setupHelperName,
  isCanceled,
  date,
  email,
  phoneNumber,
}: Props) {
  const actionText = isCanceled ? "abgesagt" : "wieder angenommen";

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        padding: "20px",
        lineHeight: 1.6,
      }}
    >
      <h1 style={{ color: "#2c3e50" }}>Aufbauhelfer-Termin {actionText}</h1>

      <p>
        <strong>{setupHelperName}</strong> hat seinen Aufbauhelfer-Termin am{" "}
        <strong>{date}</strong> {actionText}.
      </p>

      <div
        style={{
          backgroundColor: "#f8f9fa",
          padding: "15px",
          borderRadius: "5px",
          margin: "20px 0",
        }}
      >
        <h3 style={{ color: "#2c3e50", marginTop: 0 }}>Kontakt:</h3>
        <p>
          <strong>E-Mail:</strong> {email}
        </p>
        <p>
          <strong>Telefon:</strong> {phoneNumber}
        </p>
      </div>

      <p>
        Viele Grüße,
        <br />
        Das HSK Klubturnier-System
      </p>
    </div>
  );
}
