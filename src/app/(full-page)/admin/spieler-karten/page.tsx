import { authWithRedirect } from "@/auth/utils";
import { getParticipantsInGroup } from "@/db/repositories/game";
import { getGroupsByTournamentId } from "@/db/repositories/group";
import { getLatestTournament } from "@/db/repositories/tournament";
import { ParticipantWithRating } from "@/db/types/participant";
import Image from "next/image";
import invariant from "tiny-invariant";

export default async function Page() {
  await authWithRedirect();
  const tournament = await getLatestTournament();
  invariant(tournament != null, "No active tournament found");

  const groups = await getGroupsByTournamentId(tournament.id);
  const participantsInGroups = await Promise.all(
    groups.map((group) => getParticipantsInGroup(group.id)),
  );

  return (
    <div className="w-[210mm] grid grid-cols-2 gap-[5mm] p-[3mm]">
      {participantsInGroups.map((participants, index) =>
        participants.map((participant) => (
          <PlayerCard
            key={participant.id}
            tournamentName={tournament.name}
            groupName={groups[index].groupName}
            participant={participant}
          />
        )),
      )}
    </div>
  );
}

type PlayerCardProps = {
  tournamentName: string;
  groupName: string;
  participant: ParticipantWithRating;
};

async function PlayerCard({
  tournamentName,
  groupName,
  participant,
}: PlayerCardProps) {
  return (
    <div className="border border-black p-[5mm] h-[7.5cm] w-[10cm] print:break-inside-avoid">
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
            Gruppe {groupName}
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
  );
}
