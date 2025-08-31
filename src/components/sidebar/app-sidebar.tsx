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
  SidebarMenuButton,
  useSidebar,
} from "../ui/sidebar";
import Link from "next/link";
import { SidebarUserMenu } from "./sidebar-user-menu";
import {
  BinocularsIcon,
  BookTextIcon,
  CalendarIcon,
  FileCheck,
  LayoutDashboard,
  Medal,
  SwordsIcon,
  UserRoundCogIcon,
  Users,
} from "lucide-react";
import { Button } from "../ui/button";
import Image from "next/image";
import { auth } from "@/auth";
import { Tournament } from "@/db/types/tournament";

type Props = {
  session: typeof auth.$Infer.Session;
  tournament?: Tournament;
};

export function AppSidebar({ session, tournament }: Props) {
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
  const isAdmin = session?.user.role === "admin";

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
              <SidebarMenuButton asChild>
                <Link href="/uebersicht" onClick={handleMobileMenuClick}>
                  <LayoutDashboard />
                  <p className="mt-1">Übersicht</p>
                </Link>
              </SidebarMenuButton>
              <SidebarMenuButton asChild>
                <Link href="/partien" onClick={handleMobileMenuClick}>
                  <SwordsIcon />
                  <span>Partien</span>
                </Link>
              </SidebarMenuButton>
              <SidebarMenuButton asChild>
                <Link href="/rangliste" onClick={handleMobileMenuClick}>
                  <Medal />
                  <span>Rangliste</span>
                </Link>
              </SidebarMenuButton>
              <SidebarMenuButton asChild>
                <Link href="/kalender" onClick={handleMobileMenuClick}>
                  <CalendarIcon />
                  <span>Kalender</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {isActive ? (
          <SidebarGroup>
            <SidebarGroupLabel>Dokumente</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuButton asChild>
                  <Link href="/ausschreibung" target="_blank">
                    <BookTextIcon />
                    <span>Ausschreibung</span>
                  </Link>
                </SidebarMenuButton>
                <SidebarMenuButton asChild>
                  <Link href="/turnierordnung" target="_blank">
                    <BookTextIcon />
                    <span>Turnierordnung</span>
                  </Link>
                </SidebarMenuButton>
                <SidebarMenuButton asChild>
                  <Link href="/anleitung" target="_blank">
                    <BookTextIcon />
                    <span>Anleitung Webseite</span>
                  </Link>
                </SidebarMenuButton>
                <SidebarMenuButton asChild>
                  <Link href="/uhren" target="_blank">
                    <BookTextIcon />
                    <span>Anleitung Schachuhren</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}
        {isAdmin ? (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenuButton asChild>
                <Link href="/admin/tournament" onClick={handleMobileMenuClick}>
                  <BinocularsIcon />
                  <span>Turnier verwalten</span>
                </Link>
              </SidebarMenuButton>
              <SidebarMenuButton asChild>
                <Link
                  href="/admin/nutzerverwaltung"
                  onClick={handleMobileMenuClick}
                >
                  <UserRoundCogIcon />
                  <span>Nutzer verwalten</span>
                </Link>
              </SidebarMenuButton>
              <SidebarMenuButton asChild>
                <Link href="/admin/gruppen" onClick={handleMobileMenuClick}>
                  <Users />
                  <span>Gruppen verwalten</span>
                </Link>
              </SidebarMenuButton>
              <SidebarMenuButton asChild>
                <Link href="/admin/paarungen" onClick={handleMobileMenuClick}>
                  <Users />
                  <span>Paarungen verwalten</span>
                </Link>
              </SidebarMenuButton>
              <SidebarMenuButton asChild>
                <Link href="/admin/spieltage" onClick={handleMobileMenuClick}>
                  <CalendarIcon />
                  <span>Spieltage verwalten</span>
                </Link>
              </SidebarMenuButton>
              <SidebarMenuButton asChild>
                <Link
                  href="/admin/fide-bericht"
                  onClick={handleMobileMenuClick}
                >
                  <FileCheck />
                  <span>Fide Bericht</span>
                </Link>
              </SidebarMenuButton>
              <SidebarMenuButton asChild>
                <Link
                  href="/admin/namensschilder"
                  onClick={handleMobileMenuClick}
                >
                  <LayoutDashboard />
                  <p className="mt-1">Namensschilder</p>
                </Link>
              </SidebarMenuButton>
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
