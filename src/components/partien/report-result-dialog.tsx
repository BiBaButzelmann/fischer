"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { GameResult } from "@/db/types/game";
import { Handshake } from "lucide-react";
import { useTransition, useState } from "react";
import { authClient } from "@/auth-client";

type Props = {
  gameId: number;
  currentResult: GameResult | null;
  onResultChange: (gameId: number, result: GameResult) => Promise<void>;
  isReferee?: boolean;
};

export function ReportResultDialog({
  gameId,
  currentResult,
  onResultChange,
  isReferee,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = authClient.useSession();

  const handleResultFormSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const result = formData.get("result") as GameResult;
    startTransition(async () => {
      await onResultChange(gameId, result);
      setIsOpen(false);
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button aria-label="Ergebnis melden" variant="outline" size="icon">
              <Handshake className="h-4 w-4" />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Ergebnis melden</p>
        </TooltipContent>
      </Tooltip>
      <DialogContent>
        <form onSubmit={handleResultFormSubmit}>
          <DialogHeader>
            <DialogTitle>Ergebnis melden</DialogTitle>
            <DialogDescription>
              Melde hier das Ergebnis der Partie. Klicke speichern, wenn du
              fertig bist.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-4">
            <Label htmlFor={`result-select-${gameId}`} className="font-medium">
              Ergebnis
            </Label>
            <Select name="result" defaultValue={currentResult ?? ""} required>
              <SelectTrigger id={`result-select-${gameId}`} className="w-full">
                <SelectValue placeholder="Ergebnis wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1:0">Weiß gewinnt</SelectItem>
                <SelectItem value="0:1">Schwarz gewinnt</SelectItem>
                <SelectItem value="½-½">Remis</SelectItem>
                <SelectItem value="+:-">Schwarz nicht angetreten</SelectItem>
                <SelectItem value="-:+">Weiß nicht angetreten</SelectItem>
                <SelectItem value="-:-">
                  Beide Spieler nicht angetreten.
                </SelectItem>
                {(session?.user.role === "admin" || isReferee) && (
                  <>
                    <SelectItem value="0-½">
                      Weiß verliert durch Regelverstoß, aber Schwarz hat
                      unzureichendes Material zum Matt setzen.{" "}
                    </SelectItem>
                    <SelectItem value="½-0">
                      Schwarz verliert durch Regelverstoß, aber Weiß hat
                      unzureichendes Material zum Matt setzen.
                    </SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Schließen</Button>
            </DialogClose>
            <Button disabled={isPending} type="submit">
              Speichern
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
