"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "../ui/textarea";

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

    organizerName: string;
    fideId: string;
    coLine?: string;
    street: string;
    city: string;
    postalCode: string;
}

export default function CreateTournamentForm() {
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

    const onSubmit = async (data: TournamentFormData) => {
        // Simulate form submission
        console.log("Form submitted:", data);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        alert("Tournament registration submitted successfully!");
    };

    return (
        <div>
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
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
                                Part 1: Tournament Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="clubName">Verein</Label>
                                    <Input
                                        id="clubName"
                                        {...register("clubName", {
                                            required: "Club name is required",
                                        })}
                                        placeholder="Enter club name"
                                    />
                                    {errors.clubName && (
                                        <p className="text-sm text-red-600">
                                            {errors.clubName.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="tournamentType">
                                        Tournament Type *
                                    </Label>
                                    <Input
                                        id="tournamentType"
                                        {...register("tournamentType", {
                                            required:
                                                "Tournament type is required",
                                        })}
                                        placeholder="e.g., Swiss System, Round Robin"
                                    />
                                    {errors.tournamentType && (
                                        <p className="text-sm text-red-600">
                                            {errors.tournamentType.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="numberOfRounds">
                                        Number of Rounds *
                                    </Label>
                                    <Input
                                        id="numberOfRounds"
                                        type="number"
                                        min="1"
                                        {...register("numberOfRounds", {
                                            required:
                                                "Number of rounds is required",
                                            valueAsNumber: true,
                                            min: {
                                                value: 1,
                                                message:
                                                    "Must be at least 1 round",
                                            },
                                        })}
                                        placeholder="Enter number of rounds"
                                    />
                                    {errors.numberOfRounds && (
                                        <p className="text-sm text-red-600">
                                            {errors.numberOfRounds.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="timeLimit">
                                        Time Limit *
                                    </Label>
                                    <Textarea
                                        id="timeLimit"
                                        {...register("timeLimit", {
                                            required: "Time limit is required",
                                        })}
                                        placeholder="e.g., 90 minutes + 30 seconds increment"
                                    />
                                    {errors.timeLimit && (
                                        <p className="text-sm text-red-600">
                                            {errors.timeLimit.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="startDate">
                                        Start Date *
                                    </Label>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        {...register("startDate", {
                                            required: "Start date is required",
                                        })}
                                    />
                                    {errors.startDate && (
                                        <p className="text-sm text-red-600">
                                            {errors.startDate.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="endDate">End Date *</Label>
                                    <Input
                                        id="endDate"
                                        type="date"
                                        {...register("endDate", {
                                            required: "End date is required",
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
                                <Label htmlFor="location">Location *</Label>
                                <Input
                                    id="location"
                                    {...register("location", {
                                        required: "Location is required",
                                    })}
                                    placeholder="Enter tournament venue address"
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
                                        Tie Break Method *
                                    </Label>
                                    <Input
                                        id="tieBreakMethod"
                                        {...register("tieBreakMethod", {
                                            required:
                                                "Tie break method is required",
                                        })}
                                        placeholder="e.g., Buchholz, Sonneborn-Berger"
                                    />
                                    {errors.tieBreakMethod && (
                                        <p className="text-sm text-red-600">
                                            {errors.tieBreakMethod.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="softwareUsed">
                                        Software Used *
                                    </Label>
                                    <Input
                                        id="softwareUsed"
                                        {...register("softwareUsed", {
                                            required:
                                                "Software used is required",
                                        })}
                                        placeholder="e.g., Swiss Manager, ChessManager"
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
                                    All Clocks Digital
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
                                            required: "Email is required",
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message:
                                                    "Invalid email address",
                                            },
                                        })}
                                        placeholder="Enter email address"
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
                                Part 2: Organizer Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="organizerName">
                                        Name *
                                    </Label>
                                    <Input
                                        id="organizerName"
                                        {...register("organizerName", {
                                            required:
                                                "Organizer name is required",
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
                                            required: "FIDE Id is required",
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
                                    Address
                                </h3>

                                <div className="space-y-2">
                                    <Label htmlFor="coLine">C/O Line</Label>
                                    <Input
                                        id="coLine"
                                        {...register("coLine")}
                                        placeholder="Zu Händen (optional)"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="street">Street *</Label>
                                    <Input
                                        id="street"
                                        {...register("street", {
                                            required:
                                                "Street address is required",
                                        })}
                                        placeholder="Enter street address"
                                    />
                                    {errors.street && (
                                        <p className="text-sm text-red-600">
                                            {errors.street.message}
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="city">City *</Label>
                                        <Input
                                            id="city"
                                            {...register("city", {
                                                required: "City is required",
                                            })}
                                            placeholder="Enter city"
                                        />
                                        {errors.city && (
                                            <p className="text-sm text-red-600">
                                                {errors.city.message}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="postalCode">
                                            Postal Code *
                                        </Label>
                                        <Input
                                            id="postalCode"
                                            {...register("postalCode", {
                                                required:
                                                    "Postal code is required",
                                            })}
                                            placeholder="Enter postal code"
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
