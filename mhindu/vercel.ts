// Vercel deployment configuration for Mhindu.
// @vercel/config is not yet stable for Next.js 16; this file documents intent
// and will be wired to the Vercel CLI once `@vercel/config/v1` ships a stable
// ESM-compatible release. Until then, Vercel auto-detects the Next.js framework
// and `vercel.json` is intentionally absent — defaults are correct.
//
// Cron jobs (nightly pest-pressure aggregation, recheck-reminder dispatch) land
// in Phase 1 when the Neon DB is live. Placeholders below, commented out.

export const config = {
  framework: "nextjs",
  buildCommand: "pnpm build",
  installCommand: "pnpm install --frozen-lockfile",

  // Phase 1 — uncomment when DATABASE_URL is wired:
  // crons: [
  //   { path: "/api/cron/refresh-pressure", schedule: "0 2 * * *" },
  //   { path: "/api/cron/recheck-reminders", schedule: "0 6 * * *" },
  // ],
} as const;
