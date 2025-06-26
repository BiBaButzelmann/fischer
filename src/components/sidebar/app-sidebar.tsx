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
import { NavUser } from "./nav-user";
import { NotepadTextIcon, SwordsIcon } from "lucide-react";
import { Suspense } from "react";
import NavAdmin from "./nav-admin";

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <p className="text-xl font-semibold px-2 py-2">fischer</p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Übersicht</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <Suspense fallback={null}>
                <NavAdmin />
              </Suspense>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/tournament">
                    <NotepadTextIcon />
                    <span>Turnierplan</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/my-games">
                    <SwordsIcon />
                    <span>Partien</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
