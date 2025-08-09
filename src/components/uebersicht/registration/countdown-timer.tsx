"use client";

import { match } from "ts-pattern";
import { useEffect, useState } from "react";

type Props = {
  date: Date;
};

export function CountdownTimer({ date }: Props) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(date));

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft(date));
    }, 1000);

    return () => clearTimeout(timer);
  });

  if (timeLeft != null) {
    return <Timers timeLeft={timeLeft} />;
  }

  return null;
}

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function Timers({ timeLeft }: { timeLeft: TimeLeft }) {
  return (
    <div className="grid grid-cols-4 gap-2 md:gap-4">
      {Object.entries(timeLeft).map(([key, value]) => (
        <div
          key={key}
          className="flex flex-col items-center justify-center bg-muted p-4 rounded-lg"
        >
          <span className="text-2xl md:text-4xl font-bold text-red-500">
            {value.toString().padStart(2, "0")}
          </span>
          <span className="text-[0.7rem] md:text-xs text-muted-foreground uppercase">
            {match(key as keyof TimeLeft)
              .with("days", () => (value === 1 ? "Tag" : "Tagen"))
              .with("hours", () => (value === 1 ? "Stunde" : "Stunden"))
              .with("minutes", () => (value === 1 ? "Minute" : "Minuten"))
              .with("seconds", () => (value === 1 ? "Sekunde" : "Sekunden"))
              .exhaustive()}
          </span>
        </div>
      ))}
    </div>
  );
}

function calculateTimeLeft(date: Date) {
  const difference = date.getTime() - new Date().getTime();

  return difference > 0
    ? {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      }
    : undefined;
}
