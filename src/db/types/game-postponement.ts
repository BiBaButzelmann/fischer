import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type { gamePostponement } from "../schema/gamePostponement";

export type GamePostponement = InferSelectModel<typeof gamePostponement>;
export type InsertGamePostponement = InferInsertModel<typeof gamePostponement>;

export type GamePostponementWithDetails = GamePostponement & {
  participant: {
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  postponedByProfile: {
    firstName: string;
    lastName: string;
  };
};
