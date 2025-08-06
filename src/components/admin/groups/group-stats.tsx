import { useMemo } from "react";
import { GridGroup } from "./types";
import { CircleSlash2, Users } from "lucide-react";

type Props = {
  group: GridGroup;
};

export function GroupStats({ group }: Props) {
  const averageElo = useMemo(() => {
    const participantsWithElo = group.participants.filter(
      (participant) => participant.fideRating !== null,
    );
    if (participantsWithElo.length === 0) return 0;

    const eloSum = participantsWithElo.reduce(
      (sum, participant) => sum + (participant.fideRating ?? 0),
      0,
    );
    return eloSum / participantsWithElo.length;
  }, [group.participants]);

  const averageDwz = useMemo(() => {
    const participantsWithDwz = group.participants.filter(
      (participant) => participant.dwzRating !== null,
    );
    if (participantsWithDwz.length === 0) return 0;

    const dwzSum = participantsWithDwz.reduce(
      (sum, participant) => sum + (participant.dwzRating ?? 0),
      0,
    );
    return dwzSum / participantsWithDwz.length;
  }, [group.participants]);

  return (
    <div className="flex items-center justify-between text-xs text-muted-foreground">
      <div className="flex items-center gap-1">
        <Users className="h-3 w-3" />
        <span>{group.participants.length}</span>
      </div>
      <div className="flex items-center gap-1">
        <CircleSlash2 className="h-3 w-3" />
        <span>Elo: {Math.round(averageElo)}</span>
      </div>
      <div className="flex items-center gap-1">
        <CircleSlash2 className="h-3 w-3" />
        <span>DWZ: {Math.round(averageDwz)}</span>
      </div>
    </div>
  );
}
