import { pgTable, uuid, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const households = pgTable("households", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  active: boolean("active").default(false).notNull(),
  created_by: uuid("created_by")
    .notNull()
    .references(() => users.id),
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const members = pgTable("members", {
  id: uuid("id").defaultRandom().primaryKey(),
  household_id: uuid("household_id")
    .notNull()
    .references(() => households.id, { onDelete: "cascade" }),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  first_name: text("first_name"),
  last_name: text("last_name"),
  role: text("role").default("member").notNull(), // e.g. "owner", "admin", "member"
  joined_at: timestamp("joined_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const schema = {
  household: households,
  user: users,
};
