import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "../src/db/schema";
import type { Detection, TreatmentPlan } from "../src/lib/ipm/schemas";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { prepare: false });
const db = drizzle(sql, { schema });

const FAW_DETECTION: Detection = {
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
  damage_signatures: ["window-pane feeding on whorl leaves", "fine frass in leaf funnel"],
  reasoning: "Seed data — synthetic FAW L1-L2 detection.",
  unknown_reason: null,
};

const makePlan = (decisionLogId: string): TreatmentPlan => ({
  decision_log_id: decisionLogId,
  engine_version: "0.1.0",
  rule_fired: "below_economic_threshold",
  primary: {
    type: "no_action",
    agent_id: null,
    product_name: "Monitor",
    rate: null,
    rate_unit: null,
    target_stage: null,
    application_mode: "preventive",
    rationale: "Severity 0.35 below threshold 0.40 for larva_L1_L2.",
    irac_moa: null,
    source_url: null,
    expected_efficacy_pct: null,
    supplier_id: null,
    supplier_lead_time_days: null,
    release_or_apply_date: null,
  },
  alternates: [],
  rejected_options: [],
  pesticide_avoided_litres: 12.5,
  baseline_litres_for_cycle: 12.5,
  monitor_days: 7,
  notes: [],
});

async function seed() {
  console.log("Seeding...");

  const [user] = await db
    .insert(schema.users)
    .values({ role: "farmer", phone: "+263771000001", name: "Tatenda Demo", language: "en" })
    .returning();

  const [officer] = await db
    .insert(schema.users)
    .values({ role: "officer", phone: "+263771000002", name: "Extension Officer Demo", language: "en" })
    .returning();

  const [org] = await db
    .insert(schema.orgs)
    .values({ name: "Mashonaland East Cooperative", region: "mashonaland_east" })
    .returning();

  await db.insert(schema.orgMembers).values([
    { org_id: org.id, user_id: user.id, role: "member" },
    { org_id: org.id, user_id: officer.id, role: "officer" },
  ]);

  const [fieldA, fieldB] = await db
    .insert(schema.fields)
    .values([
      {
        owner_id: user.id,
        org_id: org.id,
        name: "Home Plot A",
        crop: "maize",
        area_ha: "2.5",
        growth_stage: "v6",
        geom_lat: "-17.8292",
        geom_lng: "31.0522",
        baseline_calendar_spray_litres_per_ha: "5",
        baseline_review_status: "farmer_reported",
        planted_at: new Date("2025-11-15"),
      },
      {
        owner_id: user.id,
        org_id: org.id,
        name: "Lowveld Field B",
        crop: "tomato",
        area_ha: "1.2",
        growth_stage: "flowering",
        geom_lat: "-17.8310",
        geom_lng: "31.0540",
        baseline_calendar_spray_litres_per_ha: "8",
        baseline_review_status: "officer_verified",
        planted_at: new Date("2025-12-01"),
      },
    ])
    .returning();

  const now = new Date();
  const scoutDates = [
    new Date(now.getTime() - 14 * 86400_000),
    new Date(now.getTime() - 7 * 86400_000),
    new Date(now.getTime() - 1 * 86400_000),
  ];

  for (let i = 0; i < 3; i++) {
    const [scout] = await db
      .insert(schema.scouts)
      .values({
        field_id: i < 2 ? fieldA.id : fieldB.id,
        user_id: user.id,
        taken_at: scoutDates[i],
        gps_lat: "-17.8292",
        gps_lng: "31.0522",
        detection: FAW_DETECTION as unknown as Record<string, unknown>,
        status: "done",
      })
      .returning();

    const logId = crypto.randomUUID();
    const plan = makePlan(logId);

    const [log] = await db
      .insert(schema.decisionLogs)
      .values({
        id: logId,
        scout_id: scout.id,
        decided_at: scoutDates[i],
        engine_version: "0.1.0",
        inputs: {
          detection: FAW_DETECTION,
          context: { field_id: scout.field_id, area_ha: 2.5, crop: "maize", growth_stage: "v6" },
        } as unknown as Record<string, unknown>,
        rule_fired: plan.rule_fired,
        options_considered: [plan.primary] as unknown as Record<string, unknown>[],
        chosen: plan.primary as unknown as Record<string, unknown>,
        pesticide_avoided_litres: String(plan.pesticide_avoided_litres),
      })
      .returning();

    await db.insert(schema.treatments).values({
      field_id: i < 2 ? fieldA.id : fieldB.id,
      scout_id: scout.id,
      decided_at: scoutDates[i],
      type: "no_action",
      application_mode: "preventive",
      pesticide_avoided_litres: "12.5",
      decision_log_id: log.id,
    });
  }

  console.log(`Seeded: 2 users, 1 org, 2 fields, 3 scouts, 3 decision_logs, 3 treatments`);
  await sql.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
