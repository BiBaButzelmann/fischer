import { auth } from "@/auth";
import { headers } from "next/headers";
import { Button } from "../ui/button";
import Link from "next/link";

export default async function NavAdmin() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (session?.user.role != "admin") {
        return null;
    }

    return (
        <Button>
            <Link href="/admin">Admin Panel</Link>
        </Button>
    );
}
