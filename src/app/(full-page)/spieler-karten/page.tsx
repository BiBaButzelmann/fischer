import Image from "next/image";

export default async function Page() {
  return (
    <div className="w-[210mm] grid grid-cols-2 gap-[5mm] p-[3mm]">
      <PlayerCard
        tournamentName={"HSK Klubturnier 2023"}
        groupName={"Gruppe D1"}
        playerName={"Feis Horst-Jürgen"}
        playerClub={"Hamburger SK von 1830 eV"}
        fideRating={1519}
        dwzRating={1278}
      />
      <PlayerCard
        tournamentName={"HSK Klubturnier 2023"}
        groupName={"Gruppe D1"}
        playerName={"Yee hAw"}
        playerClub={"Hamburger SK von 1830 eV"}
        fideRating={1519}
        dwzRating={1278}
      />
      <PlayerCard
        tournamentName={"HSK Klubturnier 2023"}
        groupName={"Gruppe D1"}
        playerName={"Feis Horst-Jürgen"}
        playerClub={"Hamburger SK von 1830 eV"}
        fideRating={1519}
        dwzRating={1278}
      />
      <PlayerCard
        tournamentName={"HSK Klubturnier 2023"}
        groupName={"Gruppe D1"}
        playerName={"Yee hAw"}
        playerClub={"Hamburger SK von 1830 eV"}
        fideRating={1519}
        dwzRating={1278}
      />
      <PlayerCard
        tournamentName={"HSK Klubturnier 2023"}
        groupName={"Gruppe D1"}
        playerName={"Feis Horst-Jürgen"}
        playerClub={"Hamburger SK von 1830 eV"}
        fideRating={1519}
        dwzRating={1278}
      />
      <PlayerCard
        tournamentName={"HSK Klubturnier 2023"}
        groupName={"Gruppe D1"}
        playerName={"Yee hAw"}
        playerClub={"Hamburger SK von 1830 eV"}
        fideRating={1519}
        dwzRating={1278}
      />
    </div>
  );
}

type PlayerCardProps = {
  tournamentName: string;
  groupName: string;
  playerName: string;
  playerClub: string;
  fideRating?: number;
  dwzRating?: number;
};

function PlayerCard({
  tournamentName,
  groupName,
  playerName,
  playerClub,
  fideRating,
  dwzRating,
}: PlayerCardProps) {
  return (
    <div className="border border-black p-[5mm] h-[7.5cm] w-[10cm]">
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
          <span className="text-primary text-lg font-bold">{groupName}</span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-3xl font-bold">{playerName}</span>
        <span className="text-lg">{playerClub}</span>
        <div className="flex flex-col">
          <span className="text-lg">ELO: {fideRating ?? 0}</span>
          <span className="text-lg">DWZ: {dwzRating ?? 0}</span>
        </div>
      </div>
    </div>
  );
}
