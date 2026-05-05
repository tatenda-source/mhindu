---
pest_id: spodoptera_frugiperda
binomial: Spodoptera frugiperda
common_name: Fall armyworm
local_names:
  shona: unverified
  swahili: viwavijeshi
  chichewa: unverified
type: insect
crops: [maize, sorghum, rice, sugarcane, millet]
region: pan-SSA (established since 2016)
lifecycle:
  - stage: egg
    duration_days: "2-3"
    damage_signature: >
      Cream to pale-green egg masses of 100-200 eggs each, laid in layers on leaf surfaces
      (usually upper leaf surface near the whorl), covered with greyish scales from the
      female's abdomen. No feeding damage at this stage; scouting value is high because
      parasitoid intervention (Telenomus remus) is most effective here.
    target_for_biocontrol: [telenomus_remus]

  - stage: larva_L1_L2
    duration_days: "4-6"
    damage_signature: >
      First instars scrape the epidermis leaving a clear "window-pane" or pin-hole pattern
      on whorl leaves. Larvae gregarious at this stage; a single egg mass produces a cluster.
      Fine frass visible. Economic damage minor but stage-specific opportunity for
      Bt (aizawai/kurstaki) and Beauveria bassiana before larvae descend into whorl.
    target_for_biocontrol: [bt_aizawai, bt_kurstaki, beauveria_bassiana_strain_bbg111]

  - stage: larva_L3_L6
    duration_days: "8-12"
    damage_signature: >
      Ragged, irregular holes in whorl leaves; larvae move deeper into the funnel and begin
      feeding on leaf whorls. Coarse dark frass (resembling wet sawdust) accumulates in the
      whorl funnel — the most reliable field indicator. L4-L6 larvae cause the bulk of
      economic yield loss; late-instar larvae also bore into ears after V8. Sand+ash whorl
      application has negligible efficacy beyond L2.
    target_for_biocontrol: [bt_aizawai]

  - stage: pupa
    duration_days: "8-12"
    damage_signature: >
      No above-ground damage. Pupa in a loose silken cocoon 2-5 cm deep in soil directly
      below the plant. Pupation signals the end of the current generation's foliar threat;
      soil solarisation or deep tillage after harvest can reduce carry-over.
    target_for_biocontrol: []

  - stage: adult
    duration_days: "7-21"
    damage_signature: >
      Moths do not feed on crops. Females lay up to 1,500 eggs over a lifetime; oviposition
      peaks at night on V2-V8 maize. Adults disperse up to 100 km per night on wind currents,
      making area-wide management relevant beyond the individual field.
    target_for_biocontrol: []

