import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

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
  created_by: uuid("created_by")
    .notNull()
    .references(() => users.id),
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const schema = {
  household: households,
  user: users,
};
