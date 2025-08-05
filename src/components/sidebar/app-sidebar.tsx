import { getActiveTournament } from "@/db/repositories/tournament";
import { auth } from "@/auth/utils";
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
} from "../ui/sidebar";
import Link from "next/link";
import { SidebarUserMenu } from "./sidebar-user-menu";
import {
  BinocularsIcon,
  BookTextIcon,
  CalendarIcon,
  FileCheck,
  LayoutDashboard,
  SwordsIcon,
  Trophy,
  UserRoundCogIcon,
  Users,
} from "lucide-react";
import { Button } from "../ui/button";
import Image from "next/image";

export async function AppSidebar() {
  const session = await auth();
  const tournament = await getActiveTournament();

  const stage = tournament?.stage;

  const isRegistrationOpen = stage === "registration";
  const isRunning = stage === "running";
  const isActive = stage === "registration" || stage === "running";
  const isAdmin = session?.user.role === "admin";

  return (
    <Sidebar>
      <SidebarHeader>
        <Link className="inline-flex items-center gap-2" href="/uebersicht">
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
                <Link href="/uebersicht">
                  <LayoutDashboard />
                  <p className="mt-1">Übersicht</p>
                </Link>
              </SidebarMenuButton>
              <SidebarMenuButton asChild>
                <Link href="/partien">
                  <SwordsIcon />
                  <span>Partien</span>
                </Link>
              </SidebarMenuButton>
              <SidebarMenuButton asChild>
                <Link href="/ergebnisse">
                  <Trophy />
                  <span>Ergebnisse</span>
                </Link>
              </SidebarMenuButton>
              {session != null ? (
                <SidebarMenuButton asChild>
                  <Link href="/kalender">
                    <CalendarIcon />
                    <span>Kalender</span>
                  </Link>
                </SidebarMenuButton>
              ) : null}
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
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}
        {isAdmin ? (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenuButton asChild>
                <Link href="/admin/nutzerverwaltung">
                  <UserRoundCogIcon />
                  <span>Nutzer verwalten</span>
                </Link>
              </SidebarMenuButton>
              <SidebarMenuButton asChild>
                <Link href="/admin/tournament">
                  <BinocularsIcon />
                  <span>Turnier verwalten</span>
                </Link>
              </SidebarMenuButton>
              <SidebarMenuButton asChild>
                <Link href="/admin/gruppen">
                  <Users />
                  <span>Gruppen verwalten</span>
                </Link>
              </SidebarMenuButton>
              <SidebarMenuButton asChild>
                <Link href="/admin/paarungen">
                  <Users />
                  <span>Paarungen verwalten</span>
                </Link>
              </SidebarMenuButton>
              <SidebarMenuButton asChild>
                <Link href="/admin/spieltage">
                  <Users />
                  <span>Spieltage verwalten</span>
                </Link>
              </SidebarMenuButton>

              <SidebarMenuButton asChild>
                <Link href="/admin/eingabehelfer">
                  <Users />
                  <span>Eingabehelfer verwalten</span>
                </Link>
              </SidebarMenuButton>
              <SidebarMenuButton asChild>
                <Link href="/admin/fide-bericht">
                  <FileCheck />
                  <span>Fide Bericht</span>
                </Link>
              </SidebarMenuButton>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}
      </SidebarContent>
      <SidebarFooter>
        {isRegistrationOpen && session ? (
          <Button asChild>
            <Link href="/klubturnier-anmeldung">Anmeldung anpassen</Link>
          </Button>
        ) : null}
        {isRegistrationOpen && !session ? (
          <Button asChild>
            <Link href="/registrieren">Registrieren</Link>
          </Button>
        ) : null}
        {isRunning && !session ? (
          <Button asChild>
            <Link href="/anmelden">Anmelden</Link>
          </Button>
        ) : null}
        {session ? <SidebarUserMenu session={session} /> : null}
      </SidebarFooter>
    </Sidebar>
  );
}
