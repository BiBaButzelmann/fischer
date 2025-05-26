import {
    boolean,
    date,
    integer,
    pgTable,
    smallint,
    text,
    timestamp,
} from "drizzle-orm/pg-core";

export const tournament = pgTable("tournament", {
    id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
    club: text("organizer").notNull(),
    name: text("name").notNull(),
    type: text("type").notNull(),
    numberOfRounds: smallint("number_of_rounds").notNull(),
    startDate: date("start_date", { mode: "date" }).notNull(),
    endDate: date("end_date", { mode: "date" }).notNull(),
    timeLimit: text("time_limit").notNull(),
    location: text("location").notNull(),
    allClocksDigital: boolean("all_clocks_digital").notNull(),
    tieBreakMethod: text("tie_break_method").notNull(),
    softwareUsed: text("software").notNull(),
    phone: text("phone").notNull(),
    email: text("email").notNull(),

    createdAt: timestamp("created_at")
        .$defaultFn(() => /* @__PURE__ */ new Date())
        .notNull(),
    updatedAt: timestamp("updated_at")
        .$defaultFn(() => /* @__PURE__ */ new Date())
        .notNull(),
});
