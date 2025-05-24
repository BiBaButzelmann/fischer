"use client";
import { authClient } from "@/auth-client";
import { Button } from "@/components/ui/button";
import { RedirectToSignIn } from "@daveyplate/better-auth-ui";

export default function Home() {
    const handleClick = async () => {
        await authClient.signOut();
    };

    return (
        <>
            <RedirectToSignIn />
            <div>
                <Button onClick={handleClick}>Ausloggen</Button>
            </div>
        </>
    );
}
