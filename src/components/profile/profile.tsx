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
import { address } from "@/db/schema/address";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { useTransition } from "react";
import { updateProfile } from "./actions";
import { ProfileFormData, profileFormDataSchema } from "./schema";

type Props = {
  profile: InferSelectModel<typeof profile> & {
    address: InferSelectModel<typeof address> | null;
  };
};
export function Profile({ profile }: Props) {
  const [loading, startTransition] = useTransition();
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormDataSchema),
    defaultValues: {
      name: profile.name ?? "",
      fideId: profile.fideId?.toString() ?? "",
      adressName: profile.address?.name ?? "",
      addressCoLine: profile.address?.coLine ?? "",
      addressStreet: profile.address?.street ?? "",
      addressCity: profile.address?.city ?? "",
      addressPostalCode: profile.address?.postalCode ?? "",
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
                name="fideId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fide Id</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Fide Id eingeben" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800">
              Adresse
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-6">
            <FormField
              control={form.control}
              name="adressName"
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
              name="addressCoLine"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Co-Line</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Co-Line eingeben" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="addressStreet"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Straße</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Straße eingeben" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="addressPostalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postleitzahl</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Postleitzahl eingeben" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="addressCity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stadt</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Stadt eingeben" />
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
