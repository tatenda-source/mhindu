import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

// v1 stub: accepts a batch of pending scouts from the client and acknowledges receipt.
// Full implementation will replay the detection + decision pipeline server-side
// and upsert canonical rows, bridging the IndexedDB-first offline cache to Postgres.

const SyncBatch = z.object({
  scouts: z.array(
    z.object({
      client_id: z.string(),
      field_id: z.string(),
      taken_at: z.string(),
      image_data_url: z.string().optional(),
      image_url: z.string().optional(),
      gps_lat: z.number().nullable().optional(),
      gps_lng: z.number().nullable().optional(),
      detection: z.unknown().optional(),
      plan: z.unknown().optional(),
    }),
  ),
});

export async function POST(req: Request) {
  let parsed: z.infer<typeof SyncBatch>;
  try {
    const json = await req.json();
    parsed = SyncBatch.parse(json);
  } catch (err) {
    return NextResponse.json({ error: "invalid_body", detail: String(err) }, { status: 400 });
  }

  // TODO Phase 1: for each scout in the batch:
  // 1. If detection + plan present: call insertScoutWithDecision directly.
  // 2. If only image: rerun vision + decide pipeline then insert.
  // Return per-scout server IDs so client can update its IndexedDB records.

  return NextResponse.json({
    acknowledged: parsed.scouts.length,
    server_ids: [],
    status: "stub_v1",
  });
}
