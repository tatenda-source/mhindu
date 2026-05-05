CREATE TYPE "public"."application_mode" AS ENUM('spot', 'blanket', 'release', 'preventive');--> statement-breakpoint
CREATE TYPE "public"."baseline_review_status" AS ENUM('farmer_reported', 'officer_verified', 'regional_median');--> statement-breakpoint
CREATE TYPE "public"."language" AS ENUM('en', 'sn', 'sw');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('farmer', 'officer', 'coop');--> statement-breakpoint
CREATE TYPE "public"."scout_status" AS ENUM('pending', 'processing', 'done', 'error');--> statement-breakpoint
CREATE TYPE "public"."treatment_type" AS ENUM('no_action', 'cultural', 'biological', 'mechanical', 'chemical');--> statement-breakpoint
CREATE TABLE "biocontrol_releases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"treatment_id" uuid NOT NULL,
	"agent_id" text NOT NULL,
	"qty" numeric(10, 2),
	"released_at" timestamp with time zone NOT NULL,
	"source_supplier" text,
	"batch_id" text,
	"viability_expires_at" timestamp with time zone,
	"field_temp_at_release_c" numeric(5, 2)
);
--> statement-breakpoint
CREATE TABLE "decision_logs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"scout_id" uuid NOT NULL,
	"decided_at" timestamp with time zone NOT NULL,
	"engine_version" text NOT NULL,
	"inputs" jsonb NOT NULL,
	"rule_fired" text NOT NULL,
	"options_considered" jsonb NOT NULL,
	"chosen" jsonb NOT NULL,
	"pesticide_avoided_litres" numeric(10, 3) NOT NULL,
	"superseded_by" uuid
);
--> statement-breakpoint
CREATE TABLE "fields" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"org_id" uuid,
	"name" text NOT NULL,
	"crop" text NOT NULL,
	"planted_at" timestamp with time zone,
	"growth_stage" text,
	"area_ha" numeric(10, 4),
	"geom_lat" numeric(10, 7),
	"geom_lng" numeric(10, 7),
	"baseline_calendar_spray_litres_per_ha" numeric(10, 3) DEFAULT '0' NOT NULL,
	"baseline_review_status" "baseline_review_status" DEFAULT 'farmer_reported' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "org_members" (
	"org_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" text DEFAULT 'member' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orgs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"region" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"field_id" uuid NOT NULL,
	"user_id" uuid,
	"taken_at" timestamp with time zone NOT NULL,
	"image_url" text,
	"gps_lat" numeric(10, 7),
	"gps_lng" numeric(10, 7),
	"detection" jsonb,
	"status" "scout_status" DEFAULT 'done' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "treatments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"field_id" uuid NOT NULL,
	"scout_id" uuid,
	"decided_at" timestamp with time zone NOT NULL,
	"applied_at" timestamp with time zone,
	"type" "treatment_type" NOT NULL,
	"agent_id" text,
	"rate" numeric(10, 4),
	"unit" text,
	"application_mode" "application_mode" NOT NULL,
	"pesticide_avoided_litres" numeric(10, 3) NOT NULL,
	"decision_log_id" uuid,
	"outcome_observed_at" timestamp with time zone,
	"outcome_severity_after" numeric(4, 3),
	"verification_tier" integer DEFAULT 1 NOT NULL,
	"verified_by" uuid,
	"verified_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role" "user_role" DEFAULT 'farmer' NOT NULL,
	"phone" text,
	"name" text,
	"language" "language" DEFAULT 'en' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "biocontrol_releases" ADD CONSTRAINT "biocontrol_releases_treatment_id_treatments_id_fk" FOREIGN KEY ("treatment_id") REFERENCES "public"."treatments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decision_logs" ADD CONSTRAINT "decision_logs_scout_id_scouts_id_fk" FOREIGN KEY ("scout_id") REFERENCES "public"."scouts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fields" ADD CONSTRAINT "fields_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fields" ADD CONSTRAINT "fields_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_members" ADD CONSTRAINT "org_members_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_members" ADD CONSTRAINT "org_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scouts" ADD CONSTRAINT "scouts_field_id_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."fields"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scouts" ADD CONSTRAINT "scouts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "treatments" ADD CONSTRAINT "treatments_field_id_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."fields"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "treatments" ADD CONSTRAINT "treatments_scout_id_scouts_id_fk" FOREIGN KEY ("scout_id") REFERENCES "public"."scouts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "treatments" ADD CONSTRAINT "treatments_decision_log_id_decision_logs_id_fk" FOREIGN KEY ("decision_log_id") REFERENCES "public"."decision_logs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "treatments" ADD CONSTRAINT "treatments_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "decision_logs_scout_id_idx" ON "decision_logs" USING btree ("scout_id");--> statement-breakpoint
CREATE INDEX "fields_owner_id_idx" ON "fields" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "scouts_field_id_idx" ON "scouts" USING btree ("field_id");--> statement-breakpoint
CREATE INDEX "scouts_taken_at_idx" ON "scouts" USING btree ("taken_at");--> statement-breakpoint
CREATE INDEX "treatments_field_id_idx" ON "treatments" USING btree ("field_id");