import type { Context, TreatmentOption } from "./schemas";

const CALENDAR_SPRAYS_PER_CYCLE = 6;

export function baselineLitresForCycle(context: Context): number {
  return context.baseline_calendar_spray_litres_per_ha * context.area_ha * CALENDAR_SPRAYS_PER_CYCLE;
}

export function pesticideAvoidedLitres(
  primary: TreatmentOption,
  context: Context,
  application: { mode: "spot" | "blanket" | "release" | "preventive"; coverage_0_1: number },
): number {
  const baseline = baselineLitresForCycle(context);

  if (primary.type === "no_action") return baseline;
  if (primary.type === "cultural" || primary.type === "biological" || primary.type === "mechanical") {
    return baseline;
  }

  // chemical: avoided = baseline - what we actually use this intervention
  const perSpray = context.baseline_calendar_spray_litres_per_ha * context.area_ha;
  const coverageFactor = application.mode === "spot" ? Math.max(0.05, application.coverage_0_1) : 1;
  const used = perSpray * coverageFactor;
  const avoidedThisSpray = perSpray - used;
  const remainingScheduledSprays = CALENDAR_SPRAYS_PER_CYCLE - 1;
  return Math.max(0, avoidedThisSpray + remainingScheduledSprays * perSpray);
}
