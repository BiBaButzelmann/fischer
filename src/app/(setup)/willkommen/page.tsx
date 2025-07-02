import { auth } from "@/auth/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getRolesByUserId } from "@/db/repositories/role";
import { getLatestTournament } from "@/db/repositories/tournament";
import { ChevronRight, Eye, LogIn, UserPlus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Page() {
  const [session, tournament] = await Promise.all([
    auth(),
    getLatestTournament(),
  ]);

  if (session != null) {
    if (tournament?.stage !== "registration") {
      redirect("/home");
    }
    const userRoles = await getRolesByUserId(session.user.id);
    if (userRoles.length > 0) {
      redirect("/home");
    }
    redirect("/anmeldung");
  }

  return (
    <div className="min-h-screen flex justify-center pt-[10vh]">
      <main className="w-full max-w-screen-xl px-4 pb-5">
        <section className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Willkommen beim HSK Klubturnier
          </h2>
        </section>
        <section className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          <Card className="shadow-md h-full flex flex-col">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <UserPlus className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Registrieren</CardTitle>
              <CardDescription className="text-base">
                Für neue Teilnehmer
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-base">
                Erstellen Sie ein neues Konto, um sich für Turniere anzumelden,
                Ihre Spielstatistiken zu verfolgen und mit anderen Spielern zu
                interagieren.
              </p>
            </CardContent>
            <CardFooter className="mt-auto">
              <Button className="w-full text-lg py-6" asChild variant="default">
                <Link href="/signup">
                  Registrieren <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Login Card */}
          <Card className="shadow-md h-full flex flex-col">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <LogIn className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Anmelden</CardTitle>
              <CardDescription className="text-base">
                Für bestehende Teilnehmer
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-base">
                Melden Sie sich mit Ihrem bestehenden Konto an, um auf Ihre
                Turniere, Spielpläne und Ergebnisse zuzugreifen.
              </p>
            </CardContent>
            <CardFooter className="mt-auto">
              <Button className="w-full text-lg py-6" asChild variant="default">
                <Link href="/login">
                  Anmelden <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Spectate Card */}
          <Card className="shadow-md h-full flex flex-col">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                <Eye className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-2xl">Zuschauen</CardTitle>
              <CardDescription className="text-base">
                Für Besucher ohne Konto
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-base">
                Verfolgen Sie aktuelle Turniere, sehen Sie sich Spielpläne an
                und bleiben Sie über alle Ereignisse informiert, ohne sich
                registrieren zu müssen.
              </p>
            </CardContent>
            <CardFooter className="mt-auto">
              <Button className="w-full text-lg py-6" asChild variant="default">
                <Link href="/zuschauen">
                  Zuschauen
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </section>
      </main>
    </div>
  );
}
