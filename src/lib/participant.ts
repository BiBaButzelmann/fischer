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

export function getFullNameWithTitle(
  title: string | null,
  firstName: string,
  lastName: string,
) {
  return `${title ? `${title} ` : ""}${getFullName(firstName, lastName)}`;
}

export function compareByName(
  a: { firstName: string; lastName: string },
  b: { firstName: string; lastName: string },
) {
  return (
    a.lastName.localeCompare(b.lastName, "de") ||
    a.firstName.localeCompare(b.firstName, "de")
  );
}
