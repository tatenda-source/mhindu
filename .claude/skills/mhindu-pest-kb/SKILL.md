---
name: mhindu-pest-kb
description: Reference knowledge base of pests, diseases, lifecycle stages, economic thresholds, and biocontrol options for Mhindu's target crops in Sub-Saharan Africa. Use when adding a new pest entry, validating thresholds, or looking up which biocontrol applies to which stage. Pairs with the agronomy-researcher agent who fact-checks and cites entries.
---

# Mhindu pest knowledge base

This skill defines the schema and content conventions for `mhindu/src/lib/pest-kb/<pest_id>.md` — the pest knowledge ingested by the IPM engine.

## Scope (v0)

Target crops: **maize, tomato, cotton** (Zimbabwe-relevant, expandable).

Priority pests:
- Maize: fall armyworm (*Spodoptera frugiperda*), African stem borer (*Busseola fusca*), maize streak virus, MLN, weevils
- Tomato: tomato leafminer (*Tuta absoluta*), bollworm (*Helicoverpa armigera*), early blight (*Alternaria solani*), late blight (*Phytophthora infestans*), bacterial wilt
- Cotton: bollworm (*Helicoverpa armigera*), aphids (*Aphis gossypii*), whitefly (*Bemisia tabaci*), red spider mite

## Entry schema (canonical)

Every pest is one Markdown file with YAML frontmatter:

```yaml
---
pest_id: <snake_case_unique_id>             # e.g. spodoptera_frugiperda
binomial: <Latin binomial>
common_name: <English>
local_names:
  shona: <name or "unverified">
  swahili: <name or "unverified">
  chichewa: <name or "unverified">
type: insect | disease | weed | nematode | virus
crops: [maize, sorghum, ...]
region: pan-SSA | east-africa | southern-africa | <specific>
lifecycle:
  - stage: egg
    duration_days: 2-3
    damage_signature: <visible signature>
    target_for_biocontrol: [agent_id, ...]
  - stage: larva_L1_L2
    ...
  - stage: pupa
    ...
  - stage: adult
    ...
threshold:
  metric: leaf_damage_pct_whorl | per_plant_count | per_trap_count | infestation_pct_field
  value: <number>
  growth_stage_qualifier: <crop stage where threshold applies>
  source_url: <URL or DOI>
  source_note: <publication, year>
biocontrols:
  - agent_id: <id from biocontrol-catalog>
    target_stage: egg | larva | pupa | adult
    application_rate: <e.g. 50000_per_ha>
    expected_efficacy_pct: <range, e.g. 65-90>
    weather_constraints: <e.g. "no rain 24h post-release">
    incompatible_with: [recent_pyrethroid_spray, ...]
    source_url: ...
cultural:
  - name: push_pull
    description: <short>
    applicability: <crop x region>
    source_url: ...
mechanical:
  - name: hand_egg_mass_removal
    description: <short>
    applicability: <smallholder <1ha viable>
chemical_last_resort:
  - active_ingredient: emamectin_benzoate
    irac_moa: 6
    rate: <e.g. 0.2 L/ha at 0.6%>
    compatibility: <e.g. "compatible with Telenomus parasitoids">
avoid_actives:
  - active_ingredient: <e.g. lambda_cyhalothrin>
    reason: <e.g. "broad-spectrum, kills parasitoids, resistance widespread">
citations:
  - url: <full URL>
    type: factsheet | paper | protocol | extension_note
    publisher: <CABI | FAO | ICIPE | CIMMYT | IITA | ...>
    accessed: YYYY-MM-DD
confidence:
  threshold: high | medium | low
  biocontrol_rates: high | medium | low
  local_names: high | medium | low
unverified_fields: [<list any frontmatter keys whose values still need expert confirmation>]
last_reviewed: YYYY-MM-DD
reviewed_by: <agronomy-researcher | human_expert_name>
---

# {Common name} ({Binomial})

## Identification
<plain-language description for farmer-facing UI; what does this pest LOOK like at each stage>

## Damage signature
<what does the damage look like in the field; how to distinguish from lookalikes>

## Lookalikes
- <pest X> — distinguished by <feature>
- <beneficial Y> — DO NOT confuse; <feature>

## Why this matters
<short economic/agronomic justification — why is this pest in the priority set>

## References
<bullet list of citations from frontmatter, with one-line summary each>
```

## Conventions

- **`pest_id`** is `snake_case_binomial` for animals (`spodoptera_frugiperda`), `disease_<name>` for diseases (`disease_late_blight`), to avoid conflicts.
- **`source_url` mandatory** for every threshold and rate. No URL → mark `unverified` and exclude from production engine until cited.
- **Local names**: mark `unverified` aggressively. Wrong vernacular names break farmer trust faster than English.
- **Stage taxonomy**: stick to `egg`, `larva_L1_L2`, `larva_L3_L6`, `pupa`, `adult` for Lepidoptera; `egg`, `nymph`, `adult` for Hemiptera; `mycelium`, `spore`, `sporulation` for fungi. The IPM engine joins on these strings.
- **Negative space**: `avoid_actives` and `incompatible_with` are first-class data. The IPM engine uses them as hard constraints.

## Where entries live

- `mhindu/src/lib/pest-kb/<pest_id>.md` — one file per pest
- `mhindu/src/lib/pest-kb/index.ts` — auto-generated import surface (`pnpm run kb:index`)
- `mhindu/src/lib/pest-kb/__tests__/schema.test.ts` — validates every entry against the Zod schema for the frontmatter

## When entries get added

`agronomy-researcher` agent owns research and drafting. Code agents read but don't author.

## Anchoring sources

Always prefer in this order: CABI Plantwise → FAO IPM packages → ICIPE / CGIAR centres → peer-reviewed → local extension. Wikipedia is never a primary source; it can point to one.
