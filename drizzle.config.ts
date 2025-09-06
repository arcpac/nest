import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    // host: "localhost",
    // port: 5432,
    // user: "antoncaballes",
    // password: "root",
    // database: "nest",
    url: process.env.DATABASE_URL!, // your env variable
  },
});


