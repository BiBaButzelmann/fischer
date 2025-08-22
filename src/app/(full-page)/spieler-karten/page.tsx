import { authWithRedirect } from "@/auth/utils";
import { getParticipantsInGroup } from "@/db/repositories/game";
import { getGroupById } from "@/db/repositories/group";
import { getGroupIdsByMatchdayId } from "@/db/repositories/match-day";
import { getTournamentById } from "@/db/repositories/tournament";
import Image from "next/image";
import invariant from "tiny-invariant";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    tournamentId: number;
    matchdayId: number;
  }>;
}) {
  await authWithRedirect();
  const { tournamentId, matchdayId } = await searchParams;

  const tournament = await getTournamentById(tournamentId);
  const groupIds = await getGroupIdsByMatchdayId(matchdayId);
  invariant(tournament != null);

  return (
    <div className="w-[210mm] grid grid-cols-2 gap-[5mm] p-[3mm]">
      {groupIds.map((groupId) => (
        <PlayerCard
          key={groupId}
          tournamentName={tournament.name}
          groupId={groupId}
        />
      ))}
    </div>
  );
}

type PlayerCardProps = {
  tournamentName: string;
  groupId: number;
};

async function PlayerCard({ tournamentName, groupId }: PlayerCardProps) {
  const group = await getGroupById(groupId);
  const participants = await getParticipantsInGroup(groupId);
  invariant(group != null);

  return participants.map((participant) => (
    <div
      key={participant.id}
      className="border border-black p-[5mm] h-[7.5cm] w-[10cm] print:break-inside-avoid"
    >
      <div className="flex items-center mb-2">
        <Image
          src="/logo.webp"
          alt="HSK 1830 Logo"
          width={85}
          height={85}
          className="object-contain"
        />
        <div className="flex flex-1 flex-col gap-4 text-center">
          <span className="text-lg">{tournamentName}</span>
          <span className="text-primary text-lg font-bold">
            Gruppe {group.groupName}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-3xl font-bold">
          {participant.profile.firstName} {participant.profile.lastName}
        </span>
        <span className="text-lg">{participant.chessClub}</span>
        <div className="flex flex-col">
          <span className="text-lg">ELO: {participant.fideRating ?? 0}</span>
          <span className="text-lg">DWZ: {participant.dwzRating ?? 0}</span>
        </div>
      </div>
    </div>
  ));
}
