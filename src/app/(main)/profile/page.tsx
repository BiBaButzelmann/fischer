import { auth } from "@/auth/utils";
import { getProfileByUserId } from "@/db/repositories/profile";
import invariant from "tiny-invariant";

export default async function Page() {
  const session = await auth();
  const profile = await getProfileByUserId(session.user.id);
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
