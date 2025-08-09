import { Referee } from "@/db/types/referee";
import { SetupHelper } from "@/db/types/setup-helper";

export type RefereeWithAssignments = Referee & {
  assignedDaysCount: number;
};

export type SetupHelperWithAssignments = SetupHelper & {
  assignedDaysCount: number;
};
