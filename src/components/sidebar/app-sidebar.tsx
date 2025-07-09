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
  SwordsIcon,
  UsersIcon,
} from "lucide-react";

export async function AppSidebar() {
  const session = await auth();
  const tournament = await getActiveTournament();

  const stage = tournament?.stage;
  const isRegistration = stage === "registration";
  const isActive = stage === "registration" || stage === "running";
  const isAdmin = session?.user.role === "admin";

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/uebersicht">
          <p className="text-xl font-semibold px-2 py-2">Klubturnier</p>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {isRegistration && session ? (
          <SidebarGroup>
            <SidebarGroupLabel>Registrierung</SidebarGroupLabel>
            <SidebarMenuButton asChild>
              <Link href="/klubturnier-anmeldung">
                <UsersIcon />
                {/*TODO: Farblich hervorheben*/}
                <span>Anmeldung anpassen</span>
              </Link>
            </SidebarMenuButton>
          </SidebarGroup>
        ) : null}

        <SidebarGroup>
          <SidebarGroupLabel>Turnier</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuButton asChild>
                <Link href="/partien">
                  <SwordsIcon />
                  <span>Partien</span>
                </Link>
              </SidebarMenuButton>
              <SidebarMenuButton asChild>
                <Link href="/kalendar">
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
                  <Link href="/ausschreibung">
                    <BookTextIcon />
                    <span>Ausschreibung</span>
                  </Link>
                </SidebarMenuButton>
                <SidebarMenuButton asChild>
                  <Link href="/turnierordnung">
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
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}
      </SidebarContent>
      {session ? (
        <SidebarFooter>
          <SidebarUserMenu session={session} />
        </SidebarFooter>
      ) : null}
    </Sidebar>
  );
}
