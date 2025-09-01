"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Euro, User } from "lucide-react";
import { updateEntryFeeStatus } from "@/actions/participant";
import { useTransition } from "react";
import { toast } from "sonner";

type EntryFeeParticipant = {
  id: number;
  chessClub: string;
  entryFeePayed: boolean | null;
  profile: {
    firstName: string;
    lastName: string;
  };
};

type Props = {
  participants: EntryFeeParticipant[];
};

export function EntryFeeManagement({ participants }: Props) {
  const [isPending, startTransition] = useTransition();
  const [localParticipants, setLocalParticipants] = useState(participants);

  const handleEntryFeeUpdate = (participantId: number, paid: boolean) => {
    startTransition(async () => {
      try {
        await updateEntryFeeStatus(participantId, paid);

        setLocalParticipants((prev) =>
          prev.map((p) =>
            p.id === participantId ? { ...p, entryFeePayed: paid } : p,
          ),
        );

        toast.success(
          paid
            ? "Startgeld als bezahlt markiert"
            : "Startgeld als unbezahlt markiert",
        );
      } catch {
        toast.error("Fehler beim Aktualisieren des Startgeld-Status");
      }
    });
  };

  const unpaidParticipants = localParticipants.filter(
    (participant) => !participant.entryFeePayed,
  );
  const paidParticipants = localParticipants.filter(
    (participant) => participant.entryFeePayed,
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
              <X className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <CardTitle className="text-lg text-red-700">
                Offene Startgeldzahlungen
              </CardTitle>
              <CardDescription>
                {unpaidParticipants.length} Teilnehmer haben noch nicht bezahlt
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {unpaidParticipants.length === 0 ? (
            <p className="text-gray-500 text-sm italic">
              Alle externen Teilnehmer haben ihr Startgeld bezahlt.
            </p>
          ) : (
            <div className="space-y-3">
              {unpaidParticipants.map((participant) => (
                <ParticipantRow
                  key={participant.id}
                  participant={participant}
                  onUpdateStatus={handleEntryFeeUpdate}
                  isPending={isPending}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
              <Check className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-lg text-green-700">
                Bezahlte Startgelder
              </CardTitle>
              <CardDescription>
                {paidParticipants.length} Teilnehmer haben bereits bezahlt
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {paidParticipants.length === 0 ? (
            <p className="text-gray-500 text-sm italic">
              Noch keine Startgeldzahlungen verzeichnet.
            </p>
          ) : (
            <div className="space-y-3">
              {paidParticipants.map((participant) => (
                <ParticipantRow
                  key={participant.id}
                  participant={participant}
                  onUpdateStatus={handleEntryFeeUpdate}
                  isPending={isPending}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

type ParticipantRowProps = {
  participant: EntryFeeParticipant;
  onUpdateStatus: (participantId: number, paid: boolean) => void;
  isPending: boolean;
};

function ParticipantRow({
  participant,
  onUpdateStatus,
  isPending,
}: ParticipantRowProps) {
  const isPaid = participant.entryFeePayed;

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-white border rounded-lg">
          <User className="h-4 w-4 text-gray-600" />
        </div>
        <div>
          <div className="font-medium">
            {participant.profile.firstName} {participant.profile.lastName}
          </div>
          <div className="text-sm text-gray-600">{participant.chessClub}</div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Badge variant={isPaid ? "default" : "destructive"}>
          {isPaid ? (
            <>
              <Check className="h-3 w-3 mr-1" />
              Bezahlt
            </>
          ) : (
            <>
              <X className="h-3 w-3 mr-1" />
              Offen
            </>
          )}
        </Badge>

        <Button
          variant={isPaid ? "outline" : "default"}
          size="sm"
          onClick={() => onUpdateStatus(participant.id, !isPaid)}
          disabled={isPending}
          className={
            isPaid
              ? "text-red-600 hover:text-red-700 hover:bg-red-50"
              : "bg-green-600 hover:bg-green-700"
          }
        >
          <Euro className="h-4 w-4 mr-1" />
          {isPaid ? "Als unbezahlt markieren" : "Als bezahlt markieren"}
        </Button>
      </div>
    </div>
  );
}
