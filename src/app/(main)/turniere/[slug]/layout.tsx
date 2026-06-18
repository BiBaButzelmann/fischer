import { getTournamentBySlug } from "@/db/repositories/tournament";
import { notFound } from "next/navigation";

export default async function TournamentLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tournament = await getTournamentBySlug(slug);
  if (!tournament) {
    notFound();
  }

  return <>{children}</>;
}
