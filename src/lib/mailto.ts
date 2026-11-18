function encodeAddress(address: string) {
  return encodeURIComponent(address).replaceAll("%40", "@");
}

export function buildMailtoHref({
  to,
  subject,
}: {
  to: string[];
  subject?: string;
}) {
  const recipients = to.map(encodeAddress).join(",");
  return subject
    ? `mailto:${recipients}?subject=${encodeURIComponent(subject)}`
    : `mailto:${recipients}`;
}
