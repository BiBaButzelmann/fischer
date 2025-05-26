import { auth } from "@/auth";
import { headers } from "next/headers";

export default async function Page() {
    // TODO: improve this
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (session?.user.role != "admin") {
        return null;
    }

    return <div>hehe admin</div>;
}
