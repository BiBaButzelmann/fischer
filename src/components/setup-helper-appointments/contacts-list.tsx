"use client";

import { Users, Gavel, Phone, Mail } from "lucide-react";

type ContactDetails = {
  otherSetupHelpers: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  }[];
  referee: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  } | null;
};

type Props = {
  details: ContactDetails;
};

export function ContactsList({ details }: Props) {
  return (
    <div className="space-y-4">
      {details.otherSetupHelpers.length > 0 && (
        <div>
          <h4 className="font-medium mb-2 text-sm text-gray-700 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Andere Aufbauhelfer:
          </h4>
          <div className="space-y-2">
            {details.otherSetupHelpers.map((helper, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded">
                <div className="font-medium mb-2">
                  {helper.firstName} {helper.lastName}
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{helper.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{helper.phoneNumber}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {details.referee && (
        <div>
          <h4 className="font-medium mb-2 text-sm text-gray-700 flex items-center gap-2">
            <Gavel className="w-4 h-4" />
            Schiedsrichter:
          </h4>
          <div className="p-3 bg-gray-50 rounded">
            <div className="font-medium mb-2">
              {details.referee.firstName} {details.referee.lastName}
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>{details.referee.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>{details.referee.phoneNumber}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {details.otherSetupHelpers.length === 0 && !details.referee && (
        <p className="text-sm text-gray-500 text-center py-4">
          Keine weiteren Kontakte für diesen Termin verfügbar.
        </p>
      )}
    </div>
  );
}
