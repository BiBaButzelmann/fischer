import Link from "next/link";
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
  SidebarMenuItem,
} from "../ui/sidebar";
import { buildNavKeys, navItems } from "./sidebar-nav";
import NavAdmin from "./nav-admin";
import { TournamentStage } from "@/db/types/tournament";
import { NavUser } from "./nav-user";
import { auth } from "@/auth/utils";

type Props = {
  stage: TournamentStage | undefined;
};

export default async function AuthedSidebar({ stage }: Props) {
  const session = await auth();
  const menuKeys = buildNavKeys({ authed: true, stage });

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/home">
          <p className="text-xl font-semibold px-2 py-2">fischer</p>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Übersicht</SidebarGroupLabel>
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
      {session != null ? (
        <SidebarFooter className="px-2">
          <NavUser session={session} />
        </SidebarFooter>
      ) : null}
    </Sidebar>
  );
}
