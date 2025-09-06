import { InferSelectModel } from "drizzle-orm";
import { profile } from "../schema/profile";
import { DayOfWeek } from "./group";

export type Profile = InferSelectModel<typeof profile>;

export type ProfileWithName = {
  id: number;
  userId: string;
  firstName: string;
  lastName: string;
  deletedAt: Date | null;
  phoneNumber: string;
  email: string;
  preferredMatchDay?: DayOfWeek | null;
};
