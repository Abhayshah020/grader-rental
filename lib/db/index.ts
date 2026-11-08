
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const databaseUrl = process.env.NEON_DB_URL;

if (!databaseUrl) {
  throw new Error("NEON_DB_URL is not configured");
}

const sql = neon(databaseUrl);

export const db = drizzle({
  client: sql,
  schema,
});
