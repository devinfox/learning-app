// Pushes the local data/*.json store into Supabase.
//
//   npm run db:import          # insert rows that aren't there yet
//   npm run db:import -- --replace   # empty each table first
//
// Reads SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from the environment,
// falling back to .env.local so it works without exporting anything.

import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, "data");
const BATCH = 500;
const REPLACE = process.argv.includes("--replace");

async function loadEnv() {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) return;

  let raw;
  try {
    raw = await fs.readFile(path.join(ROOT, ".env.local"), "utf8");
  } catch {
    return;
  }

  for (const line of raw.split("\n")) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (!match) continue;
    const value = match[2].trim().replace(/^["']|["']$/g, "");
    process.env[match[1]] ??= value;
  }
}

await loadEnv();

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error(
    "Missing credentials. Put SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local first.",
  );
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const files = (await fs.readdir(DATA_DIR)).filter((name) => name.endsWith(".json")).sort();

if (files.length === 0) {
  console.error(`No JSON files in ${DATA_DIR} — nothing to import.`);
  process.exit(1);
}

let imported = 0;
let skipped = 0;
const failures = [];

for (const file of files) {
  const collection = path.basename(file, ".json");
  const table = collection.replace(/-/g, "_");
  const rows = JSON.parse(await fs.readFile(path.join(DATA_DIR, file), "utf8"));

  if (!Array.isArray(rows) || rows.length === 0) {
    console.log(`  ${table.padEnd(20)} empty, skipped`);
    continue;
  }

  if (REPLACE) {
    const { error } = await supabase.from(table).delete().neq("id", "");
    if (error) {
      failures.push(`${table}: clear failed — ${error.message}`);
      continue;
    }
  }

  let written = 0;
  let failed = false;

  for (let start = 0; start < rows.length; start += BATCH) {
    const slice = rows.slice(start, start + BATCH);
    const { error } = await supabase
      .from(table)
      .upsert(slice.map((row) => ({ id: row.id, data: row })), { onConflict: "id" });

    if (error) {
      failures.push(`${table}: ${error.message}`);
      failed = true;
      break;
    }
    written += slice.length;
  }

  if (failed) {
    skipped += rows.length - written;
  } else {
    imported += written;
    console.log(`  ${table.padEnd(20)} ${written} rows`);
  }
}

console.log(`\n${imported} rows imported${skipped ? `, ${skipped} not written` : ""}.`);

if (failures.length > 0) {
  console.error("\nFailures:");
  for (const failure of failures) console.error(`  - ${failure}`);
  console.error(
    "\nIf these say the table is missing, run supabase/migrations/0001_init.sql in the Supabase SQL editor first.",
  );
  process.exit(1);
}
