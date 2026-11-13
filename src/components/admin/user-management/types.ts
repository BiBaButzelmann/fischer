import { Tournament } from "@/db/types/tournament";

export type TournamentRef = Pick<Tournament, "id" | "name">;
