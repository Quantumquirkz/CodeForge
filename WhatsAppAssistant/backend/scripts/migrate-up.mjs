#!/usr/bin/env node
/**
 * Runs migrations with dotenv loaded.
 * Creates the database if it doesn't exist, then runs migrations.
 */
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env
config({ path: resolve(__dirname, "../.env") });
config({ path: resolve(__dirname, "../../.env") });
config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), "../.env") });

const DEFAULT_DB =
  "postgresql://postgres:postgres@localhost:5432/whatsapp_assistant";
let dbUrl = process.env.DATABASE_URL || DEFAULT_DB;

// pg requires password to be a string
const userInfoMatch = dbUrl.match(/^(postgres(?:ql)?:\/\/)([^@]+)(@.+)$/);
if (userInfoMatch) {
  const [, scheme, userInfo, rest] = userInfoMatch;
  if (!userInfo.includes(":") && !userInfo.includes("%3A")) {
    dbUrl = `${scheme}${userInfo}:${rest}`;
  }
}
process.env.DATABASE_URL = dbUrl;

// Create database if it doesn't exist
const dbName = new URL(dbUrl).pathname.slice(1).replace(/^\//, "") || "whatsapp_assistant";
if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(dbName)) {
  console.error("Invalid database name in DATABASE_URL");
  process.exit(1);
}
const baseUrl = dbUrl.replace(/\/[^/]*$/, "/postgres");
const client = new pg.Client({ connectionString: baseUrl });
try {
  await client.connect();
  const res = await client.query(
    "SELECT 1 FROM pg_database WHERE datname = $1",
    [dbName]
  );
  if (res.rows.length === 0) {
    await client.query(`CREATE DATABASE ${dbName}`);
    console.log(`Database "${dbName}" created.`);
  }
} catch (err) {
  console.error("Failed to ensure database exists:", err.message);
  process.exit(1);
} finally {
  await client.end();
}

execSync("node-pg-migrate up --dir migrations/run", {
  stdio: "inherit",
  cwd: resolve(__dirname, ".."),
});
