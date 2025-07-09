"use client";

import { useEffect, useState } from "react";

type Props = {
  date: Date;
};

export function CountdownTimer({ date }: Props) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const calculated = calculateTimeLeft(date);
    setTimeLeft(calculated || null);
  }, [date]);

  useEffect(() => {
    if (!isClient) return;

    const timer = setInterval(() => {
      const calculated = calculateTimeLeft(date);
      setTimeLeft(calculated || null);
    }, 1000);

    return () => clearInterval(timer);
  }, [date, isClient]);

  if (!isClient || timeLeft === null) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {["days", "hours", "minutes", "seconds"].map((key) => (
          <div
            key={key}
            className="flex flex-col items-center justify-center bg-muted p-4 rounded-lg"
          >
            <span className="text-4xl font-bold text-red-500">--</span>
            <span className="text-xs text-muted-foreground uppercase">
              {intervalLabels[key as keyof TimeLeft]}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return <Timers timeLeft={timeLeft} />;
}

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const intervalLabels: Record<keyof TimeLeft, string> = {
  days: "Tage",
  hours: "Stunden",
  minutes: "Minuten",
  seconds: "Sekunden",
};

function Timers({ timeLeft }: { timeLeft: TimeLeft }) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {Object.entries(timeLeft).map(([key, value]) => (
        <div
          key={key}
          className="flex flex-col items-center justify-center bg-muted p-4 rounded-lg"
        >
          <span className="text-4xl font-bold text-red-500">
            {value.toString().padStart(2, "0")}
          </span>
          <span className="text-xs text-muted-foreground uppercase">
            {intervalLabels[key as keyof TimeLeft]}
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
