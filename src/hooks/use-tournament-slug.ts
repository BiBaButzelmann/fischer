"use client";

import { useParams } from "next/navigation";
import invariant from "tiny-invariant";

export function useTournamentSlug(): string {
  const { slug } = useParams<{ slug: string }>();
  invariant(
    slug,
    "useTournamentSlug must be used within a /turniere/[slug] route",
  );
  return slug;
}
