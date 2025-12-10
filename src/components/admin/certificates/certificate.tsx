import type { GroupWithTopParticipants } from "@/db/types/certificate";
import { getParticipantFullName } from "@/lib/participant";
import Image from "next/image";

type Props = {
  participant: GroupWithTopParticipants["topParticipants"][0];
  group: GroupWithTopParticipants;
  position: number;
  tournamentYear: number;
};

export function Certificate({
  participant,
  group,
  position,
  tournamentYear,
}: Props) {
  const isWinner = position === 1;
  const isKlubmeister = isWinner && group.groupName === "A";
  const placementText = isWinner
    ? `Sieger Gruppe ${group.groupName}`
    : `${position}. Platz Gruppe ${group.groupName}`;

  const maxPoints = participant.gamesPlayed;
  const formattedPoints = participant.points % 1 === 0
    ? participant.points.toString()
    : participant.points.toFixed(1);
  const pointsText = `${formattedPoints}/${maxPoints} Punkte`;  return (
    <div className="w-[210mm] h-[297mm] bg-white border shadow-lg relative print:border-0 print:shadow-none print:break-after-page">
      <div className="absolute inset-[10mm] border-[2px] border-red-700 pointer-events-none" />
      <div className="absolute inset-[11mm] border border-red-700 pointer-events-none" />

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <Image
          src="/king_icon.webp"
          alt="Schach König"
          width={500}
          height={500}
          className="opacity-[0.08] grayscale object-contain"
        />
      </div>

      <div className="relative flex flex-col items-center justify-between h-full p-16">
        <div className="flex flex-col items-center gap-16 text-center flex-1 justify-center">
          <h1 className="text-7xl font-bold tracking-wide">
            {isKlubmeister ? "Klubmeister" : "Urkunde"}
          </h1>

          <div className="text-5xl font-bold">
            {getParticipantFullName(participant)}
          </div>          <div className="text-4xl font-bold tracking-wide mt-4">
            HSK Klubturnier
          </div>

          <div className="text-3xl mt-2">{placementText}</div>

          <div className="mt-4 text-2xl">{pointsText}</div>

          <div className="mt-16 text-xl text-muted-foreground">
            {tournamentYear}
          </div>
        </div>

        <div className="flex items-center justify-center gap-12 w-full">
          <div className="text-left text-xs">
            <div className="font-bold">Hamburger Schachklub von 1830 e.V.</div>
            <div>Königlich in Fantasie und Logik</div>
          </div>
          <Image
            src="/logo.webp"
            alt="HSK 1830 Logo"
            width={120}
            height={144}
            className="object-contain"
          />
          <div className="text-right text-xs">
            <div>Schellingstraße 41, 22089 Hamburg</div>
            <div>www.hsk1830.de</div>
          </div>
        </div>
      </div>
    </div>
  );
}
