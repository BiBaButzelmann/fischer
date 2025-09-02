export function getParticipantFullName(participant: {
  profile: {
    firstName: string;
    lastName: string;
  };
}) {
  return `${participant.profile.firstName} ${participant.profile.lastName}`;
}
