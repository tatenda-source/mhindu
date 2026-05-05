import type { Detection } from "../schemas";
import type { PestKbEntry } from "../kb-types";

export type ThresholdResult =
  | { fired: true; reason: "below_economic_threshold"; threshold: number; severity: number }
  | { fired: false; threshold: number | null; severity: number };

export function thresholdGate(detection: Detection, kb: PestKbEntry): ThresholdResult {
  const stage = detection.stage;
  const threshold = stage ? kb.thresholds[stage] ?? null : null;
  const severity = detection.severity_0_1;

  if (threshold === null) {
    return { fired: false, threshold: null, severity };
  }

  if (severity < threshold) {
    return { fired: true, reason: "below_economic_threshold", threshold, severity };
  }

  return { fired: false, threshold, severity };
}
