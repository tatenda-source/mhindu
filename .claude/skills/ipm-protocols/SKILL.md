---
name: ipm-protocols
description: Integrated Pest Management decision protocols, hierarchies, and rule templates used by Mhindu's IPM engine. Use when encoding new decision rules, justifying a treatment recommendation, or designing the resistance-management constraints. Anchors on FAO/CABI IPM packages.
---

# IPM protocols (canonical decision rulebook)

The Integrated Pest Management hierarchy (UN FAO definition):

```
1. Prevention            — resistant cultivars, sanitation, crop rotation, push-pull
2. Monitoring            — scouting + thresholds (the bedrock — never skip)
3. Cultural / mechanical — hand-removal, traps, barriers, intercropping
4. Biological            — parasitoids, predators, microbials (Bt, NPV, fungi)
5. Chemical (last resort) — IRAC-rotated, narrow-spectrum, threshold-justified
```

Mhindu's engine implements this as cascading constraints, not a checklist. A treatment plan must always justify *why higher tiers were rejected* before recommending a lower tier.

## Decision rule templates

### Threshold gate

```
IF severity < pest.threshold[stage]
THEN return NO_ACTION with monitor_days = 7
```

Below threshold, treatment costs more than the damage it prevents. Always recheck within 7 days; pest dynamics escalate fast.

### Natural-enemy assessment

```
IF beneficial_pressure_score >= 0.7
THEN return MONITOR with monitor_days = 5
ELIF beneficial_pressure_score >= 0.4 AND severity < 1.5 * threshold
THEN return MONITOR with monitor_days = 5
```

`beneficial_pressure_score` comes from scout observations (parasitized eggs, predatory insects visible) or trap counts. When natural enemies are doing the work, intervention disrupts them.

### Biocontrol viability check

```
IF lifecycle_window_for_target_stage_starts_in < biocontrol_supplier_lead_time
THEN biocontrol is INFEASIBLE for this cycle → fall through to next-tier option
```

The hardest rule. If you scout L4 larvae, the egg parasitoid window has passed. Don't recommend it; recommend microbial (Bt, NPV) or mechanical instead.

### IPM compatibility (active biocontrol blocks chemical)

```
IF any biocontrol_release in field within last (agent.viability_days)
THEN broad_spectrum_chemical is FORBIDDEN
     narrow_spectrum_chemical (e.g. emamectin) is ALLOWED only with field_re-entry > 7d post-release
```

Hard constraint. Releasing parasitoids and then spraying pyrethroid wastes both inputs and trains farmers that biocontrol "doesn't work."

### IRAC mode-of-action rotation

```
IF last_chemical_in_field has same IRAC MoA group as candidate
THEN reject candidate, propose alternate MoA
IF no alternate MoA available within budget
THEN return CHEMICAL_BLOCKED, recommend cultural/biological even if rate-mismatched
```

Resistance management non-negotiable. Mhindu must never recommend the same MoA twice in succession in the same field.

### Spot vs blanket

```
IF detection.coverage < 0.3 AND zones_polygons.length > 0
THEN application_mode = SPOT
ELSE application_mode = BLANKET
```

Spot is the largest single lever for the 90% claim. Default to spot when coverage is patchy.

### Weather gate (chemical or release)

```
IF wind > 4 m/s OR temp > 30°C OR rain probability > 30% in next 24h
THEN delay treatment, return next_window
IF temp > 35°C AND fungal-biocontrol
THEN delay (fungal viability collapses)
```

### Outcome verification scheduler

```
ON every treatment, schedule recheck at min(7 days, 0.5 * pest.lifecycle.next_stage_duration)
NOTIFY farmer + officer
LOG outcome status (severity_after / null) on `treatments` table
```

Without recheck, pesticide-avoided is unverifiable.

## Anti-patterns (rules that look reasonable but break the system)

- **"Spray prophylactically near a sensitive growth stage."** No. Even at flowering, threshold + scouting beats prophylactic spray. The exception is mandated regulatory spray for export — annotated separately.
- **"If unsure, spray to be safe."** No. The default is monitor-and-recheck. Cost of false positive (chemical, beneficials killed, resistance) > cost of false negative (one extra week of pest pressure).
- **"Combine multiple actives in a tank-mix to be sure."** No. Rotate by MoA, don't stack.
- **"Use the highest label rate to ensure efficacy."** No. Highest rate accelerates resistance. Stage + severity drives rate.
- **"Trust farmer self-report on baseline."** Cross-check against regional median. Outliers flagged for verification.

## Authoritative sources for protocol design

- **FAO IPM Package**: https://www.fao.org/agriculture/ippm/the-ipm-approach/the-ipm-toolbox/en/
- **FAO Fall Armyworm Management Manual**: https://www.fao.org/3/I8665EN/i8665en.pdf
- **CABI Plantwise Toolkit**: https://www.plantwise.org/knowledgebank/
- **ICIPE Push-Pull Manual**: http://www.push-pull.net/
- **IRAC MoA Classification**: https://irac-online.org/modes-of-action/
- **FRAC Fungicide Resistance Action Committee**: https://www.frac.info/

## How rules become code

Rules live in `mhindu/src/lib/ipm/rules/*.ts`. Each rule is a pure function `(detection, context) => RuleVerdict`. The engine composes them in IPM-hierarchy order. Rule files reference protocol citations in comments — when an auditor asks "why this rule," the comment plus this skill document is the answer.

## Engine version pinning

Every `decision_log` row stores `engine_version`. When rules change, version increments. Past decisions are reproducible against their original ruleset — required for the audit trail.
