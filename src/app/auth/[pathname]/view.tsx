"use client";

import { AuthCard } from "@daveyplate/better-auth-ui";

export function AuthView({ pathname }: { pathname: string }) {
  if (pathname === "settings") {
    return (
      <main className="w-full p-4">
        <AuthCard pathname={pathname} />
      </main>
    );
  }

  if (pathname === "signup") {
    return (
      <main className="flex h-screen w-screen items-center justify-center">
        <AuthCard callbackURL="/profile/create" pathname={pathname} />
      </main>
    );
  }

  return (
    <main className="flex h-screen w-screen items-center justify-center">
      <AuthCard callbackURL="" pathname={pathname} />
    </main>
  );
}
