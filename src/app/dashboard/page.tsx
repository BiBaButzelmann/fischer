import { RedirectToSignIn } from "@daveyplate/better-auth-ui";

export default async function Home() {
    return (
        <>
            <RedirectToSignIn />
            <div>Dashboard</div>
        </>
    );
}
