import React from "react";

import { cn } from "@/lib/utils/cn";

export interface SeverityBarProps {
  value: number;
  label: string;
  className?: string;
}

export function SeverityBar({ value, label, className }: SeverityBarProps) {
  const clamped = Math.min(1, Math.max(0, value));
  const pct = Math.round(clamped * 100);

  const fillClass =
    clamped < 0.35
      ? "bg-signal-go"
      : clamped < 0.65
        ? "bg-signal-warn"
        : "bg-earth-500";

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className="w-full h-4 rounded-full bg-bone-200 overflow-hidden"
      >
        <div
          className={cn("h-full rounded-full transition-all duration-300", fillClass)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-base font-sans font-semibold text-ink-700">
        {label}
      </span>
    </div>
  );
}
