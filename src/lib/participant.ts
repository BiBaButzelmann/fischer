export function getParticipantFullName(participant: {
  profile: {
    firstName: string;
    lastName: string;
  };
}) {
  return getFullName(
    participant.profile.firstName,
    participant.profile.lastName,
  );
}

export function getFullName(firstName: string, lastName: string) {
  return `${firstName} ${lastName}`;
}
