import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "root",
    database: "nest",
  },
});