threshold:
  metric: infestation_pct_plants_with_larvae_or_damage
  value_early_whorl: 11
  value_late_whorl: 20
  growth_stage_qualifier: >
    Early whorl (V2-V5): act if ≥11% plants show damage with live larvae present.
    Late whorl (V6-V8): act if ≥20% of whorls show ragged damage with frass, or if
    ≥40% of whorls are damaged regardless of larval presence. Below-threshold: monitor
    every 3-4 days. Post-tasselling: economic damage sharply reduced; no spray threshold
    defined by CABI for that window.
  source_url: https://www.plantwise.org/KnowledgeBank/pmdg/20177801315
  source_note: >
    CABI Plantwise Knowledge Bank — Fall armyworm on maize (2017, updated 2023).
    Thresholds consistent with FAO Fall Armyworm Integrated Management Guide (FAO, 2018;
    https://www.fao.org/3/I8665EN/i8665en.pdf).

biocontrols:
  - agent_id: telenomus_remus
    type: parasitoid_wasp
    target_stage: egg
    application_rate: "50000 adults per ha per release; 3 releases at 2-week intervals"
    expected_efficacy_pct: "33-100 (highly variable; 72-100% achieved in low-pest-pressure
      minor-season releases in Ghana; 33% in high-pressure major-season releases at same
      site — see confidence note)"
    weather_constraints: >
      Release early morning or late afternoon. Avoid release within 24 hours of rainfall.
      Incompatible with pyrethroid sprays applied <7 days prior; wait ≥14 days after
      any broad-spectrum insecticide application.
    incompatible_with: [recent_pyrethroid_spray, recent_neonicotinoid_spray]
    smallholder_note: >
      Mass rearing requires local capacity; not yet widely available in Zimbabwe as of 2024.
      Real IPM Kenya produces Telenomus remus. Confirm supply chain before including in
      farmer-facing recommendation.
    source_url: https://doi.org/10.3390/insects12080665
    source_note: >
      Accrombessi et al. (2021) Insects 12(8):665. Ghana field releases ~30,000/ha (3
      releases). Recommended rate 50,000/ha drawn from Latin American programme data
      cited within same paper; CABI Agric Bioscience review DOI:10.1186/s43170-021-00071-6.

  - agent_id: bt_aizawai
    type: microbial_biopesticide
    target_stage: larva_L1_L2
    application_rate: "1.0-1.5 kg/ha commercial WP formulation; apply into whorl at
      V3-V6; re-apply after 7 days if pressure persists"
    expected_efficacy_pct: "70-100 on L1-L2; efficacy drops sharply on L3+"
    weather_constraints: >
      Apply in the evening or early morning; UV degrades Cry proteins within 24-48 hours.
      Avoid application immediately before expected rain. Bt aizawai preferred over
      kurstaki for Spodoptera spp. due to higher activity against this genus.
    incompatible_with: []
    smallholder_note: >
      Suitable for smallholder application with backpack sprayer. Targets must be small
      larvae; scouting to confirm instar is critical. Does not control L3+ effectively.
    source_url: https://www.cabidigitallibrary.org/doi/abs/10.1079/cabicompendium.29810
    source_note: >
      CABI Compendium: Spodoptera frugiperda. Commercial field applications at 1.0 kg/ha
      achieved >90% larval mortality (L1-L2) in field studies referenced therein.

  - agent_id: beauveria_bassiana_strain_bbg111
    type: entomopathogenic_fungus
    target_stage: larva_L1_L2
    application_rate: "1×10⁸ conidia/mL suspension applied to whorl; typical field rate
      ~2-3 kg/ha WP at recommended label concentration"
    expected_efficacy_pct: "70-96 against L1-L2 in laboratory; field efficacy variable
      (lower under high UV and dry conditions)"
    weather_constraints: >
      Apply in high humidity (>70% RH); fungal germination requires moisture. Evening
      application strongly recommended. Efficacy substantially reduced in dry/sunny
      conditions typical of Zimbabwe dry season.
    incompatible_with: [fungicides]
    smallholder_note: >
      South Africa ARC and CABI have assessed commercial Beauveria products against FAW.
      Shelf life and cold-chain requirements are limiting factors for remote smallholders.
    source_url: https://doi.org/10.3390/insects13010001
    source_note: >
      Mweke et al. (2022) Agronomy 12:2704. Beauveria bassiana commercial formulation
      assessment. Also: Virulence of Beauveria sp. towards FAW, Archives of Microbiology
      (2023) DOI:10.1007/s00203-023-03669-8.

cultural:
  - name: push_pull
    description: >
      Intercrop maize with Desmodium intortum (silverleaf) between rows; plant Brachiaria
      cv Mulato II or Brachiaria brizantha as a border around the field. Desmodium emits
      volatiles that repel ovipositing FAW adults (push) and attract larval parasitoids
      (Cotesia icipe, Coccygidium luteum); Brachiaria acts as a dead-end trap crop where
      eggs hatch but larvae cannot complete development (only 2.5-6% larval survival on
      Brachiaria vs 36% on maize). Climate-adapted push-pull using D. intortum + Brachiaria
      Mulato II increases maize yield 2.5× and reduces FAW by ~82%.
    quantitative_efficacy: >
      82% reduction in FAW larvae per plant; 3.6-4.9× lower crop damage score; parasitism
      9× higher in push-pull vs monocrop (18.7% vs 2.1%). Data from Kenya long and short
      rains 2019.
    applicability: "Maize; East and Southern Africa; smallholder 0.5-5ha viable; requires
      Desmodium seed availability (ICIPE supply chain). Most benefit from V2 planting of
      companion crops alongside maize."
    source_url: https://doi.org/10.3389/fevo.2022.883020
    source_note: >
      Mutyambai et al. (2022) Front. Ecol. Evol. DOI:10.3389/fevo.2022.883020.
      Also: Khan et al. (2021) Pest Manag Sci 77:2350-2357 DOI:10.1002/ps.6261.

  - name: early_planting
    description: >
      Plant maize at onset of rains to allow crop to reach V8+ before peak FAW adult
      flight pressure (typically mid-season). Early-planted maize suffers lower yield
      loss because reproductive stages are completed before heaviest infestation periods.
      Small benefit only; not a substitute for scouting.
    applicability: "All maize-growing zones; smallholder viable; no additional cost."
    source_url: https://www.cabidigitallibrary.org/doi/abs/10.1079/cabicompendium.29810
    source_note: CABI Compendium: Spodoptera frugiperda — cultural practices section.

  - name: intercropping_legumes
    description: >
      Intercropping with edible legumes (bean, cowpea) provides partial FAW suppression
      through habitat diversification and increased natural enemy populations, but achieves
      only 30-40% FAW infestation reduction vs 82% for push-pull. Recommended as a
      complementary practice, not a standalone replacement for push-pull or biocontrol.
    applicability: "Maize-legume systems; smallholder; Zimbabwe common bean/cowpea rotations."
    source_url: https://doi.org/10.1002/ps.6261
    source_note: >
      Khan et al. (2021) Pest Manag Sci 77(5):2350-2357.

