"use client";

import { useParams } from "next/navigation";

export function useTournamentSlug(): string {
  const { slug } = useParams<{ slug: string }>();
  return slug;
}
