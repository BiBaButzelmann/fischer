"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  useSidebar,
} from "../ui/sidebar";
import Link from "next/link";
import { SidebarUserMenu } from "./sidebar-user-menu";
import { SidebarLink } from "./sidebar-link";
import { TournamentSwitcher } from "./tournament-switcher";
import {
  Award,
  BinocularsIcon,
  BookTextIcon,
  CalendarIcon,
  Euro,
  FileCheck,
  LayoutDashboard,
  Medal,
  SwordsIcon,
  UserRoundCogIcon,
  Users,
  ClipboardEdit,
  CalendarClock,
} from "lucide-react";
import { Button } from "../ui/button";
import Image from "next/image";
import { Session } from "@/types/auth";
import { TournamentStage } from "@/db/types/tournament";
import { Role } from "@/db/types/role";
import { tournamentPath } from "@/lib/navigation";
import { useTournamentSlug } from "@/hooks/use-tournament-slug";

type TournamentItem = {
  id: number;
  name: string;
  slug: string;
  stage: TournamentStage;
};

type Props = {
  session: Session | null;
  tournaments: TournamentItem[];
  userRoles: Role[];
  documentAvailability: { ausschreibung: boolean; turnierordnung: boolean };
};

export function AppSidebar({ session, tournaments, userRoles, documentAvailability }: Props) {
  const { setOpenMobile, isMobile } = useSidebar();

  const handleMobileMenuClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const slug = useTournamentSlug();
  const selectedTournament =
    tournaments.find((tournament) => tournament.slug === slug) ?? tournaments[0];
  const stage = selectedTournament?.stage;

  const isRegistrationOpen = stage === "registration";
  const isRunning = stage === "running";
  const isActive = stage === "registration" || stage === "running";
  const isDone = stage === "done";

  const isAdmin = userRoles.includes("admin");
  const isParticipant = userRoles.includes("participant");
  const isMatchEnteringHelper = userRoles.includes("matchEnteringHelper");
  const isSetupHelper = userRoles.includes("setupHelper");
  const isReferee = userRoles.includes("referee");

  const canAccessMatchEntry = isAdmin || isParticipant || isMatchEnteringHelper;
  const canAccessPostponements = isAdmin || isParticipant;

  return (
    <Sidebar>
      <SidebarHeader>
        <Link
          className="inline-flex items-center gap-2"
          href={tournamentPath(slug, "/uebersicht")}
          onClick={handleMobileMenuClick}
        >
          <Image
            src="/logo.webp"
            alt="HSK 1830 Logo"
            width={40}
            height={48}
            className="object-contain"
          />
          <p className="text-xl font-semibold px-2 py-2">Klubturnier</p>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Turnier</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-2 pb-2">
              <TournamentSwitcher tournaments={tournaments} />
            </div>
            <SidebarMenu>
              <SidebarLink
                href={tournamentPath(slug, "/uebersicht")}
                icon={LayoutDashboard}
              >
                Übersicht
              </SidebarLink>
              <SidebarLink
                href={tournamentPath(slug, "/partien")}
                icon={SwordsIcon}
              >
                Partien
              </SidebarLink>
              <SidebarLink
                href={tournamentPath(slug, "/rangliste")}
                icon={Medal}
              >
                Rangliste
              </SidebarLink>
              {!isDone && (
                <SidebarLink
                  href={tournamentPath(slug, "/kalender")}
                  icon={CalendarIcon}
                >
                  Kalender
                </SidebarLink>
              )}
              {isRunning && (isSetupHelper || isReferee) && (
                <SidebarLink
                  href={tournamentPath(slug, "/terminuebersicht")}
                  icon={CalendarClock}
                >
                  Terminübersicht
                </SidebarLink>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {isRunning && canAccessPostponements && (
          <SidebarGroup>
            <SidebarGroupLabel>Spieler</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarLink
                  href={tournamentPath(slug, "/partienverlegung")}
                  icon={CalendarClock}
                >
                  Partienverlegungen
                </SidebarLink>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        {isRunning && canAccessMatchEntry && (
          <SidebarGroup>
            <SidebarGroupLabel>Eingabehelfer</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarLink
                  href={tournamentPath(slug, "/partieneingabe")}
                  icon={ClipboardEdit}
                >
                  Partieneingabe
                </SidebarLink>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        {isActive ? (
          <SidebarGroup>
            <SidebarGroupLabel>Dokumente</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {documentAvailability.ausschreibung ? (
                  <SidebarLink
                    href={tournamentPath(slug, "/ausschreibung")}
                    icon={BookTextIcon}
                    target="_blank"
                  >
                    Ausschreibung
                  </SidebarLink>
                ) : null}
                {documentAvailability.turnierordnung ? (
                  <SidebarLink
                    href={tournamentPath(slug, "/turnierordnung")}
                    icon={BookTextIcon}
                    target="_blank"
                  >
                    Turnierordnung
                  </SidebarLink>
                ) : null}
                <SidebarLink
                  href="/anleitung"
                  icon={BookTextIcon}
                  target="_blank"
                >
                  Anleitung Webseite
                </SidebarLink>
                <SidebarLink href="/uhren" icon={BookTextIcon} target="_blank">
                  Anleitung Schachuhren
                </SidebarLink>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}
        {isAdmin ? (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarLink
                href={tournamentPath(slug, "/admin/tournament")}
                icon={BinocularsIcon}
              >
                Turnier verwalten
              </SidebarLink>
              <SidebarLink
                href={tournamentPath(slug, "/admin/nutzerverwaltung")}
                icon={UserRoundCogIcon}
              >
                Nutzer verwalten
              </SidebarLink>
              <SidebarLink
                href={tournamentPath(slug, "/admin/gruppen")}
                icon={Users}
              >
                Gruppen verwalten
              </SidebarLink>
              <SidebarLink
                href={tournamentPath(slug, "/admin/paarungen")}
                icon={Users}
              >
                Paarungen verwalten
              </SidebarLink>
              <SidebarLink
                href={tournamentPath(slug, "/admin/spieltage")}
                icon={CalendarIcon}
              >
                Spieltage verwalten
              </SidebarLink>
              <SidebarLink
                href={tournamentPath(slug, "/admin/fide-bericht")}
                icon={FileCheck}
              >
                Fide Bericht
              </SidebarLink>
              <SidebarLink
                href={tournamentPath(slug, "/admin/dwz-bericht")}
                icon={FileCheck}
              >
                DWZ Bericht
              </SidebarLink>
              <SidebarLink
                href={tournamentPath(slug, "/admin/startgeld")}
                icon={Euro}
              >
                Startgeld verwalten
              </SidebarLink>
              <SidebarLink
                href={tournamentPath(slug, "/admin/namensschilder")}
                icon={LayoutDashboard}
              >
                Namensschilder
              </SidebarLink>
              <SidebarLink
                href={tournamentPath(slug, "/admin/urkunden")}
                icon={Award}
              >
                Urkunden
              </SidebarLink>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}
      </SidebarContent>
      <SidebarFooter>
        {isRegistrationOpen && session ? (
          <Button asChild>
            <Link href="/klubturnier-anmeldung" onClick={handleMobileMenuClick}>
              Anmeldung anpassen
            </Link>
          </Button>
        ) : null}
        {isRegistrationOpen && !session ? (
          <Button asChild>
            <Link href="/registrieren" onClick={handleMobileMenuClick}>
              Registrieren
            </Link>
          </Button>
        ) : null}
        {isRunning && !session ? (
          <Button asChild>
            <Link href="/anmelden" onClick={handleMobileMenuClick}>
              Anmelden
            </Link>
          </Button>
        ) : null}
        {session ? <SidebarUserMenu session={session} /> : null}
      </SidebarFooter>
    </Sidebar>
  );
}
