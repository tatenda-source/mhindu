export type GoldenFixture = {
  name: string;
  image_url: string;
  crop: string;
  growth_stage_observed: string;
  region: string;
  expected_pest_id: string | null;
  expected_type: "pest" | "disease" | "beneficial" | "abiotic" | "unknown";
  expected_min_confidence: number;
};

export const goldenSet: GoldenFixture[] = [
  {
    name: "faw-whorl-clear",
    image_url: "placeholder://faw-clear",
    crop: "maize",
    growth_stage_observed: "V6",
    region: "zimbabwe",
    expected_pest_id: "spodoptera_frugiperda",
    expected_type: "pest",
    expected_min_confidence: 0.8,
  },
  {
    name: "grey-leaf-spot-mid-canopy",
    image_url: "placeholder://gls-mid-canopy",
    crop: "maize",
    growth_stage_observed: "V12",
    region: "zimbabwe",
    expected_pest_id: "disease_grey_leaf_spot",
    expected_type: "disease",
    expected_min_confidence: 0.75,
  },
  {
    name: "coccinellid-on-aphid-colony",
    image_url: "placeholder://coccinellid-beneficial",
    crop: "maize",
    growth_stage_observed: "VT",
    region: "zimbabwe",
    expected_pest_id: "beneficial_coccinellid",
    expected_type: "beneficial",
    expected_min_confidence: 0.7,
  },
];
