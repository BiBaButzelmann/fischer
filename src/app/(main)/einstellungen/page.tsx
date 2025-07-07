import { authWithRedirect } from "@/auth/utils";
import { Button } from "@/components/ui/button";
import { getProfileByUserId } from "@/db/repositories/profile";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await authWithRedirect();
  const profile = await getProfileByUserId(session.user.id);
  if (!profile) {
    redirect("/willkommen");
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-lg">
        <Button variant="ghost" asChild>
          <a href="/uebersicht" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Zurück zur Übersicht
          </a>
        </Button>
      </div>
    </div>
  );
}
