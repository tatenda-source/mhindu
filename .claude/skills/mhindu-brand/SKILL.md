---
name: mhindu-brand
description: Visual identity tokens for the Mhindu platform — palette (deep terracotta, chlorophyll, ink), typography (slab-serif display, mono data, sans body), spacing, motion. Apply to any farmer-facing UI, officer dashboard, marketing artifact, deck, or printed map. Anchored in Sub-Saharan smallholder agronomy — earth, leaf, ink. Not SaaS-purple, not greenwash.
---

# Mhindu visual identity

## Brand thesis

Mhindu (Shona: cultivator) sits between three things: smallholder agronomy, biological intelligence, and field robotics. The visual language is **honest, soil-y, scientific** — not techbro greenwash, not minimal-SaaS, not stock-image NGO. The palette earns trust outdoors and on cheap screens.

Anchors:
- **Earth** (terracotta) for primary, structural surfaces
- **Leaf** (chlorophyll) for action, success, "treat now"
- **Ink** for text and chrome — generous black, never dilute grey
- **Bone** for paper/cards
- **Iron** for warning + mechanical/robotic states (cool counterweight to terracotta warmth)

## Palette (canonical)

```css
:root {
  /* Earth */
  --earth-900: #2a1410;
  --earth-700: #5a2a1f;
  --earth-500: #b04a2e;   /* terracotta — primary */
  --earth-300: #e08a6c;
  --earth-100: #f5d8c8;

  /* Leaf */
  --leaf-900: #0e2818;
  --leaf-700: #1f4d31;
  --leaf-500: #2f7d4a;    /* chlorophyll — action */
  --leaf-300: #6db888;
  --leaf-100: #d4ead9;

  /* Ink */
  --ink-1000: #0b0b0a;
  --ink-900:  #161513;
  --ink-700:  #3a3631;
  --ink-500:  #6e6862;
  --ink-300:  #a39d96;
  --ink-100:  #d8d3cb;

  /* Bone (paper) */
  --bone-100: #f9f4ec;
  --bone-200: #f0e9dd;

  /* Iron (cool steel for robotic/warning) */
  --iron-700: #2c3338;
  --iron-500: #4f5a62;
  --iron-300: #8a96a0;

  /* Signal */
  --signal-warn: #d4882a;        /* amber, threshold approaching */
  --signal-danger: #b8362d;      /* deep red, never pure red */
  --signal-go: var(--leaf-500);
}
```

Background defaults: bone-100 (light), ink-1000 (dark). Light is the smallholder default — sun glare destroys dark UIs outdoors.

## Contrast invariants

WCAG AA non-negotiable for farmer-facing:
- Body text on `--bone-100`: `--ink-900` (>15:1)
- Action button `--leaf-500` on bone: text `--bone-100` (>4.5:1)
- Severity bar fill: terracotta `--earth-500` on bone (>4.5:1)

Test under simulated 80,000 lux sun glare, not just office light. WebAIM contrast checker is the floor; bright outdoor field is the ceiling.

## Typography

**Display (headlines, big buttons, treatment verdicts)**: a slab serif. Choices in priority order:
1. `Recoleta` (license required, premium) — warm, agronomic, slightly literary
2. `Roslindale Display Narrow` (David Jonathan Ross, license)
3. `Fraunces` (open source, slab variant) — current default
4. `Roboto Slab` — fallback only, generic

```css
font-family: 'Fraunces', 'Roboto Slab', Georgia, serif;
font-variation-settings: 'SOFT' 50, 'WONK' 0, 'opsz' 144;
font-weight: 600;
```

**Body**: a humanist sans, never Inter / Roboto / system default. Choices:
1. `Söhne` (Klim, license) — premium pick
2. `Untitled Sans` (Klim, license)
3. `IBM Plex Sans` (open source, current default) — workhorse, subtle, multilingual
4. `Source Sans 3` — fallback only

```css
font-family: 'IBM Plex Sans', 'Source Sans 3', system-ui, sans-serif;
```

**Mono (data, IDs, readouts)**: `JetBrains Mono` or `IBM Plex Mono`.

```css
font-family: 'JetBrains Mono', 'IBM Plex Mono', ui-monospace, monospace;
```

**Forbidden by directive**: Inter, Roboto (the regular sans), Space Grotesk, Geist, Plus Jakarta Sans. Default-SaaS lookalikes erode the agronomic positioning.

## Type scale (display-driven)

```
display-xl   72/76 fraunces 700
display-l    56/60 fraunces 700
display-m    40/44 fraunces 600
display-s    28/32 fraunces 600
heading-l    22/28 ibm-plex 600
heading-m    18/24 ibm-plex 600
body-l       17/26 ibm-plex 400
body         15/24 ibm-plex 400
body-s       13/20 ibm-plex 400
mono-data    14/20 jetbrains 500
caption      12/16 ibm-plex 500 letter-spacing 0.04em uppercase
```

Smallholder farmer surfaces lean on display-m and body-l for the verdict + action; never smaller than body-l for primary info.

## Spacing & layout

8-pt grid. Big tap targets (≥48dp). Generous whitespace — agronomic data needs room to breathe; cramming = clinical = colder.

Card radius: `12px` for surfaces, `8px` for buttons. Avoid sharp corners (industrial) and pill-radius (SaaS).

## Motion

- **Entry**: 200ms ease-out, slight upward translate (4px). Never bounce.
- **State change**: 120ms cross-fade.
- **Skeleton-load**: shimmer is too SaaS. Use a low-opacity static placeholder instead.
- **Loading > 5s**: replace spinner with text status ("checking your photo with the model — your scout is queued if you go offline").

Motion is restrained — this is agronomic instrumentation, not a game.

## Iconography

Hand-drawn inflection where possible — Phosphor (regular weight) is the open-source default; the brand-bespoke pest icons override stock when budget allows. Never default Lucide-on-purple.

Critical icons to commission custom:
- Each priority pest at lifecycle stages (egg/larva/pupa/adult)
- Biocontrol agents (parasitoid card, sachet, microbial spray bottle)
- Field zones (treat / monitor / skip)

## Application: farmer verdict card

```
[Hero: large slab "Fall armyworm — L1 larvae"]   ← display-m, --ink-900
[Severity bar: 60%, terracotta fill on bone]
[Verdict slab: "Spot-treat zones 1, 3"]          ← heading-l, --earth-700
[Big button: "See treatment plan"]                ← --leaf-500 bg, --bone-100 text
[Small button: "Save photo, decide later"]        ← --bone-200 bg, --ink-900 text
[Footer mono: "Audit ID — abc-123"]               ← --ink-500
```

## Application: officer / coop dashboard

Denser, mono-friendly tables, ink-on-bone, accent terracotta bars for pesticide-saved telemetry. Same palette, different density.

## What this is NOT

- Not Inter on white with purple accent
- Not "AI for farmers" stock photography (sunsets, tractors, smiling families)
- Not greenwash gradients (mint→teal)
- Not greys-only neutralism
- Not Material Design 3 chrome
- Not Tailwind defaults

## Tokens file

Live tokens at `mhindu/src/lib/brand/tokens.ts` and `mhindu/src/styles/brand.css`. The Tailwind config references these via CSS vars; never hard-code hex outside the tokens file.

When the `frontend-design` skill activates, it must defer to this skill for palette, type, and motion. The frontend-design skill does the *quality* work; this skill provides the *vocabulary*.
