"use client";

import { useForm, UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { SelectProfile } from "@/db/types/profile";
import { SelectAddress } from "@/db/types/address";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import invariant from "tiny-invariant";
import {
  CreateTournamentFormData,
  createTournamentFormDataSchema,
} from "./schema";

type ProfileWithAddress = SelectProfile & {
  address: SelectAddress | null;
};

type Props = {
  profiles: ProfileWithAddress[];
};
export default function CreateTournament({ profiles }: Props) {
  const form = useForm({
    resolver: zodResolver(createTournamentFormDataSchema),
    defaultValues: {
      coLine: "",
      clubName: "Hamburger Schachklub von 1830 e.V.",
      tournamentType: "Rundenturnier",
      numberOfRounds: 9,
      timeLimit:
        "40 Züge in 90 Minuten, danach 0 Züge in 0 Minuten, 30 Minuten für die letzte Phase, Zugabe pro Zug in Sekunden: 30",
      location: "Hamburg",
      tieBreakMethod: "Sonneborn-Berger",
      softwareUsed: "Swiss Manager",
      allClocksDigital: true,
      phone: "040 20981411",
      email: "klubturnier@hsk1830.de",
    },
  });

  const handleSubmit = async (data: CreateTournamentFormData) => {
    // Simulate form submission
    console.log("Form submitted:", data);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    alert("Tournament registration submitted successfully!");
  };

  return (
    <div>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Turnieranmeldung
          </h1>
        </div>

        <CreateTournamentForm
          form={form}
          onSubmit={handleSubmit}
          profiles={profiles}
        />
      </div>
    </div>
  );
}

const NEW_ORGANIZER_ITEM_ID = "new";

function CreateTournamentForm({
  form,
  onSubmit,
  profiles,
}: {
  form: UseFormReturn<CreateTournamentFormData>;
  onSubmit: (data: CreateTournamentFormData) => void;
  profiles: ProfileWithAddress[];
}) {
  const handleSelectedOrganizerChange = (id: string) => {
    const selectedOrganizer = profiles.find((org) => org.id === parseInt(id));
    invariant(selectedOrganizer != null);

    form.setValue("organizerName", selectedOrganizer.name);
    form.setValue("fideId", selectedOrganizer.fideId.toString());
    form.setValue("street", selectedOrganizer.address?.street ?? "");
    form.setValue("city", selectedOrganizer.address?.city ?? "");
    form.setValue("postalCode", selectedOrganizer.address?.postalCode ?? "");
    form.setValue("coLine", selectedOrganizer.address?.coLine ?? "");
  };

  const handleClearOrganizerFields = () => {
    form.setValue("organizerName", "");
    form.setValue("fideId", "");
    form.setValue("street", "");
    form.setValue("city", "");
    form.setValue("postalCode", "");
    form.setValue("coLine", "");
  };

  const handleOrganizerIdChange = (value: string) => {
    form.setValue("existingOrganizerId", value);
    if (value === NEW_ORGANIZER_ITEM_ID) {
      handleClearOrganizerFields();
    } else if (value) {
      handleSelectedOrganizerChange(value);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Teil 1: Turnierinformationen */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800">
              Turnierinformationen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="clubName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vereinsname</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Vereinsname" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tournamentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Turnierart *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="z.B. Schweizer System, Rundenturnier"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="numberOfRounds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Anzahl Runden *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="Anzahl der Runden eingeben"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timeLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bedenkzeit *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="z.B. 90 Minuten + 30 Sekunden Zuschlag"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Startdatum *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enddatum *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Austragungsort *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Adresse des Turnierortes eingeben"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="tieBreakMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Feinwertung *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="z.B. Buchholz, Sonneborn-Berger"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="softwareUsed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verwendete Software *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="z.B. Swiss Manager, ChessManager"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="allClocksDigital"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-medium">
                    Alle Uhren digital
                  </FormLabel>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefon *</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="Telefonnummer eingeben"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-Mail *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="E-Mail-Adresse eingeben"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Teil 2: Organisatorinformationen */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800">
              Organisatorinformationen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Bestehender Organisator-Auswahl */}
            <FormField
              control={form.control}
              name="existingOrganizerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Bestehenden Organisator auswählen (Optional)
                  </FormLabel>
                  <Select
                    value={field.value || ""}
                    onValueChange={handleOrganizerIdChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Bestehenden Organisator auswählen oder neuen erstellen" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={NEW_ORGANIZER_ITEM_ID}>
                        <div className="flex items-center space-x-2">
                          <Plus className="h-4 w-4" />
                          <span>Neuen Organisator erstellen</span>
                        </div>
                      </SelectItem>
                      {profiles.map((organizer) => (
                        <SelectItem
                          key={organizer.id}
                          value={organizer.id.toString()}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {organizer.name}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Organisator-Formularfelder - Immer sichtbar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="organizerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Name des Organisators eingeben"
                        {...field}
                      />
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
                    <FormLabel>FIDE-ID *</FormLabel>
                    <FormControl>
                      <Input placeholder="FIDE-ID eingeben" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800">Adresse</h3>

              <FormField
                control={form.control}
                name="coLine"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>c/o Zeile (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Zu Händen eingeben (optional)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Straße *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Straße und Hausnummer eingeben"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stadt *</FormLabel>
                      <FormControl>
                        <Input placeholder="Stadt eingeben" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postleitzahl *</FormLabel>
                      <FormControl>
                        <Input placeholder="Postleitzahl eingeben" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
