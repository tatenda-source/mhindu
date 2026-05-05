---
name: vision-prompting
description: Prompt patterns and structured-output schemas for Mhindu's pest/disease detection via Claude vision (AI Gateway). Use when crafting detection prompts, debugging misclassifications, scoping candidate pest sets, or validating Zod output schemas.
---

# Vision prompting for pest detection

The vision pipeline is the front of every IPM decision. Its job is **structured, calibrated, scope-bounded** identification — not free-text "what pest is this".

## Core prompt template

```ts
const systemPrompt = `You are an agricultural vision specialist trained on Sub-Saharan African smallholder pest and disease identification.

Your task: identify the pest, disease, or beneficial organism visible in the provided photo of a {CROP} plant at growth stage {STAGE}.

Method (follow in order — do NOT skip steps):

1. DAMAGE SIGNATURE FIRST. Describe what you see:
   - Feeding pattern (window-pane, ragged, skeletonized, blotched, tunnelled)
   - Location on plant (whorl, leaf upper/lower, stem, fruit, root)
   - Lifecycle artefacts visible (eggs, larvae, pupae, frass, exuviae, webbing)
   - Disease symptoms (chlorosis pattern, lesion shape, sporulation, wilting)

2. CANDIDATE MAPPING. Map signatures to candidates from this set ONLY:
   {CANDIDATES_FOR_CROP_REGION}
   These are the pests/diseases/beneficials known to affect {CROP} in {REGION}. If your best match is not in this set, return "unknown" — do NOT propose a candidate outside the set.

3. RULE OUT BENEFICIALS. The following are NOT pests; if the photo shows one of these, return them in the candidates with type=beneficial and severity=0:
   - Coccinellid (ladybird) larva or adult — predator, helps you
   - Parasitized aphid mummy (golden, swollen, with exit hole)
   - Lacewing eggs (stalked, on top of leaf)
   - Honeybee, hoverfly, native pollinator
   - Spider, predatory mite (Phytoseiulus, Amblyseius)

4. RULE OUT NON-PEST EXPLANATIONS. Yellowing leaves can be:
   - Nitrogen / magnesium / potassium deficiency
   - Drought / waterlogging stress
   - Mechanical damage (livestock, wind)
   - Herbicide drift
   Consider these BEFORE settling on a disease ID. Score candidate "abiotic_stress" if symptoms fit no biotic cause.

5. SEVERITY (0-1): proportion of visible plant tissue affected.
6. COVERAGE (0-1): proportion of the FIELD likely affected, given that this photo is one sample. Lower confidence if photo is one isolated plant.
7. CONFIDENCE (0-1) per candidate.

If overall confidence < 0.5, return pest_id=null, stage=unknown, candidates=[], unknown_reason="<image quality | ambiguous | outside candidate set>".

DO NOT GUESS. Unknown is a valid, useful answer — the IPM engine treats unknown as "monitor and recheck" which is safe. A wrong confident answer triggers an unnecessary spray.`;
```

## Per-crop candidate set scoping

The biggest precision gain comes from scoping candidates by crop × region:

```ts
const candidatesByCropRegion = {
  "maize.zimbabwe": [
    "spodoptera_frugiperda",       // FAW
    "busseola_fusca",              // African stem borer
    "chilo_partellus",             // spotted stem borer
    "rhopalosiphum_maidis",        // corn leaf aphid
    "disease_maize_streak_virus",
    "disease_grey_leaf_spot",
    "disease_northern_leaf_blight",
    "abiotic_n_deficiency",
    "beneficial_coccinellid",
    "beneficial_parasitized_egg_mass",
  ],
  "tomato.zimbabwe": [
    "tuta_absoluta",
    "helicoverpa_armigera",
    "bemisia_tabaci",              // whitefly
    "tetranychus_urticae",         // red spider mite
    "disease_early_blight",
    "disease_late_blight",
    "disease_bacterial_wilt",
    "abiotic_blossom_end_rot",
    "beneficial_phytoseiulus",
  ],
  // ... cotton, etc.
};
```

When the candidate set is unbounded, models hallucinate exotic pests. Scope ruthlessly.

