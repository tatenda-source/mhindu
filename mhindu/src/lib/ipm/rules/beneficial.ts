import type { Context, Detection } from "../schemas";

export type BeneficialResult =
  | { fired: true; reason: "natural_enemies_active"; pressure: number; monitor_days: number }
  | { fired: false; pressure: number };

const HIGH_PRESSURE = 0.6;
const JUST_ABOVE_THRESHOLD_BAND = 0.15;

export function beneficialGate(
  detection: Detection,
  context: Context,
  threshold: number | null,
): BeneficialResult {
  const pressure = context.beneficial_pressure_0_1;

  if (pressure < HIGH_PRESSURE) {
    return { fired: false, pressure };
  }

  if (threshold !== null) {
    const margin = detection.severity_0_1 - threshold;
    if (margin > JUST_ABOVE_THRESHOLD_BAND) {
      return { fired: false, pressure };
    }
  }

  return { fired: true, reason: "natural_enemies_active", pressure, monitor_days: 5 };
}
