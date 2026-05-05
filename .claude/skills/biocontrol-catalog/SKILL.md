---
name: biocontrol-catalog
description: Reference catalog of biocontrol agents (parasitoids, predators, microbials, fungi, viruses) used by Mhindu — target pests, target stages, application rates, suppliers, viability windows. Use when proposing a biological treatment, scheduling a release, or sourcing from a supplier.
---

# Biocontrol agent catalog

This is the operational reference behind every biological treatment Mhindu recommends. Every entry must be stage-specific and rate-specific.

## Schema

```yaml
agent_id: <snake_case>          # e.g. telenomus_remus
binomial: <Latin>
common_name: <English>
type: parasitoid | predator | microbial_bacterial | microbial_fungal | microbial_viral | nematode
target_pests:
  - pest_id: <from pest-kb>
    target_stage: egg | larva | pupa | adult | nymph
    expected_efficacy_pct: <range>
    rate: <e.g. 50000_per_ha>
    rate_basis: <release_count_per_ha | kg_per_ha | L_per_ha>
    source_url: <citation>
viability:
  shelf_life_days: <number>
  storage_temp_c: <range or "ambient">
  cold_chain_required: <true|false>
release_method: broadcast | card | sachet | spray | drone_pellet
release_time_of_day: dawn | dusk | early_morning | late_afternoon | any
field_conditions:
  no_rain_hours_before: <number>
  no_rain_hours_after: <number>
  leaf_moisture_required: <true|false>
  uv_sensitive: <true|false>
incompatibilities:
  recent_chemicals_days:
    pyrethroids: 21
    organophosphates: 14
    neonicotinoids: 14
    bt_or_other_microbials: 0
suppliers:
  - id: real_ipm_kenya
    sku: <if known>
    lead_time_days: <2-7>
    coverage_regions: [kenya, tanzania, uganda, rwanda, malawi, zimbabwe]
    moq: <minimum order>
  - id: koppert
  - id: agrilife
```

## Core agents (priority set)

### Telenomus remus (egg parasitoid for FAW)

```yaml
agent_id: telenomus_remus
binomial: Telenomus remus
type: parasitoid
target_pests:
  - pest_id: spodoptera_frugiperda
    target_stage: egg
    rate: 50000_per_ha
    rate_basis: release_count_per_ha
    expected_efficacy_pct: 65-90
    source_url: https://doi.org/10.1007/s10340-019-01166-w  # ICIPE/CABI 2019
viability:
  shelf_life_days: 3
  storage_temp_c: 12-15
  cold_chain_required: true
release_method: card
release_time_of_day: early_morning
field_conditions:
  no_rain_hours_before: 12
  no_rain_hours_after: 24
  leaf_moisture_required: false
  uv_sensitive: true
incompatibilities:
  recent_chemicals_days:
    pyrethroids: 21
    organophosphates: 14
    bt_or_other_microbials: 0
notes: |
  Releases must hit the EGG stage. If you scout L1+ larvae, the egg window has passed
  for that wave; schedule release for the next predicted oviposition wave (~7-10 days).
suppliers:
  - id: real_ipm_kenya
    lead_time_days: 3-5
  - id: sustainable_agriculture_tanzania
    lead_time_days: 5-7
  - id: koppert
```

### Trichogramma chilonis (egg parasitoid for stem borers, bollworm)

```yaml
agent_id: trichogramma_chilonis
binomial: Trichogramma chilonis
type: parasitoid
target_pests:
  - pest_id: chilo_partellus
    target_stage: egg
    rate: 100000_per_ha
    rate_basis: release_count_per_ha
    expected_efficacy_pct: 60-80
    source_url: https://www.icipe.org/research/push-pull
  - pest_id: helicoverpa_armigera
    target_stage: egg
    rate: 100000_per_ha
    expected_efficacy_pct: 50-75
viability:
  shelf_life_days: 2
  storage_temp_c: 12-15
  cold_chain_required: true
release_method: card
release_time_of_day: early_morning
notes: |
  Multiple releases (2-3 weekly) often outperform single release.
  Card pinning at canopy mid-height; one card per ~25m².
suppliers:
  - id: real_ipm_kenya
  - id: koppert
  - id: agrilife
```

### Bacillus thuringiensis aizawai (Bt — microbial larvicide)

```yaml
agent_id: bt_aizawai
common_name: Bt aizawai
binomial: Bacillus thuringiensis aizawai
type: microbial_bacterial
target_pests:
  - pest_id: spodoptera_frugiperda
    target_stage: larva_L1_L2
    rate: 1.5
    rate_basis: kg_per_ha
    expected_efficacy_pct: 70-85
  - pest_id: tuta_absoluta
    target_stage: larva_L1_L2
    rate: 1.0
    rate_basis: kg_per_ha
    expected_efficacy_pct: 65-80
viability:
  shelf_life_days: 730  # 2 years dry, ambient
  storage_temp_c: ambient
  cold_chain_required: false
release_method: spray
release_time_of_day: dusk
field_conditions:
  uv_sensitive: true
  leaf_moisture_required: false
notes: |
  Stops working past L3. Spray late afternoon to minimize UV degradation.
  Compatible with most natural enemies — Bt is highly target-specific to Lepidoptera.
suppliers:
  - id: real_ipm_kenya
  - id: andermatt
  - id: agrilife
```

### NPV - Spodoptera/Helicoverpa nucleopolyhedrovirus

