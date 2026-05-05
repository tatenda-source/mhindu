// Human-readable source of truth: pest-kb/<pest_id>.md
// This file mirrors frontmatter from each markdown entry as typed objects
// for synchronous access by the IPM engine. When a markdown entry changes,
// update the corresponding object here.

export interface LifecycleStage {
  stage: string;
  duration_days: string;
  damage_signature: string;
  target_for_biocontrol: string[];
}

export interface Threshold {
  metric: string;
  value_early_whorl?: number;
  value_late_whorl?: number;
  growth_stage_qualifier: string;
  source_url: string;
  source_note: string;
}

export interface Biocontrol {
  agent_id: string;
  type: string;
  target_stage: string;
  application_rate: string;
  expected_efficacy_pct: string;
  weather_constraints: string;
  incompatible_with: string[];
  smallholder_note?: string;
  source_url: string;
  source_note?: string;
}

export interface CulturalControl {
  name: string;
  description: string;
  quantitative_efficacy?: string;
  applicability: string;
  source_url: string;
  source_note?: string;
}

export interface MechanicalControl {
  name: string;
  description: string;
  applicability: string;
  source_url: string;
  source_note?: string;
}

export interface ChemicalLastResort {
  active_ingredient: string;
  irac_moa: number;
  rate: string;
  target_stage: string;
  notes: string;
  source_url: string;
  source_note?: string;
}

export interface AvoidActive {
  active_ingredient: string;
  irac_moa: string;
  reason: string;
  source_url: string;
}

export interface Citation {
  url: string;
  type: "factsheet" | "paper" | "protocol" | "extension_note";
  publisher: string;
  title: string;
  accessed: string;
}

export interface Confidence {
  threshold: "high" | "medium" | "low";
  biocontrol_rates: "high" | "medium" | "low";
  local_names: "high" | "medium" | "low";
}

export interface PestKbEntry {
  pest_id: string;
  binomial: string;
  common_name: string;
  local_names: Record<string, string>;
  type: "insect" | "disease" | "weed" | "nematode" | "virus";
  crops: string[];
  region: string;
  lifecycle: LifecycleStage[];
  threshold: Threshold;
  biocontrols: Biocontrol[];
  cultural: CulturalControl[];
  mechanical: MechanicalControl[];
  chemical_last_resort: ChemicalLastResort[];
  avoid_actives: AvoidActive[];
  citations: Citation[];
  confidence: Confidence;
  unverified_fields: string[];
  last_reviewed: string;
  reviewed_by: string;
}

