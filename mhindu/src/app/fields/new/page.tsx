"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, MapPin } from "lucide-react";
import { db, setCurrentField } from "@/lib/store/db";
import type { Crop, Field } from "@/lib/store/types";
import { BigButton } from "@/components/farmer/BigButton";

const CROPS: { id: Crop; label: string }[] = [
  { id: "maize", label: "Maize" },
  { id: "tomato", label: "Tomato" },
  { id: "cotton", label: "Cotton" },
  { id: "sorghum", label: "Sorghum" },
  { id: "soybean", label: "Soybean" },
];

const STAGES_BY_CROP: Record<Crop, string[]> = {
  maize: ["VE-V2 (emergence)", "V3-V5 (early whorl)", "V6-V8 (late whorl)", "VT (tasseling)", "R1 (silking)", "R2-R6 (grain fill)"],
  tomato: ["seedling", "vegetative", "flowering", "fruit set", "fruit ripening"],
  cotton: ["seedling", "squaring", "flowering", "boll development", "boll opening"],
  sorghum: ["VE-V3", "V4-V8", "boot", "flowering", "grain fill"],
  soybean: ["VE-V2", "V3-V5", "R1 (flowering)", "R3 (pod set)", "R5 (seed fill)"],
};

export default function NewFieldPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [crop, setCrop] = useState<Crop>("maize");
  const [areaHa, setAreaHa] = useState("");
  const [growthStage, setGrowthStage] = useState(STAGES_BY_CROP.maize[1]);
  const [baselineLitres, setBaselineLitres] = useState("4.5");
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const captureGps = () => {
    if (!("geolocation" in navigator)) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsLoading(false);
      },
      () => {
        setGpsLoading(false);
      },
      { maximumAge: 60_000, timeout: 10_000, enableHighAccuracy: true },
    );
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const id = crypto.randomUUID();
    const field: Field = {
      id,
      name: name.trim(),
      crop,
      area_ha: parseFloat(areaHa) || 0,
      growth_stage: growthStage,
      planted_at: new Date().toISOString(),
      baseline_calendar_spray_litres_per_ha: parseFloat(baselineLitres) || 4.5,
      geom_lat: gps?.lat ?? null,
      geom_lng: gps?.lng ?? null,
      created_at: new Date().toISOString(),
    };
    await db().fields.put(field);
    await setCurrentField(id);
    router.push("/fields");
  };

  return (
    <main className="px-5 py-6 max-w-md mx-auto flex flex-col gap-5 min-h-dvh">
      <header className="flex items-center gap-4">
        <Link
          href="/fields"
          aria-label="Back"
          className="h-11 w-11 -ml-3 grid place-items-center rounded-full active:bg-bone-200"
        >
          <ArrowLeft size={22} />
        </Link>
        <h1 className="font-display text-2xl text-ink-900">New field</h1>
      </header>

      <form className="flex flex-col gap-5" onSubmit={onSubmit}>
        <Field label="Field name">
          <input
            required
            placeholder="e.g. Mukamba field"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-base border-b border-ink-300 bg-transparent py-3 focus:outline-none focus:border-leaf-500"
          />
        </Field>

        <Field label="Crop">
          <div className="flex flex-wrap gap-2">
            {CROPS.map((c) => (
              <button
                type="button"
                key={c.id}
                onClick={() => {
                  setCrop(c.id);
                  setGrowthStage(STAGES_BY_CROP[c.id][1]);
                }}
                className={
                  crop === c.id
                    ? "h-12 px-4 rounded-full bg-earth-500 text-bone-100 font-medium"
                    : "h-12 px-4 rounded-full bg-bone-200 text-ink-700"
                }
              >
                {c.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Growth stage">
          <select
            value={growthStage}
            onChange={(e) => setGrowthStage(e.target.value)}
            className="text-base border-b border-ink-300 bg-transparent py-3 focus:outline-none focus:border-leaf-500"
          >
            {STAGES_BY_CROP[crop].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Area (hectares)">
          <input
            type="number"
            step="0.1"
            min="0.1"
            required
            placeholder="e.g. 1.5"
            value={areaHa}
            onChange={(e) => setAreaHa(e.target.value)}
            className="text-base border-b border-ink-300 bg-transparent py-3 focus:outline-none focus:border-leaf-500"
          />
        </Field>

        <Field
          label="Baseline calendar-spray (L/ha/season)"
          hint="If you didn't use Mhindu, how many litres of pesticide would you spray on this field per season? Default 4.5 L/ha is the regional median for maize."
        >
          <input
            type="number"
            step="0.1"
            min="0"
            value={baselineLitres}
            onChange={(e) => setBaselineLitres(e.target.value)}
            className="text-base border-b border-ink-300 bg-transparent py-3 focus:outline-none focus:border-leaf-500"
          />
        </Field>

        <Field label="Location">
          <button
            type="button"
            onClick={captureGps}
            className="h-12 px-4 rounded-[8px] bg-bone-200 text-ink-900 flex items-center gap-2 self-start"
          >
            <MapPin size={18} />
            {gpsLoading
              ? "Capturing…"
              : gps
                ? `${gps.lat.toFixed(4)}, ${gps.lng.toFixed(4)}`
                : "Capture GPS"}
          </button>
        </Field>

        <BigButton variant="primary" loading={submitting}>
          Save field
        </BigButton>
      </form>
    </main>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm uppercase tracking-widest text-ink-500 font-mono">
        {label}
      </span>
      {children}
      {hint && <span className="text-xs text-ink-500">{hint}</span>}
    </label>
  );
}
