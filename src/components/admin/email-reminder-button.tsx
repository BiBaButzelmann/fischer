"use client";

import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { sendEntryFeeReminderEmails } from "@/actions/email/entry-fee-reminder";

type Props = {
  tournamentId: number;
  unpaidCount: number;
};

export function EmailReminderButton({ tournamentId, unpaidCount }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleSendReminders = () => {
    startTransition(async () => {
      try {
        const result = await sendEntryFeeReminderEmails(tournamentId);
        toast.success(result.message);
      } catch {
        toast.error("Fehler beim Versenden der E-Mails");
      }
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleSendReminders}
      disabled={isPending || unpaidCount === 0}
      className="h-8 w-8 p-0"
      title={
        unpaidCount > 0
          ? `Erinnerungen an ${unpaidCount} Teilnehmer senden`
          : "Keine Erinnerungen erforderlich"
      }
    >
      <Mail className="h-4 w-4" />
    </Button>
  );
}
