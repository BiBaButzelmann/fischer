import { ParticipantWithName } from "@/db/types/participant";

export function getParticipantFullName(participant: ParticipantWithName) {
  return `${participant.profile.firstName} ${participant.profile.lastName}`;
}
