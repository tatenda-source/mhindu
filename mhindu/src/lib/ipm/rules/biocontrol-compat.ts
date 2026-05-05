import type { Context } from "../schemas";
import type { PestKbOption } from "../kb-types";

export type BiocontrolCompatCheck =
  | { ok: true }
  | { ok: false; reason: string };

const RECENT_PYRETHROID_DAYS = 14;
const BROAD_SPECTRUM_MOAS = new Set(["1A", "1B", "3A", "3B", "4A", "5"]);

export function biocontrolCompatible(option: PestKbOption, context: Context, now = Date.now()): BiocontrolCompatCheck {
  if (option.type !== "chemical") return { ok: true };
  if (!option.broad_spectrum) return { ok: true };

  for (const r of context.recent_biocontrol_releases) {
    const releasedAt = Date.parse(r.released_at);
    if (Number.isNaN(releasedAt)) continue;
    const expires = releasedAt + r.viability_days * 86400_000;
    if (expires >= now) {
      return {
        ok: false,
        reason: `active biocontrol ${r.agent_id} (released ${r.released_at}, viable ${r.viability_days}d) blocks broad-spectrum ${option.product_name}`,
      };
    }
  }

  const cutoff = now - RECENT_PYRETHROID_DAYS * 86400_000;
  for (const t of context.recent_treatments) {
    if (t.type !== "chemical") continue;
    const at = Date.parse(t.applied_at);
    if (Number.isNaN(at)) continue;
    if (at < cutoff) continue;
    const moa = t.irac_moa ?? "";
    if (BROAD_SPECTRUM_MOAS.has(moa)) {
      return {
        ok: false,
        reason: `recent broad-spectrum chemical (MoA ${moa}, ${t.applied_at}) — second broad-spectrum within ${RECENT_PYRETHROID_DAYS}d would devastate beneficials`,
      };
    }
  }

  return { ok: true };
}
