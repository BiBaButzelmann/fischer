import { InferSelectModel } from "drizzle-orm";
import { referee } from "../schema/referee";

export type Referee = InferSelectModel<typeof referee>;

export type RefereeWithName = {
  id: number;
  profile: {
    firstName: string;
    lastName: string;
  };
};
