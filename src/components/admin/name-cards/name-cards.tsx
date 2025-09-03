import { ParticipantWithRatingAndChessClub } from "@/db/types/participant";
import Image from "next/image";

type Props = {
  tournamentName: string;
  groupName: string;
  participant: ParticipantWithRatingAndChessClub;
};

export function NameCard({ tournamentName, groupName, participant }: Props) {
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
