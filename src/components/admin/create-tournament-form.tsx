"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "../ui/textarea";
import { SelectProfile } from "@/db/types/profile";
import { SelectAddress } from "@/db/types/address";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { PlusIcon } from "lucide-react";

interface TournamentFormData {
    clubName: string;
    tournamentType: string;
    numberOfRounds: number;
    startDate: string;
    endDate: string;
    timeLimit: string;
    location: string;
    allClocksDigital: boolean;
    tieBreakMethod: string;
    softwareUsed: string;
    phone: string;
    email: string;

    organizerId?: number;

    organizerName: string;
    fideId: string;
    coLine?: string;
    street: string;
    city: string;
    postalCode: string;
}

type ProfileWithAddress = SelectProfile & {
    address: SelectAddress | null;
};

type Props = {
    profiles: ProfileWithAddress[];
};
export default function CreateTournamentForm({ profiles }: Props) {
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<TournamentFormData>({
        defaultValues: {
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

    const allClocksValue = watch("allClocksDigital");
    const organizerId = watch("organizerId");

    const onSubmit = async (data: TournamentFormData) => {
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
                        Tournament Registration
                    </h1>
                    <p className="text-gray-600">
                        Please fill out all required information to register
                        your tournament
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    {/* Part 1: Tournament Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold text-gray-800">
                                Turnierinformationen
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="clubName">Verein</Label>
                                    <Input
                                        id="clubName"
                                        {...register("clubName", {
                                            required: "Verein ist erforderlich",
                                        })}
                                        placeholder="Verein Name"
                                    />
                                    {errors.clubName && (
                                        <p className="text-sm text-red-600">
                                            {errors.clubName.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="tournamentType">
                                        Turniertyp *
                                    </Label>
                                    <Input
                                        id="tournamentType"
                                        {...register("tournamentType", {
                                            required:
                                                "Turniertyp ist erforderlich",
                                        })}
                                        placeholder="z.B. Rundenturnier, Schweizer System"
                                    />
                                    {errors.tournamentType && (
                                        <p className="text-sm text-red-600">
                                            {errors.tournamentType.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="numberOfRounds">
                                        Rundenanzahl *
                                    </Label>
                                    <Input
                                        id="numberOfRounds"
                                        type="number"
                                        min="1"
                                        {...register("numberOfRounds", {
                                            required:
                                                "Rundenanzahl ist erforderlich",
                                            valueAsNumber: true,
                                            min: {
                                                value: 1,
                                                message:
                                                    "Must be at least 1 round",
                                            },
                                        })}
                                        placeholder="Rundenanzahl"
                                    />
                                    {errors.numberOfRounds && (
                                        <p className="text-sm text-red-600">
                                            {errors.numberOfRounds.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="timeLimit">
                                        Zeitlimit *
                                    </Label>
                                    <Textarea
                                        id="timeLimit"
                                        {...register("timeLimit", {
                                            required:
                                                "Zeitlimit ist erforderlich",
                                        })}
                                    />
                                    {errors.timeLimit && (
                                        <p className="text-sm text-red-600">
                                            {errors.timeLimit.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="startDate">
                                        Turnierstart *
                                    </Label>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        {...register("startDate", {
                                            required:
                                                "Turnierstart ist erforderlich",
                                        })}
                                    />
                                    {errors.startDate && (
                                        <p className="text-sm text-red-600">
                                            {errors.startDate.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="endDate">
                                        Turnierende *
                                    </Label>
                                    <Input
                                        id="endDate"
                                        type="date"
                                        {...register("endDate", {
                                            required:
                                                "Turnierende ist erforderlich",
                                        })}
                                    />
                                    {errors.endDate && (
                                        <p className="text-sm text-red-600">
                                            {errors.endDate.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="location">Ort *</Label>
                                <Input
                                    id="location"
                                    {...register("location", {
                                        required: "Ort ist erforderlich",
                                    })}
                                    placeholder="Hamburg"
                                />
                                {errors.location && (
                                    <p className="text-sm text-red-600">
                                        {errors.location.message}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="tieBreakMethod">
                                        Tie Break Methode *
                                    </Label>
                                    <Input
                                        id="tieBreakMethod"
                                        {...register("tieBreakMethod", {
                                            required:
                                                "Tie Break Methode ist erforderlich",
                                        })}
                                        placeholder="z.B. Buchholz, Sonneborn-Berger"
                                    />
                                    {errors.tieBreakMethod && (
                                        <p className="text-sm text-red-600">
                                            {errors.tieBreakMethod.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="softwareUsed">
                                        Software *
                                    </Label>
                                    <Input
                                        id="softwareUsed"
                                        {...register("softwareUsed", {
                                            required:
                                                "Software ist erforderlich",
                                        })}
                                        placeholder="z.B. Swiss Manager, ChessManager"
                                    />
                                    {errors.softwareUsed && (
                                        <p className="text-sm text-red-600">
                                            {errors.softwareUsed.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <Switch
                                    id="allClocksDigital"
                                    checked={allClocksValue}
                                    onCheckedChange={(checked) =>
                                        setValue("allClocksDigital", checked)
                                    }
                                />
                                <Label
                                    htmlFor="allClocksDigital"
                                    className="text-sm font-medium"
                                >
                                    Alle Uhren digital
                                </Label>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone *</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        {...register("phone", {
                                            required:
                                                "Phone number is required",
                                        })}
                                        placeholder="Enter phone number"
                                    />
                                    {errors.phone && (
                                        <p className="text-sm text-red-600">
                                            {errors.phone.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        {...register("email", {
                                            required: "Email ist erforderlich",
                                        })}
                                        placeholder="Email Adresse"
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-red-600">
                                            {errors.email.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Separator />

                    {/* Part 2: Organizer Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold text-gray-800">
                                Organisator
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Existing Organizer Selection */}
                            <div className="space-y-2">
                                <Label htmlFor="existingOrganizer">
                                    Organisator auswählen (Optional)
                                </Label>
                                <Select
                                    value={organizerId?.toString() ?? ""}
                                    onValueChange={(value) => {
                                        if (value === "new") {
                                            // Clear all fields for new organizer
                                            setValue("organizerId", undefined);
                                            setValue("organizerName", "");
                                            setValue("fideId", "");
                                            setValue("coLine", "");
                                            setValue("street", "");
                                            setValue("city", "");
                                            setValue("postalCode", "");
                                        } else if (value) {
                                            // Populate fields with selected organizer data
                                            const selectedOrganizer =
                                                profiles.find(
                                                    // TODO: parseInt :(
                                                    (org) =>
                                                        org.id ===
                                                        parseInt(value),
                                                );
                                            if (selectedOrganizer) {
                                                setValue(
                                                    "organizerId",
                                                    parseInt(value),
                                                );
                                                setValue(
                                                    "organizerName",
                                                    selectedOrganizer.name,
                                                );
                                                setValue(
                                                    "fideId",
                                                    selectedOrganizer.fideId.toString(),
                                                );
                                                // You would populate other fields here if they exist in your data
                                                setValue(
                                                    "street",
                                                    selectedOrganizer.address
                                                        ?.street ?? "",
                                                );
                                                setValue(
                                                    "city",
                                                    selectedOrganizer.address
                                                        ?.city ?? "",
                                                );
                                                setValue(
                                                    "postalCode",
                                                    selectedOrganizer.address
                                                        ?.postalCode ?? "",
                                                );
                                                setValue(
                                                    "coLine",
                                                    selectedOrganizer.address
                                                        ?.coLine ?? "",
                                                );
                                            }
                                        }
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Organisator auswählen oder neuen erstellen" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="new">
                                            <div className="flex items-center space-x-2">
                                                <PlusIcon className="h-4 w-4" />
                                                <span>
                                                    Neuen Organisator anlegen
                                                </span>
                                            </div>
                                        </SelectItem>
                                        {profiles.map((profile) => (
                                            <SelectItem
                                                key={profile.id}
                                                value={profile.id.toString()}
                                            >
                                                <div className="flex flex-col">
                                                    <span className="font-medium">
                                                        {profile.name}
                                                    </span>
                                                    <span className="text-sm text-gray-500">
                                                        FIDE ID:{" "}
                                                        {profile.fideId} •{" "}
                                                        {profile.address?.city}
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Organizer Form Fields - Always Visible */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="organizerName">
                                        Name *
                                    </Label>
                                    <Input
                                        id="organizerName"
                                        {...register("organizerName", {
                                            required: "Name ist erforderlich",
                                        })}
                                        placeholder="Enter organizer name"
                                    />
                                    {errors.organizerName && (
                                        <p className="text-sm text-red-600">
                                            {errors.organizerName.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="fideId">FIDE Id *</Label>
                                    <Input
                                        id="fideId"
                                        {...register("fideId", {
                                            required:
                                                "FIDE Id ist erforderlich",
                                        })}
                                        placeholder="Enter FIDE Id"
                                    />
                                    {errors.fideId && (
                                        <p className="text-sm text-red-600">
                                            {errors.fideId.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-800">
                                    Adresse
                                </h3>

                                <div className="space-y-2">
                                    <Label htmlFor="coLine">
                                        C/O Zeile (Optional)
                                    </Label>
                                    <Input
                                        id="coLine"
                                        {...register("coLine")}
                                        placeholder="Zu Händen von..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="street">Straße *</Label>
                                    <Input
                                        id="street"
                                        {...register("street", {
                                            required: "Straße ist erforderlich",
                                        })}
                                        placeholder="Straße eingeben"
                                    />
                                    {errors.street && (
                                        <p className="text-sm text-red-600">
                                            {errors.street.message}
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="city">Stadt *</Label>
                                        <Input
                                            id="city"
                                            {...register("city", {
                                                required:
                                                    "Stadt ist erforderlich",
                                            })}
                                            placeholder="Stadt eingeben"
                                        />
                                        {errors.city && (
                                            <p className="text-sm text-red-600">
                                                {errors.city.message}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="postalCode">
                                            Postleitzahl *
                                        </Label>
                                        <Input
                                            id="postalCode"
                                            {...register("postalCode", {
                                                required:
                                                    "Postleitzahl ist erforderlich",
                                            })}
                                            placeholder="Postleitzahl eingeben"
                                        />
                                        {errors.postalCode && (
                                            <p className="text-sm text-red-600">
                                                {errors.postalCode.message}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-center pt-6">
                        <Button
                            type="submit"
                            size="lg"
                            disabled={isSubmitting}
                            className="w-full md:w-auto px-8"
                        >
                            {isSubmitting
                                ? "Submitting..."
                                : "Submit Tournament Registration"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function 