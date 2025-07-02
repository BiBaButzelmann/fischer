import { ResetPasswordForm } from "@/components/auth/reset-password-form";
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

// Route: /passwort-zurücksetzen?token=xxx&error=invalid_token
export default async function Page() {
  return (
    <div className="w-full max-w-md px-4 py-8 mx-auto">
      {/* Zurück-Button */}
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/willkommen" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Zurück zur Startseite
          </Link>
        </Button>
      </div>

      {/* Karte mit Formular */}
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Passwort zurücksetzen
          </CardTitle>
          <CardDescription>
            Bitte vergeben Sie ein neues Passwort für Ihr Konto.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <ResetPasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
