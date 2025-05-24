"use client";

import { authClient } from "@/auth-client";
import { Button } from "./ui/button";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
} from "./ui/sidebar";

export function AppSidebar() {
    const handleClick = async () => {
        await authClient.signOut();
    };

    return (
        <Sidebar>
            <SidebarHeader>
                <p className="text-lg font-semibold px-4 py-2">fischer</p>
            </SidebarHeader>
            <SidebarContent></SidebarContent>
            <SidebarFooter>
                <Button onClick={handleClick}>Ausloggen</Button>
            </SidebarFooter>
        </Sidebar>
    );
}
