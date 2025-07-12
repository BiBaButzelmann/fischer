import { loginRedirect } from "@/actions/auth";
import { auth } from "@/auth/utils";
import { LoginForm } from "@/components/auth/login-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getRolesByUserId } from "@/db/repositories/role";
import { getLatestTournament } from "@/db/repositories/tournament";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function Page() {
  const session = await auth();
  if (session != null) {
    await loginRedirect(session.user.id);
  }

  const [tournament, roles] = await Promise.all([
    session != null ? getLatestTournament() : undefined,
    session != null ? getRolesByUserId(session.user.id) : undefined,
  ]);

  return (
    <div className="w-full max-w-md px-4 py-8 mx-auto">
      {/* Back Button */}
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/willkommen" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Zurück zur Startseite
          </Link>
        </Button>
      </div>

      {/* Login Card */}
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Anmelden</CardTitle>
          <CardDescription>
            Melde dich mit deinen Zugangsdaten an
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm tournament={tournament} roles={roles} />

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Noch kein Konto?{" "}
              <Link
                href="/registrieren"
                className="text-primary hover:underline font-medium"
              >
                Jetzt registrieren
              </Link>
            </p>
          </div>

          {/* Forgot Password */}
          <div className="mt-4 text-center">
            <Link
              href="/passwort-vergessen"
              className="text-sm text-muted-foreground hover:underline"
            >
              Passwort vergessen?
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
