import { NextResponse } from "next/server";
import { getDb } from "@/db/client";
import { userRollup } from "@/db/queries/aggregates";

export const runtime = "nodejs";

const ANONYMOUS_USER_ID = "00000000-0000-0000-0000-000000000001";
const DEFAULT_SINCE_DAYS = 90;

export async function GET(req: Request) {
  if (!getDb()) {
    return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
  }

  const userId = req.headers.get("x-mhindu-user-id") ?? ANONYMOUS_USER_ID;

  const url = new URL(req.url);
  const sinceDays = Number(url.searchParams.get("days") ?? DEFAULT_SINCE_DAYS);
  const since = new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000);

  try {
    const rollup = await userRollup(userId, since.toISOString());
    return NextResponse.json({ rollup, since: since.toISOString() });
  } catch (err) {
    return NextResponse.json({ error: "rollup_failed", detail: String(err) }, { status: 500 });
  }
}
