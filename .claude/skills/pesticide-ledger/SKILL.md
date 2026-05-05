---
name: pesticide-ledger
description: Methodology, data model, and verification tiers for measuring "pesticide avoided" — the number behind Mhindu's 90% reduction claim. Use when computing per-field avoidance, designing the audit trail, building cooperative dashboards, or preparing ESG / carbon-credit issuance evidence. Pairs with measurement-auditor agent.
---

# Pesticide ledger

The 90% reduction claim is only as credible as the ledger behind it. Every litre claimed avoided must trace through scout → decision → treatment → outcome.

## Definitions

- **Baseline (counterfactual)**: what the farmer *would have* sprayed in this field-season without Mhindu. Per active ingredient, in L/ha or kg/ha, summed across the season's calendar.
- **Actual**: what the farmer *did* spray (chemical only — biocontrol releases and cultural interventions don't count toward "actual chemical").
- **Avoided**: `baseline - actual`, per active ingredient, per field, per season.
- **Reduction %**: `1 - actual / baseline`, capped at 0% on the bad side (over-spraying vs baseline = 0% reduction, not negative).

## Baseline elicitation (canonical)

Asked at field onboarding via a structured form, in the farmer's language:

```
For your <crop> on this field, in a normal season:
1. How many sprays per season? <number>
2. What product(s)? <list with autocomplete from regional pesticide registry>
3. What rate? <preset options: e.g. "1 sachet per 16L knapsack" → conversion to L/ha>
4. Any sprays you skip when conditions are good? <yes/no/sometimes>
```

Plus: cross-check against regional median for that crop × region (sourced from extension records, FAO, WHO/FAO pesticide use surveys). If the self-report is >2× or <0.5× regional median, flag for officer review before locking baseline.

Stored on `fields`:
```sql
baseline_spray_cycles_per_season int,
baseline_actives jsonb,             -- [{ active: "lambda_cyhalothrin", rate_ai_kg_per_ha: 0.025, cycles: 6 }, ...]
baseline_volume_litres_per_ha numeric,    -- formulation L/ha summed over season
baseline_set_at timestamptz,
baseline_set_by uuid,
baseline_review_status: "self_reported"|"officer_verified"|"flagged_outlier",
baseline_regional_median_ratio numeric  -- baseline / regional median for sanity flag
```

## What counts as "avoided"

| Decision type | Avoidance count |
|---|---|
| `no_action` (below threshold) | full baseline rate × area for that scheduled cycle |
| `cultural` | full baseline rate × area for that cycle |
| `biological` (biocontrol release) | full baseline rate × area for that cycle |
| `mechanical` | full baseline rate × area for that cycle |
| `chemical` spot-treat | baseline rate × (1 - treated_area_pct) × field_area |
| `chemical` reduced-rate | (baseline_rate - actual_rate) × area |
| `chemical` blanket at baseline rate | 0 avoidance |

## What does NOT count

- Sprays the farmer skipped for unrelated reasons (off-farm, out of money). If no `decision_log` of `no_action` exists for that cycle, no avoidance.
- Biocontrol releases that failed and were followed by chemical rescue — net the rescue into actual.
- Prophylactic regulatory sprays (export-mandated). Annotated; excluded from avoided.
- Avoided herbicides while we're not yet recommending mechanical weeding. (v1 scope is insecticide + fungicide; herbicide avoided requires the robotic-weeding integration.)

## Audit trail (end-to-end, per cycle)

```
field
 ├ baseline (set at onboarding, regionally cross-checked)
 ├ scheduled_cycles[]   ← what would have been sprayed when
 │
 ├ scout_event (photo + GPS + time)
 │   ├ detection (vision pipeline output)
 │   ├ decision_log (rule fired, alternates)
 │   └ treatment
 │       ├ application_record (if chemical: actual rate + area + date)
 │       ├ biocontrol_release (if biological: agent + rate + supplier + viability)
 │       └ outcome_recheck (severity 7-14d later)
 └ avoided_calculation (per cycle)
```

Every record links upstream. Drop one link, that cycle's avoidance is unverified.

## Verification tiers

| Tier | Requirement | Use |
|---|---|---|
| 1 — self-reported | Farmer logs scout + treatment + outcome through Mhindu | Internal, marketing-with-disclosure |
| 2 — cooperative-verified | Extension officer / coop manager confirms outcome at recheck | Voluntary ESG markets, internal grant reporting |
| 3 — independent-audited | Third-party samples ≥10% of decisions and outcomes per season | Compliance markets, rigorous ESG, carbon-credit issuance |

Schema: every `treatment` row carries `verification_tier int` and `verified_by uuid? + verified_at timestamptz?`. Promotion across tiers without schema migration.

## Methodology summary (publishable)

> Mhindu's pesticide-avoided figure is computed per field per season as the difference between (a) the field's elicited baseline pesticide regime, regionally cross-checked, and (b) the actual chemical applications recorded through Mhindu's audited decision log. Each avoided cycle is traceable to a scouting event, a decision rationale, and an outcome recheck. Verification tiers (1/2/3) reflect the level of third-party confirmation, with Tier 3 required for compliance carbon-credit issuance.

This methodology document goes on the public-facing Mhindu site and is the document any auditor reads first.

## Calculation per cycle (canonical)

```ts
function avoidedThisCycle(
  field: Field,
  cycle: ScheduledCycle,
  treatment: Treatment | null
): number {
  const baselineRate = cycle.baseline_rate_l_per_ha;
  const baselineCycleVolume = baselineRate * field.area_ha;

  if (!treatment || treatment.type === "no_action") {
    return baselineCycleVolume;
  }
  if (treatment.type === "cultural" || treatment.type === "biological" || treatment.type === "mechanical") {
    return baselineCycleVolume;
  }
  if (treatment.type === "chemical") {
    const applied = treatment.actual_rate_l_per_ha * treatment.treated_area_ha;
    return Math.max(0, baselineCycleVolume - applied);
  }
  return 0;
}
```

Per active ingredient, repeat the calculation. Sum at field level for season totals.

## Outcome closure

Without recheck data, "avoided" is unverified. Mhindu pushes recheck via:
- Push notification (PWA) at min(7 days, 0.5 × pest.lifecycle.next_stage_duration)
- SMS reminder if no recheck in 10 days
- Officer dashboard surfaces unverified treatments per cooperative

KPI: % of treatments with outcome recheck completed within 14 days. Target ≥80% before claiming verified avoidance in any external comm.

## Cooperative dashboard (KPI set)

Surface only:
- Aggregate L/ha avoided this season (with confidence interval based on verification tier mix)
- Active-ingredient breakdown of avoided
- # decisions by type (no_action / cultural / biological / chemical-spot / chemical-blanket)
- % outcomes verified within 14 days
- Top pests driving avoidance
- Trend line: weekly cumulative avoided

Vanity metrics excluded: total scouts, total photos, total fields. The board doesn't care.

## Anti-gaming defenses

- Baseline cross-check vs regional median (>2× flag).
- Regional median refreshed yearly from authoritative sources, not from Mhindu's own data (avoids self-referential drift).
- Outcome recheck must include photo + severity recheck — not just "yes it worked".
- Independent audit sample (Tier 3) draws across deciles of avoidance — high-claim and low-claim cycles both audited.
- Engine version pinning: avoidance is computed with the engine version that produced the decision; can't retroactively inflate by changing rules.

## Code locations

- `mhindu/src/lib/measurement/baseline.ts` — elicitation + regional median lookup
- `mhindu/src/lib/measurement/avoided.ts` — per-cycle calculation
- `mhindu/src/lib/measurement/rollups.ts` — farmer / coop / region aggregations
- `mhindu/src/lib/measurement/methodology.md` — public-facing methodology document
- `mhindu/src/lib/measurement/__tests__/golden.ts` — known scenarios → known avoided values
- `mhindu/src/db/migrations/*` — schema for verification tiers, outcome records

## Honest reporting

If a field-season ends with <80% outcome verification, the dashboard shows the verified-only avoided number with a notice on coverage. Never quietly include unverified avoidance in headline numbers.
