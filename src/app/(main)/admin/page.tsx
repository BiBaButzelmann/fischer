import { auth } from "@/auth";
import CreateTournamentForm from "@/components/admin/create-tournament-form";
import { db } from "@/db/client";
import { address } from "@/db/schema/address";
import { profile } from "@/db/schema/profile";
import { headers } from "next/headers";

export default async function Page() {
    // TODO: improve this
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (session?.user.role != "admin") {
        return null;
    }

    // TODO: parallelize queries
    const organizers = await db.query.profile.findMany({
        with: {
            address: true,
        },
    });

    return (
        <div>
            <CreateTournamentForm profiles={organizers} />
        </div>
    );
}
