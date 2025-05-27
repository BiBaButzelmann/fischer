import { auth } from "@/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";
import { BinocularsIcon } from "lucide-react";

export default async function NavAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user.role != "admin") {
    return null;
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <Link href="/admin/tournament">
          <BinocularsIcon />
          <span>Turnier verwalten</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
