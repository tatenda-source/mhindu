export type AgentType =
  | "parasitoid"
  | "predator"
  | "microbial_bacterial"
  | "microbial_fungal"
  | "microbial_viral"
  | "nematode";

export type RateBasis =
  | "release_count_per_ha"
  | "kg_per_ha"
  | "L_per_ha"
  | "g_per_ha"
  | "per_m2_release_count";

export type ReleaseMethod = "broadcast" | "card" | "sachet" | "spray" | "drone_pellet";

export type TimeOfDay = "dawn" | "dusk" | "early_morning" | "late_afternoon" | "any";

export type TargetPestEntry = {
  pest_id: string;
  target_stage: string;
  rate: number;
  rate_basis: RateBasis;
  expected_efficacy_pct: [number, number];
  source_url: string;
  /** Days from scout detection until this stage's next window opens; used by schedule.ts */
  next_stage_window_days?: number;
};

export type SupplierRef = {
  supplier_id: string;
  sku?: string;
  lead_time_days_min: number;
  lead_time_days_max: number;
  coverage_regions?: string[];
  moq?: string;
};

export type ChemicalIncompatibilities = {
  pyrethroids?: number;
  organophosphates?: number;
  neonicotinoids?: number;
  systemic_fungicides?: number;
  bt_or_other_microbials?: number;
};

export type BiocontrolAgent = {
  agent_id: string;
  binomial: string;
  common_name: string;
  type: AgentType;
  target_pests: TargetPestEntry[];
  viability: {
    shelf_life_days: number;
    storage_temp_c_min: number | null;
    storage_temp_c_max: number | null;
    cold_chain_required: boolean;
  };
  release_method: ReleaseMethod;
  release_time_of_day: TimeOfDay;
  field_conditions: {
    no_rain_hours_before?: number;
    no_rain_hours_after?: number;
    leaf_moisture_required: boolean;
    uv_sensitive: boolean;
  };
  incompatibilities: {
    recent_chemicals_days: ChemicalIncompatibilities;
  };
  suppliers: SupplierRef[];
  notes: string;
};

