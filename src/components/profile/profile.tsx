"use client";

import { profile } from "@/db/schema/profile";
import { InferSelectModel } from "drizzle-orm";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { useTransition } from "react";
import { updateProfile } from "./actions";
import { ProfileFormData, profileFormDataSchema } from "./schema";

type Props = {
  profile: InferSelectModel<typeof profile>;
};
export function Profile({ profile }: Props) {
  const [loading, startTransition] = useTransition();
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormDataSchema),
    defaultValues: {
      name: profile.name ?? "",
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
            </div>
          </CardContent>
        </Card>

        <Separator />

        <Button type="submit" disabled={loading}>
          Speichern
        </Button>
      </form>
    </Form>
  );
}
