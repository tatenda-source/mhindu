import { eq, desc } from "drizzle-orm";
import { getDb } from "../client";
import { scouts, decisionLogs, treatments } from "../schema";
import type { Detection, TreatmentPlan, Context } from "@/lib/ipm/schemas";

export type InsertScoutWithDecisionInput = {
  scoutInput: {
    field_id: string;
    taken_at: Date;
    image_url?: string;
    gps_lat?: number | null;
    gps_lng?: number | null;
  };
  detection: Detection;
  plan: TreatmentPlan;
  context: Context;
  userId?: string;
};

export type InsertScoutResult = {
  scoutId: string;
  decisionLogId: string;
  treatmentId: string;
};

export async function insertScoutWithDecision(
  input: InsertScoutWithDecisionInput,
): Promise<InsertScoutResult> {
  const db = getDb();
  if (!db) throw new Error("db_unavailable");

  const { scoutInput, detection, plan, context, userId } = input;

  // Inputs stored in audit log strip user-identifying fields from Context.
  // Only field_id (opaque UUID) is retained — no farmer name, phone, or region PII.
  const auditInputs = {
    detection,
    context: {
      field_id: context.field_id,
      area_ha: context.area_ha,
      crop: context.crop,
      growth_stage: context.growth_stage,
      baseline_calendar_spray_litres_per_ha:
        context.baseline_calendar_spray_litres_per_ha,
      recent_treatments: context.recent_treatments,
      recent_biocontrol_releases: context.recent_biocontrol_releases,
      weather: context.weather,
      beneficial_pressure_0_1: context.beneficial_pressure_0_1,
    },
  };

  return await db.transaction(async (tx) => {
    const [scoutRow] = await tx
      .insert(scouts)
      .values({
        id: crypto.randomUUID(),
        field_id: scoutInput.field_id,
        user_id: userId ?? null,
        taken_at: scoutInput.taken_at,
        image_url: scoutInput.image_url ?? null,
        gps_lat: scoutInput.gps_lat != null ? String(scoutInput.gps_lat) : null,
        gps_lng: scoutInput.gps_lng != null ? String(scoutInput.gps_lng) : null,
        detection: detection as unknown as Record<string, unknown>,
        status: "done",
      })
      .returning({ id: scouts.id });

    const [logRow] = await tx
      .insert(decisionLogs)
      .values({
        id: plan.decision_log_id,
        scout_id: scoutRow.id,
        decided_at: new Date(),
        engine_version: plan.engine_version,
        inputs: auditInputs as unknown as Record<string, unknown>,
        rule_fired: plan.rule_fired,
        options_considered: [
          plan.primary,
          ...plan.alternates,
        ] as unknown as Record<string, unknown>[],
        chosen: plan.primary as unknown as Record<string, unknown>,
        pesticide_avoided_litres: String(plan.pesticide_avoided_litres),
      })
      .returning({ id: decisionLogs.id });

    const [treatmentRow] = await tx
      .insert(treatments)
      .values({
        field_id: scoutInput.field_id,
        scout_id: scoutRow.id,
        decided_at: new Date(),
        type: plan.primary.type,
        agent_id: plan.primary.agent_id ?? null,
        rate: plan.primary.rate != null ? String(plan.primary.rate) : null,
        unit: plan.primary.rate_unit ?? null,
        application_mode: plan.primary.application_mode as
          | "spot"
          | "blanket"
          | "release"
          | "preventive",
        pesticide_avoided_litres: String(plan.pesticide_avoided_litres),
        decision_log_id: logRow.id,
      })
      .returning({ id: treatments.id });

    return {
      scoutId: scoutRow.id,
      decisionLogId: logRow.id,
      treatmentId: treatmentRow.id,
    };
  });
}

export type OutcomeUpdate = {
  outcome_severity_after: number;
  outcome_observed_at: Date;
  verified_by?: string;
};

export async function updateOutcome(
  treatmentId: string,
  outcome: OutcomeUpdate,
): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("db_unavailable");

  const patch: Partial<typeof treatments.$inferInsert> = {
    outcome_severity_after: String(outcome.outcome_severity_after),
    outcome_observed_at: outcome.outcome_observed_at,
  };

  if (outcome.verified_by) {
    patch.verified_by = outcome.verified_by;
    patch.verified_at = new Date();
    patch.verification_tier = 2;
  }

  await db.update(treatments).set(patch).where(eq(treatments.id, treatmentId));
}

export async function recentScoutsForField(fieldId: string, limit = 50) {
  const db = getDb();
  if (!db) throw new Error("db_unavailable");

  return db
    .select()
    .from(scouts)
    .where(eq(scouts.field_id, fieldId))
    .orderBy(desc(scouts.taken_at))
    .limit(limit);
}
