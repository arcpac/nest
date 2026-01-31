import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  numeric,
  serial,
  unique,
  integer,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: text("username").notNull(),
  role: text("role").notNull().default("user"),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const groups = pgTable("groups", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  active: boolean("active").default(true).notNull(),
  created_by: uuid("created_by")
    .notNull()
    .references(() => users.id),
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const members = pgTable(
  "members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    user_id: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    group_id: uuid("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    first_name: text("first_name"),
    last_name: text("last_name"),
    email: text("email").notNull(),
    joined_at: timestamp("joined_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [unique().on(table.user_id, table.group_id)]
);

export const expenses = pgTable("expenses", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  created_by: uuid("created_by")
    .notNull()
    .references(() => users.id),
  group_id: uuid("group_id")
    .notNull()
    .references(() => groups.id),
  isEqual: boolean("isEqual").default(true).notNull(),
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const expense_shares = pgTable(
  "expense_shares",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    expense_id: uuid("expense_id")
      .notNull()
      .references(() => expenses.id, { onDelete: "cascade" }),
    member_id: uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    share: numeric("share", { precision: 10, scale: 2 }).notNull(), // how much this member owes
    paid: boolean("paid").default(false).notNull(), // whether the member has settled their share
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [unique().on(table.expense_id, table.member_id)]
);

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull(), // Content of the post
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.id),
  group_id: uuid("group_id")
    .notNull()
    .references(() => groups.id),
  status: text("status").default("draft").notNull(),
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});



export const otpChallenges = pgTable("otpchallenges", {
  id: uuid("id").defaultRandom().primaryKey(),

  email: text("email").notNull(),

  // hashed OTP (never store the actual 6-digit code)
  code_hash: text("code_hash").notNull(),

  expires_at: timestamp("expires_at", { withTimezone: true }).notNull(),
  used_at: timestamp("used_at", { withTimezone: true }),
  sent_at: timestamp("sent_at", { withTimezone: true }),
  failed_at: timestamp("failed_at", { withTimezone: true }),
  attempts: integer("attempts").notNull().default(0),

  // optional but useful
  ip: text("ip"),
  user_agent: text("user_agent"),

  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});


export const schema = {
  users,
  groups,
  members,
  expenses,
  expense_shares,
  posts,
};
