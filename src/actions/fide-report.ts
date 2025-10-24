"use server";

import { authWithRedirect } from "@/auth/utils";
import { monthLabels } from "@/constants/constants";
import { db } from "@/db/client";
import { getGamesInMonth } from "@/db/repositories/game";
import { game } from "@/db/schema/game";
import { matchdayReferee, matchday, matchdayGame } from "@/db/schema/matchday";
import { profile } from "@/db/schema/profile";
import { referee } from "@/db/schema/referee";
import { GameResult } from "@/db/types/game";
import { action } from "@/lib/actions";
import { generateFideReport } from "@/lib/fide-report";
import {
  formatPlayerName,
  formatRefereeName,
} from "@/lib/fide-report/format-fide-name";
import { PlayerEntry, Result } from "@/lib/fide-report/types";
import { calculateStandings } from "@/lib/standings";
import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { DateTime } from "luxon";
import invariant from "tiny-invariant";
import { match } from "ts-pattern";

export const generateFideReportFile = action(
  async (groupId: number, month: number) => {
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
        games: true,
      },
    });
    invariant(data, "Group not found");

    const groupReferee = await getRefereeOfGroup(groupId, month);
    invariant(groupReferee, "Referee not found for the specified month");

    const gamesInMonth = await getGamesInMonth(groupId, month);

    const completedGames = gamesInMonth.filter((game) => {
      return game.result != null;
    });

    // a game is considered to have actually been played, if:
    // - it is not a bye game
    // - both participants were not disabled at the time of the game
    const actuallyPlayedGames = completedGames.filter((game) => {
      const isByeGame =
        game.whiteParticipantId == null || game.blackParticipantId == null;

      if (isByeGame) {
        return false;
      }

      // check for disabled participants
      const date = game.matchday.date;
      const whiteParticipant = data.participants.find(
        (p) => p.participant.id === game.whiteParticipantId,
      );
      const blackParticipant = data.participants.find(
        (p) => p.participant.id === game.blackParticipantId,
      );
      invariant(
        whiteParticipant,
        `White participant ${game.whiteParticipantId} not found`,
      );
      invariant(
        blackParticipant,
        `Black participant ${game.blackParticipantId} not found`,
      );

      const isWhiteParticipantDisabled =
        whiteParticipant.participant.deletedAt != null &&
        whiteParticipant.participant.deletedAt <= date;
      const isBlackParticipantDisabled =
        blackParticipant.participant.deletedAt != null &&
        blackParticipant.participant.deletedAt <= date;

      return !isWhiteParticipantDisabled && !isBlackParticipantDisabled;
    });

    const gamesAsWhiteParticipant = actuallyPlayedGames.reduce(
      (acc, game) => {
        if (
          game.whiteParticipantId === null ||
          game.blackParticipantId === null
        ) {
          return acc;
        }
        acc[game.whiteParticipantId] ??= [];
        acc[game.whiteParticipantId].push(game.id);
        return acc;
      },
      {} as Record<number, number[]>,
    );

    const gamesAsBlackParticipant = actuallyPlayedGames.reduce(
      (acc, game) => {
        if (
          game.whiteParticipantId === null ||
          game.blackParticipantId === null
        ) {
          return acc;
        }
        acc[game.blackParticipantId] ??= [];
        acc[game.blackParticipantId].push(game.id);
        return acc;
      },
      {} as Record<number, number[]>,
    );

    const standings = calculateStandings(
      actuallyPlayedGames,
      data.participants.map((p) => p.participant),
    );

    const getPointsOfPlayer = (participantId: number) => {
      const standing = standings.find((s) => s.participantId === participantId);
      invariant(
        standing != null,
        `Participant ${participantId} could not be found in standings`,
      );
      return standing.points;
    };

    const getInitialGroupPositionOfPlayer = (participantId: number) => {
      const participant = data.participants.find(
        (p) => p.participant.id === participantId,
      );
      invariant(
        participant != null,
        `Participant ${participantId} could not be found in participants`,
      );
      return participant.groupPosition;
    };

    const getGroupPositionOfPlayer = (participantId: number) => {
      const currentGroupPosition = standings.findIndex(
        (s) => s.participantId === participantId,
      );
      invariant(
        currentGroupPosition >= 0,
        `Participant ${participantId} is not in the standings`,
      );
      return currentGroupPosition + 1;
    };

    const entries = data.participants.map(({ groupPosition, participant }) => {
      const whiteGameIds = gamesAsWhiteParticipant[participant.id] ?? [];
      const blackGameIds = gamesAsBlackParticipant[participant.id] ?? [];
      const participantGames = actuallyPlayedGames.filter(
        (game) =>
          whiteGameIds.includes(game.id) || blackGameIds.includes(game.id),
      );

      invariant(
        participant.fideId != null,
        `Participant ${participant.id} does not have a FIDE ID`,
      );
      invariant(
        participant.fideRating != null,
        `Participant ${participant.id} does not have a FIDE rating`,
      );
      invariant(
        participant.birthYear != null,
        `Participant ${participant.id} does not have a birth year`,
      );
      invariant(
        participant.nationality != null,
        `Participant ${participant.id} does not have a nationality`,
      );

      const currentGroupPosition = getGroupPositionOfPlayer(participant.id);
      const currentPoints = getPointsOfPlayer(participant.id);

      return {
        index: 1,
        startingGroupPosition: groupPosition,
        gender: participant.gender,
        title: participant.title ?? "",
        name: formatPlayerName(
          participant.profile.firstName,
          participant.profile.lastName,
        ),
        fideRating: participant.fideRating!,
        fideNation: participant.nationality!,
        fideId: participant.fideId,
        birthYear: DateTime.local(participant.birthYear),
        currentPoints,
        currentGroupPosition,
        results: participantGames
          .filter(
            (game) =>
              game.whiteParticipantId !== null &&
              game.blackParticipantId !== null,
          )
          .map((game) => {
            invariant(game.result, `Game ${game.id} does not have a result`);
            const isWhite = whiteGameIds.includes(game.id);

            return {
              scheduled: DateTime.fromJSDate(game.matchday.date),
              opponentGroupPosition: getInitialGroupPositionOfPlayer(
                isWhite ? game.blackParticipantId! : game.whiteParticipantId!,
              ),
              pieceColor: isWhite ? "w" : "b",
              result: mapResult(game.result, isWhite),
            };
          }),
      } as PlayerEntry;
    });

    // 012
    const tournamentName = `${data.tournament.name} - ${data.groupName}`;
    // 022
    const location = data.tournament.location;
    // 032
    const federation = "GER";
    // 042
    const startDate = data.tournament.startDate;
    // 052
    const endDate = data.tournament.endDate;
    // 062
    const numberOfPlayers = data.participants.length;
    // 072
    const numberOfRatedPlayers = data.participants.filter(
      (p) => p.participant.fideId != null,
    ).length;
    // 092
    const tournamentType = "Individual round robin";
    // 102
    const referee = formatRefereeName(
      groupReferee.firstName,
      groupReferee.lastName,
    );
    // 122
    const timeLimit = data.tournament.timeLimit;

    const fideReport = generateFideReport(
      {
        tournamentName,
        location,
        federation,
        startDate: DateTime.fromJSDate(startDate),
        endDate: DateTime.fromJSDate(endDate),
        numberOfPlayers,
        numberOfRatedPlayers,
        tournamentType,
        referee,
        timeLimit,
      },
      entries,
    );

    const monthName = monthLabels[month - 1];
    const fileName = `FIDE_Export_${data.tournament.name.replace(" ", "_")}_${data.groupName.replace(" ", "_")} ${monthName}.txt`;

    return {
      fideReport,
      fileName,
    };
  },
);

