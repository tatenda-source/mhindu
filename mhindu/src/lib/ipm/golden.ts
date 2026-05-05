import type { Context, Detection } from "./schemas";

export type GoldenScenario = {
  name: string;
  detection: Detection;
  context: Context;
  expected: {
    rule_fired: string;
    primary_type: "no_action" | "cultural" | "biological" | "mechanical" | "chemical";
    pesticide_avoided_min: number;
  };
};

const baseContext = (overrides: Partial<Context> = {}): Context => ({
  field_id: "field-001",
  area_ha: 1.0,
  crop: "maize",
  growth_stage: "V6",
  region: "Mashonaland East, ZW",
  baseline_calendar_spray_litres_per_ha: 1.5,
  recent_treatments: [],
  recent_biocontrol_releases: [],
  weather: { temp_c: 24, wind_m_s: 2, rain_prob_24h: 0.1 },
  beneficial_pressure_0_1: 0.2,
  ...overrides,
});

const fawDetection = (severity: number, stage: Detection["stage"]): Detection => ({
  pest_id: "spodoptera_frugiperda",
  type: "pest",
  stage,
  severity_0_1: severity,
  coverage_0_1: 0.2,
  confidence_0_1: 0.85,
  candidates: [{ pest_id: "spodoptera_frugiperda", type: "pest", confidence_0_1: 0.85 }],
  damage_signatures: ["windowing", "frass_in_whorl"],
  reasoning: "Whorl damage with frass typical of FAW larvae",
  unknown_reason: null,
});

const daysAgo = (n: number): string => new Date(Date.now() - n * 86400_000).toISOString();

export const goldens: GoldenScenario[] = [
  {
    name: "FAW below threshold returns no_action",
    detection: fawDetection(0.05, "larva_L1_L2"),
    context: baseContext(),
    expected: {
      rule_fired: "below_economic_threshold",
      primary_type: "no_action",
      pesticide_avoided_min: 1.5 * 1.0 * 6,
    },
  },
  {
    name: "FAW L1_L2 above threshold no constraints picks biological (Bt or Telenomus)",
    detection: fawDetection(0.35, "larva_L1_L2"),
    context: baseContext(),
    expected: {
      rule_fired: "ipm_biological_selected",
      primary_type: "biological",
      pesticide_avoided_min: 1.5 * 1.0 * 6,
    },
  },
  {
    name: "FAW L3_L6 (egg parasitoid window passed) picks microbial Bt aizawai",
    detection: fawDetection(0.5, "larva_L3_L6"),
    context: baseContext(),
    expected: {
      rule_fired: "ipm_biological_selected",
      primary_type: "biological",
      pesticide_avoided_min: 1.5 * 1.0 * 6,
    },
  },
  {
    name: "Recent pyrethroid + FAW blocks broad-spectrum chemical, falls back to biological",
    detection: fawDetection(0.55, "larva_L3_L6"),
    context: baseContext({
      recent_treatments: [
        {
          type: "chemical",
          agent_id: null,
          irac_moa: "3A",
          applied_at: daysAgo(5),
          product: "Lambda-cyhalothrin",
        },
      ],
    }),
    expected: {
      rule_fired: "ipm_biological_selected",
      primary_type: "biological",
      pesticide_avoided_min: 1.5 * 1.0 * 6,
    },
  },
  {
    name: "High beneficial pressure + FAW just-above threshold returns monitor",
    detection: fawDetection(0.22, "larva_L1_L2"),
    context: baseContext({ beneficial_pressure_0_1: 0.75 }),
    expected: {
      rule_fired: "natural_enemies_active",
      primary_type: "no_action",
      pesticide_avoided_min: 1.5 * 1.0 * 6,
    },
  },
];
