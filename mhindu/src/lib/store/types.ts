import type { Detection, TreatmentPlan } from "@/lib/ipm/schemas";

export type Crop = "maize" | "tomato" | "cotton" | "sorghum" | "soybean";

export interface Field {
  id: string;
  name: string;
  crop: Crop;
  area_ha: number;
  growth_stage: string;
  planted_at: string;
  baseline_calendar_spray_litres_per_ha: number;
  geom_lat: number | null;
  geom_lng: number | null;
  created_at: string;
}

export interface Scout {
  id: string;
  field_id: string;
  taken_at: string;
  image_blob: Blob | null;
  image_data_url: string | null;
  gps_lat: number | null;
  gps_lng: number | null;
  status: "pending" | "processing" | "done" | "error";
  error_message?: string;
  detection: Detection | null;
  plan: TreatmentPlan | null;
  outcome_observed_at: string | null;
  outcome_severity_after: number | null;
}

export interface AppPrefs {
  id: "singleton";
  current_field_id: string | null;
  region: string;
  language: string;
}