const spodoptera_frugiperda: PestKbEntry = {
  pest_id: "spodoptera_frugiperda",
  binomial: "Spodoptera frugiperda",
  common_name: "Fall armyworm",
  local_names: {
    shona: "unverified",
    swahili: "viwavijeshi",
    chichewa: "unverified",
  },
  type: "insect",
  crops: ["maize", "sorghum", "rice", "sugarcane", "millet"],
  region: "pan-SSA (established since 2016)",
  lifecycle: [
    {
      stage: "egg",
      duration_days: "2-3",
      damage_signature:
        "Cream to pale-green egg masses of 100-200 eggs on leaf surfaces, covered with greyish scales. No feeding damage; parasitoid (Telenomus remus) intervention most effective here.",
      target_for_biocontrol: ["telenomus_remus"],
    },
    {
      stage: "larva_L1_L2",
      duration_days: "4-6",
      damage_signature:
        "Window-pane or pin-hole feeding on whorl leaves. Gregarious larvae; fine frass visible. Stage-specific window for Bt aizawai and Beauveria bassiana.",
      target_for_biocontrol: ["bt_aizawai", "bt_kurstaki", "beauveria_bassiana_strain_bbg111"],
    },
    {
      stage: "larva_L3_L6",
      duration_days: "8-12",
      damage_signature:
        "Ragged irregular holes in whorl leaves; coarse dark frass in the funnel (primary field diagnostic). Larvae bore into ears after V8. Sand+ash has negligible efficacy beyond L2.",
      target_for_biocontrol: ["bt_aizawai"],
    },
    {
      stage: "pupa",
      duration_days: "8-12",
      damage_signature:
        "No above-ground damage. Loose silken cocoon 2-5 cm deep in soil below the plant. Deep tillage after harvest reduces carry-over.",
      target_for_biocontrol: [],
    },
    {
      stage: "adult",
      duration_days: "7-21",
      damage_signature:
        "Moths do not feed on crops. Females lay up to 1,500 eggs; oviposition peaks at night on V2-V8 maize. Adults disperse up to 100 km per night.",
      target_for_biocontrol: [],
    },
  ],
  threshold: {
    metric: "infestation_pct_plants_with_larvae_or_damage",
    value_early_whorl: 11,
    value_late_whorl: 20,
    growth_stage_qualifier:
      "Early whorl (V2-V5): act if ≥11% plants show damage with live larvae. Late whorl (V6-V8): act if ≥20% of whorls show ragged damage with frass, or ≥40% of whorls damaged regardless of larval presence. Below-threshold: monitor every 3-4 days.",
    source_url: "https://www.plantwise.org/KnowledgeBank/pmdg/20177801315",
    source_note:
      "CABI Plantwise Knowledge Bank — Fall armyworm on maize (2017, updated 2023). Consistent with FAO Fall Armyworm Integrated Management Guide (FAO, 2018).",
  },
  biocontrols: [
    {
      agent_id: "telenomus_remus",
      type: "parasitoid_wasp",
      target_stage: "egg",
      application_rate:
        "50000 adults per ha per release; 3 releases at 2-week intervals",
      expected_efficacy_pct:
        "33-100 (variable; 72-100% in low-pressure seasons; 33% in high-pressure seasons — see confidence note)",
      weather_constraints:
        "Release early morning or late afternoon. Avoid release within 24 hours of rainfall. Wait ≥14 days after any broad-spectrum insecticide application.",
      incompatible_with: ["recent_pyrethroid_spray", "recent_neonicotinoid_spray"],
      smallholder_note:
        "Mass rearing requires local capacity; not yet widely available in Zimbabwe as of 2024. Real IPM Kenya produces Telenomus remus. Confirm supply chain before farmer-facing recommendation.",
      source_url: "https://doi.org/10.3390/insects12080665",
      source_note:
        "Accrombessi et al. (2021) Insects 12(8):665. Ghana field releases ~30,000/ha. Recommended rate 50,000/ha from Latin American programme data. Also: DOI:10.1186/s43170-021-00071-6.",
    },
    {
      agent_id: "bt_aizawai",
      type: "microbial_biopesticide",
      target_stage: "larva_L1_L2",
      application_rate:
        "1.0-1.5 kg/ha commercial WP formulation; apply into whorl at V3-V6; re-apply after 7 days if pressure persists",
      expected_efficacy_pct:
        "70-100 on L1-L2; efficacy drops sharply on L3+",
      weather_constraints:
        "Apply evening or early morning; UV degrades Cry proteins within 24-48 hours. Avoid application before expected rain. Bt aizawai preferred over kurstaki for Spodoptera spp.",
      incompatible_with: [],
      smallholder_note:
        "Suitable for backpack sprayer. Must confirm L1-L2 instar before application — ineffective on L3+.",
      source_url: "https://www.cabidigitallibrary.org/doi/abs/10.1079/cabicompendium.29810",
      source_note:
        "CABI Compendium: Spodoptera frugiperda. 1.0 kg/ha field applications achieved >90% larval mortality (L1-L2).",
    },
    {
      agent_id: "beauveria_bassiana_strain_bbg111",
      type: "entomopathogenic_fungus",
      target_stage: "larva_L1_L2",
      application_rate:
        "1×10⁸ conidia/mL suspension to whorl; ~2-3 kg/ha WP at label concentration",
      expected_efficacy_pct:
        "70-96 against L1-L2 in laboratory; field efficacy variable under high UV and dry conditions",
      weather_constraints:
        "Apply at >70% RH; fungal germination requires moisture. Evening application strongly recommended. Substantially reduced efficacy in dry/sunny conditions.",
      incompatible_with: ["fungicides"],
      smallholder_note:
        "Cold-chain and shelf-life requirements are limiting factors for remote smallholders.",
      source_url: "https://doi.org/10.3390/insects13010001",
      source_note:
        "Mweke et al. (2022) Agronomy 12:2704. Also: Archives of Microbiology (2023) DOI:10.1007/s00203-023-03669-8.",
    },
  ],
  cultural: [
    {
      name: "push_pull",
      description:
        "Intercrop maize with Desmodium intortum between rows; plant Brachiaria cv Mulato II as a border. Desmodium repels ovipositing FAW adults and attracts parasitoids; Brachiaria is a dead-end trap crop (2.5-6% larval survival vs 36% on maize). Climate-adapted push-pull reduces FAW by ~82% and increases yield 2.5×.",
      quantitative_efficacy:
        "82% reduction in FAW larvae per plant; 3.6-4.9× lower crop damage score; parasitism 9× higher in push-pull vs monocrop (18.7% vs 2.1%). Kenya 2019.",
      applicability:
        "Maize; East and Southern Africa; smallholder 0.5-5ha viable. Requires Desmodium seed availability (ICIPE supply chain). Plant companion crops at V2 alongside maize.",
      source_url: "https://doi.org/10.3389/fevo.2022.883020",
      source_note:
        "Mutyambai et al. (2022) Front. Ecol. Evol. DOI:10.3389/fevo.2022.883020. Also: Khan et al. (2021) DOI:10.1002/ps.6261.",
    },
    {
      name: "early_planting",
      description:
        "Plant at onset of rains to reach V8+ before peak adult flight pressure. Early-planted maize completes reproductive stages before heaviest infestation. Supplementary practice only; does not replace scouting.",
      applicability: "All maize-growing zones; smallholder viable; no additional cost.",
      source_url: "https://www.cabidigitallibrary.org/doi/abs/10.1079/cabicompendium.29810",
    },
    {
      name: "intercropping_legumes",
      description:
        "Intercropping with bean or cowpea provides 30-40% FAW infestation reduction through habitat diversification. Complementary practice; not a standalone replacement for push-pull or biocontrol.",
      applicability: "Maize-legume systems; smallholder; Zimbabwe common bean/cowpea rotations.",
      source_url: "https://doi.org/10.1002/ps.6261",
      source_note: "Khan et al. (2021) Pest Manag Sci 77(5):2350-2357.",
    },
  ],
  mechanical: [
    {
      name: "hand_egg_mass_removal",
      description:
        "Remove and destroy egg masses by hand during morning scouting. Effective pre-hatch or within 24 hours of hatching. One person can scout ~0.5 ha in 2-3 hours.",
      applicability: "Smallholder <1 ha; zero cost; viable V2-V6.",
      source_url: "https://www.cabidigitallibrary.org/doi/abs/10.1079/cabicompendium.29810",
    },
    {
      name: "sand_ash_whorl_application",
      description:
        "Apply dry sand or wood ash into whorl to desiccate small larvae. Traditional SSA practice. Effective only on L1-L2; no measurable effect on L3+. Use only as immediate response when no biopesticide available.",
      applicability: "Smallholder; zero cost; low efficacy ceiling; supplementary only.",
      source_url: "https://www.cabi.org/wp-content/uploads/ToT-manual.pdf",
      source_note: "CABI Community-Based FAW Monitoring ToT Manual.",
    },
  ],
  chemical_last_resort: [
    {
      active_ingredient: "emamectin_benzoate",
      irac_moa: 6,
      rate: "0.2 L/ha of 1.9 EC formulation (0.19 g a.i./L whorl spray)",
      target_stage: "larva_L1_L4",
      notes:
        "IRAC Group 6 (avermectin). Lower toxicity to adult parasitoid wasps than pyrethroids when spray residues are dry (24-48 hrs). Rotate MoA; do not use in consecutive seasons.",
      source_url: "https://pubmed.ncbi.nlm.nih.gov/37338689/",
    },
    {
      active_ingredient: "spinetoram",
      irac_moa: 5,
      rate: "100-150 mL/ha of 120 SC formulation (confirm local label)",
      target_stage: "larva_L1_L3",
      notes:
        "IRAC Group 5 (spinosyn). Very high FAW efficacy in Kenya; lowest resistance ratios across populations tested. Rotate with emamectin benzoate. Avoid tank-mixing with Telenomus remus release — spinosyns toxic to adult parasitoids.",
      source_url: "https://doi.org/10.1155/2022/8007998",
      source_note: "Babul Miah et al. (2022) Kenya insecticide susceptibility. MDPI Insects 12(8):665.",
    },
    {
      active_ingredient: "chlorantraniliprole",
      irac_moa: 28,
      rate: "300-500 mL/ha of 200 SC formulation at V2-V6",
      target_stage: "larva_L1_L4",
      notes:
        "IRAC Group 28 (diamide). High larval efficacy; some systemic uptake. Resistance not yet widespread in SSA (as of 2024) but detected in Americas — monitor. High cost may limit smallholder viability on staple maize.",
      source_url: "https://www.cabidigitallibrary.org/doi/abs/10.1079/cabicompendium.29810",
    },
  ],
  avoid_actives: [
    {
      active_ingredient: "lambda_cyhalothrin",
      irac_moa: "3A",
      reason:
        "Broad-spectrum pyrethroid; kills Telenomus remus, Cotesia spp., and other parasitoids. Widespread resistance in FAW across SSA. Do not use where push-pull or Telenomus releases are active.",
      source_url: "https://doi.org/10.1155/2022/8007998",
    },
    {
      active_ingredient: "deltamethrin",
      irac_moa: "3A",
      reason:
        "Same class as lambda-cyhalothrin. Resistance widespread. Destructive to natural enemy complex.",
      source_url: "https://doi.org/10.1155/2022/8007998",
    },
    {
      active_ingredient: "profenofos",
      irac_moa: "1B",
      reason:
        "Organophosphate; broad-spectrum, highly toxic to parasitoids and predators. Resistance documented. Not compatible with any biocontrol programme.",
      source_url: "https://www.cabidigitallibrary.org/doi/abs/10.1079/cabicompendium.29810",
    },
  ],
  citations: [
    {
      url: "https://www.cabidigitallibrary.org/doi/abs/10.1079/cabicompendium.29810",
      type: "factsheet",
      publisher: "CABI",
      title: "CABI Compendium: Spodoptera frugiperda (fall armyworm)",
      accessed: "2026-05-05",
    },
    {
      url: "https://www.fao.org/3/I8665EN/i8665en.pdf",
      type: "protocol",
      publisher: "FAO",
      title:
        "Integrated Management of the Fall Armyworm on Maize: A Guide for Farmer Field Schools in Africa (FAO, 2018)",
      accessed: "2026-05-05",
    },
    {
      url: "https://doi.org/10.3390/insects12080665",
      type: "paper",
      publisher: "MDPI Insects",
      title:
        "Accrombessi et al. (2021) Assessing the Potential of Inoculative Field Releases of Telenomus remus to Control Spodoptera frugiperda in Ghana. Insects 12(8):665.",
      accessed: "2026-05-05",
    },
    {
      url: "https://doi.org/10.1186/s43170-021-00071-6",
      type: "paper",
      publisher: "CABI Agriculture and Bioscience",
      title:
        "Sisay et al. (2021) The use of Telenomus remus in management of Spodoptera spp.: potential, challenges and major benefits. CABI Agric Bioscience 2:71.",
      accessed: "2026-05-05",
    },
    {
      url: "https://doi.org/10.3389/fevo.2022.883020",
      type: "paper",
      publisher: "Frontiers in Ecology and Evolution",
      title:
        "Mutyambai et al. (2022) Bioactive Volatiles From Push-Pull Companion Crops Repel Fall Armyworm and Attract Its Parasitoids. Front. Ecol. Evol. 10:883020.",
      accessed: "2026-05-05",
    },
    {
      url: "https://doi.org/10.1002/ps.6261",
      type: "paper",
      publisher: "Pest Management Science",
      title:
        "Khan et al. (2021) The role of Desmodium intortum, Brachiaria sp. and Phaseolus vulgaris in the management of Spodoptera frugiperda in maize cropping systems in Africa. Pest Manag Sci 77(5):2350-2357.",
      accessed: "2026-05-05",
    },
    {
      url: "https://doi.org/10.3390/insects11040228",
      type: "paper",
      publisher: "MDPI Insects",
      title:
        "Montezano et al. (2020) The Effect of Temperature on the Development of Spodoptera frugiperda. Insects 11(4):228.",
      accessed: "2026-05-05",
    },
    {
      url: "https://doi.org/10.1155/2022/8007998",
      type: "paper",
      publisher: "Wiley / Hindawi",
      title:
        "Babul Miah et al. (2022) Susceptibility Evaluation of Fall Armyworm Infesting Maize in Kenya against a Range of Insecticides.",
      accessed: "2026-05-05",
    },
    {
      url: "https://pubmed.ncbi.nlm.nih.gov/37338689/",
      type: "paper",
      publisher: "PubMed",
      title:
        "Sublethal effects of spinetoram and emamectin benzoate on key demographic parameters of fall armyworm (2023).",
      accessed: "2026-05-05",
    },
    {
      url: "https://doi.org/10.1007/s00203-023-03669-8",
      type: "paper",
      publisher: "Archives of Microbiology / Springer",
      title:
        "Virulence of Beauveria sp. and Metarhizium sp. fungi towards fall armyworm (2023).",
      accessed: "2026-05-05",
    },
    {
      url: "https://www.cabi.org/wp-content/uploads/ToT-manual.pdf",
      type: "extension_note",
      publisher: "CABI",
      title:
        "Community-Based Fall Armyworm (Spodoptera frugiperda) Monitoring — ToT Manual. CABI.",
      accessed: "2026-05-05",
    },
  ],
  confidence: {
    threshold: "high",
    biocontrol_rates: "medium",
    local_names: "low",
  },
  unverified_fields: [
    "local_names.shona",
    "local_names.chichewa",
    "biocontrols[0].expected_efficacy_pct",
    "biocontrols[2].application_rate",
  ],
  last_reviewed: "2026-05-05",
  reviewed_by: "agronomy-researcher",
};

