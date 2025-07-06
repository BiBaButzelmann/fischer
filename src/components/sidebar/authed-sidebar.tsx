import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import { buildNavKeys, navItems } from "./sidebar-nav";
import NavAdmin from "./nav-admin";
import { TournamentStage } from "@/db/types/tournament";
import { auth } from "@/auth";
import { NavUser } from "./nav-user";

type Props = {
  session: typeof auth.$Infer.Session;
  stage: TournamentStage | undefined;
};

export default async function AuthedSidebar({ session, stage }: Props) {
  const menuKeys = buildNavKeys({ authed: true, stage });

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/uebersicht">
          <p className="text-xl font-semibold px-2 py-2">Klubturnier</p>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <NavAdmin />

              {menuKeys.map((key) => {
                const item = navItems[key];
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild>
                      <Link href={item.href}>
                        {item.icon}
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="px-2">
        <NavUser session={session} />
      </SidebarFooter>
    </Sidebar>
  );
}
