import type { Context } from "../schemas";
import type { PestKbOption } from "../kb-types";

export type ResistanceCheck =
  | { ok: true }
  | { ok: false; reason: string; conflicting_moa: string; last_applied_at: string };

const MOA_BLOCK_DAYS = 30;

export function resistanceCompatible(option: PestKbOption, context: Context, now = Date.now()): ResistanceCheck {
  if (option.type !== "chemical" || !option.irac_moa) return { ok: true };

  const cutoff = now - MOA_BLOCK_DAYS * 86400_000;

  for (const t of context.recent_treatments) {
    if (t.type !== "chemical" || !t.irac_moa) continue;
    if (t.irac_moa !== option.irac_moa) continue;
    const at = Date.parse(t.applied_at);
    if (Number.isNaN(at)) continue;
    if (at >= cutoff) {
      return {
        ok: false,
        reason: `IRAC MoA ${option.irac_moa} already used within last ${MOA_BLOCK_DAYS}d`,
        conflicting_moa: option.irac_moa,
        last_applied_at: t.applied_at,
      };
    }
  }

  return { ok: true };
}
