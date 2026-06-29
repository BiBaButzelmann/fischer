import { DayOfWeek } from "@/db/types/group";
import { ParticipantWithName } from "@/db/types/participant";
import { averageTwz, sortParticipantsByTwz } from "@/lib/twz";

export type DistributableGroup = {
  id: number;
  groupNumber: number;
  tier: number | null;
  dayOfWeek: DayOfWeek | null;
  participants: ParticipantWithName[];
};

type WorkingGroup = {
  group: DistributableGroup;
  members: ParticipantWithName[];
  added: ParticipantWithName[];
  remaining: number;
  tierKey: number;
};

function availableDays(participant: ParticipantWithName): Set<DayOfWeek> {
  return new Set<DayOfWeek>([
    participant.preferredMatchDay,
    ...participant.secondaryMatchDays,
  ]);
}

/**
 * Wählt unter gleichwertigen Gruppen: wenigste Mitglieder → niedrigster
 * TWZ-Schnitt (Gruppe ohne bewertete Mitglieder zuerst) → kleinste groupNumber.
 */
function pickByBalance(groups: WorkingGroup[]): WorkingGroup {
  return groups.reduce((best, candidate) => {
    if (candidate.members.length !== best.members.length) {
      return candidate.members.length < best.members.length ? candidate : best;
    }
    const candidateAvg = averageTwz(candidate.members) ?? -Infinity;
    const bestAvg = averageTwz(best.members) ?? -Infinity;
    if (candidateAvg !== bestAvg) {
      return candidateAvg < bestAvg ? candidate : best;
    }
    return candidate.group.groupNumber < best.group.groupNumber
      ? candidate
      : best;
  });
}

/**
 * Verteilt unverteilte Teilnehmer auf die Gruppen (Turnierordnung 2026 §4.1):
 * Tag = harte Bedingung, stärkstmögliche Klasse (Tier) zuerst, innerhalb der
 * Klasse bevorzugter Tag vor sekundären, dann Balance (Größe, dann TWZ-Schnitt).
 * Reine Funktion – mutiert die Eingaben nicht.
 */
export function distributeParticipantsByTwzAndDay({
  groups,
  unassigned,
  participantsPerGroup,
}: {
  groups: DistributableGroup[];
  unassigned: ParticipantWithName[];
  participantsPerGroup: number;
}): {
  assignmentsByGroupId: Map<number, ParticipantWithName[]>;
  newUnassigned: ParticipantWithName[];
} {
  const working: WorkingGroup[] = groups.map((group) => ({
    group,
    members: [...group.participants],
    added: [],
    remaining: Math.max(0, participantsPerGroup - group.participants.length),
    tierKey: group.tier ?? Number.POSITIVE_INFINITY,
  }));

  const newUnassigned: ParticipantWithName[] = [];

  for (const player of sortParticipantsByTwz(unassigned)) {
    const days = availableDays(player);

    const candidates = working.filter(
      (w) =>
        w.remaining > 0 &&
        (w.group.dayOfWeek === null || days.has(w.group.dayOfWeek)),
    );
    if (candidates.length === 0) {
      newUnassigned.push(player);
      continue;
    }

    const targetTier = Math.min(...candidates.map((w) => w.tierKey));
    const tierCands = candidates.filter((w) => w.tierKey === targetTier);

    const preferred = tierCands.filter(
      (w) => w.group.dayOfWeek === player.preferredMatchDay,
    );
    const secondary = tierCands.filter(
      (w) =>
        w.group.dayOfWeek !== null &&
        w.group.dayOfWeek !== player.preferredMatchDay &&
        days.has(w.group.dayOfWeek),
    );
    const wildcard = tierCands.filter((w) => w.group.dayOfWeek === null);
    const bucket = preferred.length
      ? preferred
      : secondary.length
        ? secondary
        : wildcard;

    const chosen = pickByBalance(bucket);
    chosen.members.push(player);
    chosen.added.push(player);
    chosen.remaining -= 1;
  }

  const assignmentsByGroupId = new Map<number, ParticipantWithName[]>();
  for (const w of working) {
    if (w.added.length > 0) {
      assignmentsByGroupId.set(w.group.id, w.added);
    }
  }

  return { assignmentsByGroupId, newUnassigned };
}
