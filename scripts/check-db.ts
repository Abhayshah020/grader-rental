
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: ".env" });

async function checkDatabase() {
  const connectionString = process.env.NEON_DB_URL;

  if (!connectionString) {
    throw new Error("NEON_DB_URL was not loaded from .env.local");
  }

  const sql = neon(connectionString);

  console.log("\n--- NEON DATABASE CONNECTION CHECK ---");

  const info = await sql`
    SELECT
      current_database() AS database_name,
      current_schema() AS current_schema,
      current_user AS database_user,
      NOW() AS server_time
  `;

  console.log("Connection successful:");
  console.log(info);

  console.log("\n--- AUTHENTICATION TABLES ---");

  const tables = await sql`
    SELECT table_schema, table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN (
        'admins',
        'admin_login_otps',
        'admin_sessions',
        'admin_login_audit'
      )
    ORDER BY table_name
  `;

  console.table(tables);

  console.log("\n--- DRIZZLE MIGRATION HISTORY ---");

  const migrations = await sql`
    SELECT to_regclass('drizzle.__drizzle_migrations')
      AS migration_table
  `;

  console.log(migrations);

  if (tables.length === 4) {
    console.log("\nSUCCESS: All four authentication tables exist.");
  } else {
    console.log(
      `\nWARNING: Found ${tables.length}/4 authentication tables.`
    );
  }
}

checkDatabase().catch((error) => {
  console.error("\nDATABASE CHECK FAILED:");
  console.error(error);
  process.exitCode = 1;
});
