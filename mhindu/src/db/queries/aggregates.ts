import { eq, sql, count } from "drizzle-orm";
import { getDb } from "../client";
import { decisionLogs, treatments, scouts, fields, orgMembers } from "../schema";

export type Rollup = {
  totalAvoidedLitres: number;
  totalBaselineLitres: number;
  decisionsByType: Record<string, number>;
  fieldCount: number;
  scoutCount: number;
  verificationPct: number;
};

export async function cooperativeRollup(
  orgId: string,
  sinceISO: string,
): Promise<Rollup> {
  const db = getDb();
  if (!db) throw new Error("db_unavailable");

  const since = new Date(sinceISO);

  // Fields belonging to org members
  const memberFields = await db
    .select({ field_id: fields.id })
    .from(fields)
    .innerJoin(orgMembers, eq(orgMembers.user_id, fields.owner_id))
    .where(eq(orgMembers.org_id, orgId));

  if (memberFields.length === 0) {
    return emptyRollup();
  }

  const fieldIds = memberFields.map((r) => r.field_id);

  return await _rollupForFields(fieldIds, since);
}

export async function fieldRollup(
  fieldId: string,
  sinceISO: string,
): Promise<Rollup> {
  const db = getDb();
  if (!db) throw new Error("db_unavailable");

  return await _rollupForFields([fieldId], new Date(sinceISO));
}

export async function userRollup(
  userId: string,
  sinceISO: string,
): Promise<Rollup> {
  const db = getDb();
  if (!db) throw new Error("db_unavailable");

  const userFields = await db
    .select({ field_id: fields.id })
    .from(fields)
    .where(eq(fields.owner_id, userId));

  if (userFields.length === 0) return emptyRollup();

  const fieldIds = userFields.map((r) => r.field_id);
  return await _rollupForFields(fieldIds, new Date(sinceISO));
}

async function _rollupForFields(fieldIds: string[], since: Date): Promise<Rollup> {
  const db = getDb()!;

  // Avoided litres from decision_logs; join through scouts to filter by field
  const avoided = await db
    .select({
      total: sql<string>`coalesce(sum(${decisionLogs.pesticide_avoided_litres}), 0)`,
    })
    .from(decisionLogs)
    .innerJoin(scouts, eq(scouts.id, decisionLogs.scout_id))
    .where(
      sql`${scouts.field_id} = any(${sql.raw(`'{${fieldIds.join(",")}}'::uuid[]`)}) and ${decisionLogs.decided_at} >= ${since.toISOString()}`,
    );

  // Treatment counts by type
  const byType = await db
    .select({
      type: treatments.type,
      cnt: count(),
    })
    .from(treatments)
    .where(
      sql`${treatments.field_id} = any(${sql.raw(`'{${fieldIds.join(",")}}'::uuid[]`)}) and ${treatments.decided_at} >= ${since.toISOString()}`,
    )
    .groupBy(treatments.type);

  // Scout count
  const scoutCountResult = await db
    .select({ cnt: count() })
    .from(scouts)
    .where(
      sql`${scouts.field_id} = any(${sql.raw(`'{${fieldIds.join(",")}}'::uuid[]`)}) and ${scouts.taken_at} >= ${since.toISOString()}`,
    );

  // Verification stats
  const verificationResult = await db
    .select({
      total: count(),
      verified: sql<string>`count(*) filter (where ${treatments.verification_tier} >= 2)`,
    })
    .from(treatments)
    .where(
      sql`${treatments.field_id} = any(${sql.raw(`'{${fieldIds.join(",")}}'::uuid[]`)}) and ${treatments.decided_at} >= ${since.toISOString()}`,
    );

  const decisionsByType: Record<string, number> = {};
  for (const row of byType) {
    decisionsByType[row.type] = Number(row.cnt);
  }

  const totalTreatments = Number(verificationResult[0]?.total ?? 0);
  const totalVerified = Number(verificationResult[0]?.verified ?? 0);
  const verificationPct =
    totalTreatments > 0 ? (totalVerified / totalTreatments) * 100 : 0;

  return {
    totalAvoidedLitres: Number(avoided[0]?.total ?? 0),
    // baseline is avoided + what was actually applied; approximated as avoided for v1
    totalBaselineLitres: Number(avoided[0]?.total ?? 0),
    decisionsByType,
    fieldCount: fieldIds.length,
    scoutCount: Number(scoutCountResult[0]?.cnt ?? 0),
    verificationPct,
  };
}

function emptyRollup(): Rollup {
  return {
    totalAvoidedLitres: 0,
    totalBaselineLitres: 0,
    decisionsByType: {},
    fieldCount: 0,
    scoutCount: 0,
    verificationPct: 0,
  };
}
