# Mhindu — low-pesticide agriculture platform

Mhindu (Shona: cultivator) is an AI + biology + robotics platform aimed at cutting on-farm pesticide use by 90% for Sub-Saharan smallholder and commercial farmers. The thesis: precision IPM (Integrated Pest Management) — detect-then-treat instead of calendar spray, biocontrol-first, spot-treatment over blanket — reliably stacks to 80–95% reduction when measured against an honest baseline.

## Repo layout (current)

```
agriculture/
├─ CLAUDE.md                 # this file
├─ .claude/
│   ├─ agents/               # specialist subagents (8)
│   └─ skills/               # auto-triggering knowledge packs (8)
└─ mhindu/                   # Next.js 16 app (scaffold; not yet wired)
```

The agent team and skill library precede implementation. Decisions about crop scope, persona, and business model are still open — see "Open decisions" below.

## Agent team

Located in `.claude/agents/`. Each is a specialist with a scoped tool set and a focused system prompt. Invoke via the Agent tool with `subagent_type` matching the agent name.

| Agent | Owns |
|---|---|
| `agronomy-researcher` | Pest / disease / biocontrol KB content; sources from CABI, FAO, ICIPE, CIMMYT, peer-reviewed |
| `ipm-engine-architect` | The core IPM decision engine (pure functions, Zod contracts, golden-set tests) |
| `vision-pipeline-engineer` | Pest detection via Claude vision + AI Gateway, structured Zod output, eval harness |
| `field-data-modeler` | Postgres schema (Neon), Drizzle migrations, PostGIS spatial, audit ledger |
| `robotics-integrator` | Prescription map generation (KML, DJI WPML, XAG, ISOXML, smallholder PDF), drone coverage planning |
| `biocontrol-logistician` | Supplier integration, lifecycle-aware release scheduling, viability windows |
| `measurement-auditor` | Pesticide-avoided ledger, baseline elicitation, verification tiers, ESG-grade audit trail |
| `smallholder-ux-designer` | Offline-first PWA, low-bandwidth, low-literacy, multi-language farmer UX |
| `deployment-ops` | Vercel deployment, Marketplace integrations, env management, production runbook |

## Skill library

Located in `.claude/skills/`. These auto-trigger on description match — when a future task touches their domain, they load automatically.

| Skill | Triggers on |
|---|---|
| `mhindu-pest-kb` | Pest knowledge entries, schema, conventions |
| `ipm-protocols` | IPM decision rules, hierarchies, anti-patterns |
| `vision-prompting` | Pest-detection prompt design, Zod schemas, eval harness |
| `biocontrol-catalog` | Biocontrol agent reference, supplier catalog, release math |
| `prescription-maps` | Variable-rate file generation across vendors |
| `mhindu-brand` | Visual identity tokens (terracotta / chlorophyll / ink, slab serif) |
| `smallholder-ux` | Phone-first, offline, low-literacy UX heuristics |
| `pesticide-ledger` | Avoided-litres methodology, verification tiers, dashboard KPIs |

## How a typical task flows

1. **New pest**: invoke `agronomy-researcher` to draft KB entry → `ipm-engine-architect` adds engine rules + golden-set tests → `vision-pipeline-engineer` updates candidate set + eval → `biocontrol-logistician` confirms supplier coverage.
2. **New crop**: same pipeline at scale; `smallholder-ux-designer` adds locale-specific copy and pest-name translations.
3. **New vendor (drone, sprayer)**: `robotics-integrator` writes adapter; `prescription-maps` skill provides format reference.
4. **Production deploy**: `deployment-ops` for Vercel + Marketplace wiring; rolling release once traffic is real.

## Open decisions (block real Phase 0 build)

These need user direction before scaffolding the application beyond the empty Next.js shell:

1. **Geography & crops**: Zimbabwe-first is assumed (user is in Harare timezone). Crop priority: maize (FAW thesis) → tomato → cotton? Confirm or override.
2. **User persona**: smallholder (1–5ha, phone-only) primary; cooperative officer secondary. Commercial (50–500ha) deferred? Confirm.
3. **Business model**: SaaS / freemium-with-biocontrol-fulfilment / cooperative licensing / carbon-credit issuer? Determines what to build first.
4. **Robotics: build or integrate**: assumption is integrate-only for v1 (DJI / XAG / printable PDF). Confirm.
5. **Biocontrol supply chain**: partnership with Real IPM Kenya is the obvious anchor. Need to confirm or identify alternatives.
6. **Funding stage**: prototype / hackathon / grant pitch / seed? Determines depth vs breadth.
7. **Starting data**: assume cold-start; bootstrap with Claude vision + PlantVillage + iNaturalist; build proprietary dataset over time.
8. **Connectivity**: assume intermittent; offline-first PWA mandatory.

## Phasing (recommendation)

- **Phase 0 (weeks 0–6)**: Decision Brain. Mobile PWA, vision-based scouting, IPM engine, no robotics, biocontrol via referral. Validate with 5–10 real fields.
- **Phase 1 (months 2–6)**: Field intelligence — multi-zone, weather forecasting, prescription map export to any drone/sprayer. Biocontrol marketplace.
- **Phase 2 (months 6–18)**: DJI/XAG drone integration, robotic spot-spray pilot, biocontrol release scheduling tied to lifecycle.
- **Phase 3 (year 2+)**: Autonomous fleets, area-wide pheromone disruption, verified carbon/sustainability credits.

## Stack (canonical)

- Next.js 16 App Router + TypeScript + Tailwind + Turbopack
- AI SDK v6 → Vercel AI Gateway (`anthropic/claude-sonnet-4-6` default, `claude-opus-4-7` for ambiguous)
- Neon Postgres via Vercel Marketplace; PostGIS; Drizzle ORM
- Vercel Blob (private) for scout images
- Clerk auth via Marketplace (phone OTP for farmers, email/magic-link for officers)
- Vercel Workflow DevKit for durable scout → enrich → decide → schedule flows
- Vercel Cron for nightly aggregations
- pnpm, Node 24 LTS

## Non-negotiables

- **Cite or don't claim.** Every threshold, rate, biocontrol efficacy figure has a source URL or DOI.
- **Audit trail end-to-end.** Photo → detection → decision → treatment → outcome. Drop a link, claim is unverified.
- **Resistance management is a hard constraint.** No same-MoA-twice; biocontrol viability windows respected.
- **Conservative defaults.** Below threshold, return `monitor`; ambiguous detection, return `unknown`. False positives on spraying are worse than false negatives on pest.
- **Local language and farmer literacy first.** Plain language, voice readout, big buttons. SaaS aesthetics are deadweight.
- **Honest measurement.** Don't ship "90% reduction" UI before outcome verification is ≥80% across a meaningful sample.

## Working style

- Vibe coding, parallel tool calls, terse responses, no trailing summaries.
- Conventional-commit prefixes; `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>`.
- Stage by name (`git add path`), never `git add -A`.
- Project-specific feedback / decisions live in memory at `~/.claude/projects/-Users-tatendanyemudzo-agriculture/memory/`.