export const pestKbFull: Record<string, PestKbEntry> = {
  spodoptera_frugiperda,
};

// ---------- Engine adapter ----------
// The IPM engine consumes a normalized PestKbMap (see lib/ipm/kb-types.ts).
// Adapt the rich frontmatter-mirror form into the engine's expected shape.

import type { PestKbEntry as EnginePestKbEntry, PestKbMap, PestKbOption } from "@/lib/ipm/kb-types";

const STAGE_FROM_TARGET: Record<string, "egg" | "larva_L1_L2" | "larva_L3_L6" | "pupa" | "adult"> = {
  egg: "egg",
  larva_L1_L2: "larva_L1_L2",
  larva_L3_L6: "larva_L3_L6",
  pupa: "pupa",
  adult: "adult",
};

function parseEfficacyRange(s: string): [number, number] | null {
  const m = s.match(/(\d+)\s*-\s*(\d+)/);
  if (!m) return null;
  return [Number(m[1]), Number(m[2])];
}

function adaptEntry(full: PestKbEntry): EnginePestKbEntry {
  const opts: PestKbOption[] = [];

  for (const b of full.biocontrols) {
    const stage = STAGE_FROM_TARGET[b.target_stage] ?? null;
    opts.push({
      type: "biological",
      agent_id: b.agent_id,
      product_name: b.agent_id,
      rate: null,
      rate_unit: null,
      target_stage: stage,
      application_mode: "release",
      rationale: `${b.type} targeting ${b.target_stage} of ${full.common_name}. ${b.smallholder_note ?? ""}`.trim(),
      irac_moa: null,
      source_url: b.source_url,
      expected_efficacy_pct: parseEfficacyRange(b.expected_efficacy_pct),
      supplier_id: b.agent_id === "telenomus_remus" ? "real_ipm_kenya" : "real_ipm_kenya",
      supplier_lead_time_days: null,
      ipm_rank: "biological",
    });
  }
  for (const c of full.cultural) {
    opts.push({
      type: "cultural",
      agent_id: null,
      product_name: c.name,
      rate: null,
      rate_unit: null,
      target_stage: null,
      application_mode: "preventive",
      rationale: c.description,
      irac_moa: null,
      source_url: c.source_url,
      expected_efficacy_pct: null,
      supplier_id: null,
      supplier_lead_time_days: null,
      ipm_rank: "cultural",
    });
  }
  for (const m of full.mechanical) {
    opts.push({
      type: "mechanical",
      agent_id: null,
      product_name: m.name,
      rate: null,
      rate_unit: null,
      target_stage: null,
      application_mode: "spot",
      rationale: m.description,
      irac_moa: null,
      source_url: m.source_url,
      expected_efficacy_pct: null,
      supplier_id: null,
      supplier_lead_time_days: null,
      ipm_rank: "mechanical",
    });
  }
  for (const ch of full.chemical_last_resort) {
    opts.push({
      type: "chemical",
      agent_id: ch.active_ingredient,
      product_name: ch.active_ingredient,
      rate: null,
      rate_unit: null,
      target_stage: STAGE_FROM_TARGET[ch.target_stage] ?? null,
      application_mode: "spot",
      rationale: ch.notes,
      irac_moa: String(ch.irac_moa),
      source_url: ch.source_url,
      expected_efficacy_pct: null,
      supplier_id: null,
      supplier_lead_time_days: null,
      ipm_rank: "chemical",
      broad_spectrum: ["1A", "1B", "3A", "3B", "4A", "5"].includes(String(ch.irac_moa)),
    });
  }

  // Convert dual-whorl thresholds to per-stage normalized 0-1 severity targets.
  const thresholds: EnginePestKbEntry["thresholds"] = {};
  if (full.threshold.value_early_whorl != null) {
    thresholds.larva_L1_L2 = full.threshold.value_early_whorl / 100;
    thresholds.egg = full.threshold.value_early_whorl / 100;
  }
  if (full.threshold.value_late_whorl != null) {
    thresholds.larva_L3_L6 = full.threshold.value_late_whorl / 100;
  }

  return {
    id: full.pest_id,
    common_name: full.common_name,
    scientific_name: full.binomial,
    thresholds,
    options: opts,
    notes: [`Source: ${full.threshold.source_note}`],
  };
}

export const pestKb: PestKbMap = Object.fromEntries(
  Object.entries(pestKbFull).map(([k, v]) => [k, adaptEntry(v)]),
);
