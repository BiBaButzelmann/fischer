import { auth } from "@/auth/utils";

export async function Page() {
  const session = await auth();

  return <div>Hier könnten die Spiele deines Turniers stehen</div>;
}
