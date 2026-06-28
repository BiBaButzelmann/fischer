import { EditGroupsGrid } from "../groups/edit-groups-grid";
import { Tournament } from "@/db/types/tournament";
import { type GridGroup } from "./types";
import { getGroupsWithParticipantsByTournamentId } from "@/db/repositories/group";
import { getUnassignedParticipantsByTournamentId } from "@/db/repositories/participant";
import { getAllMatchEnteringHelpersByTournamentId } from "@/db/repositories/admin";
import { getGroupsWithMatchEnteringHelpersByTournamentId } from "@/db/repositories/group";
import { MatchEnteringHelperWithName } from "@/db/types/match-entering-helper";
import { getPromotionTargetsForPreviousEdition } from "@/services/promotion";

export async function EditGroups({ tournament }: { tournament: Tournament }) {
  const groupsData = await getGroupsWithParticipantsByTournamentId(
    tournament.id,
  );

  const unassignedParticipants = await getUnassignedParticipantsByTournamentId(
    tournament.id,
  );

  const matchEnteringHelpers = await getAllMatchEnteringHelpersByTournamentId(
    tournament.id,
  );

  const groupsWithHelpers =
    await getGroupsWithMatchEnteringHelpersByTournamentId(tournament.id);

  const currentAssignments = groupsWithHelpers.reduce(
    (acc, group) => {
      acc[group.id] = group.matchEnteringHelpers.map(
        ({ matchEnteringHelper }) => ({
          ...matchEnteringHelper,
          profile: matchEnteringHelper.profile,
        }),
      );
      return acc;
    },
    {} as Record<number, MatchEnteringHelperWithName[]>,
  );

  const groups = groupsData.map(
    (g) =>
      ({
        id: g.id,
        isNew: false,
        isDeleted: false,
        groupName: g.groupName,
        groupNumber: g.groupNumber,
        tier: g.tier,
        dayOfWeek: g.dayOfWeek,
        participants: g.participants.map(({ groupPosition, participant }) => ({
          groupPosition: groupPosition,
          ...participant,
        })),
        matchEnteringHelpers: currentAssignments[g.id] ?? [],
      }) as GridGroup,
  );

  const promotionTargets = await getPromotionTargetsForPreviousEdition();
  const promotionByParticipantId: Record<number, string> = {};
  for (const p of [
    ...groups.flatMap((g) => g.participants),
    ...unassignedParticipants,
  ]) {
    if (p.exercisePromotionRight === true) {
      const target = promotionTargets.get(p.profileId);
      if (target) {
        promotionByParticipantId[p.id] = target.targetTierLetter;
      }
    }
  }

  return (
    <EditGroupsGrid
      tournamentId={tournament.id}
      groups={groups}
      unassignedParticipants={unassignedParticipants}
      matchEnteringHelpers={matchEnteringHelpers}
      currentAssignments={currentAssignments}
      promotionTargets={promotionByParticipantId}
    />
  );
}