export const agents: Record<string, BiocontrolAgent> = {
  telenomus_remus: {
    agent_id: "telenomus_remus",
    binomial: "Telenomus remus",
    common_name: "FAW egg parasitoid",
    type: "parasitoid",
    target_pests: [
      {
        pest_id: "spodoptera_frugiperda",
        target_stage: "egg",
        rate: 50000,
        rate_basis: "release_count_per_ha",
        expected_efficacy_pct: [65, 90],
        source_url: "https://doi.org/10.1007/s10340-019-01166-w",
        next_stage_window_days: 7,
      },
    ],
    viability: {
      shelf_life_days: 3,
      storage_temp_c_min: 12,
      storage_temp_c_max: 15,
      cold_chain_required: true,
    },
    release_method: "card",
    release_time_of_day: "early_morning",
    field_conditions: {
      no_rain_hours_before: 12,
      no_rain_hours_after: 24,
      leaf_moisture_required: false,
      uv_sensitive: true,
    },
    incompatibilities: {
      recent_chemicals_days: {
        pyrethroids: 21,
        organophosphates: 14,
        neonicotinoids: 14,
      },
    },
    suppliers: [
      {
        supplier_id: "real_ipm_kenya",
        lead_time_days_min: 3,
        lead_time_days_max: 5,
        coverage_regions: ["kenya", "tanzania", "uganda", "rwanda", "malawi", "zimbabwe"],
      },
      {
        supplier_id: "sustainable_agriculture_tanzania",
        lead_time_days_min: 5,
        lead_time_days_max: 7,
      },
      {
        supplier_id: "koppert",
        lead_time_days_min: 5,
        lead_time_days_max: 10,
      },
    ],
    notes:
      "Must target the EGG stage. L1 larvae scouted implies eggs were laid 3-5 days ago; next oviposition wave ~7-10 days out. Release timed to that wave, not current larval cohort.",
  },

  trichogramma_chilonis: {
    agent_id: "trichogramma_chilonis",
    binomial: "Trichogramma chilonis",
    common_name: "Stem borer / bollworm egg parasitoid",
    type: "parasitoid",
    target_pests: [
      {
        pest_id: "chilo_partellus",
        target_stage: "egg",
        rate: 100000,
        rate_basis: "release_count_per_ha",
        expected_efficacy_pct: [60, 80],
        source_url: "https://www.icipe.org/research/push-pull",
        next_stage_window_days: 7,
      },
      {
        pest_id: "helicoverpa_armigera",
        target_stage: "egg",
        rate: 100000,
        rate_basis: "release_count_per_ha",
        expected_efficacy_pct: [50, 75],
        source_url: "https://doi.org/10.1016/j.biocontrol.2015.06.004",
        next_stage_window_days: 7,
      },
    ],
    viability: {
      shelf_life_days: 2,
      storage_temp_c_min: 12,
      storage_temp_c_max: 15,
      cold_chain_required: true,
    },
    release_method: "card",
    release_time_of_day: "early_morning",
    field_conditions: {
      no_rain_hours_before: 6,
      no_rain_hours_after: 12,
      leaf_moisture_required: false,
      uv_sensitive: true,
    },
    incompatibilities: {
      recent_chemicals_days: {
        pyrethroids: 21,
        organophosphates: 14,
        neonicotinoids: 14,
      },
    },
    suppliers: [
      {
        supplier_id: "real_ipm_kenya",
        lead_time_days_min: 3,
        lead_time_days_max: 5,
      },
      {
        supplier_id: "koppert",
        lead_time_days_min: 5,
        lead_time_days_max: 10,
      },
      {
        supplier_id: "agrilife_bcrl",
        lead_time_days_min: 10,
        lead_time_days_max: 21,
      },
    ],
    notes:
      "Multiple releases (2-3 weekly) outperform single release. Card pinning at canopy mid-height, one card per ~25 m2. Fragile — 24-48h ambient tolerance only.",
  },

  bt_aizawai: {
    agent_id: "bt_aizawai",
    binomial: "Bacillus thuringiensis subsp. aizawai",
    common_name: "Bt aizawai",
    type: "microbial_bacterial",
    target_pests: [
      {
        pest_id: "spodoptera_frugiperda",
        target_stage: "larva_L1_L2",
        rate: 1.5,
        rate_basis: "kg_per_ha",
        expected_efficacy_pct: [70, 85],
        source_url: "https://doi.org/10.1002/ps.5220",
      },
      {
        pest_id: "tuta_absoluta",
        target_stage: "larva_L1_L2",
        rate: 1.0,
        rate_basis: "kg_per_ha",
        expected_efficacy_pct: [65, 80],
        source_url: "https://doi.org/10.1016/j.cropro.2019.104966",
      },
    ],
    viability: {
      shelf_life_days: 730,
      storage_temp_c_min: null,
      storage_temp_c_max: 30,
      cold_chain_required: false,
    },
    release_method: "spray",
    release_time_of_day: "dusk",
    field_conditions: {
      no_rain_hours_after: 6,
      leaf_moisture_required: false,
      uv_sensitive: true,
    },
    incompatibilities: {
      recent_chemicals_days: {
        pyrethroids: 7,
      },
    },
    suppliers: [
      {
        supplier_id: "real_ipm_kenya",
        lead_time_days_min: 3,
        lead_time_days_max: 5,
      },
      {
        supplier_id: "andermatt",
        lead_time_days_min: 7,
        lead_time_days_max: 14,
      },
      {
        supplier_id: "agrilife_bcrl",
        lead_time_days_min: 10,
        lead_time_days_max: 21,
      },
    ],
    notes:
      "Stops working past L3 — efficacy window is narrow. Spray late afternoon / dusk to minimise UV degradation of delta-endotoxins. Compatible with most natural enemies.",
  },

  npv_spodoptera: {
    agent_id: "npv_spodoptera",
    binomial: "Spodoptera frugiperda multiple nucleopolyhedrovirus (SfMNPV)",
    common_name: "FAW NPV",
    type: "microbial_viral",
    target_pests: [
      {
        pest_id: "spodoptera_frugiperda",
        target_stage: "larva_L2_L3",
        rate: 250,
        rate_basis: "g_per_ha",
        expected_efficacy_pct: [70, 85],
        source_url: "https://doi.org/10.1007/s10340-020-01210-0",
      },
    ],
    viability: {
      shelf_life_days: 365,
      storage_temp_c_min: 4,
      storage_temp_c_max: 8,
      cold_chain_required: true,
    },
    release_method: "spray",
    release_time_of_day: "dusk",
    field_conditions: {
      no_rain_hours_after: 6,
      leaf_moisture_required: false,
      uv_sensitive: true,
    },
    incompatibilities: {
      recent_chemicals_days: {
        pyrethroids: 14,
        organophosphates: 7,
      },
    },
    suppliers: [
      {
        supplier_id: "andermatt",
        lead_time_days_min: 7,
        lead_time_days_max: 14,
      },
      {
        supplier_id: "real_ipm_kenya",
        lead_time_days_min: 3,
        lead_time_days_max: 7,
      },
    ],
    notes:
      "Highly host-specific. No effect on beneficials or vertebrates. Slow kill 3-7 days post-ingestion — communicate this expectation to the farmer to avoid premature re-spray.",
  },

  metarhizium_anisopliae: {
    agent_id: "metarhizium_anisopliae",
    binomial: "Metarhizium anisopliae",
    common_name: "Green muscardine fungus",
    type: "microbial_fungal",
    target_pests: [
      {
        pest_id: "helicoverpa_armigera",
        target_stage: "larva_any",
        rate: 2.5,
        rate_basis: "kg_per_ha",
        expected_efficacy_pct: [55, 75],
        source_url: "https://doi.org/10.1017/S0007485316001140",
      },
      {
        pest_id: "bemisia_tabaci",
        target_stage: "nymph",
        rate: 2.5,
        rate_basis: "kg_per_ha",
        expected_efficacy_pct: [50, 70],
        source_url: "https://doi.org/10.1017/S0007485316001140",
      },
    ],
    viability: {
      shelf_life_days: 365,
      storage_temp_c_min: null,
      storage_temp_c_max: 25,
      cold_chain_required: false,
    },
    release_method: "spray",
    release_time_of_day: "dusk",
    field_conditions: {
      no_rain_hours_after: 6,
      leaf_moisture_required: true,
      uv_sensitive: true,
    },
    incompatibilities: {
      recent_chemicals_days: {
        systemic_fungicides: 21,
        pyrethroids: 7,
      },
    },
    suppliers: [
      {
        supplier_id: "real_ipm_kenya",
        lead_time_days_min: 3,
        lead_time_days_max: 5,
      },
      {
        supplier_id: "koppert",
        lead_time_days_min: 5,
        lead_time_days_max: 10,
      },
    ],
    notes:
      "Efficacy requires leaf wetness > 6h forecast. Apply when humidity is high. Incompatible with systemic fungicides — check recent spray history before scheduling.",
  },

  beauveria_bassiana: {
    agent_id: "beauveria_bassiana",
    binomial: "Beauveria bassiana",
    common_name: "White muscardine fungus",
    type: "microbial_fungal",
    target_pests: [
      {
        pest_id: "spodoptera_frugiperda",
        target_stage: "larva_any",
        rate: 2.0,
        rate_basis: "kg_per_ha",
        expected_efficacy_pct: [50, 70],
        source_url: "https://doi.org/10.1007/s10340-021-01334-3",
      },
      {
        pest_id: "bemisia_tabaci",
        target_stage: "nymph",
        rate: 2.0,
        rate_basis: "kg_per_ha",
        expected_efficacy_pct: [55, 75],
        source_url: "https://doi.org/10.1007/s10340-021-01334-3",
      },
      {
        pest_id: "tetranychus_urticae",
        target_stage: "nymph",
        rate: 2.0,
        rate_basis: "kg_per_ha",
        expected_efficacy_pct: [45, 65],
        source_url: "https://doi.org/10.1007/s10340-021-01334-3",
      },
    ],
    viability: {
      shelf_life_days: 365,
      storage_temp_c_min: null,
      storage_temp_c_max: 25,
      cold_chain_required: false,
    },
    release_method: "spray",
    release_time_of_day: "dusk",
    field_conditions: {
      no_rain_hours_after: 6,
      leaf_moisture_required: true,
      uv_sensitive: true,
    },
    incompatibilities: {
      recent_chemicals_days: {
        systemic_fungicides: 21,
        pyrethroids: 7,
      },
    },
    suppliers: [
      {
        supplier_id: "real_ipm_kenya",
        lead_time_days_min: 3,
        lead_time_days_max: 5,
      },
      {
        supplier_id: "koppert",
        lead_time_days_min: 5,
        lead_time_days_max: 10,
      },
    ],
    notes:
      "Broad-spectrum contact fungal — useful when pest mix is unknown. Requires high humidity for germination. Avoid applying within 21 days of any systemic fungicide.",
  },

  phytoseiulus_persimilis: {
    agent_id: "phytoseiulus_persimilis",
    binomial: "Phytoseiulus persimilis",
    common_name: "Red spider mite predator",
    type: "predator",
    target_pests: [
      {
        pest_id: "tetranychus_urticae",
        target_stage: "any",
        rate: 20,
        rate_basis: "per_m2_release_count",
        expected_efficacy_pct: [80, 95],
        source_url: "https://doi.org/10.1007/s10340-005-0096-y",
      },
    ],
    viability: {
      shelf_life_days: 2,
      storage_temp_c_min: 8,
      storage_temp_c_max: 15,
      cold_chain_required: true,
    },
    release_method: "sachet",
    release_time_of_day: "any",
    field_conditions: {
      leaf_moisture_required: false,
      uv_sensitive: false,
    },
    incompatibilities: {
      recent_chemicals_days: {
        pyrethroids: 21,
        organophosphates: 14,
        neonicotinoids: 14,
        systemic_fungicides: 7,
      },
    },
    suppliers: [
      {
        supplier_id: "koppert",
        lead_time_days_min: 5,
        lead_time_days_max: 10,
      },
      {
        supplier_id: "real_ipm_kenya",
        lead_time_days_min: 3,
        lead_time_days_max: 5,
      },
    ],
    notes:
      "Most fragile agent in the catalog — shelf life 2 days, cold-chain mandatory, dispatch to release within 48h. Order only when scout-confirmed T. urticae infestation is present. Predator starves without prey.",
  },
};

export function getAgent(agentId: string): BiocontrolAgent | undefined {
  return agents[agentId];
}

export function agentsForPest(pestId: string, stage?: string): BiocontrolAgent[] {
  return Object.values(agents).filter((agent) =>
    agent.target_pests.some(
      (tp) =>
        tp.pest_id === pestId &&
        (stage === undefined || tp.target_stage === stage),
    ),
  );
}
