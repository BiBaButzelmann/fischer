"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useTransition } from "react";
import { updateProfile } from "./actions";
import { ProfileFormData, profileFormDataSchema } from "./schema";
import { type Profile } from "@/db/types/profile";

type Props = {
  profile: Profile;
};
export function Profile({ profile }: Props) {
  const [loading, startTransition] = useTransition();
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormDataSchema),
    defaultValues: {
      name: profile.name ?? "",
      phoneNumber: profile.phoneNumber ?? "",
    },
  });

  const handleSubmit = (data: ProfileFormData) => {
    startTransition(async () => {
      await updateProfile(data);
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800">
              Spielerprofil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Name eingeben" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefonnummer</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Telefonnummer eingeben" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
        <Button type="submit" disabled={loading}>
          Speichern
        </Button>
      </form>
    </Form>
  );
}
