import { signupRedirect } from "@/actions/auth";
import { auth } from "@/auth/utils";
import { SignupForm } from "@/components/auth/signup-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function Page() {
  const session = await auth();
  if (session) {
    await signupRedirect();
  }

  return (
    <div className="w-full max-w-md px-4 py-8 mx-auto">
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
          <CardTitle className="text-2xl font-bold">Registrieren</CardTitle>
          <CardDescription>
            Erstelle ein Konto für das HSK Klubturnier mit den Daten der
            teilnehmenden Person.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignupForm />
          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Bereits ein Konto?{" "}
              <Link
                href="/anmelden"
                className="text-primary hover:underline font-medium"
              >
                Jetzt anmelden
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
