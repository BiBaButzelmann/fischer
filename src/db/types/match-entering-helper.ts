import { InferSelectModel } from "drizzle-orm";
import { matchEnteringHelper } from "../schema/matchEnteringHelper";

export type MatchEnteringHelper = InferSelectModel<typeof matchEnteringHelper>;

export type MatchEnteringHelperWithName = MatchEnteringHelper & {
  profile: {
    firstName: string;
    lastName: string;
  };
};
