import { getActiveTournament } from "@/db/repositories/tournament";
import { auth } from "@/auth/utils";
import { getRolesByUserId } from "@/db/repositories/role";
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
  Medal,
  SwordsIcon,
  UserRoundCogIcon,
  Users,
  ClipboardEdit,
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

  const userRoles = session ? await getRolesByUserId(session.user.id) : [];
  const canAccessMatchEntry = userRoles.some((role) =>
    ["participant", "matchEnteringHelper", "admin"].includes(role),
  );

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
                <Link href="/rangliste">
                  <Medal />
                  <span>Rangliste</span>
                </Link>
              </SidebarMenuButton>
              <SidebarMenuButton asChild>
                <Link href="/kalender">
                  <CalendarIcon />
                  <span>Kalender</span>
                </Link>
              </SidebarMenuButton>
              {canAccessMatchEntry && isRunning && (
                <SidebarMenuButton asChild>
                  <Link href="/partieneingabe">
                    <ClipboardEdit />
                    <span>Partieneingabe</span>
                  </Link>
                </SidebarMenuButton>
              )}
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
                <Link href="/admin/tournament">
                  <BinocularsIcon />
                  <span>Turnier verwalten</span>
                </Link>
              </SidebarMenuButton>
              <SidebarMenuButton asChild>
                <Link href="/admin/nutzerverwaltung">
                  <UserRoundCogIcon />
                  <span>Nutzer verwalten</span>
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
                  <CalendarIcon />
                  <span>Spieltage verwalten</span>
                </Link>
              </SidebarMenuButton>
              <SidebarMenuButton asChild>
                <Link href="/admin/fide-bericht">
                  <FileCheck />
                  <span>Fide Bericht</span>
                </Link>
              </SidebarMenuButton>
              <SidebarMenuButton asChild>
                <Link href="/admin/namensschilder">
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
