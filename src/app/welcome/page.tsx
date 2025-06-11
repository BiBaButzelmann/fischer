import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default async function Page() {
  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold my-8 text-center">
        Willkommen beim HSK Klubturnier
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Registrieren</CardTitle>
            <CardDescription>Für neue Teilnehmer</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Erstellen sie ein neues Konto bla bla bla</p>
          </CardContent>
          <CardFooter>
            <Link href="/signup">
              <Button>Registrieren</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Anmelden</CardTitle>
            <CardDescription>Für bestehende Teilnehmer</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Melden Sie sich mit Ihrem bestenden Konto bla bla bla</p>
          </CardContent>
          <CardFooter>
            <Link href="/login">
              <Button>Anmelden</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Zuschauen</CardTitle>
            <CardDescription>Für Besucher ohne Konto</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Verfolgen Sie aktuelle Turniere, sehen Sie bla bla bla</p>
          </CardContent>
          <CardFooter>
            <Link href="/view">
              <Button>Als Zuschauer fortfahren</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