mechanical:
  - name: hand_egg_mass_removal
    description: >
      Remove and destroy egg masses by hand during early-morning scouting walks. Egg
      masses are cream-coloured, roughly circular, 1-2 cm diameter, on leaf surfaces.
      One person can scout and remove from ~0.5 ha in 2-3 hours. Effective pre-hatch or
      within 24 hours of hatching; negligible benefit once L1 larvae have dispersed into
      whorl.
    applicability: "Smallholder <1 ha; labour-intensive but zero cost; viable V2-V6."
    source_url: https://www.cabidigitallibrary.org/doi/abs/10.1079/cabicompendium.29810

  - name: sand_ash_whorl_application
    description: >
      Apply a pinch of dry sand or wood ash into the whorl funnel to abrade and desiccate
      small larvae. Traditional practice documented in SSA extension materials. Efficacy
      established only for L1-L2; no measurable effect on L3+. Use only as an immediate
      response when no biopesticide is available; pair with scouting to confirm instar.
    applicability: "Smallholder; zero cost; low efficacy ceiling; supplementary only."
    source_url: https://www.cabi.org/wp-content/uploads/ToT-manual.pdf
    source_note: CABI Community-Based FAW Monitoring ToT Manual.

chemical_last_resort:
  - active_ingredient: emamectin_benzoate
    irac_moa: 6
    rate: "0.2 L/ha of 1.9 EC formulation (follow label; typical field concentration
      0.19 g a.i./L whorl spray)"
    target_stage: larva_L1_L4
    notes: >
      IRAC Group 6 (avermectin — chloride channel activator). Relatively selective;
      lower toxicity to adult parasitoid wasps than pyrethroids when spray is dry
      (24-48 hrs post-application). Efficacy against L1-L3 well-documented; reduced
      on L5-L6. Rotate MoA; do not use emamectin benzoate in consecutive seasons.
    source_url: https://pubmed.ncbi.nlm.nih.gov/37338689/

  - active_ingredient: spinetoram
    irac_moa: 5
    rate: "100-150 mL/ha of 120 SC formulation (confirm local label)"
    target_stage: larva_L1_L3
    notes: >
      IRAC Group 5 (spinosyn — nicotinic acetylcholine receptor allosteric modulator).
      Derived from Saccharopolyspora polyspinosa; lower mammalian toxicity. Very high
      FAW efficacy in Kenya susceptibility trials (lowest resistance ratios across
      populations tested). Rotate with emamectin benzoate — do not use same group
      in same season. Avoid tank-mixing with Telenomus remus release (spinosyns toxic
      to adult parasitoids).
    source_url: https://doi.org/10.1155/2022/8007998
    source_note: >
      Babul Miah et al. (2022) Susceptibility Evaluation of FAW in Kenya.
      MDPI Insects 12(8):665.

  - active_ingredient: chlorantraniliprole
    irac_moa: 28
    rate: "300-500 mL/ha of 200 SC formulation at V2-V6"
    target_stage: larva_L1_L4
    notes: >
      IRAC Group 28 (diamide — ryanodine receptor modulator). High larval efficacy;
      some systemic uptake providing whorl protection. Resistance not yet documented
      widely in SSA (as of 2024) but detected in Americas — monitor. Expensive; may
      not be cost-effective for smallholder use on staple maize.
    source_url: https://www.cabidigitallibrary.org/doi/abs/10.1079/cabicompendium.29810

