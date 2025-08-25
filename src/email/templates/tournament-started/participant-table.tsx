import * as React from "react";
import { ParticipantWithProfile } from "@/db/types/participant";

type Props = {
  participants: ParticipantWithProfile[];
};

export function ParticipantTable({ participants }: Props) {
  return (
    <table
      style={{
        borderCollapse: "collapse",
        width: "100%",
        marginTop: "10px",
        marginBottom: "15px",
      }}
    >
      <thead>
        <tr style={{ backgroundColor: "#f8f9fa" }}>
          <th
            style={{
              border: "1px solid #dee2e6",
              padding: "8px",
              textAlign: "left",
            }}
          >
            Name
          </th>
          <th
            style={{
              border: "1px solid #dee2e6",
              padding: "8px",
              textAlign: "left",
            }}
          >
            DWZ
          </th>
          <th
            style={{
              border: "1px solid #dee2e6",
              padding: "8px",
              textAlign: "left",
            }}
          >
            Elo
          </th>
          <th
            style={{
              border: "1px solid #dee2e6",
              padding: "8px",
              textAlign: "left",
            }}
          >
            Telefon
          </th>
          <th
            style={{
              border: "1px solid #dee2e6",
              padding: "8px",
              textAlign: "left",
            }}
          >
            E-Mail
          </th>
        </tr>
      </thead>
      <tbody>
        {participants.map((participant) => (
          <tr key={participant.id}>
            <td
              style={{
                border: "1px solid #dee2e6",
                padding: "8px",
              }}
            >
              {participant.profile.firstName} {participant.profile.lastName}
            </td>
            <td
              style={{
                border: "1px solid #dee2e6",
                padding: "8px",
              }}
            >
              {participant.dwzRating || "-"}
            </td>
            <td
              style={{
                border: "1px solid #dee2e6",
                padding: "8px",
              }}
            >
              {participant.fideRating || "-"}
            </td>
            <td
              style={{
                border: "1px solid #dee2e6",
                padding: "8px",
              }}
            >
              {participant.profile.phoneNumber}
            </td>
            <td
              style={{
                border: "1px solid #dee2e6",
                padding: "8px",
              }}
            >
              {participant.profile.email}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
