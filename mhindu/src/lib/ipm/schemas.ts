import { z } from "zod";

export const Stage = z.enum([
  "egg",
  "larva_L1_L2",
  "larva_L3_L6",
  "pupa",
  "adult",
  "nymph",
  "mycelium",
  "sporulation",
  "unknown",
]);
export type Stage = z.infer<typeof Stage>;

export const CandidateType = z.enum(["pest", "disease", "beneficial", "abiotic"]);

export const Detection = z.object({
  pest_id: z.string().nullable(),
  type: z.enum(["pest", "disease", "beneficial", "abiotic", "unknown"]).default("unknown"),
  stage: Stage.nullable(),
  severity_0_1: z.number().min(0).max(1),
  coverage_0_1: z.number().min(0).max(1),
  confidence_0_1: z.number().min(0).max(1),
  candidates: z
    .array(
      z.object({
        pest_id: z.string(),
        type: CandidateType,
        confidence_0_1: z.number().min(0).max(1),
      }),
    )
    .max(3),
  damage_signatures: z.array(z.string()),
  reasoning: z.string(),
  unknown_reason: z.string().nullable(),
});
export type Detection = z.infer<typeof Detection>;

export const ScoutInput = z.object({
  image_url: z.string(),
  crop: z.string(),
  growth_stage_observed: z.string(),
  region: z.string(),
  taken_at: z.string(),
  gps: z.object({ lat: z.number(), lng: z.number() }).nullable(),
});
export type ScoutInput = z.infer<typeof ScoutInput>;

export const Context = z.object({
  field_id: z.string(),
  area_ha: z.number(),
  crop: z.string(),
  growth_stage: z.string(),
  region: z.string(),
  baseline_calendar_spray_litres_per_ha: z.number(),
  recent_treatments: z.array(
    z.object({
      type: z.enum(["no_action", "cultural", "biological", "mechanical", "chemical"]),
      agent_id: z.string().nullable(),
      irac_moa: z.string().nullable(),
      applied_at: z.string(),
      product: z.string().nullable(),
    }),
  ),
  recent_biocontrol_releases: z.array(
    z.object({
      agent_id: z.string(),
      released_at: z.string(),
      viability_days: z.number(),
    }),
  ),
  weather: z.object({
    temp_c: z.number(),
    wind_m_s: z.number(),
    rain_prob_24h: z.number().min(0).max(1),
  }),
  beneficial_pressure_0_1: z.number().min(0).max(1).default(0),
});
export type Context = z.infer<typeof Context>;

export const TreatmentOption = z.object({
  type: z.enum(["no_action", "cultural", "biological", "mechanical", "chemical"]),
  agent_id: z.string().nullable(),
  product_name: z.string(),
  rate: z.number().nullable(),
  rate_unit: z.string().nullable(),
  target_stage: Stage.nullable(),
  application_mode: z.enum(["spot", "blanket", "release", "preventive"]),
  rationale: z.string(),
  irac_moa: z.string().nullable(),
  source_url: z.string().nullable(),
  expected_efficacy_pct: z.tuple([z.number(), z.number()]).nullable(),
  supplier_id: z.string().nullable(),
  supplier_lead_time_days: z.number().nullable(),
  release_or_apply_date: z.string().nullable(),
});
export type TreatmentOption = z.infer<typeof TreatmentOption>;

export const TreatmentPlan = z.object({
  decision_log_id: z.string(),
  engine_version: z.string(),
  rule_fired: z.string(),
  primary: TreatmentOption,
  alternates: z.array(TreatmentOption),
  rejected_options: z.array(z.object({ type: z.string(), reason: z.string() })),
  pesticide_avoided_litres: z.number(),
  baseline_litres_for_cycle: z.number(),
  monitor_days: z.number().nullable(),
  notes: z.array(z.string()),
});
export type TreatmentPlan = z.infer<typeof TreatmentPlan>;

export const ENGINE_VERSION = "0.1.0";
