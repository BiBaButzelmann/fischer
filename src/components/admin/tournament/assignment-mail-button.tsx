"use client";

import { Button } from "@/components/ui/button";
import { Tournament } from "@/db/types/tournament";
import { sendTournamentStartedEmails } from "@/actions/email/tournament-started";
import { useTransition, useState } from "react";
import { Mail } from "lucide-react";
import { toast } from "sonner";

type Props = {
  tournament: Tournament;
};

export function AssignmentMailButton({ tournament }: Props) {
  const [isPending, startTransition] = useTransition();
  const [hasSent, setHasSent] = useState(false);
  const isRunning = tournament.stage === "running";

  const handleSendMails = () => {
    startTransition(async () => {
      try {
        const result = await sendTournamentStartedEmails(tournament.id);
        setHasSent(true);
        toast.success(`E-Mails an ${result.sent} Personen versendet`);
      } catch (error) {
        console.error("Error sending emails:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Fehler beim Versenden der E-Mails";
        toast.error(errorMessage);
      }
    });
  };

  return (
    <Button
      onClick={handleSendMails}
      disabled={!isRunning || isPending || hasSent}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      <Mail className="h-4 w-4" />
      {isPending ? "Versendet..." : hasSent ? "Versendet" : "Mails versenden"}
    </Button>
  );
}
