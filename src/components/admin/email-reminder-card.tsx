"use client";

import { sendEntryFeeReminderEmails } from "@/actions/email/entry-fee-reminder";
import { Mail, Send } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";

type Props = {
  unpaidCount: number;
};

export function EmailReminderCard({ unpaidCount }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleSendReminders = () => {
    if (unpaidCount === 0) {
      toast.info("Keine Erinnerungen zu versenden - alle haben bezahlt!");
      return;
    }

    startTransition(async () => {
      try {
        const result = await sendEntryFeeReminderEmails();
        toast.success(result.message);
      } catch (error) {
        toast.error("Fehler beim Versenden der E-Mails");
        console.error("Error sending entry fee reminder emails:", error);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
            <Mail className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-lg">E-Mail Erinnerungen</CardTitle>
            <p className="text-sm text-gray-600">
              Sende Zahlungserinnerungen an säumige Teilnehmer
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            {unpaidCount > 0 ? (
              <>
                <strong>{unpaidCount}</strong> Teilnehmer haben noch nicht
                bezahlt und würden eine Erinnerung erhalten.
              </>
            ) : (
              "Alle externen Teilnehmer haben ihr Startgeld bezahlt."
            )}
          </div>

          <Button
            onClick={handleSendReminders}
            disabled={isPending || unpaidCount === 0}
            className="w-full"
            variant={unpaidCount > 0 ? "default" : "secondary"}
          >
            <Send className="h-4 w-4 mr-2" />
            {isPending
              ? "Sende E-Mails..."
              : unpaidCount > 0
                ? `Erinnerungen senden (${unpaidCount})`
                : "Keine Erinnerungen erforderlich"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
