"use client";

import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { sendEntryFeeReminderEmails } from "@/actions/email/entry-fee-reminder";

type Props = {
  unpaidCount: number;
};

export function EmailReminderButton({ unpaidCount }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleSendReminders = () => {
    if (unpaidCount === 0) {
      toast.info("Keine Erinnerungen zu versenden - alle haben bezahlt!");
      return;
    }

    startTransition(async () => {
      try {
        await sendEntryFeeReminderEmails();
      } catch (error) {
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
