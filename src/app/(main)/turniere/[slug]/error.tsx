"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function TournamentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="text-center p-6 bg-gray-50 rounded-lg">
      <div className="mb-4">Etwas ist schiefgelaufen.</div>
      <p className="mb-4 text-sm text-gray-600">
        Bitte versuche es erneut. Wenn der Fehler bleibt, melde dich unter
        klubturnier@hsk1830.de.
      </p>
      <Button variant="outline" onClick={reset}>
        Erneut versuchen
      </Button>
    </div>
  );
}
