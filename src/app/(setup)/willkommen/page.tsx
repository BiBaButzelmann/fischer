import { auth } from "@/auth/utils";
import { TournamentWeeks } from "@/components/uebersicht/tournament-weeks";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { getRolesByUserId } from "@/db/repositories/role";
import { getLatestTournament } from "@/db/repositories/tournament";
import { getTournamentWeeksByTournamentId } from "@/db/repositories/tournamentWeek";
import {
  BookTextIcon,
  ChevronRight,
  ExternalLinkIcon,
  Eye,
  LogIn,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Page() {
  const [session, tournament] = await Promise.all([
    auth(),
    getLatestTournament(),
  ]);
  const tournamentWeeks = tournament
    ? await getTournamentWeeksByTournamentId(tournament.id)
    : [];
  if (session != null) {
    if (tournament?.stage !== "registration") {
      redirect("/uebersicht");
    }
    const userRoles = await getRolesByUserId(session.user.id);
    if (userRoles.length > 0) {
      redirect("/uebersicht");
    }
    redirect("/klubturnier-anmeldung");
  }

  return (
    <div>
      <section className="text-center mb-8 md:mb-16 max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Willkommen beim HSK Klubturnier
        </h2>
      </section>
      <div className="text-center mb-8">
        {/* Document Links */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/ausschreibung"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 px-4 py-3 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all duration-200"
          >
            <BookTextIcon className="h-5 w-5" />
            <span className="font-medium">Ausschreibung</span>
            <ExternalLinkIcon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>

          <Link
            href="/turnierordnung"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 px-4 py-3 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all duration-200"
          >
            <BookTextIcon className="h-5 w-5" />
            <span className="font-medium">Turnierordnung</span>
            <ExternalLinkIcon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>

          <Dialog>
            <DialogTrigger asChild>
              <div className="group flex items-center gap-3 px-4 py-3 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all duration-200 cursor-pointer">
                <BookTextIcon className="h-5 w-5" />
                <span className="font-medium">Zeitplan</span>
                <ExternalLinkIcon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh]">
              <DialogHeader>
                <DialogTitle>Zeitplan</DialogTitle>
                <DialogDescription>
                  Gesamtübersicht der Spieltermine.
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="w-full pb-3">
                <TournamentWeeks tournamentWeeks={tournamentWeeks} />
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <section className="grid gap-4 md:gap-8 md:grid-cols-3 max-w-5xl mx-auto">
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
              Erstelle ein neues Konto, um dich für Turniere anzumelden, deine
              Spielstatistiken zu verfolgen und mit anderen Spielern zu
              interagieren.
            </p>
          </CardContent>
          <CardFooter className="mt-auto">
            <Button className="w-full text-lg py-6" asChild variant="default">
              <Link href="/registrieren">
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
              Melde dich mit deinem bestehenden Konto an, um auf deine Turniere,
              Spielpläne und Ergebnisse zuzugreifen.
            </p>
          </CardContent>
          <CardFooter className="mt-auto">
            <Button className="w-full text-lg py-6" asChild variant="default">
              <Link href="/anmelden">
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
              Verfolge aktuelle Turniere, sieh dir Spielpläne an und bleibe über
              alle Ereignisse informiert, ohne sich registrieren zu müssen.
            </p>
          </CardContent>
          <CardFooter className="mt-auto">
            <Button className="w-full text-lg py-6" asChild variant="default">
              <Link href="/uebersicht">
                Zuschauen
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </section>
    </div>
  );
}
