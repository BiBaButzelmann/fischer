"use client";

import { createAuthClient } from "better-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";

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
                <Button disabled>Ausloggen</Button>
            </div>
        );
    }

    const user = session.data.user;

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center space-x-4 w-full text-left text-sm">
                <Avatar className="h-12 w-12 rounded-full">
                    <AvatarImage src={user.image ?? ""} alt={user.name} />
                    <AvatarFallback className="rounded-lg">
                        {user.name.charAt(0)}
                    </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.name}</span>
                    <span className="truncate text-xs">{user.email}</span>
                </div>
            </div>
            <Button onClick={handleLogout}>Ausloggen</Button>
        </div>
    );
}
