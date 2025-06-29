import { auth } from "@/auth/utils";
import { ParticipateForm } from "@/components/roles/forms/participate-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getParticipantByProfileId } from "@/db/repositories/participant";
import { getProfileByUserId } from "@/db/repositories/profile";
import { getActiveTournament } from "@/db/repositories/tournament";
import { ArrowLeft, Trophy } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function RegisterPage() {
  const session = await auth();

  const activeTournament = await getActiveTournament();
  if (activeTournament?.stage !== "registration") {
    redirect("/willkommen");
  }

  const currentProfile = await getProfileByUserId(session.user.id);
  if (currentProfile != null) {
    const p = await getParticipantByProfileId(currentProfile.id);
    if (p != null) {
      redirect("/home");
    }
  }

  return (
    <div className="w-full max-w-4xl px-4 py-8 mx-auto">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/willkommen" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Zurück zur Startseite
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
            <Trophy className="h-6 w-6 text-yellow-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Turnieranmeldung</CardTitle>
          <CardDescription>
            Vervollständigen Sie Ihre Anmeldung für das HSK Klubturnier
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-3">
          <ParticipateForm
            tournamentId={activeTournament.id}
            profile={currentProfile}
          />
        </CardContent>
      </Card>
    </div>
  );
}
