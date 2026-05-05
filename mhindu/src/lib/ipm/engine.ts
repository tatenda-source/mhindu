import {
  ENGINE_VERSION,
  type Context,
  type Detection,
  type TreatmentOption,
  type TreatmentPlan,
} from "./schemas";
import type { IpmRank, PestKbMap, PestKbOption } from "./kb-types";
import { thresholdGate } from "./rules/threshold";
import { beneficialGate } from "./rules/beneficial";
import { weatherCompatible } from "./rules/weather";
import { resistanceCompatible } from "./rules/resistance";
import { biocontrolCompatible } from "./rules/biocontrol-compat";
import { baselineLitresForCycle, pesticideAvoidedLitres } from "./avoided";

// Parallel-built modules; resolved at runtime. Typed defensively.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - module built in parallel by agronomy-researcher
import * as pestKbModule from "@/lib/pest-kb";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - module built in parallel by biocontrol-logistician
import * as biocontrolCatalog from "@/lib/biocontrol/catalog";

type GetAgent = (id: string) => { id: string; common_name?: string; scientific_name?: string } | null | undefined;
type GetSupplier = (id: string) => { id: string; lead_time_days?: number } | null | undefined;

const getAgentSafe: GetAgent = (id) => {
  const fn = (biocontrolCatalog as { getAgent?: GetAgent }).getAgent;
  return fn ? fn(id) : null;
};
const getSupplierSafe: GetSupplier = (id) => {
  const fn = (biocontrolCatalog as { getSupplier?: GetSupplier }).getSupplier;
  return fn ? fn(id) : null;
};

const RANK_ORDER: Record<IpmRank, number> = {
  no_action: 0,
  cultural: 1,
  biological: 2,
  mechanical: 3,
  chemical: 4,
};

const noActionOption = (rationale: string): TreatmentOption => ({
  type: "no_action",
  agent_id: null,
  product_name: "Monitor",
  rate: null,
  rate_unit: null,
  target_stage: null,
  application_mode: "preventive",
  rationale,
  irac_moa: null,
  source_url: null,
  expected_efficacy_pct: null,
  supplier_id: null,
  supplier_lead_time_days: null,
  release_or_apply_date: null,
});

function kbOptionToTreatment(o: PestKbOption, notes: string[]): TreatmentOption {
  const supplier_id = o.supplier_id;
  let supplier_lead_time_days = o.supplier_lead_time_days;

  if (o.agent_id) {
    const agent = getAgentSafe(o.agent_id);
    if (!agent) notes.push(`supplier lookup pending for agent ${o.agent_id}`);
  }
  if (supplier_id) {
    const sup = getSupplierSafe(supplier_id);
    if (sup) {
      if (sup.lead_time_days != null && supplier_lead_time_days == null) {
        supplier_lead_time_days = sup.lead_time_days;
      }
    } else {
      notes.push(`supplier lookup pending for ${supplier_id}`);
    }
  } else if (o.agent_id) {
    notes.push(`supplier lookup pending`);
  }

  return {
    type: o.type,
    agent_id: o.agent_id,
    product_name: o.product_name,
    rate: o.rate,
    rate_unit: o.rate_unit,
    target_stage: o.target_stage,
    application_mode: o.application_mode,
    rationale: o.rationale,
    irac_moa: o.irac_moa,
    source_url: o.source_url,
    expected_efficacy_pct: o.expected_efficacy_pct,
    supplier_id,
    supplier_lead_time_days,
    release_or_apply_date: null,
  };
}

function unknownPlan(reason: string, context: Context): TreatmentPlan {
  const baseline = baselineLitresForCycle(context);
  const primary = noActionOption(`Unable to recommend: ${reason}. Recheck in 7 days.`);
  return {
    decision_log_id: crypto.randomUUID(),
    engine_version: ENGINE_VERSION,
    rule_fired: "unknown_or_unsupported",
    primary,
    alternates: [],
    rejected_options: [],
    pesticide_avoided_litres: baseline,
    baseline_litres_for_cycle: baseline,
    monitor_days: 7,
    notes: [reason],
  };
}

export type DecideDeps = {
  pestKb?: PestKbMap;
  now?: number;
};

