"use server";

import { authWithRedirect } from "@/auth/utils";
import { db } from "@/db/client";
import { action } from "@/lib/actions";
import { generateDwzReport } from "@/lib/dwz-report/dwz-report";
import { formatRefereeName } from "@/lib/fide-report/format-fide-name";
import { getRefereeOfGroup } from "@/services/referee";
import { getStandings } from "@/services/standings";
import invariant from "tiny-invariant";

export const generateDwzReportFile = action(async (groupId: number) => {
  const session = await authWithRedirect();
  invariant(session?.user.role === "admin", "Unauthorized");

  const data = await db.query.group.findFirst({
    where: (group, { eq }) => eq(group.id, groupId),
    with: {
      participants: {
        with: {
          participant: {
            with: {
              profile: true,
            },
          },
        },
      },
      tournament: true,
      games: {
        with: {
          matchdayGame: {
            with: {
              matchday: true,
            },
          },
        },
      },
    },
  });
  invariant(data, "Group not found");

  const groupReferee = await getRefereeOfGroup(groupId);
  const standings = await getStandings(groupId);

  const dwzReport = generateDwzReport({
    tournamentName: data.tournament.name,
    groupName: data.groupName,
    location: data.tournament.location,
    startDate: data.tournament.startDate,
    endDate: data.tournament.endDate,
    timeLimit: data.tournament.timeLimit,
    referee:
      groupReferee != null
        ? formatRefereeName(groupReferee.firstName, groupReferee.lastName)
        : undefined,
    participants: data.participants.map(({ groupPosition, participant }) => ({
      id: participant.id,
      startingPosition: groupPosition,
      firstName: participant.profile.firstName,
      lastName: participant.profile.lastName,
      academicTitle: participant.profile.academicTitle,
      title: participant.title,
      gender: participant.gender,
      birthYear: participant.birthYear,
      birthDate: participant.birthDate,
      nationality: participant.nationality,
      fideId: participant.fideId,
      fideRating: participant.fideRating,
      dwzRating: participant.dwzRating,
    })),
    games: data.games.map((game) => ({
      round: game.round,
      whiteParticipantId: game.whiteParticipantId,
      blackParticipantId: game.blackParticipantId,
      result: game.result,
      date: game.matchdayGame?.matchday.date ?? data.tournament.startDate,
    })),
    standings: standings.map((standing) => ({
      participantId: standing.participantId,
      points: standing.points,
    })),
  });

  const fileName = `DWZ_Export_${data.tournament.name.replaceAll(" ", "_")}_${data.groupName.replaceAll(" ", "_")}.trf`;

  return {
    dwzReport,
    fileName,
  };
});
