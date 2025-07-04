import { pgEnum, timestamp } from "drizzle-orm/pg-core";

export const timestamps = {
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
};

export const availableMatchDays = ["tuesday", "thursday", "friday"] as const;

export const matchDay = pgEnum("match_day", availableMatchDays);

export const gameResults = [
  "draw",
  "white_wins",
  "black_wins",
  // TODO: nicht angetreten etc.
] as const;

export const gameResult = pgEnum("result", gameResults);
