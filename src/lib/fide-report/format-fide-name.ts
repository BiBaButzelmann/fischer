import { toFideSpelling } from "@/lib/fide/spelling";

export function formatPlayerName(firstName: string, lastName: string, title?: string | null) {
  const formattedName = `${toFideSpelling(lastName.trim())},${toFideSpelling(firstName.trim())}`;
  return title ? `${formattedName},${title}` : formattedName;
}

export function formatRefereeName(firstName: string, lastName: string) {
  return `${toFideSpelling(firstName.trim())} ${toFideSpelling(lastName.trim())}`;
}
