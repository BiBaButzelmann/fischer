import { auth } from "@/auth";
import { getProfileByUserId } from "@/db/repositories/profile";
import invariant from "tiny-invariant";
import { ChangePhoneNumberCard } from "./change-phonenumber-card";

type Props = {
  session: typeof auth.$Infer.Session;
};

export async function ChangePhoneNumber({ session }: Props) {
  const profile = await getProfileByUserId(session.user.id);
  invariant(profile, "Profile not found");

  return <ChangePhoneNumberCard phoneNumber={profile.phoneNumber ?? ""} />;
}