```yaml
agent_id: npv_spodoptera
binomial: SfMNPV (Spodoptera frugiperda multiple NPV)
type: microbial_viral
target_pests:
  - pest_id: spodoptera_frugiperda
    target_stage: larva_L2_L3
    rate: 250
    rate_basis: g_per_ha
    expected_efficacy_pct: 70-85
viability:
  shelf_life_days: 365
  storage_temp_c: 4-8
  cold_chain_required: true
release_method: spray
release_time_of_day: dusk
field_conditions:
  uv_sensitive: true
notes: |
  Highly host-specific. No effect on beneficials. Slow kill (3-7 days post-ingestion).
suppliers:
  - id: andermatt
  - id: real_ipm_kenya
```

### Phytoseiulus persimilis (predatory mite for spider mite)

```yaml
agent_id: phytoseiulus_persimilis
binomial: Phytoseiulus persimilis
type: predator
target_pests:
  - pest_id: tetranychus_urticae
    target_stage: any  # eats eggs through adults
    rate: 20
    rate_basis: per_m2_release_count
    expected_efficacy_pct: 80-95
viability:
  shelf_life_days: 2  # very fragile
  storage_temp_c: 8-15
  cold_chain_required: true
release_method: sachet
release_time_of_day: any
notes: |
  Most fragile agent. Order only when scout-confirmed and treatment imminent.
  Must have spider mite present — predator starves without prey.
suppliers:
  - id: koppert
  - id: real_ipm_kenya
```

### Metarhizium anisopliae (entomopathogenic fungus)

```yaml
agent_id: metarhizium_anisopliae
type: microbial_fungal
target_pests:
  - pest_id: helicoverpa_armigera
    target_stage: larva_any
    rate: 2.5
    rate_basis: kg_per_ha
  - pest_id: bemisia_tabaci
    target_stage: nymph_adult
    rate: 2.5
    rate_basis: kg_per_ha
viability:
  shelf_life_days: 365
  storage_temp_c: ambient (under 25)
  cold_chain_required: false
release_method: spray
release_time_of_day: dusk
field_conditions:
  leaf_moisture_required: true   # fungi need humidity
  no_rain_hours_after: 6
  uv_sensitive: true
notes: |
  Higher humidity = better efficacy. Apply when leaf wetness > 6h forecast.
  Compatible with most actives EXCEPT systemic fungicides.
suppliers:
  - id: real_ipm_kenya
  - id: koppert
```

### Trichoderma spp. (soil-borne disease antagonist)

```yaml
agent_id: trichoderma_harzianum
type: microbial_fungal
target_pests:
  - pest_id: disease_bacterial_wilt
    target_stage: prevention
    rate: 2.5
    rate_basis: kg_per_ha
  - pest_id: disease_fusarium
    target_stage: prevention
    rate: 2.5
viability:
  shelf_life_days: 365
  storage_temp_c: ambient
release_method: soil_drench
release_time_of_day: any
notes: |
  Preventive, not curative. Apply at transplant or crop establishment.
suppliers:
  - id: real_ipm_kenya
  - id: koppert
```

## Suppliers (Sub-Saharan Africa focus)

```yaml
real_ipm_kenya:
  name: Real IPM
  hq: Kenya
  coverage: [kenya, tanzania, uganda, rwanda, malawi, zimbabwe, zambia]
  agents: [telenomus_remus, trichogramma_chilonis, phytoseiulus_persimilis, amblyseius_swirskii, metarhizium_anisopliae, beauveria_bassiana, bt_aizawai, trichoderma_harzianum]
  lead_time_days: 3-7
  contact: # via Mhindu integration partnership

koppert:
  name: Koppert Biological Systems
  hq: Netherlands
  coverage: [global, including east_africa_distribution]
  agents: [phytoseiulus_persimilis, amblyseius_swirskii, encarsia_formosa, ...]
  lead_time_days: 5-10

andermatt:
  name: Andermatt Biocontrol
  hq: Switzerland
  coverage: [global, africa_partner_network]
  specialty: [npv, granuloviruses]

agrilife_bcrl:
  name: AgriLife / BCRL
  hq: India
  coverage: [india, exporting_to_africa]
  specialty: [trichogramma, npv, bt]

sustainable_agriculture_tanzania:
  name: Sustainable Agriculture Tanzania
  hq: Tanzania
  agents: [telenomus_remus]
```

## Release scheduling math (canonical)

```ts
function releaseDate(detection, agent, supplier, weather): Date {
  const targetStageWindowOpens = predictTargetStage(detection, agent.target_stage);
  const orderDate = subtractDays(targetStageWindowOpens, supplier.lead_time_days);
  if (orderDate < today()) {
    return INFEASIBLE;  // engine recommends a substitute
  }
  const releaseDate = adjustForWeatherWindow(targetStageWindowOpens, weather, agent.field_conditions);
  return releaseDate;
}
```

`predictTargetStage` uses degree-day accumulation from local temperature data (CHIRPS or local met). For lepidoptera, ~250 DD°C ≈ one generation.

## When to refuse biocontrol (recommend something else)

- Lead time > target window opening — pest moves faster than supplier
- Recent incompatible chemical — release would be wasted
- Weather window unreachable in next 14 days
- Field area below MOQ for any supplier — group with neighbouring farmers via cooperative or fall back to microbial
- Agent specific to a stage that has already passed in this generation

In all these cases, fall through IPM hierarchy to next-tier (microbial → cultural → mechanical) and document the constraint that ruled out biocontrol.