avoid_actives:
  - active_ingredient: lambda_cyhalothrin
    irac_moa: 3A
    reason: >
      Broad-spectrum pyrethroid; kills adult Telenomus remus, Cotesia spp., and other
      parasitoids. Widespread resistance in FAW populations across SSA. Negative
      cost-benefit for IPM programmes. Do not use if push-pull or Telenomus releases
      are active in or adjacent to the field.
    source_url: https://doi.org/10.1155/2022/8007998

  - active_ingredient: deltamethrin
    irac_moa: 3A
    reason: >
      Same class as lambda-cyhalothrin. Resistance widespread. Destructive to natural
      enemy complex. Avoid.
    source_url: https://doi.org/10.1155/2022/8007998

  - active_ingredient: profenofos
    irac_moa: 1B
    reason: >
      Organophosphate; broad-spectrum, highly toxic to parasitoids and predators.
      Resistance documented. Not compatible with any biocontrol programme.
    source_url: https://www.cabidigitallibrary.org/doi/abs/10.1079/cabicompendium.29810

citations:
  - url: https://www.cabidigitallibrary.org/doi/abs/10.1079/cabicompendium.29810
    type: factsheet
    publisher: CABI
    title: "CABI Compendium: Spodoptera frugiperda (fall armyworm)"
    accessed: 2026-05-05

  - url: https://www.fao.org/3/I8665EN/i8665en.pdf
    type: protocol
    publisher: FAO
    title: "Integrated Management of the Fall Armyworm on Maize: A Guide for Farmer Field Schools in Africa (FAO, 2018)"
    accessed: 2026-05-05

  - url: https://doi.org/10.3390/insects12080665
    type: paper
    publisher: MDPI Insects
    title: "Accrombessi et al. (2021) Assessing the Potential of Inoculative Field Releases of Telenomus remus to Control Spodoptera frugiperda in Ghana. Insects 12(8):665."
    accessed: 2026-05-05

  - url: https://doi.org/10.1186/s43170-021-00071-6
    type: paper
    publisher: CABI Agriculture and Bioscience
    title: "Sisay et al. (2021) The use of Telenomus remus in management of Spodoptera spp.: potential, challenges and major benefits. CABI Agric Bioscience 2:71."
    accessed: 2026-05-05

  - url: https://doi.org/10.3389/fevo.2022.883020
    type: paper
    publisher: Frontiers in Ecology and Evolution
    title: "Mutyambai et al. (2022) Bioactive Volatiles From Push-Pull Companion Crops Repel Fall Armyworm and Attract Its Parasitoids. Front. Ecol. Evol. 10:883020."
    accessed: 2026-05-05

  - url: https://doi.org/10.1002/ps.6261
    type: paper
    publisher: Pest Management Science
    title: "Khan et al. (2021) The role of Desmodium intortum, Brachiaria sp. and Phaseolus vulgaris in the management of Spodoptera frugiperda in maize cropping systems in Africa. Pest Manag Sci 77(5):2350-2357."
    accessed: 2026-05-05

  - url: https://doi.org/10.3390/insects11040228
    type: paper
    publisher: MDPI Insects
    title: "Montezano et al. (2020) The Effect of Temperature on the Development of Spodoptera frugiperda. Insects 11(4):228."
    accessed: 2026-05-05

  - url: https://doi.org/10.1155/2022/8007998
    type: paper
    publisher: Wiley / Hindawi
    title: "Babul Miah et al. (2022) Susceptibility Evaluation of Fall Armyworm Infesting Maize in Kenya against a Range of Insecticides."
    accessed: 2026-05-05

  - url: https://pubmed.ncbi.nlm.nih.gov/37338689/
    type: paper
    publisher: PubMed
    title: "Sublethal effects of spinetoram and emamectin benzoate on key demographic parameters of fall armyworm (2023)."
    accessed: 2026-05-05

  - url: https://doi.org/10.1007/s00203-023-03669-8
    type: paper
    publisher: Archives of Microbiology / Springer
    title: "Virulence of Beauveria sp. and Metarhizium sp. fungi towards fall armyworm (2023)."
    accessed: 2026-05-05

  - url: https://www.cabi.org/wp-content/uploads/ToT-manual.pdf
    type: extension_note
    publisher: CABI
    title: "Community-Based Fall Armyworm (Spodoptera frugiperda) Monitoring — ToT Manual. CABI."
    accessed: 2026-05-05

confidence:
  threshold: high
  biocontrol_rates: medium
  local_names: low
unverified_fields:
  - local_names.shona
  - local_names.chichewa
  - biocontrols[0].expected_efficacy_pct
  - biocontrols[2].application_rate
last_reviewed: 2026-05-05
reviewed_by: agronomy-researcher
---

# Fall armyworm (Spodoptera frugiperda)

## Identification

