"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationPopup } from "@/components/notification/notification-popup";
import type { GameWithParticipantsAndDate } from "@/db/types/game";

type Props = {
  games: GameWithParticipantsAndDate[];
  participantId?: number;
};

export function NotificationBell({ games, participantId }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const pendingCount = games.length;
  const toggleOpen = () => setIsOpen(!isOpen);
  const close = () => setIsOpen(false);

  return (
    <div className="relative">
      {/* Bell Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={toggleOpen}
        className="relative bg-transparent"
      >
        <Bell className="w-5 h-5" />
        {pendingCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {pendingCount}
          </span>
        )}
      </Button>

      {/* Pending Results */}
      {isOpen && (
        <>
          <NotificationPopup
            games={games}
            participantId={participantId}
            onClose={close}
          />
          <div className="fixed inset-0 z-40" onClick={close} />
        </>
      )}
    </div>
  );
}
