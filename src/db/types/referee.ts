import { InferSelectModel } from "drizzle-orm";
import { referee } from "../schema/referee";
import { DayOfWeek } from "./group";

export type Referee = InferSelectModel<typeof referee>;

export type RefereeWithName = Referee & {
  profile: {
    firstName: string;
    lastName: string;
  };
};

export type RefereeWithProfile = {
  id: number;
  preferredMatchDay: DayOfWeek;
  profile: {
    id: number;
    userId: string;
    firstName: string;
    lastName: string;
    phoneNumber: string | null;
    deletedAt: Date | null;
  };
};
