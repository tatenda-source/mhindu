"use client";

import React, { useState } from "react";

import { cn } from "@/lib/utils/cn";
import { useT } from "@/lib/i18n";
import { SeverityBar } from "./SeverityBar";

export interface VerdictCardProps {
  pestName: string;
  stage: string;
  severity: number;
  confidence: number;
  reasoning?: string;
  className?: string;
}

function confidenceLabel(
  t: ReturnType<typeof useT>,
  confidence: number,
): string {
  if (confidence < 0.4) return t("verdict.confidence_low");
  if (confidence < 0.75) return t("verdict.confidence_medium");
  return t("verdict.confidence_high");
}

function severityLabel(t: ReturnType<typeof useT>, severity: number): string {
  if (severity < 0.35) return t("verdict.severity_light");
  if (severity < 0.65) return t("verdict.severity_moderate");
  return t("verdict.severity_heavy");
}

export function VerdictCard({
  pestName,
  stage,
  severity,
  confidence,
  reasoning,
  className,
}: VerdictCardProps) {
  const t = useT();
  const [showReasoning, setShowReasoning] = useState(false);

  const confPct = Math.round(confidence * 100);

  return (
    <article
      className={cn(
        "bg-bone-100 rounded-[12px] p-5 flex flex-col gap-4",
        "border border-ink-100",
        className,
      )}
    >
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-ink-900 text-[28px] leading-[32px] font-semibold">
          {pestName}
        </h2>
        <p className="text-base text-ink-500 font-sans">{stage}</p>
      </div>

      <SeverityBar
        value={severity}
        label={severityLabel(t, severity)}
      />

      <div className="flex items-center gap-2">
        <div
          className="h-2.5 w-2.5 rounded-full shrink-0"
          style={{
            background:
              confidence < 0.4
                ? "var(--color-signal-warn)"
                : confidence < 0.75
                  ? "var(--color-iron-300)"
                  : "var(--color-signal-go)",
          }}
          aria-hidden
        />
        <span className="text-base text-ink-700 font-sans">
          {confidenceLabel(t, confidence)}{" "}
          <span className="font-mono text-sm text-ink-500">({confPct}%)</span>
        </span>
      </div>

      {reasoning && (
        <div>
          <button
            type="button"
            onClick={() => setShowReasoning((v) => !v)}
            className={cn(
              "text-base text-leaf-700 underline underline-offset-2",
              "min-h-11 flex items-center",
            )}
            aria-expanded={showReasoning}
          >
            {showReasoning ? t("verdict.hide") : t("verdict.why")}
          </button>
          {showReasoning && (
            <p className="mt-2 text-base text-ink-700 font-sans leading-6">
              {reasoning}
            </p>
          )}
        </div>
      )}
    </article>
  );
}
