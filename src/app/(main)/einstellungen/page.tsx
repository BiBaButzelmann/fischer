import { authWithRedirect } from "@/auth/utils";
import { ChangeNameCard } from "@/components/settings/change-name-card";
import { ChangePhoneNumberCard } from "@/components/settings/change-phonenumber-card";
import { Button } from "@/components/ui/button";
import { getProfileByUserId } from "@/db/repositories/profile";
import {
  ChangeEmailCard,
  ChangePasswordCard,
} from "@daveyplate/better-auth-ui";
import { ArrowLeft } from "lucide-react";
import invariant from "tiny-invariant";

export default async function Page() {
  const session = await authWithRedirect();
  const profile = await getProfileByUserId(session.user.id);
  invariant(profile, "Profile not found");

  return (
    <div className="flex flex-col gap-6">
      <Button variant="ghost" asChild className="self-start">
        <a href="/uebersicht" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Zurück zur Übersicht
        </a>
      </Button>
      <ChangeNameCard
        firstName={profile.firstName}
        lastName={profile.lastName}
      />
      <ChangeEmailCard
        localization={{
          EMAIL: "Deine E-Mail",
          EMAIL_DESCRIPTION:
            "Du kannst hier deine E-Mail-Adresse aktualisieren.",
          EMAIL_INSTRUCTIONS:
            "Mit Speichern bestätigst du die Änderung deiner E-Mail-Adresse.",
          EMAIL_PLACEHOLDER: "du@beispiel.de",
          EMAIL_VERIFICATION:
            "Überprüfe dein Postfach für den Bestätigungslink!",
          SAVE: "Speichern",
        }}
        classNames={{
          skeleton: "bg-secondary",
        }}
      />
      <ChangePhoneNumberCard phoneNumber={profile.phoneNumber ?? ""} />
      <ChangePasswordCard
        localization={{
          CHANGE_PASSWORD: "Passwort ändern",
          CHANGE_PASSWORD_DESCRIPTION:
            "Setze ein neues Passwort für deinen Account",
          NEW_PASSWORD: "",
          CHANGE_PASSWORD_SUCCESS: "Passwort erfolgreich aktualisiert!",
          SET_PASSWORD: "Passwort festlegen",
          CHANGE_PASSWORD_INSTRUCTIONS:
            "Mit Speichern bestätigst du die Änderung deines Passworts.",
          NEW_PASSWORD_PLACEHOLDER: "Neues Passwort",
          CURRENT_PASSWORD: "",
          CURRENT_PASSWORD_PLACEHOLDER: "Aktuelles Passwort",
          SAVE: "Speichern",
          PASSWORD_TOO_LONG:
            "Das Passwort muss mindestens 6 Zeichen lang sein.",
        }}
        passwordValidation={{
          minLength: 6,
        }}
        classNames={{
          skeleton: "bg-secondary",
        }}
      />
    </div>
  );
}
