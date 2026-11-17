import { getTwz } from "@/lib/twz";
import { cn } from "@/lib/utils";

const RATING_COLUMNS = "grid w-[5.75rem] shrink-0 grid-cols-2 gap-x-3";

type Props = {
  fideRating: number | null;
  dwzRating: number | null;
};

export function Ratings({ fideRating, dwzRating }: Props) {
  const twz = getTwz({ fideRating, dwzRating });
  const ratings = [
    { label: "FIDE", value: fideRating },
    { label: "DWZ", value: dwzRating },
  ];

  return (
    <dl
      className={cn(
        RATING_COLUMNS,
        "pt-px text-right font-mono text-sm tabular-nums",
      )}
    >
      {ratings.map(({ label, value }) => {
        const isTwz = value != null && value === twz;
        return (
          <div key={label}>
            <dt className="sr-only">{label}</dt>
            <dd
              title={isTwz ? "Turnierwertungszahl (TWZ)" : undefined}
              className={cn(
                isTwz
                  ? "font-semibold underline decoration-primary decoration-2 underline-offset-[5px]"
                  : "text-muted-foreground",
              )}
            >
              {value ?? "–"}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

export function RatingsHeader() {
  return (
    <div className="flex items-center gap-3 border-b bg-muted px-3 py-2 text-xs font-medium text-muted-foreground sm:px-4">
      <span className="flex-1">Name</span>
      <span className={cn(RATING_COLUMNS, "text-right font-mono")}>
        <span>FIDE</span>
        <span>DWZ</span>
      </span>
      <span className="w-9" aria-hidden />
    </div>
  );
}
