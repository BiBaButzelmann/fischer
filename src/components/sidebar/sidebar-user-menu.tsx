"use client";

import { UserView } from "@daveyplate/better-auth-ui";
import { ChevronsUpDown, LogOutIcon, SettingsIcon } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { auth } from "@/auth";
import { useSidebar } from "../ui/sidebar";

export function SidebarUserMenu({
  session,
}: {
  session: typeof auth.$Infer.Session;
}) {
  const { setOpenMobile, isMobile } = useSidebar();

  const handleMobileMenuClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };
  return (
    <div className="flex flex-col gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="!p-2 h-fit bg-gray-100 hover:bg-secondary hover:text-sidebar-foreground">
            <UserView
              classNames={{ base: "text-gray-700" }}
              user={session.user}
            />

            <ChevronsUpDown className="ml-auto text-gray-500" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-[--radix-dropdown-menu-trigger-width] min-w-56 max-w-64"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <div className="p-2">
            <UserView user={session.user} />
          </div>

          <DropdownMenuSeparator />

          <Link href="/einstellungen" onClick={handleMobileMenuClick}>
            <DropdownMenuItem>
              <>
                <SettingsIcon />
                Einstellungen
              </>
            </DropdownMenuItem>
          </Link>

          <Link href="/ausloggen" onClick={handleMobileMenuClick}>
            <DropdownMenuItem>
              <LogOutIcon />
              Ausloggen
            </DropdownMenuItem>
          </Link>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
