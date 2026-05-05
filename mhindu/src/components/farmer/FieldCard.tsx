"use client";

import { ChevronRight } from "lucide-react";
import React from "react";

import { cn } from "@/lib/utils/cn";
import { useT } from "@/lib/i18n";

export type PressureLevel = "calm" | "elevated" | "critical";

export interface FieldCardProps {
  name: string;
  crop: string;
  growthStage: string;
  lastScoutedAt: Date | null;
  pressureLevel: PressureLevel;
  onTap: () => void;
}

const pressureConfig: Record<
  PressureLevel,
  { bar: string; label: string; dot: string }
> = {
  calm: {
    bar: "bg-signal-go",
    label: "field.pressure_calm",
    dot: "bg-signal-go",
  },
  elevated: {
    bar: "bg-signal-warn",
    label: "field.pressure_elevated",
    dot: "bg-signal-warn",
  },
  critical: {
    bar: "bg-signal-danger",
    label: "field.pressure_critical",
    dot: "bg-signal-danger",
  },
};

function formatRelative(date: Date | null, t: ReturnType<typeof useT>): string {
  if (!date) return t("field.never_scouted");
  const diffMs = Date.now() - date.getTime();
  const days = Math.floor(diffMs / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

export function FieldCard({
  name,
  crop,
  growthStage,
  lastScoutedAt,
  pressureLevel,
  onTap,
}: FieldCardProps) {
  const t = useT();
  const cfg = pressureConfig[pressureLevel];

  return (
    <button
      type="button"
      onClick={onTap}
      className={cn(
        "w-full text-left",
        "bg-bone-100 rounded-[12px] border border-ink-100",
        "flex items-stretch overflow-hidden",
        "min-h-[72px] active:bg-bone-200 transition-colors duration-100",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf-500 focus-visible:ring-offset-2",
      )}
      aria-label={`${name}, ${crop}, ${t(cfg.label)}`}
    >
      <div className={cn("w-1.5 shrink-0", cfg.bar)} aria-hidden />

      <div className="flex-1 px-4 py-4 flex flex-col gap-1 min-w-0">
        <div className="flex items-center gap-2">
          <div
            className={cn("h-2.5 w-2.5 rounded-full shrink-0", cfg.dot)}
            aria-hidden
          />
          <span className="font-display text-[22px] leading-7 font-semibold text-ink-900 truncate">
            {name}
          </span>
        </div>
        <p className="text-base text-ink-700 font-sans truncate">
          {crop} — {growthStage}
        </p>
        <p className="text-base text-ink-500 font-sans">
          {t("field.last_scouted")}: {formatRelative(lastScoutedAt, t)}
        </p>
      </div>

      <div className="flex items-center pr-4 pl-2 shrink-0">
        <ChevronRight size={20} className="text-ink-300" aria-hidden />
      </div>
    </button>
  );
}
