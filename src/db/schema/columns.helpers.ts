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
