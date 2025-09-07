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
import {
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
import { Tournament } from "@/db/types/tournament";
import { Role } from "@/db/types/role";

type Props = {
  session: Session | null;
  tournament?: Tournament;
  userRoles: Role[];
};

export function AppSidebar({ session, tournament, userRoles }: Props) {
  const { setOpenMobile, isMobile } = useSidebar();

  const handleMobileMenuClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const stage = tournament?.stage;

  const isRegistrationOpen = stage === "registration";
  const isRunning = stage === "running";
  const isActive = stage === "registration" || stage === "running";

  const isAdmin = userRoles.includes("admin");
  const isParticipant = userRoles.includes("participant");
  const isMatchEnteringHelper = userRoles.includes("matchEnteringHelper");

  const canAccessMatchEntry = isAdmin || isParticipant || isMatchEnteringHelper;

  return (
    <Sidebar>
      <SidebarHeader>
        <Link
          className="inline-flex items-center gap-2"
          href="/uebersicht"
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
            <SidebarMenu>
              <SidebarLink href="/uebersicht" icon={LayoutDashboard}>
                Übersicht
              </SidebarLink>
              <SidebarLink href="/partien" icon={SwordsIcon}>
                Partien
              </SidebarLink>
              <SidebarLink href="/rangliste" icon={Medal}>
                Rangliste
              </SidebarLink>
              <SidebarLink href="/kalender" icon={CalendarIcon}>
                Kalender
              </SidebarLink>
              {isRunning && (
                <SidebarLink href="/partienverlegung" icon={CalendarClock}>
                  Partienverlegungen
                </SidebarLink>
              )}
              {isRunning && canAccessMatchEntry && (
                <SidebarLink href="/partieneingabe" icon={ClipboardEdit}>
                  Partieneingabe
                </SidebarLink>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {isActive ? (
          <SidebarGroup>
            <SidebarGroupLabel>Dokumente</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarLink
                  href="/ausschreibung"
                  icon={BookTextIcon}
                  target="_blank"
                >
                  Ausschreibung
                </SidebarLink>
                <SidebarLink
                  href="/turnierordnung"
                  icon={BookTextIcon}
                  target="_blank"
                >
                  Turnierordnung
                </SidebarLink>
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
              <SidebarLink href="/admin/tournament" icon={BinocularsIcon}>
                Turnier verwalten
              </SidebarLink>
              <SidebarLink
                href="/admin/nutzerverwaltung"
                icon={UserRoundCogIcon}
              >
                Nutzer verwalten
              </SidebarLink>
              <SidebarLink href="/admin/gruppen" icon={Users}>
                Gruppen verwalten
              </SidebarLink>
              <SidebarLink href="/admin/startgeld" icon={Euro}>
                Startgeld verwalten
              </SidebarLink>
              <SidebarLink href="/admin/paarungen" icon={Users}>
                Paarungen verwalten
              </SidebarLink>
              <SidebarLink href="/admin/spieltage" icon={CalendarIcon}>
                Spieltage verwalten
              </SidebarLink>
              <SidebarLink href="/admin/fide-bericht" icon={FileCheck}>
                Fide Bericht
              </SidebarLink>
              <SidebarLink href="/admin/namensschilder" icon={LayoutDashboard}>
                Namensschilder
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
