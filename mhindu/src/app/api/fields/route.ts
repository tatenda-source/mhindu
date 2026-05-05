import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { fields } from "@/db/schema";

export const runtime = "nodejs";

const ANONYMOUS_USER_ID = "00000000-0000-0000-0000-000000000001";

function resolveUserId(req: Request): string {
  return req.headers.get("x-mhindu-user-id") ?? ANONYMOUS_USER_ID;
}

export async function GET(req: Request) {
  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
  }

  const userId = resolveUserId(req);
  const rows = await db
    .select()
    .from(fields)
    .where(eq(fields.owner_id, userId))
    .orderBy(fields.created_at);

  return NextResponse.json({ fields: rows });
}

const CreateFieldBody = z.object({
  name: z.string().min(1),
  crop: z.string().min(1),
  area_ha: z.number().positive().optional(),
  growth_stage: z.string().optional(),
  planted_at: z.string().optional(),
  geom_lat: z.number().optional(),
  geom_lng: z.number().optional(),
  baseline_calendar_spray_litres_per_ha: z.number().nonnegative().optional(),
  org_id: z.string().uuid().optional(),
});

export async function POST(req: Request) {
  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
  }

  let body: z.infer<typeof CreateFieldBody>;
  try {
    body = CreateFieldBody.parse(await req.json());
  } catch (err) {
    return NextResponse.json({ error: "invalid_body", detail: String(err) }, { status: 400 });
  }

  const userId = resolveUserId(req);

  const [row] = await db
    .insert(fields)
    .values({
      owner_id: userId,
      org_id: body.org_id ?? null,
      name: body.name,
      crop: body.crop,
      area_ha: body.area_ha != null ? String(body.area_ha) : null,
      growth_stage: body.growth_stage ?? null,
      planted_at: body.planted_at ? new Date(body.planted_at) : null,
      geom_lat: body.geom_lat != null ? String(body.geom_lat) : null,
      geom_lng: body.geom_lng != null ? String(body.geom_lng) : null,
      baseline_calendar_spray_litres_per_ha:
        body.baseline_calendar_spray_litres_per_ha != null
          ? String(body.baseline_calendar_spray_litres_per_ha)
          : "0",
      baseline_review_status: "farmer_reported",
    })
    .returning();

  return NextResponse.json({ field: row }, { status: 201 });
}
