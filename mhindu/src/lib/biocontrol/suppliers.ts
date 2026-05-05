export type Supplier = {
  id: string;
  name: string;
  hq_country: string;
  coverage_regions: string[];
  lead_time_days_min: number;
  lead_time_days_max: number;
  moq_description: string;
  cold_chain_available: boolean;
  certifications: string[];
  contact_notes: string;
  whatsapp_number?: string;
};

export const suppliers: Record<string, Supplier> = {
  real_ipm_kenya: {
    id: "real_ipm_kenya",
    name: "Real IPM Kenya",
    hq_country: "Kenya",
    coverage_regions: ["kenya", "tanzania", "uganda", "rwanda", "malawi", "zimbabwe", "zambia"],
    lead_time_days_min: 3,
    lead_time_days_max: 7,
    moq_description: "1 ha equivalent unit; cooperative orders accepted",
    cold_chain_available: true,
    certifications: ["KEPHIS", "ISO 9001"],
    contact_notes: "Primary anchor supplier for East + Southern Africa distribution",
    // PLACEHOLDER — confirm in Phase 0 partnership conversations
    whatsapp_number: "+254 700 000 000",
  },

  koppert: {
    id: "koppert",
    name: "Koppert Biological Systems",
    hq_country: "Netherlands",
    coverage_regions: ["global", "east_africa", "southern_africa"],
    lead_time_days_min: 5,
    lead_time_days_max: 10,
    moq_description: "Commercial scale; minimum order varies by product",
    cold_chain_available: true,
    certifications: ["ISO 14001", "MPS-Socially Qualified"],
    contact_notes: "Established cold-chain to EA; preferred for Phytoseiulus and Amblyseius",
  },

  andermatt: {
    id: "andermatt",
    name: "Andermatt Biocontrol",
    hq_country: "Switzerland",
    coverage_regions: ["global", "africa_partner_network"],
    lead_time_days_min: 7,
    lead_time_days_max: 14,
    moq_description: "Consult distributor; typically 1 kg or 250 g sachets",
    cold_chain_available: true,
    certifications: ["OMRI Listed", "EU Organic"],
    contact_notes: "Specialty in NPV and granuloviruses; source via Africa partner network",
  },

  agrilife_bcrl: {
    id: "agrilife_bcrl",
    name: "AgriLife / BCRL",
    hq_country: "India",
    coverage_regions: ["india", "export_to_africa"],
    lead_time_days_min: 10,
    lead_time_days_max: 21,
    moq_description: "Bulk export quantities; coordinate via freight forwarder",
    cold_chain_available: false,
    certifications: ["CIB India"],
    contact_notes: "Lower cost Trichogramma, NPV, Bt; longer lead times due to export logistics",
  },

  sustainable_agriculture_tanzania: {
    id: "sustainable_agriculture_tanzania",
    name: "Sustainable Agriculture Tanzania",
    hq_country: "Tanzania",
    coverage_regions: ["tanzania", "kenya", "malawi"],
    lead_time_days_min: 5,
    lead_time_days_max: 7,
    moq_description: "Cooperative scale; contact for smallholder group orders",
    cold_chain_available: true,
    certifications: [],
    contact_notes: "Specialist in Telenomus remus for FAW; closest regional insectary to Zimbabwe corridor",
  },
};

export function getSupplier(supplierId: string): Supplier | undefined {
  return suppliers[supplierId];
}
