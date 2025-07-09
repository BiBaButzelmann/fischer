import Link from "next/link";
import { ArrowLeftIcon, BookTextIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AusschreibungPage() {
  return (
    <div className="h-screen flex flex-col">
      <header className="flex-shrink-0 p-4 border-b">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" asChild>
            <Link href="/klubturnier-anmeldung">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Zurück zur Anmeldung
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <BookTextIcon className="h-5 w-5" />
            <h1 className="text-lg font-semibold">Ausschreibung</h1>
          </div>
          <div className="w-32"></div> {/* Spacer for center alignment */}
        </div>
      </header>

      <div className="flex-1 w-full">
        <iframe
          src="/pdfs/ausschreibung_25.pdf"
          className="w-full h-full"
          style={{ border: "none" }}
        />
      </div>
    </div>
  );
}
