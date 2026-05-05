import { NextResponse } from "next/server";
import { z } from "zod";
import { identify } from "@/lib/vision";
import { decide } from "@/lib/ipm/engine";
import type { Context, Detection, TreatmentPlan } from "@/lib/ipm/schemas";
import { insertScoutWithDecision } from "@/db/queries/scouts";
import { getDb } from "@/db/client";

export const runtime = "nodejs";
export const maxDuration = 60;

const Body = z.object({
  image_data_url: z.string().min(20),
  field: z.object({
    id: z.string(),
    name: z.string(),
    crop: z.string(),
    growth_stage: z.string(),
    area_ha: z.number().positive(),
    baseline_calendar_spray_litres_per_ha: z.number().nonnegative(),
  }),
  region: z.string().default("zimbabwe"),
  taken_at: z.string(),
  gps: z
    .object({ lat: z.number(), lng: z.number() })
    .nullable()
    .default(null),
});

const DEMO_FAW: Detection = {
  pest_id: "spodoptera_frugiperda",
  type: "pest",
  stage: "larva_L1_L2",
  severity_0_1: 0.35,
  coverage_0_1: 0.25,
  confidence_0_1: 0.82,
  candidates: [
    { pest_id: "spodoptera_frugiperda", type: "pest", confidence_0_1: 0.82 },
    { pest_id: "busseola_fusca", type: "pest", confidence_0_1: 0.18 },
  ],
  damage_signatures: [
    "window-pane feeding on whorl leaves",
    "fine frass in leaf funnel",
  ],
  reasoning: "DEMO MODE — AI_GATEWAY_API_KEY not set; returning a canned FAW L1-L2 detection.",
  unknown_reason: null,
};

export async function POST(req: Request) {
  let parsed: z.infer<typeof Body>;
  try {
    const json = await req.json();
    parsed = Body.parse(json);
  } catch (err) {
    return NextResponse.json({ error: "invalid_body", detail: String(err) }, { status: 400 });
  }

  const hasKey = Boolean(process.env.AI_GATEWAY_API_KEY);
  let detection: Detection;
  let demo = false;

  if (hasKey) {
    try {
      detection = await identify({
        image_url: parsed.image_data_url,
        crop: parsed.field.crop,
        growth_stage_observed: parsed.field.growth_stage,
        region: parsed.region,
        taken_at: parsed.taken_at,
        gps: parsed.gps,
      });
    } catch (err) {
      return NextResponse.json(
        { error: "vision_failed", detail: String(err) },
        { status: 502 },
      );
    }
  } else {
    detection = DEMO_FAW;
    demo = true;
  }

  const context: Context = {
    field_id: parsed.field.id,
    area_ha: parsed.field.area_ha,
    crop: parsed.field.crop,
    growth_stage: parsed.field.growth_stage,
    region: parsed.region,
    baseline_calendar_spray_litres_per_ha: parsed.field.baseline_calendar_spray_litres_per_ha,
    recent_treatments: [],
    recent_biocontrol_releases: [],
    weather: { temp_c: 25, wind_m_s: 2, rain_prob_24h: 0.1 },
    beneficial_pressure_0_1: 0,
  };

  let plan: TreatmentPlan;
  try {
    plan = decide(detection, context);
  } catch (err) {
    return NextResponse.json(
      { error: "engine_failed", detail: String(err) },
      { status: 500 },
    );
  }

  // Write to Postgres server-of-record if available.
  // DB failure must never fail the request — client cache is canonical for offline-first.
  let server_scout_id: string | undefined;
  let server_decision_log_id: string | undefined;
  let server_treatment_id: string | undefined;

  if (getDb() !== null) {
    try {
      const userId = req.headers.get("x-mhindu-user-id") ?? undefined;
      const result = await insertScoutWithDecision({
        scoutInput: {
          field_id: parsed.field.id,
          taken_at: new Date(parsed.taken_at),
          gps_lat: parsed.gps?.lat ?? null,
          gps_lng: parsed.gps?.lng ?? null,
        },
        detection,
        plan,
        context,
        userId,
      });
      server_scout_id = result.scoutId;
      server_decision_log_id = result.decisionLogId;
      server_treatment_id = result.treatmentId;
    } catch (err) {
      console.error("[scout] db_write_failed:", err);
    }
  }

  return NextResponse.json({
    detection,
    plan,
    demo,
    ...(server_scout_id && {
      server_scout_id,
      server_decision_log_id,
      server_treatment_id,
    }),
  });
}
