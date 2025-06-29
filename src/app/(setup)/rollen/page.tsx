import { RolesManager } from "@/components/roles/roles-manager";

export default function RolesPage() {
  return (
    <div className="min-h-screen w-full mx-auto bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-start p-4 sm:p-6 md:p-8 pt-16">
      <div className="w-full max-w-3xl mx-auto space-y-8">
        <header className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Rollen-Auswahl
          </h1>
          <p className="text-muted-foreground mt-2">
            Wähle eine oder mehrere Rollen aus und gib deine Informationen dazu
            an.
          </p>
        </header>
        <RolesManager />
      </div>
    </div>
  );
}
