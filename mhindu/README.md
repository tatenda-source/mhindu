# Mhindu

Low-pesticide precision IPM platform for Sub-Saharan smallholder and commercial farmers. Thesis: detect-then-treat + biocontrol-first stacks to 80–95% pesticide reduction versus a calendar-spray baseline.

Full project context: [`../CLAUDE.md`](../CLAUDE.md)

---

## Local development

**Postgres setup** — requires a local Postgres instance (Postgres.app, `brew install postgresql`, or Docker).

```bash
createdb mhindu
export DATABASE_URL=postgresql://localhost/mhindu
```

**Database scripts**

```bash
pnpm db:generate   # regenerate migration SQL after schema changes
pnpm db:migrate    # apply migrations to DATABASE_URL
pnpm db:seed       # load synthetic dev data (1 farmer, 1 org, 2 fields, 3 scouts with detections + decisions)
pnpm db:studio     # open Drizzle Studio at http://localhost:4983
```

If `DATABASE_URL` is unset the app degrades gracefully — API routes skip Postgres writes and the client's IndexedDB cache remains canonical. This is by design for the offline-first smallholder story.

---

## Quickstart

```bash
pnpm install
cp .env.example .env.local   # fill in keys you have; see below for sources
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

**Demo mode** — if `AI_GATEWAY_API_KEY` is unset, `/api/scout` returns a canned Fall Armyworm detection so the full UI flow (photo → decision → biocontrol recommendation) works with zero credentials.

---

## Environment variables

| Variable | Source | Required for live |
|---|---|---|
| `AI_GATEWAY_API_KEY` | Vercel Marketplace → AI Gateway (prefer OIDC) | Vision detection |
| `DATABASE_URL` | Vercel Marketplace → Neon (auto-injected per environment) | Persistence |
| `BLOB_READ_WRITE_TOKEN` | Vercel Marketplace → Blob (private mode) | Scout image upload |
| `MHINDU_DEFAULT_REGION` | Project-level, default `zimbabwe` | IPM thresholds |

Pull all env for local dev after `vercel link`:

```bash
vercel env pull .env.local
```

---

## Architecture

```
mhindu/
├─ src/app/          # Next.js 16 App Router pages + API routes
├─ src/lib/
│   ├─ ipm/          # IPM decision engine (pure functions, Zod contracts)
│   ├─ vision/       # Pest detection pipeline (AI Gateway, structured output)
│   └─ biocontrol/   # Biocontrol catalog + release scheduler
└─ public/           # PWA manifest, icons
```

Agent team: `../.claude/agents/` — 8 specialists covering agronomy, IPM engine, vision pipeline, field data modelling, robotics, biocontrol logistics, measurement auditing, and UX.

Skill library: `../.claude/skills/` — 8 auto-triggering knowledge packs.

---

## Deployment

### Preview

```bash
vercel link          # link to Vercel project once
vercel deploy        # creates a preview deployment
```

### Marketplace integrations (install once per Vercel project)

1. **AI Gateway** — Vercel Marketplace. Provides `AI_GATEWAY_API_KEY`; use OIDC where offered.
2. **Neon Postgres** — Vercel Marketplace. Auto-creates branch per preview deployment; injects `DATABASE_URL`.
3. **Vercel Blob** — Vercel Marketplace. Private mode. Provides `BLOB_READ_WRITE_TOKEN`. Phase 0+.
4. **Clerk** — Vercel Marketplace. Phone OTP for farmers; email + magic link for cooperative officers. Phase 1.

### Production cutover checklist

- [ ] Vercel project linked to `main` branch; auto-deploy enabled
- [ ] All four Marketplace integrations installed and env vars verified in Vercel dashboard
- [ ] Neon prod project separated from preview project; `DATABASE_URL` scoped to Production environment
- [ ] Clerk prod environment created (separate publishable key from preview)
- [ ] `MHINDU_DEFAULT_REGION=zimbabwe` set at project level
- [ ] Rolling Release configured (10% → 50% → 100% over 30 min) once real traffic exists
- [ ] Web Vitals + Function duration alerts wired (p95 > 3s on `/api/scout` → alert)
- [ ] Nightly cron jobs uncommented in `vercel.ts` and `DATABASE_URL` confirmed live
- [ ] Pesticide-avoided ledger health check job passes (every `treatment` has `decision_log` parent + `avoided_litres`)
- [ ] Rollback tested: `vercel rollback <prev-deployment-url>`

---

## CI / CD

Three workflows in `../.github/workflows/`:

| Workflow | Trigger | Does |
|---|---|---|
| `ci.yml` | PR + push to `main` | typecheck, lint, build, migration drift check, secret scan |
| `preview.yml` | PR opened/updated | migrate preview DB, Vercel preview deploy, PR comment with URL |
| `production.yml` | Push to `main` | migrate production DB, Vercel prod deploy, health check `/api/health` |

Dependabot (`../.github/dependabot.yml`) runs weekly for npm and GitHub Actions dependencies, grouped minor+patch, capped at 5 open PRs.

Migrations are CI-driven (not Vercel build-time). `vercel.ts` `buildCommand` stays `pnpm build`.

### GitHub secrets required

Add these in **Settings → Secrets and variables → Actions** before the first push:

| Secret | Where to get it |
|---|---|
| `VERCEL_TOKEN` | vercel.com → Account Settings → Tokens |
| `VERCEL_ORG_ID` | `vercel link` → writes to `.vercel/project.json` as `orgId` |
| `VERCEL_PROJECT_ID` | `vercel link` → writes to `.vercel/project.json` as `projectId` |
| `DATABASE_URL` | Vercel dashboard → Project → Settings → Environment Variables → copy Neon URL |

### Recommended branch protection (Settings → Branches → main)

- Require status checks to pass before merging: `build` (ci.yml), `secret-scan` (ci.yml)
- Require linear history
- Do not allow bypassing the above settings
- Block direct pushes to `main`
- Require pull request reviews before merging (recommended, not required)
