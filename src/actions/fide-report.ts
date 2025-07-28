import { authWithRedirect } from "@/auth/utils";
import { db } from "@/db/client";
import { Game } from "@/db/types/game";
import { generateFideReport } from "@/lib/fide-report";
import { PlayerEntry, Result } from "@/lib/fide-report/types";
import { DateTime } from "luxon";
import invariant from "tiny-invariant";
import { match } from "ts-pattern";

export async function generateFideReportFile(groupId: number, month: number) {
  const session = await authWithRedirect();
  invariant(session?.user.role === "admin", "Unauthorized");

  const data = await db.query.group.findFirst({
    where: (group, { eq }) => eq(group.id, groupId),
    with: {
      participants: {
        with: {
          participant: {
            with: {
              profile: {
                columns: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      },
      tournament: true,
      games: true,
    },
  });
  invariant(data, "Group not found");
  invariant(
    data.tournament.organizerProfileId != null,
    "Organizer profile id not found",
  );

  const organizerProfile = await db.query.profile.findFirst({
    where: (profile, { eq }) =>
      eq(profile.id, data.tournament.organizerProfileId!),
    columns: {
      firstName: true,
      lastName: true,
    },
  });
  invariant(organizerProfile, "Organizer profile not found");

  const games = await db.query.game.findMany({
    where: (game, { eq, and, sql }) =>
      and(
        eq(game.groupId, groupId),
        sql`EXTRACT(MONTH FROM ${game.scheduled}) = ${month}`,
      ),
    orderBy: (game, { asc }) => asc(game.scheduled),
  });

  const gamesAsWhiteParticipant = games.reduce(
    (acc, game) => {
      acc[game.whiteParticipantId] ??= [];
      acc[game.whiteParticipantId].push(game.id);
      return acc;
    },
    {} as Record<number, number[]>,
  );

  const gamesAsBlackParticipant = games.reduce(
    (acc, game) => {
      acc[game.blackParticipantId] ??= [];
      acc[game.blackParticipantId].push(game.id);
      return acc;
    },
    {} as Record<number, number[]>,
  );

  const entries = data.participants.map(({ groupPosition, participant }) => {
    const whiteGameIds = gamesAsWhiteParticipant[participant.id] ?? [];
    const blackGameIds = gamesAsBlackParticipant[participant.id] ?? [];
    const participantGames = games.filter(
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

    return {
      index: 1,
      startingGroupPosition: groupPosition,
      gender: "m", // TODO,
      title: participant.title ?? "",
      name: `${participant.profile.firstName} ${participant.profile.lastName}`,
      fideRating: participant.fideRating!,
      fideNation: participant.nationality!,
      fideId: participant.fideId,
      birthYear: DateTime.local(participant.birthYear),
      currentPoints: -1, // TODO: calculate from games
      currentGroupPosition: -1, // TODO: calculate from games
      results: participantGames.map((game) => {
        invariant(game.result, `Game ${game.id} does not have a result`);
        return {
          scheduled: DateTime.fromJSDate(game.scheduled),
          opponentGroupPosition: -1, // TODO: get from relations table
          pieceColor: whiteGameIds.includes(game.id) ? "w" : "b",
          result: mapResult(game.result),
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
  const organizer = `${organizerProfile.firstName} ${organizerProfile.lastName}`;
  // 122
  const timeLimit = data.tournament.timeLimit;

  return generateFideReport(
    {
      tournamentName,
      location,
      federation,
      startDate: DateTime.fromJSDate(startDate),
      endDate: DateTime.fromJSDate(endDate),
      numberOfPlayers,
      numberOfRatedPlayers,
      tournamentType,
      organizer,
      timeLimit,
    },
    entries,
  );
}

function mapResult(result: NonNullable<Game["result"]>): Result["result"] {
  return match<NonNullable<Game["result"]>, Result["result"]>(result)
    .with("+:-", () => "+")
    .with("-:-", () => "-")
    .with("-:+", () => "-")
    .with("0-½", () => "0")
    .with("0:1", () => "0")
    .with("1:0", () => "1")
    .with("½-0", () => "=")
    .with("½-½", () => "=")
    .exhaustive();
}
