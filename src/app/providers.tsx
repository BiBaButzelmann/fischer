"use client";

import { authClient } from "@/auth-client";
import { AuthUIProvider } from "@daveyplate/better-auth-ui";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
    const router = useRouter();

    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
        >
            <AuthUIProvider
                authClient={authClient}
                navigate={router.push}
                replace={router.replace}
                onSessionChange={() => {
                    // Clear router cache (protected routes)
                    router.refresh();
                }}
                Link={Link}
                localization={{
                    signIn: "Einloggen",
                    signInDescription: "Email und Passwort eingeben",
                    signUp: "Account erstellen",
                    forgotPassword: "Passwort zurücksetzen",
                    emailPlaceholder: "max.musterman@web.de",
                    passwordPlaceholder: "Passwort",
                    dontHaveAnAccount: "Noch keinen Account?",
                    forgotPasswordLink: "Passwort vergessen?",
                    goBack: "Zurück",
                    signUpDescription: "Informationen eingeben",
                    namePlaceholder: "Max Mustermann",
                    password: "Passwort",
                    signUpAction: "Registrieren",
                    alreadyHaveAnAccount: "Bereits einen Account?",
                }}
            >
                {children}
            </AuthUIProvider>
        </ThemeProvider>
    );
}
