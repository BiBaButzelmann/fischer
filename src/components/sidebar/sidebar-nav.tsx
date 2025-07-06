import { TournamentStage } from "@/db/types/tournament";
import {
  CalendarIcon,
  SwordsIcon,
  UsersIcon,
  BookTextIcon,
  TrophyIcon,
} from "lucide-react";

export const navItems = {
  games: { href: "/partien", icon: <SwordsIcon />, label: "Partien" },
  calendar: { href: "/kalendar", icon: <CalendarIcon />, label: "Kalender" },
  ranking: {
    href: "/bestenliste",
    icon: <TrophyIcon />,
    label: "Bestenlisten",
  },
  roles: {
    href: "/anmeldung",
    icon: <UsersIcon />,
    label: "Anmeldung anpassen",
  },
  rules: {
    href: "/turnierordnung",
    icon: <BookTextIcon />,
    label: "Turnierordnung",
  },
} as const;

export type NavKey = keyof typeof navItems;

type BuildArgs = {
  authed: boolean;
  stage: TournamentStage | undefined;
};

export function buildNavKeys({ authed, stage }: BuildArgs): NavKey[] {
  const isActive = stage === "registration" || stage === "running";
  const keys: NavKey[] = ["games"];

  if (isActive) keys.push("calendar");
  keys.push("ranking");

  if (authed && stage === "registration") keys.push("roles");
  if (isActive) keys.push("rules");

  return keys;
}
