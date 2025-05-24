"use client";

import { createAuthClient } from "better-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import { UserButton } from "@daveyplate/better-auth-ui";

const { useSession, signOut } = createAuthClient();

export function NavUser() {
    const session = useSession();

    const handleLogout = async () => {
        await signOut();
    };

    if (session.data == null) {
        return (
            <div className="flex flex-col gap-2">
                <div className="flex items-center space-x-4 w-full">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-grow">
                        <Skeleton className="h-4" />
                        <Skeleton className="h-4" />
                    </div>
                </div>
            </div>
        );
    }

    const user = session.data.user;

    return (
        <div className="flex flex-col gap-2">
            <UserButton
                size="full"
                localization={{
                    settings: "Einstellungen",
                    signOut: "Ausloggen",
                }}
                className="hover:bg-secondary hover:text-sidebar-foreground"
            />
        </div>
    );
}
