"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";

type Props = {
  deadline: Date;
};

export const RegistrationCountdownClient = ({ deadline }: Props) => {
  const calculateTimeLeft = () => {
    const difference = +deadline - +new Date();
    if (difference <= 0) return null;

    return {
      Tage: Math.floor(difference / (1000 * 60 * 60 * 24)),
      Stunden: Math.floor((difference / (1000 * 60 * 60)) % 24),
      Minuten: Math.floor((difference / 1000 / 60) % 60),
      Sekunden: Math.floor((difference / 1000) % 60),
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      const updated = calculateTimeLeft();
      setTimeLeft(updated);
    }, 1000);

    return () => clearInterval(timer);
  }, [deadline]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Clock className="h-5 w-5 text-muted-foreground" />
          Anmeldefrist endet in...
        </CardTitle>
      </CardHeader>
      <CardContent>
        {timeLeft ? (
          <div className="grid grid-cols-4 gap-4 text-center">
            {Object.entries(timeLeft).map(([label, value]) => (
              <div key={label} className="flex flex-col items-center">
                <span className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">
                  {value}
                </span>
                <span className="text-xs font-medium uppercase text-muted-foreground">
                  {label}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-lg font-semibold text-destructive">
            Die Anmeldung ist geschlossen.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
