---
name: prescription-maps
description: Generate variable-rate prescription map files (KML, GeoJSON, ISOXML, DJI WPML, XAG AcreFly, printable PDF) from Mhindu's internal Prescription type. Use when integrating a new sprayer or drone vendor, generating spot-spray instructions, or producing a smallholder-printable map.
---

# Prescription map generation

Internal `Prescription` (vendor-neutral) → vendor-specific file. Used by `robotics-integrator` agent.

## Internal `Prescription` type

```ts
interface Prescription {
  id: string;
  field_id: string;
  generated_at: string;
  treatment_plan_id: string;
  product: {
    id: string;
    name: string;
    rate_per_ha: number;
    unit: "L" | "kg" | "agents";  // agents = biocontrol release count
  };
  zones: Array<{
    polygon: GeoJSON.Polygon;     // WGS84 (EPSG:4326)
    rate_pct: number;             // 0-100% of product.rate_per_ha; 0 = skip
    notes?: string;
  }>;
  buffer_m: number;
  weather_window: { earliest: string; latest: string };
  total_area_ha: number;
  pesticide_volume_litres: number;
  pesticide_volume_blanket_baseline_litres: number;
  decision_log_id: string;        // audit trail
}
```

## Vendor format reference

### KML (universal viewer, smallholder PDF backbone)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Mhindu Prescription {id}</name>
    <Style id="treat100"><PolyStyle><color>aa0000ff</color></PolyStyle></Style>
    <Style id="treat50"><PolyStyle><color>aa0080ff</color></PolyStyle></Style>
    <Style id="skip"><PolyStyle><color>4400ff00</color></PolyStyle></Style>
    <Placemark>
      <name>Zone 1 (100% rate)</name>
      <styleUrl>#treat100</styleUrl>
      <Polygon><outerBoundaryIs><LinearRing>
        <coordinates>...{lon,lat,0 ...}...</coordinates>
      </LinearRing></outerBoundaryIs></Polygon>
    </Placemark>
    ...
  </Document>
</kml>
```

Library: `@tmcw/togeojson` for parsing, hand-rolled writer for output (KML writers are mostly bloated). Or use `tokml` (npm).

### GeoJSON (programmatic interop, ISOXML upstream)

Plain `FeatureCollection` of `Polygon` features with properties:
```json
{
  "type": "Feature",
  "properties": { "rate_pct": 100, "zone_id": "z1" },
  "geometry": { "type": "Polygon", "coordinates": [[...]] }
}
```

### ISOXML (generic tractor variable-rate, John Deere See & Spray)

ISO 11783-10 standard. Treatment grids encoded in `TSK` (task) elements with `GAN` (treatment zones) and `PDV` (product data variable). Heavy spec — use `iso-xml-format` (npm) or generate manually for simple cases.

### DJI WPML (DJI Agras MG-1P, T20, T30, T40)

WPML = Waypoint Mission Markup Language. Two-file mission: `template.kml` + `waylines.wpml`. The waylines define flight path; template defines the polygon coverage. DJI Pilot 2 imports.

```xml
<wpml:waylines>
  <wpml:wayline>
    <wpml:waypoint>
      <wpml:lat>...</wpml:lat>
      <wpml:lng>...</wpml:lng>
      <wpml:alt>3.0</wpml:alt>           <!-- 3m above crop, typical -->
      <wpml:speed>5.0</wpml:speed>       <!-- m/s -->
      <wpml:action>spray_on</wpml:action>
      <wpml:flow_rate>{calculated_L_per_min}</wpml:flow_rate>
    </wpml:waypoint>
    ...
  </wpml:wayline>
</wpml:waylines>
```

Reference: DJI Agras WPML docs (developer.dji.com). The flow rate per waypoint is `(rate_pct/100 * product.rate_per_ha * speed_m/s * swath_m / 600)` in L/min.

### XAG AcreFly (XAG P40, P100)

Proprietary JSON. AcreFly cloud accepts an upload via API. Per-zone rate, plus flight parameters. Documentation via XAG developer program — they've been responsive to ag-tech partners.

### Printable PDF (Tier 1 — smallholder)

The most valuable output. Generated via `@react-pdf/renderer` or server-side Puppeteer. Layout:

```
[Field map with red/orange/green zones]
[Field name, area, generated date]
[Product: <name>, target: <pest>]
[Total rate: <L/kg> needed]
[Spot-spray instructions (1-2 short sentences in farmer's language)]
[Walk path numbered 1→N]
[Weather window: earliest / latest]
[Buffer notes: avoid spraying within Xm of water/dwellings]
[QR code → scan to log "I did it"]
```

Mobile-first PDF: A5 portrait, large font (≥14pt), high contrast, monochrome-friendly fallback for cheap printers.

## Coverage planning

For drone missions with multiple disjoint zones:

```ts
function planCoverage(prescription: Prescription, drone: DroneSpec): FlightMission[] {
  const sortedZones = nearestNeighbourTSP(prescription.zones, drone.home);
  const missions: FlightMission[] = [];
  let currentMission: FlightMission = newMission(drone);

  for (const zone of sortedZones) {
    const tankAfter = currentMission.tank_left - estimateVolume(zone, prescription);
    const distAfter = currentMission.distance_m + distanceToZone(currentMission, zone);
    if (tankAfter < 0 || distAfter > drone.range_m * 0.7) {
      missions.push(currentMission);
      currentMission = newMission(drone);
    }
    currentMission = addZoneToMission(currentMission, zone, prescription);
  }
  if (currentMission.zones.length > 0) missions.push(currentMission);
  return missions;
}
```

`drone.range_m * 0.7` is the safety margin. Always plan for return-to-home.

## Buffer zones (non-negotiable)

Hard-coded defaults; per-region overrides:

```ts
const DEFAULT_BUFFERS = {
  water_body: 30,           // metres
  dwelling: 50,
  school: 100,
  beehive: 100,
  organic_field_neighbour: 30,
};
```

Buffers are applied at prescription generation: zones are `ST_Difference`'d against buffered protected geometries before output. Never rely on the drone operator to "just avoid" — it's encoded in the file.

## Library choices

- `@turf/turf` — geometry ops (buffer, difference, area, centroid, distance)
- `proj4` — projection math if needed (most ops stay in WGS84)
- `tokml` or hand-rolled — KML output
- `@react-pdf/renderer` — PDF generation
- `qrcode` — QR for the "I did it" log link

## Output validation

Every generated file is validated before download:
- Total area in zones matches field polygon ± 1%
- Buffers respected (re-check against protected geometries)
- Weather window in the future
- `decision_log_id` resolves to a real decision in the DB
- File parses round-trip (KML → KML, no information loss)

If any check fails, return error and surface to the operator. Never silently produce a malformed file.

## Code locations

- `mhindu/src/lib/robotics/prescription.ts` — internal builder
- `mhindu/src/lib/robotics/adapters/kml.ts`
- `mhindu/src/lib/robotics/adapters/dji-wpml.ts`
- `mhindu/src/lib/robotics/adapters/xag.ts`
- `mhindu/src/lib/robotics/adapters/isoxml.ts`
- `mhindu/src/lib/robotics/adapters/pdf-smallholder.tsx`
- `mhindu/src/lib/robotics/coverage.ts`
- `mhindu/src/lib/robotics/buffers.ts`
