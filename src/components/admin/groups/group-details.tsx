import { useMemo } from "react";
import { GroupTitle } from "./group-title";
import { GridGroup } from "./types";

type Props = {
  group: GridGroup;
};

export function GroupDetails({ group }: Props) {
  const averageElo = useMemo(() => {
    if (group.participants.length === 0) return 0;

    const eloSum = group.participants.reduce(
      (sum, participant) => sum + (participant.fideRating ?? 0),
      0,
    );
    return eloSum / group.participants.length;
  }, [group.participants]);

  const averageDwz = useMemo(() => {
    if (group.participants.length === 0) return 0;

    const dwzSum = group.participants.reduce(
      (sum, participant) => sum + (participant.dwzRating ?? 0),
      0,
    );
    return dwzSum / group.participants.length;
  }, [group.participants]);

  return (
    <div className="flex flex-col gap-1">
      <GroupTitle groupId={group.id} groupName={group.groupName} />
      <div className="flex flex-col gap-1 text-muted-foreground text-sm font-normal">
        <span>Teilnehmer: {group.participants.length}</span>
        <span>Elo-Durchschnitt: {averageElo.toFixed(2)}</span>
        <span>DWZ-Durchschnitt: {averageDwz.toFixed(2)}</span>
      </div>
    </div>
  );
}
