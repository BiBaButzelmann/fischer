import { auth } from "@/auth/utils";
import { db } from "@/db/client";
import invariant from "tiny-invariant";

export default async function Page() {
  const session = await auth();
  const profile = await db.query.profile.findFirst({
    where: (profile, { eq }) => eq(profile.userId, session.user.id),
  });
  invariant(profile, "Profile not found");

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profil</h1>
      </div>
      Profil
    </div>
  );
}