async function getRefereeOfGroup(groupId: number, month: number) {
  const countExpr = sql<number>`COUNT(*)`;
  const rows = await db
    .select({
      refereeId: referee.id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      occurrences: countExpr,
    })
    .from(matchdayReferee)
    .innerJoin(matchday, eq(matchday.id, matchdayReferee.matchdayId))
    .innerJoin(matchdayGame, eq(matchdayGame.matchdayId, matchday.id))
    .innerJoin(game, eq(game.id, matchdayGame.gameId))
    .innerJoin(referee, eq(referee.id, matchdayReferee.refereeId))
    .innerJoin(profile, eq(profile.id, referee.profileId))
    .where(
      and(
        eq(game.groupId, groupId),
        isNull(matchdayReferee.canceledAt),
        sql`EXTRACT(MONTH FROM ${matchday.date}) = ${month}`,
      ),
    )
    .groupBy(referee.id, profile.firstName, profile.lastName)
    .orderBy(desc(countExpr))
    .limit(1);

  return rows[0] ?? null;
}

function mapResult(result: GameResult, isWhite: boolean): Result["result"] {
  return match<GameResult, Result["result"]>(result)
    .with("+:-", () => (isWhite ? "+" : "-"))
    .with("-:-", () => (isWhite ? "-" : "-"))
    .with("-:+", () => (isWhite ? "-" : "+"))
    .with("0-½", () => (isWhite ? "0" : "="))
    .with("0:1", () => (isWhite ? "0" : "1"))
    .with("1:0", () => (isWhite ? "1" : "0"))
    .with("½-0", () => (isWhite ? "=" : "0"))
    .with("½-½", () => (isWhite ? "=" : "="))
    .exhaustive();
}
