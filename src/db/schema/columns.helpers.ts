import { pgEnum, timestamp } from "drizzle-orm/pg-core";

export const timestamps = {
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  deletedAt: timestamp("deleted_at"),
};

export const availableMatchDays = ["tuesday", "thursday", "friday"] as const;

export const matchDay = pgEnum("match_day", availableMatchDays);

export const gameResults = [
  "1:0",
  "0:1",
  "½-½",
  "+:-",
  "-:+",
  "-:-",
  "0-½",
  "½-0",
] as const;

export const gameResult = pgEnum("result", gameResults);

export const gender = pgEnum("gender", ["m", "f"]);
// Currently I have only seen "Dr." as an academic title in use on ratings.fide.com
export const academicTitle = pgEnum("academic_title", ["Dr."]);