export function decide(detection: Detection, context: Context, deps: DecideDeps = {}): TreatmentPlan {
  const now = deps.now ?? Date.now();
  const importedPestKb = (pestKbModule as { pestKb?: PestKbMap }).pestKb;
  const kbMap: PestKbMap = deps.pestKb ?? importedPestKb ?? {};

  if (detection.type === "unknown" || !detection.pest_id) {
    return unknownPlan(detection.unknown_reason ?? "ambiguous_detection", context);
  }

  const kb = kbMap[detection.pest_id];
  if (!kb) {
    return unknownPlan(`pest_kb_missing:${detection.pest_id}`, context);
  }

  const baseline = baselineLitresForCycle(context);
  const notes: string[] = [];
  const rejected: { type: string; reason: string }[] = [];

  // 1. Threshold gate
  const thr = thresholdGate(detection, kb);
  if (thr.fired) {
    const primary = noActionOption(
      `Severity ${thr.severity.toFixed(2)} below threshold ${thr.threshold.toFixed(2)} for ${detection.stage ?? "stage"}.`,
    );
    return {
      decision_log_id: crypto.randomUUID(),
      engine_version: ENGINE_VERSION,
      rule_fired: "below_economic_threshold",
      primary,
      alternates: [],
      rejected_options: [],
      pesticide_avoided_litres: baseline,
      baseline_litres_for_cycle: baseline,
      monitor_days: 7,
      notes,
    };
  }

  // 2. Beneficial pressure gate
  const ben = beneficialGate(detection, context, thr.threshold);
  if (ben.fired) {
    const primary = noActionOption(
      `High beneficial pressure (${ben.pressure.toFixed(2)}); natural enemies likely to suppress without intervention.`,
    );
    return {
      decision_log_id: crypto.randomUUID(),
      engine_version: ENGINE_VERSION,
      rule_fired: "natural_enemies_active",
      primary,
      alternates: [],
      rejected_options: [],
      pesticide_avoided_litres: baseline,
      baseline_litres_for_cycle: baseline,
      monitor_days: ben.monitor_days,
      notes,
    };
  }

  // 3. Build candidates from KB, ranked by IPM hierarchy
  const stageMatched = kb.options.filter(
    (o) => o.target_stage === null || o.target_stage === detection.stage,
  );

  const survivors: PestKbOption[] = [];
  for (const o of stageMatched) {
    if (o.required_beneficial_pressure_lt != null && context.beneficial_pressure_0_1 >= o.required_beneficial_pressure_lt) {
      rejected.push({ type: o.type, reason: `${o.product_name}: beneficial pressure too high for this option` });
      continue;
    }
    const bc = biocontrolCompatible(o, context, now);
    if (!bc.ok) {
      rejected.push({ type: o.type, reason: `${o.product_name}: ${bc.reason}` });
      continue;
    }
    const rs = resistanceCompatible(o, context, now);
    if (!rs.ok) {
      rejected.push({ type: o.type, reason: `${o.product_name}: ${rs.reason}` });
      continue;
    }
    const wc = weatherCompatible(o, context);
    if (!wc.ok) {
      rejected.push({ type: o.type, reason: `${o.product_name}: ${wc.reason}` });
      continue;
    }
    survivors.push(o);
  }

  survivors.sort((a, b) => RANK_ORDER[a.ipm_rank] - RANK_ORDER[b.ipm_rank]);

  if (survivors.length === 0) {
    return unknownPlan(`no_compatible_options:${detection.pest_id}`, context);
  }

  const primaryKb = survivors[0];
  const primary = kbOptionToTreatment(primaryKb, notes);
  const alternates = survivors.slice(1, 3).map((o) => kbOptionToTreatment(o, notes));

  const application = {
    mode: primary.application_mode,
    coverage_0_1: detection.coverage_0_1,
  };

  const avoided = pesticideAvoidedLitres(primary, context, application);

  const rule_fired = ruleNameForRank(primaryKb.ipm_rank);

  return {
    decision_log_id: crypto.randomUUID(),
    engine_version: ENGINE_VERSION,
    rule_fired,
    primary,
    alternates,
    rejected_options: rejected,
    pesticide_avoided_litres: avoided,
    baseline_litres_for_cycle: baseline,
    monitor_days: null,
    notes,
  };
}

function ruleNameForRank(rank: IpmRank): string {
  switch (rank) {
    case "cultural":
      return "ipm_cultural_selected";
    case "biological":
      return "ipm_biological_selected";
    case "mechanical":
      return "ipm_mechanical_selected";
    case "chemical":
      return "ipm_chemical_selected_threshold_exceeded";
    case "no_action":
      return "ipm_no_action";
  }
}
