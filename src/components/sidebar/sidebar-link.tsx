"use client";

import Link from "next/link";
import { SidebarMenuButton } from "../ui/sidebar";
import { useSidebar } from "../ui/sidebar";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

type Props = {
  href: string;
  icon: LucideIcon;
  children: ReactNode;
  target?: string;
};

export function SidebarLink({ href, icon: Icon, children, target }: Props) {
  const { setOpenMobile, isMobile } = useSidebar();

  const handleClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <SidebarMenuButton asChild>
      <Link href={href} onClick={handleClick} target={target}>
        <Icon />
        <span>{children}</span>
      </Link>
    </SidebarMenuButton>
  );
}
