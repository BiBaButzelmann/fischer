import { InferSelectModel } from "drizzle-orm";
import { setupHelper } from "../schema/setupHelper";

export type SetupHelper = InferSelectModel<typeof setupHelper>;

export type SetupHelperWithName = SetupHelper & {
  profile: {
    firstName: string;
    lastName: string;
  };
};

export type SetupHelperWithAssignments = SetupHelper & {
  assignedDaysCount: number;
};
