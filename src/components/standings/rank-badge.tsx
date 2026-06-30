import { cn } from "@/lib/utils";

export function RankBadge({ position }: { position: number }) {
  return (
    <div
      className={cn(
        "w-7 h-7 flex items-center justify-center rounded-md mx-auto font-bold",
        position === 1 && "bg-yellow-400 text-yellow-900",
        position === 2 && "bg-slate-300 text-slate-800",
        position === 3 && "bg-orange-400 text-orange-900",
      )}
    >
      {position}
    </div>
  );
}
