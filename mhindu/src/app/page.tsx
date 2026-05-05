"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Camera, Layers, Droplets } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { BigButton } from "@/components/farmer/BigButton";
import { useFields, useAllScouts } from "@/lib/store/hooks";

export default function Home() {
  const fields = useFields();
  const scouts = useAllScouts();

  const stats = useMemo(() => {
    const allScouts = scouts ?? [];
    const totalAvoided = allScouts.reduce((acc, s) => {
      return acc + (s.plan?.pesticide_avoided_litres ?? 0);
    }, 0);
    return {
      fieldCount: fields?.length ?? 0,
      scoutCount: allScouts.length,
      avoidedLitres: totalAvoided,
    };
  }, [fields, scouts]);

  const hasField = (fields?.length ?? 0) > 0;

  return (
    <main className="px-5 py-8 max-w-md mx-auto flex flex-col gap-8 min-h-dvh">
      <header className="flex items-center justify-between">
        <Logo size="md" />
        <span className="text-xs uppercase tracking-widest text-ink-500 font-mono">
          v0.1
        </span>
      </header>

      <section className="flex flex-col gap-2">
        <h1 className="font-display text-4xl leading-tight text-ink-900">
          Cut the spray.
          <br />
          <span className="text-leaf-700">Grow the harvest.</span>
        </h1>
        <p className="text-base text-ink-700">
          Scout. Decide biocontrol-first. Spray only what you must.
        </p>
      </section>

      {stats.scoutCount > 0 && (
        <Link
          href="/ledger"
          className="bg-bone-200 rounded-2xl p-5 flex items-center gap-4 border border-ink-100/50 active:bg-bone-100"
        >
          <Droplets className="text-leaf-500 shrink-0" size={32} strokeWidth={1.6} />
          <div className="flex-1">
            <div className="text-sm text-ink-700">Pesticide saved this season</div>
            <div className="font-display text-3xl text-ink-900">
              {stats.avoidedLitres.toFixed(1)}
              <span className="text-base text-ink-500 font-sans ml-1">L</span>
            </div>
          </div>
          <span className="text-sm text-leaf-700 underline underline-offset-4">
            ledger
          </span>
        </Link>
      )}

      <section className="flex flex-col gap-3">
        {hasField ? (
          <BigButton as="a" href="/scout" variant="primary" leftIcon={Camera}>
            Scout a field
          </BigButton>
        ) : (
          <BigButton as="a" href="/fields/new" variant="primary" leftIcon={Layers}>
            Add your first field
          </BigButton>
        )}

        <BigButton as="a" href="/fields" variant="secondary" leftIcon={Layers}>
          {hasField ? `Fields (${stats.fieldCount})` : "Fields"}
        </BigButton>
      </section>

      <footer className="mt-auto text-xs text-ink-500 font-mono uppercase tracking-widest">
        Mhindu · biocontrol-first IPM · zimbabwe
      </footer>
    </main>
  );
}
