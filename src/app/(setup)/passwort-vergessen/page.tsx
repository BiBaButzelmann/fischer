"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, CheckCircle, Lock } from "lucide-react";
import { authClient } from "@/auth-client";

export default function PasswortVergessenPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Add password reset logic
    setIsLoading(true);

    setMessage(
      "Falls ein Konto mit dieser E-Mail-Adresse existiert, wurde ein Link zum Zurücksetzen des Passworts gesendet.",
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Zurück zur Startseite
            </Link>
          </Button>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              Passwort vergessen
            </CardTitle>
            <CardDescription>
              Wir senden Ihnen einen Link zum Zurücksetzen zu.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSuccess ? (
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-green-800">{message}</p>
                <Button asChild className="mt-4 w-full">
                  <Link href="/anmelden">Zurück zur Anmeldung</Link>
                </Button>
              </div>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-Mail-Adresse</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="ihre.email@beispiel.de"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Invisible Placeholder to match Login form's password field */}
                  <div className="space-y-2 invisible" aria-hidden="true">
                    <Label htmlFor="password-placeholder">Passwort</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password-placeholder"
                        type="password"
                        className="pl-10"
                        disabled
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full text-lg py-6"
                    disabled={isLoading}
                  >
                    {isLoading ? "Wird gesendet..." : "Passwort zurücksetzen"}
                  </Button>
                </form>

                {/* Invisible Placeholder to match Login form's register link */}
                <div className="mt-6 text-center invisible" aria-hidden="true">
                  <p className="text-muted-foreground">
                    Noch kein Konto?{" "}
                    <Link href="#" tabIndex={-1}>
                      Jetzt registrieren
                    </Link>
                  </p>
                </div>

                {/* "Back to Login" link, now matching the position and style of the "Forgot Password" link on the login page */}
                <div className="mt-4 text-center">
                  <Link
                    href="/login"
                    className="text-sm text-muted-foreground hover:underline"
                  >
                    Zurück zur Anmeldung
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
