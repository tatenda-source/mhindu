"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { useScout, useField } from "@/lib/store/hooks";
import { VerdictCard } from "@/components/farmer/VerdictCard";
import { TreatmentPlanView } from "@/components/farmer/TreatmentPlanView";
import { BigButton } from "@/components/farmer/BigButton";
import { pestKbFull } from "@/lib/pest-kb";

export default function ResultPage() {
  const params = useParams<{ scoutId: string }>();
  const scout = useScout(params?.scoutId);
  const field = useField(scout?.field_id);

  if (scout === undefined) {
    return (
      <main className="px-5 py-8 max-w-md mx-auto">
        <p className="text-ink-500">Loading…</p>
      </main>
    );
  }

  if (!scout) {
    return (
      <main className="px-5 py-8 max-w-md mx-auto flex flex-col gap-4">
        <p className="text-ink-700">Scout not found.</p>
        <BigButton as="a" href="/" variant="secondary">
          Home
        </BigButton>
      </main>
    );
  }

  if (scout.status === "error") {
    return (
      <main className="px-5 py-8 max-w-md mx-auto flex flex-col gap-4">
        <header className="flex items-center gap-4">
          <Link href="/" aria-label="Back" className="h-11 w-11 -ml-3 grid place-items-center rounded-full active:bg-bone-200">
            <ArrowLeft size={22} />
          </Link>
          <h1 className="font-display text-2xl text-ink-900">Scout error</h1>
        </header>
        <div className="bg-signal-danger/10 border border-signal-danger/30 rounded-2xl p-5 flex gap-3">
          <AlertTriangle className="text-signal-danger shrink-0" size={22} />
          <div className="flex-1">
            <p className="text-base text-ink-900">We saved the photo but could not get a verdict.</p>
            <p className="text-sm text-ink-500 mt-1">{scout.error_message}</p>
          </div>
        </div>
        <BigButton as="a" href="/scout" variant="primary">
          Try again
        </BigButton>
      </main>
    );
  }

  const det = scout.detection;
  const plan = scout.plan;

  if (!det || !plan) {
    return (
      <main className="px-5 py-8 max-w-md mx-auto">
        <p className="text-ink-500">Still processing your scout. Pull down to refresh in a moment.</p>
      </main>
    );
  }

  const pestEntry = det.pest_id ? pestKbFull[det.pest_id] : undefined;
  const pestName = pestEntry?.common_name ?? (det.pest_id ?? "Unknown");
  const stageLabel = (det.stage ?? "unknown").replace(/_/g, " ");

  return (
    <main className="px-5 py-6 max-w-md mx-auto flex flex-col gap-6 min-h-dvh pb-12">
      <header className="flex items-center gap-4">
        <Link href="/" aria-label="Back" className="h-11 w-11 -ml-3 grid place-items-center rounded-full active:bg-bone-200">
          <ArrowLeft size={22} />
        </Link>
        <h1 className="font-display text-2xl text-ink-900">Verdict</h1>
      </header>

      {field && (
        <div className="text-sm text-ink-500 font-mono uppercase tracking-widest">
          {field.name} · {field.crop} · {field.growth_stage}
        </div>
      )}

      {det.pest_id ? (
        <VerdictCard
          pestName={pestName}
          stage={stageLabel}
          severity={det.severity_0_1}
          confidence={det.confidence_0_1}
          reasoning={det.reasoning}
        />
      ) : (
        <div className="bg-bone-200 rounded-2xl p-5 border border-ink-100/50">
          <p className="font-display text-2xl text-ink-900">Can&apos;t tell from this photo</p>
          <p className="text-sm text-ink-700 mt-2">
            {det.unknown_reason ?? "Try again with a clearer view of the leaf, in better light, focused on the affected area."}
          </p>
          <div className="mt-4">
            <BigButton as="a" href="/scout" variant="primary">
              Take another photo
            </BigButton>
          </div>
        </div>
      )}

      {det.pest_id && <TreatmentPlanView plan={plan} />}

      <details className="text-xs text-ink-500 mt-2">
        <summary className="cursor-pointer font-mono uppercase tracking-widest">audit</summary>
        <pre className="overflow-auto bg-bone-200 rounded-lg p-3 mt-2 text-[11px] leading-relaxed">
{JSON.stringify({ rule_fired: plan.rule_fired, engine_version: plan.engine_version, decision_log_id: plan.decision_log_id, pesticide_avoided_litres: plan.pesticide_avoided_litres, baseline_litres_for_cycle: plan.baseline_litres_for_cycle }, null, 2)}
        </pre>
      </details>
    </main>
  );
}
