"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DwzPlayerSelect } from "@/components/klubturnier-anmeldung/forms/dwz-player-select";
import {
  linkParticipantDsb,
  updateParticipantFromDsb,
} from "@/actions/participant";
import { isError } from "@/lib/actions";
import { getFullName } from "@/lib/participant";
import type { DsbPlayerCandidate } from "@/lib/dsb/types";

type Props = {
  participantId: number;
  firstName: string;
  lastName: string;
  vkz: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DsbLinkDialog({
  participantId,
  firstName,
  lastName,
  vkz,
  open,
  onOpenChange,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const fullName = getFullName(firstName, lastName);

  const handleSelect = (candidate: DsbPlayerCandidate) => {
    startTransition(async () => {
      try {
        const linked = await linkParticipantDsb(
          participantId,
          candidate.nuLigaPersonId,
        );
        if (isError(linked)) {
          toast.error(linked.error);
          return;
        }

        const update = await updateParticipantFromDsb(participantId);
        const ratings =
          !isError(update) && update.status !== "dsbNotFound"
            ? [
                update.dwz ? `DWZ ${update.dwz.next}` : null,
                update.elo ? `Elo ${update.elo.next}` : null,
              ].filter(Boolean)
            : [];

        toast.success(
          `${fullName} verknüpft${ratings.length > 0 ? ` · ${ratings.join(" · ")}` : ""}`,
        );
        onOpenChange(false);
        router.refresh();
      } catch {
        toast.error("Fehler beim Verknüpfen");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>DSB-Verknüpfung</DialogTitle>
          <DialogDescription>
            Wähle die DSB-Person für {fullName}. Nach der Auswahl werden DWZ
            und Elo direkt aktualisiert.
          </DialogDescription>
        </DialogHeader>
        {isPending ? (
          <p className="text-sm text-gray-600">Wird verknüpft…</p>
        ) : (
          <DwzPlayerSelect
            firstName={firstName}
            lastName={lastName}
            vkz={vkz}
            onSelect={handleSelect}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
