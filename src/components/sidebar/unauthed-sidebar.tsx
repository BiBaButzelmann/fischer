import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import { buildNavKeys, navItems } from "./sidebar-nav";
import { TournamentStage } from "@/db/types/tournament";

type Props = {
  stage: TournamentStage | undefined;
};

export default function UnauthedSidebar({ stage }: Props) {
  const menuKeys = buildNavKeys({ authed: false, stage });

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
    </Sidebar>
  );
}
