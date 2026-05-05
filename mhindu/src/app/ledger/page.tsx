"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowLeft, Droplets } from "lucide-react";
import { useAllScouts, useFields } from "@/lib/store/hooks";
import type { TreatmentPlan } from "@/lib/ipm/schemas";

const TREATMENT_LABEL: Record<string, string> = {
  no_action: "Skipped (below threshold)",
  cultural: "Cultural / preventive",
  biological: "Biocontrol release",
  mechanical: "Mechanical",
  chemical: "Chemical (last resort)",
};

export default function LedgerPage() {
  const scouts = useAllScouts();
  const fields = useFields();

  const stats = useMemo(() => {
    const list = (scouts ?? []).filter((s) => s.plan && s.detection);
    const decisionsByType = new Map<string, number>();
    let avoided = 0;
    let baseline = 0;
    let outcomesVerified = 0;

    for (const s of list) {
      const plan = s.plan as TreatmentPlan;
      avoided += plan.pesticide_avoided_litres;
      baseline += plan.baseline_litres_for_cycle;
      decisionsByType.set(
        plan.primary.type,
        (decisionsByType.get(plan.primary.type) ?? 0) + 1,
      );
      if (s.outcome_observed_at != null) outcomesVerified++;
    }
    const reductionPct = baseline > 0 ? Math.max(0, Math.min(100, (avoided / baseline) * 100)) : 0;
    const verifiedPct = list.length > 0 ? (outcomesVerified / list.length) * 100 : 0;
    return {
      decisions: list.length,
      avoided,
      baseline,
      reductionPct,
      verifiedPct,
      decisionsByType: Array.from(decisionsByType.entries()),
      fieldCount: (fields ?? []).length,
    };
  }, [scouts, fields]);

  return (
    <main className="px-5 py-6 max-w-md mx-auto flex flex-col gap-6 min-h-dvh pb-12">
      <header className="flex items-center gap-4">
        <Link href="/" aria-label="Back" className="h-11 w-11 -ml-3 grid place-items-center rounded-full active:bg-bone-200">
          <ArrowLeft size={22} />
        </Link>
        <h1 className="font-display text-2xl text-ink-900">Pesticide ledger</h1>
      </header>

      <section className="bg-bone-200 rounded-2xl p-6 border border-ink-100/50 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <Droplets size={36} className="text-leaf-500" strokeWidth={1.6} />
          <div>
            <div className="text-sm text-ink-700">Saved this season</div>
            <div className="font-display text-5xl text-ink-900 leading-none">
              {stats.avoided.toFixed(1)}
              <span className="text-xl text-ink-500 font-sans ml-1">L</span>
            </div>
          </div>
        </div>
        <div className="text-sm text-ink-700 mt-1">
          That&apos;s{" "}
          <span className="font-display text-2xl text-leaf-700">
            {stats.reductionPct.toFixed(0)}%
          </span>{" "}
          less than calendar-spray baseline ({stats.baseline.toFixed(1)} L).
        </div>
        {stats.verifiedPct < 80 && stats.decisions > 0 && (
          <p className="text-xs text-signal-warn mt-2 font-mono uppercase tracking-widest">
            ⚠ only {stats.verifiedPct.toFixed(0)}% of treatments have outcome rechecks. Headline figures stay provisional until ≥80%.
          </p>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-display text-xl text-ink-900">Decisions</h2>
        {stats.decisions === 0 ? (
          <p className="text-sm text-ink-500">No scouts yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {stats.decisionsByType.map(([type, n]) => (
              <li
                key={type}
                className="flex items-center justify-between bg-bone-200 rounded-xl px-4 py-3 border border-ink-100/40"
              >
                <span className="text-sm text-ink-900">
                  {TREATMENT_LABEL[type] ?? type}
                </span>
                <span className="font-mono text-base text-ink-700">×{n}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-display text-xl text-ink-900">Methodology</h2>
        <p className="text-sm text-ink-700">
          Avoided = baseline − actual, per cycle. Below-threshold scouting,
          biocontrol releases, cultural and mechanical interventions credit the
          full baseline cycle. Spot-treated chemicals credit the un-treated area.
          Tier 1 self-reported until cooperative verification lands.
        </p>
        <p className="text-xs text-ink-500 font-mono uppercase tracking-widest">
          {stats.decisions} decisions · {stats.fieldCount} fields · v0.1
        </p>
      </section>
    </main>
  );
}
