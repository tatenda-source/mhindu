"use client";

import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { useFields, useAllScouts } from "@/lib/store/hooks";
import { FieldCard } from "@/components/farmer/FieldCard";
import { BigButton } from "@/components/farmer/BigButton";
import type { Scout } from "@/lib/store/types";
import { useRouter } from "next/navigation";

function pressureFor(scouts: Scout[] | undefined, fieldId: string): "calm" | "elevated" | "critical" {
  const recent = (scouts ?? [])
    .filter((s) => s.field_id === fieldId && s.detection)
    .slice(0, 5);
  if (recent.length === 0) return "calm";
  const meanSeverity =
    recent.reduce((a, s) => a + (s.detection?.severity_0_1 ?? 0), 0) / recent.length;
  if (meanSeverity > 0.5) return "critical";
  if (meanSeverity > 0.25) return "elevated";
  return "calm";
}

function lastScoutedAtFor(scouts: Scout[] | undefined, fieldId: string): Date | null {
  const list = (scouts ?? []).filter((s) => s.field_id === fieldId);
  if (list.length === 0) return null;
  const t = list[0]?.taken_at;
  return t ? new Date(t) : null;
}

export default function FieldsPage() {
  const router = useRouter();
  const fields = useFields();
  const scouts = useAllScouts();

  return (
    <main className="px-5 py-6 max-w-md mx-auto flex flex-col gap-5 min-h-dvh">
      <header className="flex items-center gap-4">
        <Link
          href="/"
          aria-label="Back"
          className="h-11 w-11 -ml-3 grid place-items-center rounded-full active:bg-bone-200"
        >
          <ArrowLeft size={22} />
        </Link>
        <h1 className="font-display text-2xl text-ink-900">Fields</h1>
      </header>

      {fields === undefined ? (
        <p className="text-ink-500">Loading…</p>
      ) : fields.length === 0 ? (
        <div className="bg-bone-200 rounded-2xl p-6 flex flex-col gap-3 border border-ink-100/50">
          <p className="text-base text-ink-700">
            You haven&apos;t added any fields yet. Add one to start scouting.
          </p>
          <BigButton
            as="a"
            href="/fields/new"
            variant="primary"
            leftIcon={Plus}
          >
            Add field
          </BigButton>
        </div>
      ) : (
        <>
          <ul className="flex flex-col gap-3">
            {fields.map((f) => (
              <li key={f.id}>
                <FieldCard
                  name={f.name}
                  crop={f.crop}
                  growthStage={f.growth_stage}
                  lastScoutedAt={lastScoutedAtFor(scouts, f.id)}
                  pressureLevel={pressureFor(scouts, f.id)}
                  onTap={() => router.push(`/scout?fieldId=${f.id}`)}
                />
              </li>
            ))}
          </ul>
          <BigButton
            as="a"
            href="/fields/new"
            variant="secondary"
            leftIcon={Plus}
          >
            Add another field
          </BigButton>
        </>
      )}
    </main>
  );
}
