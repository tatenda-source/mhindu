import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type DrizzleClient = ReturnType<typeof drizzle<typeof schema>>;

let _client: DrizzleClient | null = null;

function buildClient(): DrizzleClient | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;

  // prepare: false required for Neon pooled connections (no named prepared statements)
  const sql = postgres(url, { prepare: false });
  return drizzle(sql, { schema });
}

export function getDb(): DrizzleClient | null {
  if (_client !== null) return _client;
  _client = buildClient();
  return _client;
}