**Egg mass:** Cream or pale grey circular clump of 100-200 overlapping eggs, 1-2 cm across, typically found on the upper surface of lower leaves in V2-V6 maize. Covered with fine grey scales from the female moth's abdomen. Hatch in 2-3 days at tropical temperatures.

**Young larvae (L1-L2):** Tiny (2-4 mm), pale greenish-white with a dark head capsule. Gregarious directly after hatching — a group of 50-150 tiny caterpillars feeding in a patch. Look for a cluster of window-pane feeding marks near an egg-mass site.

**Older larvae (L3-L6):** 10-40 mm; brown to dark grey-green with a distinctive inverted white Y-shape on the head capsule (frons). Four large spots in a square arrangement on abdominal segment 8, each bearing a spine. This Y-mark is the key field identification character separating FAW from African armyworm and African stem borer larvae.

**Pupa:** Reddish-brown, 14-18 mm, found 2-5 cm deep in the soil immediately below the plant.

**Adult moth:** 32-40 mm wingspan. Male forewing grey-brown with irregular white patches; female forewing more uniformly grey-brown. Nocturnal; not reliably identified in the field without a light trap.

## Damage signature

**V2-V5 (early whorl):** Pin-hole or window-pane transparent patches on the newest leaves, concentrated in the upper part of the plant. Young larvae are still on the leaf surface.

**V5-V8 (late whorl):** Ragged, irregular holes in whorl leaves with abundant coarse dark frass piled in the funnel. The frass — wet sawdust appearance, 1-3 mm pellets — is the most reliable field diagnostic even when larvae have burrowed out of sight. Severely infested whorls may be reduced to a shredded cylinder of leaf fragments.

**V8+:** Larvae bore into developing ears; scarring and frass at silk channels. Post-tasselling damage is cosmetic at low-to-moderate infestations.

## Lookalikes

- **African armyworm (Spodoptera exempta)** — larvae lack the Y-mark on the frons; occur in mass migrations across the soil surface rather than within the whorl; damage is broader defoliation rather than whorl-specific.
- **African stem borer (Busseola fusca)** — larvae are cream-coloured without the Y-mark; early damage is identical window-pane feeding but larvae move into the stem rather than the whorl; deadheart symptom rather than whorl frass.
- **Cutworms (Agrotis spp.)** — soil-surface feeders; cut stems at ground level; do not produce whorl frass.
- **Beneficial: ground beetles (Carabidae)** — shiny, fast-moving, found at soil surface; do not feed on plants; do not confuse with FAW larvae.

## Why this matters

FAW arrived in Africa in 2016 and by 2018 was present in all maize-growing countries of SSA. It is estimated to cause 20-50% yield loss in smallholder maize without intervention. Zimbabwe's smallholder maize sector — the country's primary staple crop — is highly exposed. The pest has a single-field economic threshold of 11-20% infested plants and can destroy an entire whorl within 48-72 hours when L3-L6 larvae are present, meaning weekly scouting intervals miss actionable windows. FAW is the primary pest driving calendar-spray behaviour on maize in SSA, making it the highest-priority entry for a pesticide-reduction platform.

## References

- **CABI Compendium: Spodoptera frugiperda** — primary factsheet; thresholds, distribution, management options. https://www.cabidigitallibrary.org/doi/abs/10.1079/cabicompendium.29810
- **FAO (2018) Integrated Management of the Fall Armyworm on Maize** — farmer field school protocol; thresholds, chemical options, cultural practices. https://www.fao.org/3/I8665EN/i8665en.pdf
- **Accrombessi et al. (2021)** — first published field releases of Telenomus remus in West Africa (Ghana); release rates, parasitism efficacy. DOI:10.3390/insects12080665
- **Sisay et al. (2021)** — comprehensive review of Telenomus remus use in Spodoptera management; mass-rearing, release strategies. DOI:10.1186/s43170-021-00071-6
- **Mutyambai et al. (2022)** — mechanistic push-pull volatile study; quantified FAW repellency and parasitoid attraction. DOI:10.3389/fevo.2022.883020
- **Khan et al. (2021)** — push-pull vs legume intercrop comparison; 82% vs 30-40% FAW reduction. DOI:10.1002/ps.6261
- **Montezano et al. (2020)** — temperature-dependent lifecycle durations; 26-30°C optimal range. DOI:10.3390/insects11040228
- **Babul Miah et al. (2022)** — Kenya insecticide susceptibility; spinetoram efficacy, pyrethroid resistance confirmation. DOI:10.1155/2022/8007998
