"use client";

import { AuthCard } from "@daveyplate/better-auth-ui";

export function AuthView({ pathname }: { pathname: string }) {
    return (
        <main className="flex h-screen w-screen items-center justify-center">
            <AuthCard pathname={pathname} />
        </main>
    );
}
