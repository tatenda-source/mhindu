import type { BiocontrolAgent, ChemicalIncompatibilities } from "./catalog";
import type { Supplier } from "./suppliers";

const MS_PER_DAY = 86_400_000;

function addDays(isoDate: string, days: number): string {
  return new Date(new Date(isoDate).getTime() + days * MS_PER_DAY).toISOString().slice(0, 10);
}

function daysBetween(earlier: string, later: string): number {
  return Math.floor(
    (new Date(later).getTime() - new Date(earlier).getTime()) / MS_PER_DAY,
  );
}

export type OrderSchedule =
  | { feasible: true; orderDate: string; releaseDate: string }
  | { feasible: false; reason: string };

/**
 * Derives the order date and release date for a biocontrol agent given the
 * scouted pest stage and the chosen supplier.
 *
 * Logic:
 *   targetWindowStart = scoutTakenAt + next_stage_window_days (defaults to 7)
 *   orderDate         = targetWindowStart - supplier.lead_time_days_max
 *   releaseDate       = targetWindowStart
 *
 * If orderDate is in the past relative to scoutTakenAt (i.e. lead time exceeds
 * the target window), the call is infeasible and a substitute should be proposed.
 */
export function recommendOrderDate(
  detectionStage: string,
  agent: BiocontrolAgent,
  supplier: Supplier,
  scoutTakenAt: string,
): OrderSchedule {
  const matchingPestEntry = agent.target_pests.find(
    (tp) => tp.target_stage === detectionStage,
  ) ?? agent.target_pests[0];

  const windowDays = matchingPestEntry?.next_stage_window_days ?? 7;
  const targetWindowStart = addDays(scoutTakenAt, windowDays);
  const orderDate = addDays(targetWindowStart, -supplier.lead_time_days_max);

  // orderDate must be >= scoutTakenAt; if negative the window has passed
  if (daysBetween(scoutTakenAt, orderDate) < 0) {
    return {
      feasible: false,
      reason:
        `Supplier lead time (${supplier.lead_time_days_max}d) exceeds the target-stage window ` +
        `(${windowDays}d from scout). Agent cannot arrive before the ${matchingPestEntry?.target_stage ?? "target"} ` +
        `stage window closes. Route to next IPM tier instead.`,
    };
  }

  return {
    feasible: true,
    orderDate,
    releaseDate: targetWindowStart,
  };
}

type RecentTreatment = {
  product: string | null;
  irac_moa: string | null;
  applied_at: string;
};

const MOA_TO_INCOMPATIBILITY: Record<string, keyof ChemicalIncompatibilities> = {
  // IRAC group 3 = pyrethroids/pyrethrins
  "3a": "pyrethroids",
  "3b": "pyrethroids",
  // IRAC group 1 = organophosphates (1b) and carbamates (1a)
  "1a": "organophosphates",
  "1b": "organophosphates",
  // IRAC group 4 = neonicotinoids
  "4a": "neonicotinoids",
  "4b": "neonicotinoids",
  "4c": "neonicotinoids",
  "4d": "neonicotinoids",
};

function classifyMoa(iracMoa: string | null): keyof ChemicalIncompatibilities | null {
  if (!iracMoa) return null;
  const normalized = iracMoa.toLowerCase().trim();
  return MOA_TO_INCOMPATIBILITY[normalized] ?? null;
}

/**
 * Returns true if no recent chemical treatment falls within the agent's
 * incompatibility window for that chemical class.
 *
 * A treatment with an unrecognized MoA is treated conservatively as incompatible
 * with a 14-day default window, unless the agent has no incompatibilities defined
 * for unknown MoAs (in which case we allow it through).
 */
export function isCompatibleWithRecentChemicals(
  agent: BiocontrolAgent,
  recentTreatments: RecentTreatment[],
  now: string,
): boolean {
  const { recent_chemicals_days } = agent.incompatibilities;

  for (const treatment of recentTreatments) {
    const daysAgo = daysBetween(treatment.applied_at, now);
    const moa = classifyMoa(treatment.irac_moa);

    if (moa !== null) {
      const blockWindow = recent_chemicals_days[moa];
      if (blockWindow !== undefined && daysAgo < blockWindow) {
        return false;
      }
    }
    // Unknown MoA with a product name — apply conservative 14-day block
    // if the agent lists any chemical incompatibilities at all.
    else if (
      treatment.product !== null &&
      Object.keys(recent_chemicals_days).length > 0 &&
      daysAgo < 14
    ) {
      return false;
    }
  }

  return true;
}
