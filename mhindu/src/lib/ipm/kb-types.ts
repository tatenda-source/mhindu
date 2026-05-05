import type { Stage, TreatmentOption } from "./schemas";

export type IpmRank = "no_action" | "cultural" | "biological" | "mechanical" | "chemical";

export type PestKbOption = Omit<TreatmentOption, "release_or_apply_date" | "rationale"> & {
  rationale: string;
  ipm_rank: IpmRank;
  broad_spectrum?: boolean;
  weather_constraints?: {
    max_wind_m_s?: number;
    max_rain_prob_24h?: number;
    min_temp_c?: number;
    max_temp_c?: number;
  };
  required_beneficial_pressure_lt?: number;
};

export type PestKbThresholds = Partial<Record<Stage, number>>;

export type PestKbEntry = {
  id: string;
  common_name: string;
  scientific_name: string;
  thresholds: PestKbThresholds;
  options: PestKbOption[];
  notes?: string[];
};

export type PestKbMap = Record<string, PestKbEntry>;
