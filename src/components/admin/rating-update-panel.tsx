"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { updateParticipantFromDsb } from "@/actions/participant";
import { isError } from "@/lib/actions";
import {
  ELO_MISSING_AT_DSB_WARNING,
  getRatingSyncOutcome,
  isEloMissingAtDsb,
  type RatingSync,
  type RatingSyncOutcome,
} from "@/lib/dsb/ratings";
import { ParticipantWithName } from "@/db/types/participant";
import { compareByName, getParticipantFullName } from "@/lib/participant";

type RatingEntry = {
  participantId: number;
  name: string;
  dsbPersonId: string | null;
  fideId: string | null;
};

type LogLine = {
  id: number;
  level: "muted" | "normal" | "error";
  text: string;
};

type Summary = Record<RatingSyncOutcome | "failed" | "unlinked", number>;

type Props = {
  participants: ParticipantWithName[];
};

function formatRatingSync({ previous, dsb }: RatingSync) {
  return [
    formatChange("DWZ", previous.dwzRating, dsb.dwzRating),
    formatChange("Elo", previous.fideRating, dsb.fideRating),
    dsb.fideId !== previous.fideId
      ? formatChange("FIDE-ID", previous.fideId, dsb.fideId)
      : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

function formatChange<T>(label: string, previous: T | null, next: T | null) {
  if (next == null) {
    return null;
  }
  return previous === next
    ? `${label} ${next} unverändert`
    : `${label} ${previous ?? "–"} → ${next}`;
}

function toRatingEntries(participants: ParticipantWithName[]): RatingEntry[] {
  return [...participants]
    .sort((a, b) => compareByName(a.profile, b.profile))
    .map((participant) => ({
      participantId: participant.id,
      name: getParticipantFullName(participant),
      dsbPersonId: participant.dsbPersonId,
      fideId: participant.fideId,
    }));
}

export function RatingUpdatePanel({ participants }: Props) {
  const router = useRouter();
  const [isRunning, setIsRunning] = useState(false);
  const [log, setLog] = useState<LogLine[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const cancelRef = useRef(false);
  const autoScrollRef = useRef(true);
  const nextLineIdRef = useRef(0);
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = logContainerRef.current;
    if (container && autoScrollRef.current) {
      container.scrollTop = container.scrollHeight;
    }
  }, [log]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [isRunning]);

  const appendLine = (level: LogLine["level"], text: string) => {
    setLog((lines) => [...lines, { id: nextLineIdRef.current++, level, text }]);
  };

  const run = async () => {
    setIsRunning(true);
    setLog([]);
    setSummary(null);
    nextLineIdRef.current = 0;
    cancelRef.current = false;
    autoScrollRef.current = true;

    const issues: string[] = [];
    const appendIssue = (text: string) => {
      issues.push(text);
      appendLine("error", text);
    };

    try {
      const entries = toRatingEntries(participants);
      const linked = entries.filter((entry) => entry.dsbPersonId != null);
      const unlinked = entries.filter((entry) => entry.dsbPersonId == null);
      const runSummary: Summary = {
        updated: 0,
        unchanged: 0,
        failed: 0,
        withoutRating: 0,
        unlinked: unlinked.length,
      };

      appendLine(
        "muted",
        `${entries.length} Teilnehmer, davon ${linked.length} mit DSB-Verknüpfung`,
      );
      for (const entry of unlinked) {
        appendIssue(
          entry.fideId
            ? `${entry.name} · keine DSB-Verknüpfung – Elo wird nicht aktualisiert`
            : `${entry.name} · keine DSB-Verknüpfung`,
        );
      }

      appendLine(
        "muted",
        `DWZ und Elo über das DSB-Wertungsportal (${linked.length} Abfragen)`,
      );
      for (const [index, entry] of linked.entries()) {
        if (cancelRef.current) {
          break;
        }
        setProgress(`${index + 1}/${linked.length}`);
        const result = await updateParticipantFromDsb(entry.participantId);
        if (isError(result)) {
          runSummary.failed++;
          appendIssue(`${entry.name} · ${result.error}`);
          continue;
        }
        if (result.status === "dsbNotFound") {
          runSummary.failed++;
          appendIssue(
            `${entry.name} · DSB-Person ${entry.dsbPersonId} nicht gefunden – Verknüpfung prüfen`,
          );
          continue;
        }

        const outcome = getRatingSyncOutcome(result);
        runSummary[outcome]++;
        if (outcome === "withoutRating") {
          appendIssue(
            `${entry.name} · DSB-Person ${entry.dsbPersonId} gefunden, aber ohne Wertung`,
          );
        } else {
          appendLine("normal", `${entry.name} · ${formatRatingSync(result)}`);
        }
        if (isEloMissingAtDsb(result)) {
          appendIssue(`${entry.name} · ${ELO_MISSING_AT_DSB_WARNING}`);
        }
      }

      if (cancelRef.current) {
        appendLine(
          "muted",
          "Abgebrochen · bisherige Änderungen bleiben gespeichert",
        );
        toast.info(
          "Lauf abgebrochen – bisherige Änderungen bleiben gespeichert",
        );
        router.refresh();
        return;
      }

      setSummary(runSummary);
      if (issues.length > 0) {
        appendLine("muted", `Fehlerübersicht (${issues.length}):`);
        for (const issue of issues) {
          appendLine("error", issue);
        }
      }
      appendLine(
        "muted",
        `Fertig · ${runSummary.updated} aktualisiert, ${runSummary.unchanged} unverändert, ${runSummary.failed} fehlgeschlagen, ${runSummary.withoutRating} ohne Wertung, ${runSummary.unlinked} ohne DSB-Verknüpfung`,
      );
      toast.info(
        `${runSummary.updated} von ${entries.length} Wertungszahlen aktualisiert`,
      );
      router.refresh();
    } catch {
      toast.error("Fehler beim Aktualisieren der Wertungszahlen");
    } finally {
      setIsRunning(false);
      setProgress(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          {isRunning
            ? progress
            : summary != null
              ? `Aktualisiert ${summary.updated} · Unverändert ${summary.unchanged} · Fehlgeschlagen ${summary.failed} · Ohne Wertung ${summary.withoutRating} · Ohne DSB-Verknüpfung ${summary.unlinked}`
              : null}
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={run}
            disabled={isRunning}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRunning ? "animate-spin" : ""}`}
            />
            {isRunning ? "Wird aktualisiert..." : "Ratings aktualisieren"}
          </Button>
          {isRunning && (
            <Button
              variant="outline"
              title="Lauf abbrechen"
              onClick={() => {
                cancelRef.current = true;
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      {log.length > 0 && (
        <div
          ref={logContainerRef}
          onScroll={(event) => {
            const container = event.currentTarget;
            autoScrollRef.current =
              container.scrollHeight -
                container.scrollTop -
                container.clientHeight <
              24;
          }}
          className="max-h-80 overflow-y-auto rounded-md border border-gray-800 bg-gray-950 p-3 font-mono text-xs leading-5"
        >
          {log.map((line) => (
            <div
              key={line.id}
              className={
                line.level === "error"
                  ? "text-red-400"
                  : line.level === "muted"
                    ? "text-gray-500"
                    : "text-gray-200"
              }
            >
              {line.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
