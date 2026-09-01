"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  updateParticipantDwz,
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
  const nextLineIdRef = useRef(0);
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = logContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [log]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [isRunning]);

  const appendLine = (level: LogLine["level"], text: string) => {
    setLog((lines) => [...lines, { id: nextLineIdRef.current++, level, text }]);
  };

  const pauseForThrottle = async () => {
    skipPauseRef.current = false;
    for (
      let remaining = FIDE_THROTTLE_PAUSE_SECONDS;
      remaining > 0;
      remaining--
    ) {
      if (skipPauseRef.current) {
        break;
      }
      setPauseSecondsLeft(remaining);
      await sleep(1000);
    }
    setPauseSecondsLeft(null);
  };

  const run = async () => {
    setIsRunning(true);
    setLog([]);
    setSummary(null);
    nextLineIdRef.current = 0;

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
        appendLine("error", `${entry.name} · keine DSB-Verknüpfung`);
      }

      appendLine(
        "muted",
        `Phase 1: DWZ über das DSB-Wertungsportal (${linked.length} Abfragen)`,
      );
      const fideCandidates: RatingEntry[] = unlinked.filter(
        (entry) => entry.fideId != null,
      );
      for (const [index, entry] of linked.entries()) {
        setProgress(`Phase 1 · ${index + 1}/${linked.length}`);
        const result = await updateParticipantDwz(entry.participantId);
        if (isError(result)) {
          mark(entry.participantId, "failed");
          appendLine("error", `${entry.name} · ${result.error}`);
        } else if (result.status === "dsbNotFound") {
          mark(entry.participantId, "failed");
          appendLine(
            "error",
            `${entry.name} · DSB-Person ${entry.dsbPersonId} nicht gefunden`,
          );
          if (entry.fideId) {
            fideCandidates.push(entry);
          }
        } else if (result.status === "noRating") {
          appendLine("error", `${entry.name} · beim DSB ohne Wertung`);
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
            fideCandidates.push(entry);
          }
        }
      }

      appendLine(
        "muted",
        `Phase 2: FIDE-Ratings, gedrosselt auf 1 Abfrage je ${FIDE_REQUEST_INTERVAL_MS / 1000} s (${fideCandidates.length} Abfragen)`,
      );
      let index = 0;
      while (index < fideCandidates.length) {
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
          appendLine("muted", `Pause beendet · weiter mit ${entry.name}`);
          continue;
        }
        if (isError(result)) {
          mark(entry.participantId, "failed");
          appendLine("error", `${entry.name} · ${result.error}`);
        } else if (result.status === "updated") {
          mark(entry.participantId, "wrote");
          appendLine(
            "normal",
            `${entry.name} · ${formatChange("FIDE", result.previousFideRating, result.fideRating)}`,
          );
        } else if (result.status === "error") {
          mark(entry.participantId, "failed");
          appendLine("error", `${entry.name} · FIDE-Abfrage fehlgeschlagen`);
        } else if (result.status === "notFound") {
          appendLine("error", `${entry.name} · FIDE-Profil nicht gefunden`);
        } else if (result.status === "noRating") {
          appendLine(
            "error",
            `${entry.name} · FIDE-Profil ohne Standard-Rating`,
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

      const result: Summary = {
        updated: 0,
        failed: 0,
        withoutRating: 0,
        unlinked: unlinked.length,
      };
      for (const entry of entries) {
        const outcome = outcomes.get(entry.participantId);
        if (outcome?.wrote) {
          result.updated++;
        } else if (outcome?.failed) {
          result.failed++;
        } else if (entry.dsbPersonId != null) {
          result.withoutRating++;
        }
      }
      setSummary(result);
      appendLine(
        "muted",
        `Fertig · ${result.updated} aktualisiert, ${result.failed} fehlgeschlagen, ${result.withoutRating} ohne Wertung, ${result.unlinked} ohne DSB-Verknüpfung`,
      );
      toast.info(
        `${result.updated} von ${entries.length} Wertungszahlen aktualisiert`,
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
        <Button
          onClick={run}
          disabled={isRunning}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRunning ? "animate-spin" : ""}`} />
          {isRunning ? "Wird aktualisiert..." : "Ratings aktualisieren"}
        </Button>
      </div>
      {log.length > 0 && (
        <div
          ref={logContainerRef}
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
