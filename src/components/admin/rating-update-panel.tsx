"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  updateParticipantFromDsb,
  updateParticipantFide,
} from "@/actions/participant";
import { isError } from "@/lib/actions";
import { ParticipantWithName } from "@/db/types/participant";
import { getParticipantFullName } from "@/lib/participant";

const FIDE_REQUEST_INTERVAL_MS = 4000;
const FIDE_THROTTLE_PAUSE_SECONDS = 120;

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

type Summary = {
  updated: number;
  failed: number;
  withoutRating: number;
  unlinked: number;
};

type Props = {
  participants: ParticipantWithName[];
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatChange(label: string, previous: number | null, next: number) {
  return previous === next
    ? `${label} ${next} unverändert`
    : `${label} ${previous ?? "–"} → ${next}`;
}

function toRatingEntries(participants: ParticipantWithName[]): RatingEntry[] {
  return [...participants]
    .sort(
      (a, b) =>
        a.profile.lastName.localeCompare(b.profile.lastName, "de") ||
        a.profile.firstName.localeCompare(b.profile.firstName, "de"),
    )
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
  const [pauseSecondsLeft, setPauseSecondsLeft] = useState<number | null>(null);
  const skipPauseRef = useRef(false);
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

  const pauseForThrottle = () =>
    new Promise<void>((resolve) => {
      skipPauseRef.current = false;
      let remaining = FIDE_THROTTLE_PAUSE_SECONDS;
      setPauseSecondsLeft(remaining);
      const interval = setInterval(() => {
        remaining--;
        if (remaining <= 0 || skipPauseRef.current || cancelRef.current) {
          clearInterval(interval);
          setPauseSecondsLeft(null);
          resolve();
          return;
        }
        setPauseSecondsLeft(remaining);
      }, 1000);
    });

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

    const outcomes = new Map<number, { wrote: boolean; failed: boolean }>();
    const mark = (participantId: number, key: "wrote" | "failed") => {
      const outcome = outcomes.get(participantId) ?? {
        wrote: false,
        failed: false,
      };
      outcomes.set(participantId, { ...outcome, [key]: true });
    };

    try {
      const entries = toRatingEntries(participants);
      const linked = entries.filter((entry) => entry.dsbPersonId != null);
      const unlinked = entries.filter((entry) => entry.dsbPersonId == null);

      appendLine(
        "muted",
        `${entries.length} Teilnehmer, davon ${linked.length} mit DSB-Verknüpfung`,
      );
      for (const entry of unlinked) {
        appendIssue(`${entry.name} · keine DSB-Verknüpfung`);
      }

      appendLine(
        "muted",
        `Phase 1: DWZ über das DSB-Wertungsportal (${linked.length} Abfragen)`,
      );
      const fideCandidates: RatingEntry[] = unlinked.filter(
        (entry) => entry.fideId != null,
      );
      for (const [index, entry] of linked.entries()) {
        if (cancelRef.current) {
          break;
        }
        setProgress(`Phase 1 · ${index + 1}/${linked.length}`);
        const result = await updateParticipantFromDsb(entry.participantId);
        if (isError(result)) {
          mark(entry.participantId, "failed");
          appendIssue(`${entry.name} · ${result.error}`);
        } else if (result.status === "dsbNotFound") {
          mark(entry.participantId, "failed");
          appendIssue(
            `${entry.name} · DSB-Person ${entry.dsbPersonId} nicht gefunden – Verknüpfung prüfen`,
          );
          if (entry.fideId) {
            fideCandidates.push(entry);
          }
        } else if (result.status === "noRating") {
          appendIssue(
            `${entry.name} · DSB-Person ${entry.dsbPersonId} gefunden, aber ohne DWZ-Wertung`,
          );
          if (entry.fideId) {
            fideCandidates.push(entry);
          }
        } else {
          mark(entry.participantId, "wrote");
          const parts = [
            result.dwzRating != null
              ? formatChange("DWZ", result.previousDwzRating, result.dwzRating)
              : "DWZ –",
          ];
          if (result.fideId && !entry.fideId) {
            parts.push(`FIDE-ID ${result.fideId} ergänzt`);
          }
          appendLine("normal", `${entry.name} · ${parts.join(" · ")}`);
          if (result.fideId) {
            fideCandidates.push({ ...entry, fideId: result.fideId });
          }
        }
      }

      appendLine(
        "muted",
        `Phase 2: FIDE-Ratings, gedrosselt auf 1 Abfrage je ${FIDE_REQUEST_INTERVAL_MS / 1000} s (${fideCandidates.length} Abfragen)`,
      );
      let index = 0;
      while (index < fideCandidates.length) {
        if (cancelRef.current) {
          break;
        }
        const entry = fideCandidates[index];
        setProgress(`Phase 2 · ${index + 1}/${fideCandidates.length}`);
        const startedAt = Date.now();
        const result = await updateParticipantFide(entry.participantId);
        if (!isError(result) && result.status === "throttled") {
          appendLine(
            "error",
            `FIDE-Rate-Limit erreicht · Pause ${FIDE_THROTTLE_PAUSE_SECONDS} s`,
          );
          await pauseForThrottle();
          if (cancelRef.current) {
            break;
          }
          appendLine("muted", `Pause beendet · weiter mit ${entry.name}`);
          continue;
        }
        if (isError(result)) {
          mark(entry.participantId, "failed");
          appendIssue(`${entry.name} · ${result.error}`);
        } else if (result.status === "updated") {
          mark(entry.participantId, "wrote");
          appendLine(
            "normal",
            `${entry.name} · ${formatChange("FIDE", result.previousFideRating, result.fideRating)}`,
          );
        } else if (result.status === "error") {
          mark(entry.participantId, "failed");
          appendIssue(
            `${entry.name} · FIDE-Abfrage für ID ${entry.fideId} fehlgeschlagen`,
          );
        } else if (result.status === "notFound") {
          appendIssue(
            `${entry.name} · kein FIDE-Profil zur ID ${entry.fideId} – FIDE-ID prüfen`,
          );
        } else if (result.status === "noRating") {
          appendIssue(
            `${entry.name} · FIDE-Profil ${entry.fideId} gefunden, aber ohne Standard-Elo`,
          );
        }
        index++;
        if (index < fideCandidates.length) {
          const elapsed = Date.now() - startedAt;
          if (elapsed < FIDE_REQUEST_INTERVAL_MS) {
            await sleep(FIDE_REQUEST_INTERVAL_MS - elapsed);
          }
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

      const runSummary: Summary = {
        updated: 0,
        failed: 0,
        withoutRating: 0,
        unlinked: unlinked.length,
      };
      for (const entry of entries) {
        const outcome = outcomes.get(entry.participantId);
        if (outcome?.wrote) {
          runSummary.updated++;
        } else if (outcome?.failed) {
          runSummary.failed++;
        } else if (entry.dsbPersonId != null) {
          runSummary.withoutRating++;
        }
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
        `Fertig · ${runSummary.updated} aktualisiert, ${runSummary.failed} fehlgeschlagen, ${runSummary.withoutRating} ohne Wertung, ${runSummary.unlinked} ohne DSB-Verknüpfung`,
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
      setPauseSecondsLeft(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div className="text-sm text-gray-600">
          {isRunning
            ? progress
            : summary != null
              ? `Aktualisiert ${summary.updated} · Fehlgeschlagen ${summary.failed} · Ohne Wertung ${summary.withoutRating} · Ohne DSB-Verknüpfung ${summary.unlinked}`
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
                skipPauseRef.current = true;
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
      {pauseSecondsLeft != null && (
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <span>FIDE-Pause · weiter in {pauseSecondsLeft} s</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              skipPauseRef.current = true;
            }}
          >
            Jetzt fortsetzen
          </Button>
        </div>
      )}
    </div>
  );
}
