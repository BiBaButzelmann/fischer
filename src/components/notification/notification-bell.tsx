"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationPopup } from "@/components/notification/notification-popup";
import { useState } from "react";

type Props = {
  gameItems: React.ReactNode[];
};

export function NotificationBell({ gameItems }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);
  const close = () => setIsOpen(false);

  const pendingCount = gameItems.length;

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="icon"
        onClick={toggle}
        className="relative bg-transparent"
      >
        <Bell className="w-5 h-5" />
        {pendingCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {pendingCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          <NotificationPopup
            gameItems={gameItems.map((item, i) => (
              <div key={i} onClick={toggle}>
                {item}
              </div>
            ))}
          />
          <div className="fixed inset-0 z-40" onClick={close} />
        </>
      )}
    </div>
  );
}
