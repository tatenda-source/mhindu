import { z } from "zod";
import { CandidateType } from "@/lib/ipm/schemas";

export type CandidateDef = {
  pest_id: string;
  type: z.infer<typeof CandidateType>;
  description: string;
};

export const MAIZE_ZIMBABWE_CANDIDATES: CandidateDef[] = [
  {
    pest_id: "spodoptera_frugiperda",
    type: "pest",
    description:
      "Fall armyworm. Whorl feeding; ragged 'window-pane' pattern; frass like wet sawdust; larvae with inverted-Y mark on head capsule; egg masses (100–200 eggs) covered in buff-coloured scales.",
  },
  {
    pest_id: "busseola_fusca",
    type: "pest",
    description:
      "African stem borer. Dead-heart on young plants; tunnelling in stem; frass expelled at entry hole; larva cream with dark-brown head, no inverted-Y; do NOT confuse with FAW (Busseola larvae lack inverted-Y and prefer stem over whorl).",
  },
  {
    pest_id: "chilo_partellus",
    type: "pest",
    description:
      "Spotted stem borer. Window-pane feeding on young leaves before boring; larva pale with four rows of purple-brown spots; entry holes smaller than Busseola; co-occurs with Busseola at lower altitudes.",
  },
  {
    pest_id: "rhopalosiphum_maidis",
    type: "pest",
    description:
      "Corn leaf aphid. Dense blue-green colonies on upper leaves and tassels; honeydew; sooty mould; vectors MDMV. Distinguish from Sitobion: bluer colour, prefers maize.",
  },
  {
    pest_id: "disease_maize_streak_virus",
    type: "disease",
    description:
      "Maize streak virus (MSV). Yellow streaks parallel to leaf veins; stunting; transmitted by leafhopper Cicadulina; NOT confused with N-deficiency which starts at tip/margin, not as streaks.",
  },
  {
    pest_id: "disease_grey_leaf_spot",
    type: "disease",
    description:
      "Grey leaf spot (Cercospora zeina). Rectangular tan-grey lesions bounded by veins; lower leaves first; grey sporulation visible on lesions; no dark border (unlike northern leaf blight).",
  },
  {
    pest_id: "disease_northern_leaf_blight",
    type: "disease",
    description:
      "Northern leaf blight (Exserohilum turcicum). Large cigar-shaped grey-green lesions 5–15 cm; dark at edges; upper canopy; spores dark olive in humid conditions.",
  },
  {
    pest_id: "abiotic_n_deficiency",
    type: "abiotic",
    description:
      "Nitrogen deficiency. Yellowing starting at tip of lower/older leaves spreading to midrib in a V-shape; uniform across plant; no lesions, no feeding damage, no frass. CONSIDER before any disease ID.",
  },
  {
    pest_id: "abiotic_drought",
    type: "abiotic",
    description:
      "Drought stress. Leaf rolling (inward curl) during day; purple colouration on stems; tip firing on ears; wilting that recovers at night. No biotic lesions.",
  },
  {
    pest_id: "beneficial_coccinellid",
    type: "beneficial",
    description:
      "Ladybird (Coccinellidae) adult or larva. Adults: hemispherical, spotted. Larvae: elongated, spiny, dark with orange spots. PREDATOR — do NOT flag as pest. severity_0_1 = 0.",
  },
  {
    pest_id: "beneficial_parasitized_egg_mass",
    type: "beneficial",
    description:
      "Parasitized FAW egg mass. Eggs turn dark/black from Telenomus remus or Trichogramma parasitoids; exit holes may be visible. This is a positive sign — do NOT treat. severity_0_1 = 0.",
  },
];

const CANDIDATE_BLOCK = MAIZE_ZIMBABWE_CANDIDATES.map(
  (c) => `  - ${c.pest_id} [${c.type}]: ${c.description}`,
).join("\n");

export function buildMaizePrompt(stage: string): string {
  return `You are an agricultural vision specialist trained on Sub-Saharan African smallholder pest and disease identification.

Your task: identify the pest, disease, abiotic condition, or beneficial organism visible in the provided photo of a MAIZE plant at growth stage ${stage}, grown in Zimbabwe.

Method (follow in order — do NOT skip steps):

1. DAMAGE SIGNATURE FIRST. Describe exactly what you see:
   - Feeding pattern (window-pane, ragged, skeletonized, blotched, tunnelled, none visible)
   - Location on plant (whorl, leaf upper surface, leaf lower surface, stem, ear, root, tassel)
   - Lifecycle artefacts (eggs, larvae, pupae, frass, exuviae, webbing, exit holes)
   - Disease symptoms (chlorosis pattern, lesion shape/colour/border, sporulation, wilting, streaking)
   - Abiotic signs (tip-fire yellowing, leaf roll, purple colouration, no biotic lesions)

2. CANDIDATE MAPPING. Map your damage signatures to ONE of the candidates below — from this list ONLY. If your best match is not in this list, return pest_id=null and unknown_reason="outside_candidate_set". Do NOT invent a candidate outside this set.

Candidates for maize × Zimbabwe:
${CANDIDATE_BLOCK}

3. RULE OUT BENEFICIALS. If the image shows a coccinellid or parasitized egg mass, return that candidate with type=beneficial and severity_0_1=0. Do not recommend treatment.

4. RULE OUT ABIOTIC CAUSES. Before any disease diagnosis, ask: could this be N-deficiency, drought stress, mechanical damage, or herbicide drift? If yes, prefer the abiotic candidate.

5. LOOKALIKE RULES (mandatory check):
   - FAW vs Busseola fusca: FAW has inverted-Y on head, prefers whorl; Busseola bores stem, no inverted-Y.
   - FAW vs Chilo partellus: Chilo has rows of purple-brown spots on body, smaller entry holes.
   - Grey leaf spot vs Northern leaf blight: GLS lesions are rectangular, bounded by veins; NLB lesions are cigar-shaped, not vein-bounded.
   - MSV vs N-deficiency: MSV causes vein-parallel streaks from base; N-deficiency causes V-shaped tip-fire from leaf tip.
   - Corn aphid colony vs sooty mould from aphid: look for live insects first.

6. SCORES:
   - severity_0_1: proportion of visible plant tissue affected (0 = none, 1 = fully destroyed).
   - coverage_0_1: proportion of field likely affected. If only one plant visible, lower your coverage confidence.
   - confidence_0_1 per candidate. Return up to 3 candidates ranked by confidence.

7. UNKNOWN POLICY: If you cannot identify with overall confidence ≥ 0.5, return pest_id=null, stage=unknown, unknown_reason describing why (image_quality | ambiguous | outside_candidate_set). Do NOT return a low-confidence guess as the primary pest_id. Unknown is safe — the IPM engine treats it as "monitor and recheck". A wrong confident answer may trigger an unnecessary spray.

8. IMAGE QUALITY: If the image is too blurry, too dark, off-target (soil, sky, non-plant), or the plant fills less than 30% of frame, return pest_id=null, unknown_reason="image_quality".

reasoning field: short audit note (≤200 chars) explaining which signatures drove your conclusion. NOT shown to the farmer.`;
}