## Output schema (Zod, source of truth)

```ts
import { z } from "zod";

export const Detection = z.object({
  pest_id: z.string().nullable(),
  type: z.enum(["pest", "disease", "beneficial", "abiotic", "unknown"]).default("unknown"),
  stage: z.enum(["egg","L1_L2","L3_L6","pupa","adult","nymph","mycelium","sporulation","unknown"]).nullable(),
  severity_0_1: z.number().min(0).max(1),
  coverage_0_1: z.number().min(0).max(1),
  confidence_0_1: z.number().min(0).max(1),
  candidates: z.array(z.object({
    pest_id: z.string(),
    type: z.enum(["pest","disease","beneficial","abiotic"]),
    confidence_0_1: z.number().min(0).max(1),
  })).max(3),
  damage_signatures: z.array(z.string()),
  reasoning: z.string(),               // for audit log, not UI
  unknown_reason: z.string().nullable(),
});
export type Detection = z.infer<typeof Detection>;
```

Use `generateObject` from AI SDK v6 with this schema — never `generateText` followed by JSON parsing.

## Model selection

```ts
import { generateObject } from "ai";
import { gateway } from "@ai-sdk/gateway";

const result = await generateObject({
  model: gateway("anthropic/claude-sonnet-4-6"),  // default
  schema: Detection,
  system: systemPrompt,
  messages: [{ role: "user", content: [{ type: "image", image: imageUrl }] }],
});

if (result.object.confidence_0_1 < 0.7 || result.object.candidates.length >= 2) {
  // Escalate to Opus
  const opus = await generateObject({
    model: gateway("anthropic/claude-opus-4-7"),
    schema: Detection,
    system: systemPrompt,
    messages: [...same...],
  });
  return opus.object;
}
return result.object;
```

## Prompting pitfalls (with fixes)

| Pitfall | Symptom | Fix |
|---|---|---|
| Unbounded candidate set | Model invents exotic pests | Scope candidates by crop × region |
| Single-stage prompts | Treats L1 like L4 | Always include stage in candidate description |
| No beneficial examples | Flags ladybirds as pests | List beneficials explicitly in candidate set with `type=beneficial` |
| No abiotic option | Calls every yellow leaf "disease" | Include `abiotic_*` candidates |
| Free text + JSON parse | Schema drift, silent failures | Use `generateObject` with Zod always |
| `temperature > 0` | Same photo, different output | Default 0 for all detection prompts |
| Reasoning in farmer UI | Confuses farmer | Reasoning goes to audit log, UI sees verdict + plan only |
| One golden-set photo per pest | Brittle to variation | ≥5 photos per pest covering stage + lighting + angle |

## Eval harness

`mhindu/src/lib/vision/__tests__/eval.ts` runs the prompt against a labeled golden set. Required:
- ≥15 photos per priority pest
- Mix of clear and edge cases (poor lighting, partial occlusion, lookalikes)
- Includes ≥3 photos labeled `unknown` (blurry, off-target, irrelevant)
- Includes ≥3 beneficials photos that must NOT be flagged as pests

Eval prints precision, recall, top-1 accuracy, false-positive rate (especially for beneficials). Regression on any of these blocks merge.

## Image preprocessing (client-side, before upload)

- Compress to ≤200KB JPEG via `browser-image-compression`
- Max dimension 1280px (preserves enough detail for FAW egg masses, doesn't waste bandwidth)
- Strip EXIF except orientation + GPS (privacy: no device serial, no app fingerprint)
- Auto-rotate from EXIF before upload (Android cameras lie about portrait)

## Signal beyond image

The vision pipeline accepts image + metadata, not image alone:

```ts
interface ScoutInput {
  image_url: string;
  crop: string;
  growth_stage_observed: string;  // farmer-reported, e.g. "tasseling", "flowering"
  region: string;
  taken_at: string;               // ISO; affects pest pressure context
  gps: { lat: number; lng: number };
}
```

Stage and region are inputs to the prompt's `{STAGE}` and `{CANDIDATES_FOR_CROP_REGION}` substitutions. Without them, precision drops materially.
