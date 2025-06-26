"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";

interface SavePGNButtonProps {
  /** Invoked when the user wants to persist the current PGN */
  onClick: () => Promise<void> | void;
}

/**
 * Simple wrapper around a shadcn/ui `<Button>` that shows a loading state while
 * the passed asynchronous `onClick` completes.
 */
export default function SavePGNButton({ onClick }: SavePGNButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(() => {
      const maybePromise = onClick();
      // Ensure we properly await any promise to keep the loading state
      if (maybePromise instanceof Promise) return maybePromise;
    });
  };

  return (
    <Button onClick={handleClick} disabled={isPending} className="w-full mt-4">
      {isPending ? "Saving…" : "Save PGN"}
    </Button>
  );
}
