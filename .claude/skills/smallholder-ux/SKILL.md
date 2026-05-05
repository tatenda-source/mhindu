---
name: smallholder-ux
description: UX heuristics for low-bandwidth, intermittent-connectivity, low-literacy, multi-language phone-first agricultural interfaces. Use when designing or reviewing any farmer-facing surface, debating accessibility tradeoffs, or planning the SMS / WhatsApp / USSD fallback channels. Pairs with the smallholder-ux-designer agent.
---

# Smallholder UX heuristics

The user this skill is built around:
- Android 8-12 phone, 2-4GB RAM, 3-5MP rear camera
- 2G/3G data, intermittent LTE, paid by MB
- Outdoor sun glare; gloved or dirty hands
- Standard 7 / Form 2 reading level; primary language Shona / Swahili / Chichewa, English secondary
- Battery at one bar; multi-tasking with farming, not browsing

Every heuristic below is judged against this user.

## Hard rules

1. **One primary action per screen.** "Take photo of pest." Not "scout, save draft, view past, settings."
2. **Big tap targets, ≥48dp.** Gloved hands miss small targets.
3. **Plain language, farmer's language.** "Tiny wasps that eat the eggs" beats "*Telenomus remus* parasitoid release."
4. **Voice readout for verdicts.** WebSpeechSynthesis API; `lang="sn"`/`"sw"`/etc. Falls back to English if voice unavailable.
5. **Offline-first.** Every action queues; nothing fails for "no network."
6. **Image weight ≤200KB.** Compress client-side via `browser-image-compression` (target 0.2MB, max 1280px dimension).
7. **No spinner > 5s without text fallback.** "Checking your photo — saved if you go offline."
8. **No background autoplay video, no carousels, no animated splash.** Bandwidth and battery.
9. **High contrast everywhere; pair colour with icon + text.** Sun glare destroys subtle UI.
10. **No dependency on external fonts loading.** System fallback identical layout.

## Layout patterns

### Verdict card (after scouting)

```
[Hero icon: pest at this stage]               <- 96dp, custom illustration
[Pest name in farmer's language]              <- display-m, slab
[Severity bar: 60% terracotta fill on bone]
[Plain-language verdict: "Treat patches 1, 3 with tiny wasps. Order today, release Saturday."]
[BIG BUTTON: "See plan"]                      <- full width, ≥56dp
[Small link: "Save photo, decide later"]
```

### Field list

Cards stacked, full width, one field per card. Each card:
- Field name (display-s)
- Crop + growth stage (body)
- Last scouted (relative time)
- Pressure indicator (bar, terracotta if elevated, leaf if calm)
- Tap = open scout flow

No filters, no search, no sort dropdowns. Five fields ordered by recency.

### Treatment plan

Step-by-step, numbered, big icons:

```
1. [icon] Order biocontrol from Real IPM by phone: <number>
2. [icon] Cooler-box pickup at depot, 5km
3. [icon] Release Saturday at sunrise
4. [icon] Photo recheck in 7 days — we'll send a reminder
```

Tappable to mark complete. State syncs.

## Channel fallbacks

When the PWA can't reach (genuine offline, blocked install, low-end phone):

- **SMS** (Twilio): "FAW detected in your maize field. Treat patches 1+3 with Bt. Reply YES to order delivery, NO to opt out." 160 chars max, multilingual.
- **WhatsApp** (Business API): preferred over SMS where data exists. Photos in, treatment plan PDF + voice note out.
- **USSD** (`*123#`): for ultra-low-end. Menu-driven: "1. Report pest, 2. Check field, 3. Order biocontrol." Build only if user research validates demand.
- **Voice IVR** (later): farmer calls a number, presses 1 to record audio of pest description, gets callback with plan. Requires speech recognition for low-resource languages (Mozilla Common Voice progress).

## Connectivity-aware patterns

```ts
// Service worker queues all POSTs to /api/scout when offline; surfaces as sync pill.
// Synced events trigger a one-shot toast: "Scout 4 synced — verdict ready."
```

```ts
// Asset caching: stale-while-revalidate for pest KB pages, cache-first for pest icons,
// network-first with timeout for dynamic API responses.
```

```ts
// Image upload: compress + queue. If queue depth > 5, warn user gently:
// "5 scouts waiting to sync. Connect to Wi-Fi when you can."
```

## Internationalization

- `next-intl` with catalogs at `mhindu/src/i18n/<lang>.json`
- Languages v1: en, sn (Shona), sw (Swahili), ny (Chichewa)
- Pest common names live in pest-kb frontmatter, also translated per language
- **Human translation for farmer-facing copy.** Auto-translation for the officer dashboard is acceptable; for farmer surfaces, always human.
- Top-level language toggle (not buried in settings); persists in IndexedDB

## Accessibility (real, not compliance)

- Contrast: WCAG AAA where feasible; AA floor for everything farmer-facing.
- Tap targets ≥48dp, never <44dp.
- Voice readout for verdicts and primary actions.
- Screen-reader labels on every actionable element; `aria-live` on sync state.
- Reduced motion: respect `prefers-reduced-motion`; default subtle motion only.
- Colour-blind safe: pair colour with icon + label always. Never red-vs-green alone.

## Anti-patterns (review block-list)

| Anti-pattern | Why it fails |
|---|---|
| Toast notifications as primary feedback | Missed by users in glare |
| Hover-only affordances | Touch only |
| Tooltips for important info | Missed by users; not farmer-friendly |
| Modal stacks (>1 deep) | Confusing on small screens |
| "Pull to refresh" without feedback | Users don't know it's a gesture |
| Search bars on screens with <10 items | Cognitive load for nothing |
| Numeric severity ("23.4%") instead of bar + label ("Heavy") | Numbers are abstract; bars are visceral |
| Pesticide-saved as a chart | A jug filled vs empty hits harder |
| Notifications without action | Don't notify if there's nothing to do |
| Login walls before first-use value | Onboarding deferred until after first scout |

## First-run flow (canonical)

1. Open app from QR / WhatsApp link → installs as PWA (no Play Store).
2. Pick language → big buttons with native scripts and English subtitle.
3. Add first field: name, crop, planted date, GPS-pin or draw polygon.
4. **Scout immediately** — first action is take a photo. No tour, no walkthrough.
5. Verdict card appears. Plan shown. Cooperative/officer linked if invite code.
6. Recheck reminder set automatically.

Total time to first verdict: under 90 seconds for a connected user.

## Performance budget

- JS bundle (initial): ≤150KB gzipped
- Time to first scout possibility (cold): ≤3s on 3G
- Scout submission round-trip: ≤8s on 3G (compressed image + API call)
- IndexedDB queue size: alert at 50+ pending (something's wrong)

## Testing reality

- Real low-end Android (Itel, Tecno, Infinix devices common in SSA), not Chrome devtools throttling
- Airplane mode for offline tests; simulate 30s timeouts not 200ms latency
- Outdoor sunlight contrast checks (literally take device outside)
- Local-language native speakers reviewing copy before merge

## Where this lives

- Components: `mhindu/src/components/farmer/*`
- Hooks: `mhindu/src/lib/offline/*`
- i18n: `mhindu/src/i18n/*`
- Service worker: `mhindu/src/sw.ts` (or `next-pwa` config)
- PWA manifest: `mhindu/public/manifest.webmanifest`
