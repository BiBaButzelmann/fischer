import { GroupRef } from "@/db/types/group";
import { compareByName } from "@/lib/participant";

type GroupedParticipant = {
  profile: { firstName: string; lastName: string };
  group: { group: GroupRef } | null;
};

export type ParticipantSection<T> = {
  group: GroupRef | null;
  participants: T[];
};

export function groupParticipantsByStrength<T extends GroupedParticipant>(
  participants: T[],
): ParticipantSection<T>[] {
  const sections = new Map<number | null, ParticipantSection<T>>();
  for (const participant of participants) {
    const group = participant.group?.group ?? null;
    const key = group?.id ?? null;
    const section = sections.get(key) ?? { group, participants: [] };
    section.participants.push(participant);
    sections.set(key, section);
  }

  return [...sections.values()]
    .map((section) => ({
      group: section.group,
      participants: [...section.participants].sort((a, b) =>
        compareByName(a.profile, b.profile),
      ),
    }))
    .sort((a, b) => compareGroupsByStrength(a.group, b.group));
}

function compareGroupsByStrength(a: GroupRef | null, b: GroupRef | null) {
  if (a === null || b === null) {
    return Number(a === null) - Number(b === null);
  }
  if (a.tier !== b.tier) {
    if (a.tier === null) return 1;
    if (b.tier === null) return -1;
    return a.tier - b.tier;
  }
  return a.groupNumber - b.groupNumber;
}

type SearchableProfile = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
};

function normalizeForSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replaceAll("ß", "ss");
}

export function matchesSearch(profile: SearchableProfile, query: string) {
  const words = normalizeForSearch(query).split(/\s+/).filter(Boolean);
  const text = normalizeForSearch(
    `${profile.firstName} ${profile.lastName} ${profile.email}`,
  );
  const phoneDigits = profile.phoneNumber.replace(/\D/g, "");

  return words.every(
    (word) =>
      text.includes(word) ||
      (/\d/.test(word) && phoneDigits.includes(word.replace(/\D/g, ""))),
  );
}
