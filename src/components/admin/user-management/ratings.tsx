import { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DetailsLabel, DetailsSection } from "./details-section";

type Props = {
  fideRating: number | null;
  dwzRating: number | null;
  fideId: string | null;
  dsbPersonId: string | null;
};

export function RatingsSection({
  fideRating,
  dwzRating,
  fideId,
  dsbPersonId,
}: Props) {
  return (
    <DetailsSection title="Wertungen">
      <div className="flex items-baseline gap-4 sm:gap-6">
        <div>
          <Rating label="Elo" value={fideRating} />
          <RatingSource>
            {fideId ? `FIDE-ID ${fideId}` : "Keine FIDE-ID"}
          </RatingSource>
        </div>
        <div className="border-l pl-4 sm:pl-6">
          <Rating label="DWZ" value={dwzRating} />
          <RatingSource>
            {dsbPersonId ? `DSB-ID ${dsbPersonId}` : "Keine DSB-Verknüpfung"}
          </RatingSource>
        </div>
      </div>
      {fideId ? (
        <div>
          <a
            href={`https://ratings.fide.com/profile/${fideId}`}
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            FIDE-Profil öffnen
            <ArrowUpRight aria-hidden />
          </a>
        </div>
      ) : null}
    </DetailsSection>
  );
}

function Rating({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="min-w-0">
      <div
        className={cn(
          "text-xl font-semibold tabular-nums",
          value == null ? "text-muted-foreground" : "text-primary",
        )}
      >
        {value ?? "–"}
      </div>
      <DetailsLabel>{label}</DetailsLabel>
    </div>
  );
}

function RatingSource({ children }: { children: ReactNode }) {
  return (
    <p className="mt-1.5 whitespace-nowrap text-[11px] text-muted-foreground">
      {children}
    </p>
  );
}
