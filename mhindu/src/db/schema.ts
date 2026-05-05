import {
  pgTable,
  uuid,
  text,
  pgEnum,
  timestamp,
  numeric,
  jsonb,
  integer,
  index,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("user_role", ["farmer", "officer", "coop"]);
export const languageEnum = pgEnum("language", ["en", "sn", "sw"]);
export const scoutStatusEnum = pgEnum("scout_status", [
  "pending",
  "processing",
  "done",
  "error",
]);
export const treatmentTypeEnum = pgEnum("treatment_type", [
  "no_action",
  "cultural",
  "biological",
  "mechanical",
  "chemical",
]);
export const applicationModeEnum = pgEnum("application_mode", [
  "spot",
  "blanket",
  "release",
  "preventive",
]);
export const baselineReviewStatusEnum = pgEnum("baseline_review_status", [
  "farmer_reported",
  "officer_verified",
  "regional_median",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  role: roleEnum("role").notNull().default("farmer"),
  phone: text("phone"),
  name: text("name"),
  language: languageEnum("language").notNull().default("en"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const orgs = pgTable("orgs", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  region: text("region").notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const orgMembers = pgTable("org_members", {
  org_id: uuid("org_id")
    .notNull()
    .references(() => orgs.id),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.id),
  role: text("role").notNull().default("member"),
});

export const fields = pgTable(
  "fields",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    owner_id: uuid("owner_id")
      .notNull()
      .references(() => users.id),
    org_id: uuid("org_id").references(() => orgs.id),
    name: text("name").notNull(),
    crop: text("crop").notNull(),
    planted_at: timestamp("planted_at", { withTimezone: true }),
    growth_stage: text("growth_stage"),
    area_ha: numeric("area_ha", { precision: 10, scale: 4 }),
    geom_lat: numeric("geom_lat", { precision: 10, scale: 7 }),
    geom_lng: numeric("geom_lng", { precision: 10, scale: 7 }),
    baseline_calendar_spray_litres_per_ha: numeric(
      "baseline_calendar_spray_litres_per_ha",
      { precision: 10, scale: 3 },
    ).notNull().default("0"),
    baseline_review_status: baselineReviewStatusEnum("baseline_review_status")
      .notNull()
      .default("farmer_reported"),
    created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    // primary access pattern: fetch all fields for a user
    index("fields_owner_id_idx").on(t.owner_id),
  ],
);

export const scouts = pgTable(
  "scouts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    field_id: uuid("field_id")
      .notNull()
      .references(() => fields.id),
    user_id: uuid("user_id").references(() => users.id),
    taken_at: timestamp("taken_at", { withTimezone: true }).notNull(),
    image_url: text("image_url"),
    gps_lat: numeric("gps_lat", { precision: 10, scale: 7 }),
    gps_lng: numeric("gps_lng", { precision: 10, scale: 7 }),
    // full Detection blob from vision pipeline
    detection: jsonb("detection"),
    status: scoutStatusEnum("status").notNull().default("done"),
    created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    // pressure dashboard: scouts per field, time-ordered
    index("scouts_field_id_idx").on(t.field_id),
    // nightly aggregation window scans
    index("scouts_taken_at_idx").on(t.taken_at),
  ],
);

// Immutable audit ledger. Rows are never updated.
// If a decision is superseded, write a new row linking via superseded_by.
export const decisionLogs = pgTable(
  "decision_logs",
  {
    id: uuid("id").primaryKey(),
    scout_id: uuid("scout_id")
      .notNull()
      .references(() => scouts.id),
    decided_at: timestamp("decided_at", { withTimezone: true }).notNull(),
    engine_version: text("engine_version").notNull(),
    // Detection + Context with PII stripped (no farmer name, only field_id)
    inputs: jsonb("inputs").notNull(),
    rule_fired: text("rule_fired").notNull(),
    options_considered: jsonb("options_considered").notNull(),
    chosen: jsonb("chosen").notNull(),
    pesticide_avoided_litres: numeric("pesticide_avoided_litres", {
      precision: 10,
      scale: 3,
    }).notNull(),
    superseded_by: uuid("superseded_by"),
  },
  (t) => [
    // fetch decision for a given scout
    index("decision_logs_scout_id_idx").on(t.scout_id),
  ],
);

export const treatments = pgTable(
  "treatments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    field_id: uuid("field_id")
      .notNull()
      .references(() => fields.id),
    scout_id: uuid("scout_id").references(() => scouts.id),
    decided_at: timestamp("decided_at", { withTimezone: true }).notNull(),
    applied_at: timestamp("applied_at", { withTimezone: true }),
    type: treatmentTypeEnum("type").notNull(),
    agent_id: text("agent_id"),
    rate: numeric("rate", { precision: 10, scale: 4 }),
    unit: text("unit"),
    application_mode: applicationModeEnum("application_mode").notNull(),
    pesticide_avoided_litres: numeric("pesticide_avoided_litres", {
      precision: 10,
      scale: 3,
    }).notNull(),
    decision_log_id: uuid("decision_log_id").references(() => decisionLogs.id),
    outcome_observed_at: timestamp("outcome_observed_at", { withTimezone: true }),
    outcome_severity_after: numeric("outcome_severity_after", {
      precision: 4,
      scale: 3,
    }),
    verification_tier: integer("verification_tier").notNull().default(1),
    verified_by: uuid("verified_by").references(() => users.id),
    verified_at: timestamp("verified_at", { withTimezone: true }),
  },
  (t) => [
    // pressure rollup: all treatments for a field
    index("treatments_field_id_idx").on(t.field_id),
  ],
);

export const biocontrolReleases = pgTable("biocontrol_releases", {
  id: uuid("id").primaryKey().defaultRandom(),
  treatment_id: uuid("treatment_id")
    .notNull()
    .references(() => treatments.id),
  agent_id: text("agent_id").notNull(),
  qty: numeric("qty", { precision: 10, scale: 2 }),
  released_at: timestamp("released_at", { withTimezone: true }).notNull(),
  source_supplier: text("source_supplier"),
  batch_id: text("batch_id"),
  viability_expires_at: timestamp("viability_expires_at", { withTimezone: true }),
  field_temp_at_release_c: numeric("field_temp_at_release_c", {
    precision: 5,
    scale: 2,
  }),
});
