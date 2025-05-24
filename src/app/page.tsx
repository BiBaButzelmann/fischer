"use client";

import { authClient } from "@/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormEventHandler, useState } from "react";
import { redirect } from "next/navigation";

export default function Home() {
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();
        const email = e.target.email.value as string;
        const name = e.target.name.value as string;
        const password = e.target.password.value as string;

        await authClient.signUp.email(
            {
                email,
                password,
                name,
                callbackURL: "/dashboard",
            },
            {
                onRequest: (ctx) => {
                    setIsLoading(true);
                },
                onSuccess: () => {
                    redirect("/dashboard");
                },
                onError: (error) => {
                    setIsLoading(false);
                    console.error("Error during sign up:", error);
                },
            }
        );
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 max-w-[400px] m-auto mt-8"
        >
            <div>
                <Label htmlFor="email">Email</Label>
                <Input type="email" id="email" />
            </div>
            <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" />
            </div>
            <div>
                <Label htmlFor="password">Passwort</Label>
                <Input id="password" type="password" />
            </div>
            <Button>Registrieren</Button>
        </form>
    );
}
