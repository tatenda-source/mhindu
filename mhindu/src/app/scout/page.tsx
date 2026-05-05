"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { ArrowLeft, Camera } from "lucide-react";
import imageCompression from "browser-image-compression";
import { db, getPrefs, setCurrentField } from "@/lib/store/db";
import { useFields } from "@/lib/store/hooks";
import type { Field, Scout } from "@/lib/store/types";
import { BigButton } from "@/components/farmer/BigButton";

async function fileToCompressedDataUrl(file: File): Promise<{
  blob: Blob;
  dataUrl: string;
}> {
  const compressed = await imageCompression(file, {
    maxSizeMB: 0.2,
    maxWidthOrHeight: 1280,
    useWebWorker: true,
    fileType: "image/jpeg",
  });
  const dataUrl: string = await new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(compressed);
  });
  return { blob: compressed, dataUrl };
}

async function captureGps(): Promise<{ lat: number; lng: number } | null> {
  if (!("geolocation" in navigator)) return null;
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { maximumAge: 60_000, timeout: 6_000 },
    );
  });
}

export default function ScoutPage() {
  return (
    <Suspense fallback={<main className="px-5 py-8 max-w-md mx-auto"><p className="text-ink-500">Loading…</p></main>}>
      <ScoutPageInner />
    </Suspense>
  );
}

function ScoutPageInner() {
  const router = useRouter();
  const search = useSearchParams();
  const fields = useFields();
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [busy, setBusy] = useState<"idle" | "compressing" | "uploading" | "deciding">("idle");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      const fromQs = search.get("fieldId");
      if (fromQs) {
        setSelectedFieldId(fromQs);
        return;
      }
      const prefs = await getPrefs();
      if (prefs.current_field_id) setSelectedFieldId(prefs.current_field_id);
      else if (fields && fields.length > 0) setSelectedFieldId(fields[0].id);
    })();
  }, [fields, search]);

  const selectedField: Field | undefined = (fields ?? []).find(
    (f) => f.id === selectedFieldId,
  );

  const handleSelect = async (id: string) => {
    setSelectedFieldId(id);
    await setCurrentField(id);
  };

  const onFile = async (file: File) => {
    if (!selectedField) {
      setError("Pick a field first");
      return;
    }
    setError(null);

    setBusy("compressing");
    let prepared: { blob: Blob; dataUrl: string };
    try {
      prepared = await fileToCompressedDataUrl(file);
    } catch {
      setBusy("idle");
      setError("Could not read that image. Try again.");
      return;
    }

    const gps = await captureGps();
    const scoutId = crypto.randomUUID();
    const taken_at = new Date().toISOString();

    const initial: Scout = {
      id: scoutId,
      field_id: selectedField.id,
      taken_at,
      image_blob: prepared.blob,
      image_data_url: prepared.dataUrl,
      gps_lat: gps?.lat ?? null,
      gps_lng: gps?.lng ?? null,
      status: "processing",
      detection: null,
      plan: null,
      outcome_observed_at: null,
      outcome_severity_after: null,
    };
    await db().scouts.put(initial);

    setBusy("uploading");
    try {
      const res = await fetch("/api/scout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          image_data_url: prepared.dataUrl,
          field: {
            id: selectedField.id,
            name: selectedField.name,
            crop: selectedField.crop,
            growth_stage: selectedField.growth_stage,
            area_ha: selectedField.area_ha,
            baseline_calendar_spray_litres_per_ha:
              selectedField.baseline_calendar_spray_litres_per_ha,
          },
          region: "zimbabwe",
          taken_at,
          gps,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`API ${res.status}: ${text.slice(0, 120)}`);
      }
      const data = await res.json();
      setBusy("deciding");
      await db().scouts.update(scoutId, {
        status: "done",
        detection: data.detection,
        plan: data.plan,
      });
      router.push(`/scout/result/${scoutId}`);
    } catch (err) {
      await db().scouts.update(scoutId, {
        status: "error",
        error_message: String(err),
      });
      setBusy("idle");
      setError("Could not get a verdict. Saved your scout — try again when online.");
    }
  };

  if (fields !== undefined && fields.length === 0) {
    return (
      <main className="px-5 py-8 max-w-md mx-auto flex flex-col gap-5 min-h-dvh">
        <header className="flex items-center gap-4">
          <Link href="/" aria-label="Back" className="h-11 w-11 -ml-3 grid place-items-center rounded-full active:bg-bone-200">
            <ArrowLeft size={22} />
          </Link>
          <h1 className="font-display text-2xl text-ink-900">Scout</h1>
        </header>
        <p className="text-base text-ink-700">Add a field first so we can build a treatment plan for it.</p>
        <BigButton as="a" href="/fields/new" variant="primary">
          Add a field
        </BigButton>
      </main>
    );
  }

  return (
    <main className="px-5 py-6 max-w-md mx-auto flex flex-col gap-6 min-h-dvh">
      <header className="flex items-center gap-4">
        <Link href="/" aria-label="Back" className="h-11 w-11 -ml-3 grid place-items-center rounded-full active:bg-bone-200">
          <ArrowLeft size={22} />
        </Link>
        <h1 className="font-display text-2xl text-ink-900">Scout</h1>
      </header>

      {fields && fields.length > 1 && (
        <section className="flex flex-col gap-2">
          <span className="text-sm uppercase tracking-widest text-ink-500 font-mono">Field</span>
          <div className="flex flex-wrap gap-2">
            {fields.map((f) => (
              <button
                key={f.id}
                onClick={() => handleSelect(f.id)}
                className={
                  f.id === selectedFieldId
                    ? "h-12 px-4 rounded-full bg-earth-500 text-bone-100 font-medium"
                    : "h-12 px-4 rounded-full bg-bone-200 text-ink-700"
                }
              >
                {f.name}
              </button>
            ))}
          </div>
        </section>
      )}

      {selectedField && (
        <section className="flex flex-col gap-2 bg-bone-200 rounded-2xl p-4 border border-ink-100/50">
          <div className="text-sm text-ink-700">
            <span className="font-display text-lg text-ink-900">{selectedField.name}</span>
            <span className="text-ink-500"> · {selectedField.crop} · {selectedField.growth_stage}</span>
          </div>
          <div className="text-xs text-ink-500 font-mono uppercase tracking-widest">
            {selectedField.area_ha.toFixed(1)} ha · baseline {selectedField.baseline_calendar_spray_litres_per_ha.toFixed(1)} L/ha
          </div>
        </section>
      )}

      <section className="flex flex-col gap-4 mt-2">
        <p className="text-base text-ink-700">
          Point your camera at the affected leaf. Get close. Good light beats blur.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
          }}
        />
        <BigButton
          variant="primary"
          leftIcon={Camera}
          loading={busy !== "idle"}
          onClick={() => fileInputRef.current?.click()}
          disabled={!selectedField}
          voiceText="Take photo of pest"
        >
          {busy === "compressing"
            ? "Reading photo…"
            : busy === "uploading"
              ? "Checking with the model…"
              : busy === "deciding"
                ? "Building plan…"
                : "Take photo of pest"}
        </BigButton>
        {error && (
          <p className="text-sm text-signal-danger" role="alert">
            {error}
          </p>
        )}
      </section>
    </main>
  );
}
