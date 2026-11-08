
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

if (!process.env.NEON_DB_URL) {
  throw new Error("NEON_DB_URL is missing");
}

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.NEON_DB_URL,
  },
  strict: true,
  verbose: true,
});
