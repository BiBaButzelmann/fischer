import { auth } from "@/auth";
import { Profile } from "@/components/profile/profile";
import { db } from "@/db/client";
import { headers } from "next/headers";
import invariant from "tiny-invariant";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  // TODO: find better way to make sure session is not null
  invariant(session, "Session not found");

  const profile = await db.query.profile.findFirst({
    where: (profile, { eq }) => eq(profile.userId, session.user.id),
    with: {
      address: true,
    },
  });
  invariant(profile, "Profile not found");

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profil</h1>
      </div>
      <Profile profile={profile} />
    </div>
  );
}
