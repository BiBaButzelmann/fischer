"use client";

import { useState, useTransition } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { updateProfile } from "@/actions/profile";

export function ChangePhoneNumberCard({
  phoneNumber: initialPhoneNumber = "",
}: {
  phoneNumber: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber);

  const handleSave = () => {
    startTransition(async () => {
      await updateProfile({
        phoneNumber,
      });
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-semibold text-lg md:text-xl">
          Deine Telefonnummer
        </CardTitle>
        <CardDescription>
          Du kannst hier deine Telefonnummer aktualisieren.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6">
        <Input type="tel" value={phoneNumber ?? ""} onChange={handleChange} />
      </CardContent>
      <CardFooter className="items-center px-6 [.border-t]:pt-6 flex flex-col justify-between gap-4 rounded-b-xl md:flex-row !py-4 border-t bg-sidebar">
        <p className="text-center text-muted-foreground text-xs md:text-start md:text-sm">
          Mit Speichern bestätigst du die Änderung deiner Telefonnummer.
        </p>
        <Button
          size="default"
          disabled={isPending}
          onClick={handleSave}
          className="h-8"
        >
          Speichern
        </Button>
      </CardFooter>
    </Card>
  );
}
