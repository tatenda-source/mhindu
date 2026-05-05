"use client";

import {
  Bug,
  CheckCircle2,
  Droplet,
  FlaskConical,
  Leaf,
  MessageCircle,
  Shovel,
  Timer,
} from "lucide-react";
import React from "react";

import { cn } from "@/lib/utils/cn";
import { useT } from "@/lib/i18n";
import type { TreatmentPlan, TreatmentOption } from "@/lib/ipm/schemas";
import { BigButton } from "./BigButton";

export interface TreatmentPlanViewProps {
  plan: TreatmentPlan;
  className?: string;
}

const REAL_IPM_WHATSAPP = "254700000000";

const TYPE_ICON: Record<
  TreatmentOption["type"],
  React.ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean | "true" }>
> = {
  biological: Bug,
  cultural: Shovel,
  mechanical: CheckCircle2,
  chemical: FlaskConical,
  no_action: Leaf,
};

function typeLabelKey(type: TreatmentOption["type"]): string {
  return `treatment.${type}`;
}

function JugVisual({ saved, baseline }: { saved: number; baseline: number }) {
  const t = useT();
  const fill = baseline > 0 ? Math.min(1, saved / baseline) : 0;
  const fillPct = Math.round(fill * 100);

  return (
    <div
      className="flex flex-col items-center gap-3"
      aria-label={`${saved} litres saved out of ${baseline} baseline`}
    >
      <div className="relative w-20 h-32 rounded-b-2xl rounded-t-lg border-2 border-earth-500 overflow-hidden bg-bone-200">
        <div
          className="absolute bottom-0 left-0 right-0 bg-earth-300 transition-all duration-700"
          style={{ height: `${fillPct}%` }}
          aria-hidden
        />
        <div
          className="absolute inset-0 flex items-center justify-center"
          aria-hidden
        >
          <Droplet
            size={28}
            className={cn(
              fill > 0.5 ? "text-bone-100" : "text-earth-500",
            )}
          />
        </div>
      </div>
      <p className="text-base font-sans text-ink-500 text-center">
        {t("ledger.jug_full")}
      </p>
      <p className="font-display text-[40px] leading-none font-semibold text-earth-500">
        {saved.toFixed(1)}
        <span className="text-base ml-1 font-sans font-normal text-ink-700">
          {t("ledger.litres")}
        </span>
      </p>
    </div>
  );
}

function StepRow({
  index,
  option,
}: {
  index: number;
  option: TreatmentOption;
}) {
  const t = useT();
  const IconComponent = TYPE_ICON[option.type] ?? Leaf;

  return (
    <div className="flex items-start gap-4 py-3">
      <div
        className={cn(
          "w-9 h-9 rounded-full shrink-0 flex items-center justify-center",
          "bg-earth-100 text-earth-700",
        )}
        aria-hidden
      >
        <span className="font-display font-semibold text-base">{index}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <IconComponent size={18} className="text-leaf-700 shrink-0" aria-hidden />
          <span className="text-base font-sans font-semibold text-ink-900">
            {t(typeLabelKey(option.type))}
          </span>
        </div>
        <p className="text-base font-sans text-ink-700 leading-6">
          {option.product_name}
        </p>
        {option.rationale && (
          <p className="text-base font-sans text-ink-500 leading-6">
            {option.rationale}
          </p>
        )}
        {option.release_or_apply_date && (
          <p className="flex items-center gap-1.5 text-base text-ink-500 mt-1">
            <Timer size={14} aria-hidden />
            {option.release_or_apply_date}
          </p>
        )}
      </div>
    </div>
  );
}

export function TreatmentPlanView({ plan, className }: TreatmentPlanViewProps) {
  const t = useT();
  const isBiological = plan.primary.type === "biological";

  const whatsappUrl = `https://wa.me/${REAL_IPM_WHATSAPP}?text=${encodeURIComponent(
    t("treatment.order_via_whatsapp") + " — " + plan.primary.product_name,
  )}`;

  const recheckText =
    plan.monitor_days != null
      ? t("treatment.recheck_in_days", { days: plan.monitor_days })
      : null;

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <JugVisual
        saved={plan.pesticide_avoided_litres}
        baseline={plan.baseline_litres_for_cycle}
      />

      <div className="bg-bone-100 rounded-[12px] border border-ink-100 px-4 py-2 divide-y divide-ink-100">
        <h3 className="font-display text-[22px] leading-8 font-semibold text-ink-900 py-2">
          {t("treatment.steps_heading")}
        </h3>
        <StepRow index={1} option={plan.primary} />
        {plan.alternates.map((alt, i) => (
          <StepRow key={alt.agent_id ?? i} index={i + 2} option={alt} />
        ))}
      </div>

      {isBiological && (
        <BigButton
          variant="primary"
          leftIcon={MessageCircle}
          as="a"
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          voiceText={t("treatment.order_via_whatsapp")}
        >
          {t("treatment.order_via_whatsapp")}
        </BigButton>
      )}

      {recheckText && (
        <p className="text-center text-base font-sans text-ink-500">
          {recheckText}
        </p>
      )}

      {plan.notes.length > 0 && (
        <ul className="flex flex-col gap-2">
          {plan.notes.map((note, i) => (
            <li key={i} className="text-base font-sans text-ink-700 leading-6">
              {note}
            </li>
          ))}
        </ul>
      )}

      <p className="font-mono text-sm text-ink-300 text-center">
        {plan.decision_log_id}
      </p>
    </div>
  );
}
