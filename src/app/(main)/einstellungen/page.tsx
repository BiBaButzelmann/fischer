import { authWithRedirect } from "@/auth/utils";
import { Button } from "@/components/ui/button";
import { getProfileByUserId } from "@/db/repositories/profile";
import {
  ChangeEmailCard,
  ChangePasswordCard,
  UpdateNameCard,
  UpdateUsernameCard,
} from "@daveyplate/better-auth-ui";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await authWithRedirect();
  const profile = await getProfileByUserId(session.user.id);
  if (!profile) {
    redirect("/willkommen");
  }
  return (
    <div className="flex flex-col gap-6">
      <Button variant="ghost" asChild className="self-start">
        <a href="/uebersicht" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Zurück zum Dashboard
        </a>
      </Button>
      <UpdateNameCard
        localization={{
          name: "Dein Name",
          nameDescription:
            "Aktualisiere deinen Namen für dein Profil. Dieser Name wird für die DWZ-Auswertung verwendet. Wenn der Name nicht stimmt, kannst du ggf. nicht für das Turnier berücksichtigt werden.",
          nameInstructions:
            "Mit Speichern bestätigst du die Änderung deines Namens.",
          namePlaceholder: "Max Mustermann",
          save: "Speichern",
        }}
      />
      <ChangeEmailCard
        localization={{
          email: "Deine E-Mail",
          emailDescription:
            "Du kannst hier deine E-Mail-Adresse aktualisieren.",
          emailInstructions:
            "Mit Speichern bestätigst du die Änderung deiner E-Mail-Adresse.",
          emailPlaceholder: "du@beispiel.de",
          emailVerification:
            "Überprüfe dein Postfach für den Bestätigungslink!",
          save: "Speichern",
        }}
      />
      <ChangePasswordCard
        localization={{
          changePassword: "Passwort ändern",
          changePasswordDescription:
            "Setze ein neues Passwort für deinen Account",
          newPassword: "",
          changePasswordSuccess: "Passwort erfolgreich aktualisiert!",
          setPassword: "Passwort festlegen",
          changePasswordInstructions:
            "Mit Speichern bestätigst du die Änderung deines Passworts.",
          newPasswordPlaceholder: "Neues Passwort",
          currentPassword: "",
          currentPasswordPlaceholder: "Aktuelles Passwort",
          save: "Speichern",
        }}
      />
    </div>
  );
}
