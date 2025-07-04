import { createAuthClient } from "better-auth/react";
import { UserButton } from "@daveyplate/better-auth-ui";

export function NavUser() {
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
