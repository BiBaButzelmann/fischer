import { createAuthClient } from "better-auth/react";
import { Skeleton } from "../ui/skeleton";
import { UserButton } from "@daveyplate/better-auth-ui";
import { UserIcon } from "lucide-react";

const { useSession } = createAuthClient();

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
