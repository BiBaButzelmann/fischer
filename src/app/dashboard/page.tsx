import { headers } from "next/headers";
import { auth } from "@/auth";

export default async function Home() {
    const session = await auth.api.getSession({
        headers: await headers(), // you need to pass the headers object.
    });

    return <div>{JSON.stringify(session)}</div>;
}
