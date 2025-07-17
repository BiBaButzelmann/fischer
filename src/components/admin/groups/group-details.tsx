import { useMemo } from "react";
import { GroupTitle } from "./group-title";
import { GridGroup } from "./types";

type Props = {
  group: GridGroup;
};

export function GroupDetails({ group }: Props) {
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
    <div className="flex flex-col gap-1">
      <GroupTitle groupId={group.id} groupName={group.groupName} />
      <div className="flex flex-col gap-1 text-muted-foreground text-sm font-normal">
        <span>Teilnehmer: {group.participants.length}</span>
        <span>Elo-Durchschnitt: {Math.round(averageElo)}</span>
        <span>DWZ-Durchschnitt: {Math.round(averageDwz)}</span>
      </div>
    </div>
  );
}
