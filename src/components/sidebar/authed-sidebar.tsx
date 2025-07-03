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
import { Session, User } from "better-auth";

type Props = {
  stage: TournamentStage | undefined;
  session: Session;
};

export default function AuthedSidebar({ stage, session }: Props) {
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

      <SidebarFooter></SidebarFooter>
    </Sidebar>
  );
}
