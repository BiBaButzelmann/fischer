"use client";

import { authClient } from "@/auth-client";
import { SidebarProvider } from "@/components/ui/sidebar";
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
          SIGN_IN: "Einloggen",
          SIGN_IN_DESCRIPTION: "Email und Passwort eingeben",
          SIGN_UP: "Account erstellen",
          FORGOT_PASSWORD: "Passwort zurücksetzen",
          EMAIL_PLACEHOLDER: "max.mustermann@web.de",
          PASSWORD_PLACEHOLDER: "Passwort",
          DONT_HAVE_AN_ACCOUNT: "Noch keinen Account?",
          FORGOT_PASSWORD_LINK: "Passwort vergessen?",
          GO_BACK: "Zurück",
          SIGN_UP_DESCRIPTION: "Informationen eingeben",
          NAME_PLACEHOLDER: "Max Mustermann",
          PASSWORD: "Passwort",
          SIGN_UP_ACTION: "Registrieren",
          ALREADY_HAVE_AN_ACCOUNT: "Bereits einen Account?",
          INVALID_PASSWORD: "Das Passwort ist ungültig.",
        }}
      >
        <SidebarProvider>{children}</SidebarProvider>
      </AuthUIProvider>
    </ThemeProvider>
  );
}
