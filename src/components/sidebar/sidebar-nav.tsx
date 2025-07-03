import { TournamentStage } from "@/db/types/tournament";
import {
  CalendarIcon,
  SwordsIcon,
  UsersIcon,
  UserIcon,
  BookTextIcon,
  TrophyIcon,
} from "lucide-react";

export const navItems = {
  games: { href: "/my-games", icon: <SwordsIcon />, label: "Partien" },
  calendar: { href: "/calendar", icon: <CalendarIcon />, label: "Kalender" },
  ranking: {
    href: "/bestenliste",
    icon: <TrophyIcon />,
    label: "Bestenlisten",
  },
  roles: {
    href: "/anmeldung",
    icon: <UsersIcon />,
    label: "Rollen bearbeiten",
  },
  rules: {
    href: "/turnierordnung",
    icon: <BookTextIcon />,
    label: "Turnierordnung",
  },
  profile: {
    href: "/profile",
    icon: <UserIcon />,
    label: "Profileinstellungen",
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
  if (authed) keys.push("profile");

  return keys;
}
