const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const sha256 = (text) => crypto.createHash('sha256').update(text).digest('hex');

// 1. Stratigraphic Column of Upper Assam Basin (Greater Duliajan / Nahorkatiya Field)
const formations = [
  {
    formation_id: "FORM-01",
    name: "Dhekiajuli / Alluvium",
    top_depth: 0,
    bottom_depth: 1200,
    lithology: "Unconsolidated coarse sand, pebble beds, alluvial silt",
    color: "#d97706",
    porosity_pct: 28.5,
    permeability_md: 1200,
    risk_level: "LOW",
    typical_hazards: ["Shallow seepage loss", "Unconsolidated hole washout"],
    description: "Quaternary to Pliocene unconsolidated fluvial sequence requiring high-viscosity spud mud."
  },
  {
    formation_id: "FORM-02",
    name: "Girujan Clay",
    top_depth: 1200,
    bottom_depth: 2400,
    lithology: "Mottled plastic claystone, ferruginous silty shale",
    color: "#10b981",
    porosity_pct: 14.2,
    permeability_md: 12,
    risk_level: "MEDIUM",
    typical_hazards: ["Bit balling", "Swelling smectite clays", "Tight hole on trips"],
    description: "Regional caprock composed of sticky hydro-swelling clays; requires KCl/Polymer inhibition."
  },
  {
    formation_id: "FORM-03",
    name: "Tipam Sandstone",
    top_depth: 2400,
    bottom_depth: 3100,
    lithology: "Massive cross-bedded arkosic sandstone with thin shale bands",
    color: "#fbbf24",
    porosity_pct: 22.8,
    permeability_md: 480,
    risk_level: "MEDIUM",
    typical_hazards: ["Differential pipe sticking", "Thick filter cake buildup", "Partial filtrate invasion"],
    description: "Major Miocene reservoir unit in Upper Assam; high permeability sands prone to differential sticking."
  },
  {
    formation_id: "FORM-04",
    name: "Barail Coal-Shale",
    top_depth: 3100,
    bottom_depth: 3700,
    lithology: "Interbedded fissile carbonaceous shale, fractured coal seams, channel sands",
    color: "#ef4444",
    porosity_pct: 18.6,
    permeability_md: 850,
    risk_level: "CRITICAL",
    typical_hazards: ["Severe Mud Loss (Fractured Coal)", "Stuck Pipe (Coal Sloughing)", "High Torque Spikes", "Connection Gas"],
    description: "Oligocene primary hydrocarbon producer & highest-risk drilling horizon in Nahorkatiya-Moran block. Natural micro-cleats in coal seams cause sudden circulation losses between 3,400–3,460 m."
  },
  {
    formation_id: "FORM-05",
    name: "Kopili Shale",
    top_depth: 3700,
    bottom_depth: 4200,
    lithology: "Dark splintery marine shale, thin fossiliferous limestone streaks",
    color: "#8b5cf6",
    porosity_pct: 9.4,
    permeability_md: 2.5,
    risk_level: "HIGH",
    typical_hazards: ["Overpressure transition zone", "High-pressure gas kicks", "Brittle shale cavings"],
    description: "Late Eocene overpressured marine shale requiring careful ECD and pore-pressure monitoring."
  }
];

// Helper to get formation by TVD
function getFormationAtDepth(tvd) {
  for (const f of formations) {
    if (tvd >= f.top_depth && tvd < f.bottom_depth) return f.name;
  }
  return "Kopili Shale";
}

// Haversine formula in km
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371.0;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return Number((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2));
}

const activeLat = 27.4128;
const activeLon = 95.3421;

// 2. Wells Catalog (Active Well W-101 + 7 Offset Wells in Greater Duliajan / Nahorkatiya)
const rawWells = [
  {
    well_id: "W-101",
    well_name: "Nahorkatiya-101 (ACTIVE)",
    latitude: 27.4128,
    longitude: 95.3421,
    field: "Greater Duliajan - Block NHR-04",
    block: "NHR-04",
    status: "DRILLING",
    spud_date: "2026-08-04",
    completion_date: null,
    current_depth: 3385.0,
    total_depth: 3950.0,
    current_formation: "Barail Coal-Shale",
    formation_similarity_pct: 100.0,
    parameter_similarity_pct: 100.0,
    overall_similarity_pct: 100.0,
    risk_rating: "HIGH",
    rig_name: "OIL-E-2000 #14",
    elevation_m: 122.5,
    surface_offset_x: 0,
    surface_offset_z: 0,
    azimuth_deg: 45,
    max_inclination_deg: 14.5
  },
  {
    well_id: "W-093",
    well_name: "Nahorkatiya-093",
    latitude: 27.4512,
    longitude: 95.2980,
    field: "Greater Duliajan - Block NHR-04",
    block: "NHR-04",
    status: "COMPLETED",
    spud_date: "2025-11-10",
    completion_date: "2026-02-18",
    current_depth: 3920.0,
    total_depth: 3920.0,
    current_formation: "Kopili Shale",
    formation_similarity_pct: 95.4,
    parameter_similarity_pct: 89.2,
    overall_similarity_pct: 92.8,
    risk_rating: "CRITICAL",
    rig_name: "OIL-E-2000 #11",
    elevation_m: 121.0,
    surface_offset_x: -4350,
    surface_offset_z: 4260,
    azimuth_deg: 62,
    max_inclination_deg: 16.2
  },
  {
    well_id: "W-087",
    well_name: "Duliajan-South-087",
    latitude: 27.3865,
    longitude: 95.3112,
    field: "Greater Duliajan - Block NHR-04",
    block: "NHR-04",
    status: "COMPLETED",
    spud_date: "2025-05-19",
    completion_date: "2025-08-29",
    current_depth: 3850.0,
    total_depth: 3850.0,
    current_formation: "Kopili Shale",
    formation_similarity_pct: 93.0,
    parameter_similarity_pct: 86.5,
    overall_similarity_pct: 90.4,
    risk_rating: "CRITICAL",
    rig_name: "OIL-E-1500 #08",
    elevation_m: 119.8,
    surface_offset_x: -3050,
    surface_offset_z: -2920,
    azimuth_deg: 30,
    max_inclination_deg: 18.0
  },
  {
    well_id: "W-098",
    well_name: "Nahorkatiya-East-098",
    latitude: 27.4345,
    longitude: 95.4110,
    field: "Greater Duliajan - Block NHR-05",
    block: "NHR-05",
    status: "COMPLETED",
    spud_date: "2025-08-12",
    completion_date: "2025-11-24",
    current_depth: 4010.0,
    total_depth: 4010.0,
    current_formation: "Kopili Shale",
    formation_similarity_pct: 88.5,
    parameter_similarity_pct: 82.0,
    overall_similarity_pct: 85.6,
    risk_rating: "HIGH",
    rig_name: "OIL-E-2000 #14",
    elevation_m: 124.2,
    surface_offset_x: 6800,
    surface_offset_z: 2410,
    azimuth_deg: 110,
    max_inclination_deg: 12.8
  },
  {
    well_id: "W-105",
    well_name: "Moran-North-105",
    latitude: 27.3610,
    longitude: 95.3990,
    field: "Moran Extension",
    block: "MRN-02",
    status: "COMPLETED",
    spud_date: "2026-01-14",
    completion_date: "2026-04-20",
    current_depth: 3790.0,
    total_depth: 3790.0,
    current_formation: "Kopili Shale",
    formation_similarity_pct: 86.2,
    parameter_similarity_pct: 79.4,
    overall_similarity_pct: 83.1,
    risk_rating: "HIGH",
    rig_name: "OIL-E-1500 #04",
    elevation_m: 118.4,
    surface_offset_x: 5620,
    surface_offset_z: -5750,
    azimuth_deg: 145,
    max_inclination_deg: 15.0
  },
  {
    well_id: "W-076",
    well_name: "Duliajan-Central-076",
    latitude: 27.4680,
    longitude: 95.3740,
    field: "Greater Duliajan - Block NHR-04",
    block: "NHR-04",
    status: "COMPLETED",
    spud_date: "2024-09-02",
    completion_date: "2024-12-15",
    current_depth: 3680.0,
    total_depth: 3680.0,
    current_formation: "Barail Coal-Shale",
    formation_similarity_pct: 84.0,
    parameter_similarity_pct: 77.8,
    overall_similarity_pct: 81.2,
    risk_rating: "MEDIUM",
    rig_name: "OIL-E-1500 #09",
    elevation_m: 123.1,
    surface_offset_x: 3150,
    surface_offset_z: 6130,
    azimuth_deg: 15,
    max_inclination_deg: 10.5
  },
  {
    well_id: "W-112",
    well_name: "Hugrijan-112",
    latitude: 27.4920,
    longitude: 95.2890,
    field: "Hugrijan Block",
    block: "HGR-01",
    status: "COMPLETED",
    spud_date: "2026-02-11",
    completion_date: "2026-05-30",
    current_depth: 3620.0,
    total_depth: 3620.0,
    current_formation: "Barail Coal-Shale",
    formation_similarity_pct: 79.5,
    parameter_similarity_pct: 74.0,
    overall_similarity_pct: 76.8,
    risk_rating: "LOW",
    rig_name: "OIL-E-2000 #06",
    elevation_m: 125.0,
    surface_offset_x: -5240,
    surface_offset_z: 8800,
    azimuth_deg: 210,
    max_inclination_deg: 9.0
  },
  {
    well_id: "W-120",
    well_name: "Tengakhat-120",
    latitude: 27.3210,
    longitude: 95.2380,
    field: "Tengakhat West",
    block: "TGK-03",
    status: "COMPLETED",
    spud_date: "2026-03-01",
    completion_date: "2026-06-19",
    current_depth: 4120.0,
    total_depth: 4120.0,
    current_formation: "Kopili Shale",
    formation_similarity_pct: 73.2,
    parameter_similarity_pct: 69.5,
    overall_similarity_pct: 71.4,
    risk_rating: "MEDIUM",
    rig_name: "OIL-E-2000 #12",
    elevation_m: 117.2,
    surface_offset_x: -10280,
    surface_offset_z: -10200,
    azimuth_deg: 280,
    max_inclination_deg: 21.0
  }
];

// 3. Historical Drilling Incidents (Structured Institutional Memory)
const events = [
  {
    event_id: "EVT-093-01",
    well_id: "W-093",
    well_name: "Nahorkatiya-093",
    depth: 3428.0,
    depth_end: 3446.0,
    formation: "Barail Coal-Shale",
    event_type: "MUD_LOSS",
    severity: "CRITICAL",
    loss_rate_bbl_hr: 15.4,
    npt_hours: 18.5,
    description: "Encountered natural cleat fractures in Barail coal seam at 3,428 m. Dynamic mud losses escalated rapidly from 4 bbl/hr to 15.4 bbl/hr with 1.24 sg Water-Based Mud. Pit volume dropped by 28 bbl.",
    root_cause: "High Equivalent Circulating Density (ECD 1.31 sg) exceeding fracture propagation gradient of micro-cleated Barail coal bed (1.27 sg).",
    mitigation: "Reduced pump flow rate from 2,150 LPM to 1,750 LPM. Spotted 25 bbl High-Concentration LCM Pill (15 ppb Medium Nut-Plug + 10 ppb Coarse Flake Mica + 8 ppb Sized CaCO3) across 3,415–3,450 m and soaked for 45 mins.",
    outcome: "Dynamic losses reduced to <0.8 bbl/hr within 1.5 hours; full circulation regained and 9-5/8\" liner set safely.",
    source_doc: "DDR_W093_142.pdf",
    source_page: 3,
    date: "2026-01-19"
  },
  {
    event_id: "EVT-093-02",
    well_id: "W-093",
    well_name: "Nahorkatiya-093",
    depth: 3442.0,
    depth_end: 3452.0,
    formation: "Barail Coal-Shale",
    event_type: "TORQUE_SPIKE",
    severity: "HIGH",
    loss_rate_bbl_hr: 2.1,
    npt_hours: 6.0,
    description: "Erratic surface torque spikes from 24 kNm baseline up to 36.8 kNm accompanied by splintery coal cavings over shale shakers.",
    root_cause: "Mechanical destabilization of interbedded Barail coal-shale lamination due to filtrate invasion prior to LCM seal.",
    mitigation: "Added 2% poly-glycol lubricant and swept hole with 30 bbl high-viscosity bentonite pill; controlled ROP to 12 m/hr.",
    outcome: "Torque stabilized at 25–27 kNm; wellbore cleaned without pack-off.",
    source_doc: "DDR_W093_143.pdf",
    source_page: 2,
    date: "2026-01-21"
  },
  {
    event_id: "EVT-087-01",
    well_id: "W-087",
    well_name: "Duliajan-South-087",
    depth: 3412.0,
    depth_end: 3435.0,
    formation: "Barail Coal-Shale",
    event_type: "MUD_LOSS",
    severity: "HIGH",
    loss_rate_bbl_hr: 12.8,
    npt_hours: 14.0,
    description: "Sudden partial return loss of 12.8 bbl/hr while drilling Barail sandstone-coal interface at 3,412 m accompanied by SPP drop of 180 psi.",
    root_cause: "Depleted sub-hydrostatic fracture network in upper Barail horizon.",
    mitigation: "Pumped 20 bbl LCM pill (12 ppb Nut-Plug + 12 ppb Fine/Medium Mica + 5 ppb Graphite) and lowered MW from 1.25 sg to 1.22 sg.",
    outcome: "Wellbore sealed; losses arrested to 0.5 bbl/hr.",
    source_doc: "WCR_W087_Final.pdf",
    source_page: 14,
    date: "2025-07-14"
  },
  {
    event_id: "EVT-087-02",
    well_id: "W-087",
    well_name: "Duliajan-South-087",
    depth: 3430.0,
    depth_end: 3438.0,
    formation: "Barail Coal-Shale",
    event_type: "STUCK_PIPE",
    severity: "CRITICAL",
    loss_rate_bbl_hr: 4.5,
    npt_hours: 32.0,
    description: "BHA packed off at 3,430 m during wiper trip. Overpull reached 65 tonnes with standpipe pressure spiking to 3,150 psi (unable to rotate).",
    root_cause: "Sloughing carbonaceous shale & coal rubble settling around 8-1/2\" stabilizer after fluid loss reduced annular velocity.",
    mitigation: "Worked pipe with hydraulic jar (42 tonnes downward blow) + spotted 15 bbl organic spotting fluid. Backreamed out of hole at 40 RPM.",
    outcome: "String freed after 32 hours NPT; reconditioned mud with 3% KCl + asphaltic shale stabilizer.",
    source_doc: "WCR_W087_Final.pdf",
    source_page: 16,
    date: "2025-07-16"
  },
  {
    event_id: "EVT-098-01",
    well_id: "W-098",
    well_name: "Nahorkatiya-East-098",
    depth: 3405.0,
    depth_end: 3440.0,
    formation: "Barail Coal-Shale",
    event_type: "MUD_LOSS",
    severity: "HIGH",
    loss_rate_bbl_hr: 14.2,
    npt_hours: 11.5,
    description: "Partial mud losses of 14.2 bbl/hr recorded at 3,405 m immediately upon entering middle Barail coal-shale member.",
    root_cause: "High permeability micro-fractured coal cleat system intersecting deviated wellbore at 12.8 deg inclination.",
    mitigation: "Pre-sheared 25 bbl Sized Calcium Carbonate (CaCO3 50-150 micron) + 15 ppb Mica pill spotted across loss zone.",
    outcome: "Complete seal achieved in 65 minutes; zero further losses through remainder of Barail section.",
    source_doc: "MudLog_W098_Barail.pdf",
    source_page: 7,
    date: "2025-10-08"
  },
  {
    event_id: "EVT-105-01",
    well_id: "W-105",
    well_name: "Moran-North-105",
    depth: 3438.0,
    depth_end: 3455.0,
    formation: "Barail Coal-Shale",
    event_type: "MUD_LOSS",
    severity: "MEDIUM",
    loss_rate_bbl_hr: 9.6,
    npt_hours: 7.5,
    description: "Seepage to partial losses peaking at 9.6 bbl/hr between 3,438 m and 3,455 m in Barail formation.",
    root_cause: "Induced thermal/pressure micro-fracturing during high pump rate hole cleaning.",
    mitigation: "Continuous background addition of 6 ppb micronized cellulose fiber + 15 bbl Mica sweep.",
    outcome: "Losses controlled below 1 bbl/hr without stopping drilling.",
    source_doc: "DDR_W105_118.pdf",
    source_page: 4,
    date: "2026-03-11"
  },
  {
    event_id: "EVT-076-01",
    well_id: "W-076",
    well_name: "Duliajan-Central-076",
    depth: 2780.0,
    depth_end: 2795.0,
    formation: "Tipam Sandstone",
    event_type: "STUCK_PIPE",
    severity: "MEDIUM",
    loss_rate_bbl_hr: 1.5,
    npt_hours: 9.0,
    description: "Differential sticking tendency observed at 2,780 m while stationary for directional survey (28 tonnes overpull).",
    root_cause: "High overbalance (+340 psi) across high-permeability (520 mD) Tipam channel sand with thick filter cake.",
    mitigation: "Pumped 15 bbl diesel-surfactant pipe-lax pill and worked string free with 18 kNm torque.",
    outcome: "Pipe freed in 3.5 hours; added 4 ppb ultra-fine bridging CaCO3 to reduce API fluid loss to <4.2 ml/30min.",
    source_doc: "CementingReport_W076.pdf",
    source_page: 5,
    date: "2024-11-02"
  },
  {
    event_id: "EVT-098-02",
    well_id: "W-098",
    well_name: "Nahorkatiya-East-098",
    depth: 3790.0,
    depth_end: 3805.0,
    formation: "Kopili Shale",
    event_type: "KICK",
    severity: "HIGH",
    loss_rate_bbl_hr: 0.0,
    npt_hours: 22.0,
    description: "Pit gain of 6.5 bbl with background gas jumping from 18 units to 142 units (C1 89%, C2 7%) at 3,790 m in Kopili transition zone.",
    root_cause: "Pore pressure ramp in upper Kopili marine shale (1.31 sg equivalent) exceeding 1.26 sg mud weight.",
    mitigation: "Shut in well on annular BOP (SIDPP 280 psi, SICP 340 psi). Circulated out influx using Driller's Method and weighted mud up to 1.34 sg with barite.",
    outcome: "Well killed safely with zero surface incident.",
    source_doc: "MudLog_W098_Barail.pdf",
    source_page: 19,
    date: "2025-11-01"
  }
];

// Enrich wells with computed distance & event counts
const wells = rawWells.map((w) => {
  const dist = w.well_id === "W-101" ? 0.0 : haversineKm(activeLat, activeLon, w.latitude, w.longitude);
  const wellEvents = events.filter((e) => e.well_id === w.well_id);
  return {
    ...w,
    distance_km: dist,
    events_count: wellEvents.length,
    events: wellEvents
  };
});

// 4. Generate 3D Directional Trajectories for every well (0 to total_depth every 100m)
const trajectories = {};
for (const w of wells) {
  const pts = [];
  const maxDepth = w.well_id === "W-101" ? w.total_depth : w.current_depth;
  const step = 100;
  let north = w.surface_offset_z;
  let east = w.surface_offset_x;
  let tvd = 0;
  const azRad = (w.azimuth_deg * Math.PI) / 180;

  for (let md = 0; md <= maxDepth; md += step) {
    // Kick-off point around 1100m
    let inc = 0;
    if (md > 1100) {
      inc = Math.min(w.max_inclination_deg, ((md - 1100) / 1500) * w.max_inclination_deg);
    }
    const incRad = (inc * Math.PI) / 180;
    if (md > 0) {
      const dMd = step;
      tvd += dMd * Math.cos(incRad);
      const horiz = dMd * Math.sin(incRad);
      north += horiz * Math.cos(azRad);
      east += horiz * Math.sin(azRad);
    }
    pts.push({
      md: Number(md.toFixed(1)),
      tvd: Number(tvd.toFixed(1)),
      inclination: Number(inc.toFixed(2)),
      azimuth: w.azimuth_deg,
      north_m: Number(north.toFixed(1)),
      east_m: Number(east.toFixed(1)),
      formation: getFormationAtDepth(tvd),
      drilled: md <= w.current_depth
    });
  }
  trajectories[w.well_id] = pts;
}

// 5. Generate High-Resolution Depth-Indexed Well Logs (3000m to 3600m every 5m) for Comparison
function generateWellLogSeries(wellId, maxDrilledDepth) {
  const samples = [];
  for (let depth = 3000; depth <= 3600; depth += 5) {
    if (depth > maxDrilledDepth) break;
    const formation = getFormationAtDepth(depth);
    // Deterministic seeded variation based on depth and wellId
    const seed = Math.sin(depth * 0.09 + wellId.charCodeAt(4) * 1.7);
    const seed2 = Math.cos(depth * 0.05 + wellId.charCodeAt(3));

    let rop = 19.5 + seed * 3.2;
    let wob = 12.0 + seed2 * 1.8;
    let rpm = 118 + Math.round(seed * 6);
    let torque = 24.5 + seed * 2.5;
    let spp = 2480 + seed2 * 85;
    let mw = depth < 3100 ? 1.18 : 1.24;
    let loss = 0.2 + Math.max(0, seed * 0.4);
    let gas = 12 + Math.max(0, seed2 * 8);

    // Inject authentic physical signature in Barail Danger Zone (3400 - 3455m)
    if (depth >= 3375 && depth <= 3395 && wellId === "W-101") {
      // W-101 approaching danger zone: early precursor tremors (torque creeping up, gas rising)
      const factor = (depth - 3375) / 20;
      torque += factor * 6.8; // up to 31.3 kNm
      rop -= factor * 1.4;
      gas += factor * 14;
      loss = Number((0.4 + factor * 1.2).toFixed(2));
    }

    if (depth >= 3405 && depth <= 3455) {
      if (wellId === "W-093") {
        // Severe Mud Loss & Torque spike on W-093
        loss = depth >= 3420 && depth <= 3445 ? Number((13.5 + Math.abs(seed) * 2.5).toFixed(2)) : 5.2;
        torque = Number((32.0 + Math.abs(seed) * 4.8).toFixed(2));
        spp = Number((2190 - Math.abs(seed2) * 90).toFixed(0)); // pressure drop during loss
        rop = Number((24.5 + Math.abs(seed) * 3.0).toFixed(1)); // drilling break in fractured coal
        gas = Number((48 + Math.abs(seed2) * 25).toFixed(1));
      } else if (wellId === "W-087") {
        // Mud loss + Stuck pipe signature on W-087
        loss = depth >= 3410 && depth <= 3435 ? Number((11.2 + Math.abs(seed) * 2.0).toFixed(2)) : 3.8;
        torque = Number((35.5 + Math.abs(seed2) * 5.2).toFixed(2));
        spp = depth >= 3425 ? Number((2980 + Math.abs(seed) * 180).toFixed(0)) : 2310; // pack-off pressure spike
        rop = Number((9.5 - Math.abs(seed) * 2.5).toFixed(1));
        gas = Number((39 + Math.abs(seed) * 18).toFixed(1));
      } else if (wellId === "W-098") {
        // Mud loss on W-098
        loss = depth >= 3405 && depth <= 3440 ? Number((12.4 + Math.abs(seed2) * 2.2).toFixed(2)) : 2.1;
        torque = Number((29.5 + Math.abs(seed) * 3.1).toFixed(2));
        spp = Number((2280 - Math.abs(seed) * 60).toFixed(0));
        gas = Number((42 + Math.abs(seed2) * 15).toFixed(1));
      } else if (wellId === "W-101") {
        // Simulated continuation if user steps W-101 into 3400+ zone
        loss = Number((8.5 + Math.abs(seed) * 4.5).toFixed(2));
        torque = Number((32.4 + Math.abs(seed) * 3.5).toFixed(2));
        spp = Number((2290 - Math.abs(seed2) * 70).toFixed(0));
        gas = Number((44 + Math.abs(seed) * 18).toFixed(1));
      }
    }

    samples.push({
      depth,
      formation,
      rop_m_hr: Number(rop.toFixed(1)),
      wob_tonnes: Number(wob.toFixed(1)),
      rpm: Math.round(rpm),
      torque_knm: Number(torque.toFixed(1)),
      spp_psi: Math.round(spp),
      mud_weight_sg: Number(mw.toFixed(2)),
      flow_in_lpm: 2100,
      flow_out_lpm: Math.round(2100 - loss * 2.65),
      mud_loss_bbl_hr: Number(loss.toFixed(2)),
      gas_units: Number(gas.toFixed(1)),
      ecd_sg: Number((mw + 0.06).toFixed(2))
    });
  }
  return samples;
}

const wellLogs = {
  "W-101": generateWellLogSeries("W-101", 3450), // Pre-computed up to 3450m for live playback simulation!
  "W-093": generateWellLogSeries("W-093", 3600),
  "W-087": generateWellLogSeries("W-087", 3600),
  "W-098": generateWellLogSeries("W-098", 3600)
};

// 6. Historical & Research Documents Repository (with SHA-256 Hashes & Verbatim Content)
const rawDocuments = [
  {
    document_id: "DOC-W093-DDR-142",
    well_id: "W-093",
    document_type: "Daily Drilling Report (DDR)",
    filename: "DDR_W093_142.pdf",
    date: "2026-01-19",
    author: "Sr. Drilling Supt. R.K. Borgohain (OIL Duliajan)",
    pages: 4,
    formation: "Barail Coal-Shale",
    depth_interval: "3,410 m – 3,448 m",
    summary: "Daily Drilling Report #142 for Well Nahorkatiya-093 documenting severe 15.4 bbl/hr mud losses at 3,428 m in Barail Coal-Shale and successful stabilization using 25 bbl Nut-Plug/Mica/CaCO3 LCM pill.",
    extracted_entities: {
      well: "W-093",
      depth_m: 3428.0,
      formation: "Barail Coal-Shale",
      event: "Mud Loss",
      severity: "CRITICAL",
      loss_rate_bbl_hr: 15.4,
      mud_weight_sg: 1.24,
      ecd_sg: 1.31,
      mitigation: "25 bbl High-Concentration LCM Pill (15 ppb Medium Nut-Plug + 10 ppb Coarse Flake Mica + 8 ppb Sized CaCO3)",
      outcome: "Losses reduced to <0.8 bbl/hr within 90 minutes"
    },
    verbatim_excerpt: "08:30 - 11:00 HRS: Drilling 8-1/2\" hole in Barail Coal-Shale from 3,418 m to 3,428 m with 1.24 sg KCl-Polymer mud. At 3,428 m, encountered sudden drilling break (ROP jumped from 18.2 to 27.4 m/hr) followed by 180 psi SPP drop and dynamic mud loss of 15.4 bbl/hr into micro-cleated coal fractures. Reduced flow rate from 2,150 LPM to 1,750 LPM. Spotted 25 bbl LCM pill (15 ppb Medium Nut-Plug + 10 ppb Coarse Flake Mica + 8 ppb Sized CaCO3 150-micron) across 3,415-3,448 m. Soaked for 45 mins under 150 psi squeeze pressure. Full returns re-established; dynamic seepage <0.8 bbl/hr."
  },
  {
    document_id: "DOC-W087-WCR-FINAL",
    well_id: "W-087",
    document_type: "Well Completion Report (WCR)",
    filename: "WCR_W087_Final.pdf",
    date: "2025-08-29",
    author: "Wellsite Geology & Drilling Engineering Directorate, OIL",
    pages: 28,
    formation: "Barail Coal-Shale",
    depth_interval: "3,390 m – 3,460 m",
    summary: "Comprehensive Well Completion Report for Duliajan-South-087 detailing 12.8 bbl/hr mud loss at 3,412 m followed by mechanical pipe sticking (32 hrs NPT) at 3,430 m due to coal sloughing.",
    extracted_entities: {
      well: "W-087",
      depth_m: 3430.0,
      formation: "Barail Coal-Shale",
      event: "Stuck Pipe & Mud Loss",
      severity: "CRITICAL",
      loss_rate_bbl_hr: 12.8,
      overpull_tonnes: 65.0,
      mitigation: "20 bbl LCM Pill + Hydraulic jarring (42T) + 15 bbl Organic Spotting Fluid + 3% KCl/Asphaltene inhibition",
      outcome: "String jarred free after 32 hrs NPT; hole stabilized"
    },
    verbatim_excerpt: "SECTION 4.3 - DRILLING HAZARDS & NPT ANALYSIS: While drilling Barail Coal-Shale at 3,412 m, partial circulation losses of 12.8 bbl/hr reduced annular velocity in the 8-1/2\" section. During subsequent wiper trip at 3,430 m, splintery coal and carbonaceous shale cavings bridged around the upper stabilizer, causing immediate mechanical pack-off (65 tonnes overpull, 3,150 psi SPP). String was freed by spotting 15 bbl organic surfactant pill and downward jarring at 42 tonnes. LESSON LEARNED: In Barail horizon (3,400–3,450 m), always pre-treat mud with 6 ppb micronized LCM and asphaltic shale inhibitor prior to crossing 3,400 m to prevent filtrate-induced coal sloughing."
  },
  {
    document_id: "DOC-W098-MUDLOG",
    well_id: "W-098",
    document_type: "Geological Mud Logging Report",
    filename: "MudLog_W098_Barail.pdf",
    date: "2025-11-24",
    author: "Geolog / OIL Mud Logging Unit #07",
    pages: 22,
    formation: "Barail Coal-Shale & Kopili Shale",
    depth_interval: "3,100 m – 4,010 m",
    summary: "Final Mud Logging & Pore Pressure Report for Nahorkatiya-East-098 covering Barail coal fracture losses (3,405 m) and Kopili Shale high-pressure gas kick (3,790 m).",
    extracted_entities: {
      well: "W-098",
      depth_m: 3405.0,
      formation: "Barail Coal-Shale",
      event: "Mud Loss & Connection Gas",
      severity: "HIGH",
      loss_rate_bbl_hr: 14.2,
      gas_peak_units: 142.0,
      mitigation: "25 bbl Sized CaCO3 (50-150 micron) + 15 ppb Mica pill; Driller's Method well kill at 3,790 m with 1.34 sg mud",
      outcome: "100% wellbore seal achieved in 65 minutes"
    },
    verbatim_excerpt: "LITHOLOGY & GAS LOG (3,400–3,445 m): Cuttings consist of 45% black vitreous sub-bituminous coal with orthogonal cleat planes, 35% dark grey fissile carbonaceous shale, and 20% fine argillaceous sandstone. At 3,405 m MD (3,368 m TVD), mud pit active sensor recorded 14.2 bbl/hr dynamic loss. Pumped pre-mixed 25 bbl CaCO3 (50-150 micron) + 15 ppb Mica pill; fracture network bridged effectively within 65 minutes."
  },
  {
    document_id: "DOC-W105-DDR-118",
    well_id: "W-105",
    document_type: "Daily Drilling Report (DDR)",
    filename: "DDR_W105_118.pdf",
    date: "2026-03-11",
    author: "Drilling Operations Cell, Moran Extension",
    pages: 3,
    formation: "Barail Coal-Shale",
    depth_interval: "3,420 m – 3,465 m",
    summary: "Daily Drilling Report #118 demonstrating preventive background LCM treatment in Moran-North-105 that restricted Barail mud losses to 9.6 bbl/hr with zero stuck-pipe NPT.",
    extracted_entities: {
      well: "W-105",
      depth_m: 3438.0,
      formation: "Barail Coal-Shale",
      event: "Partial Seepage Loss",
      severity: "MEDIUM",
      loss_rate_bbl_hr: 9.6,
      mitigation: "Continuous background 6 ppb micronized cellulose fiber + 15 bbl Mica sweep",
      outcome: "Drilled through Barail hazard zone with zero trip NPT"
    },
    verbatim_excerpt: "14:00 - 20:00 HRS: Based on offset correlation from W-093 and W-087, pre-treated active system with 6 ppb micronized cellulose fiber at 3,385 m prior to entering middle Barail coal seams. Observed partial losses of 9.6 bbl/hr at 3,438 m which rapidly self-healed to <1.0 bbl/hr following a 15 bbl Mica sweep. Confirmed effectiveness of pre-emptive wellbore strengthening."
  },
  {
    document_id: "DOC-W076-CEMENT",
    well_id: "W-076",
    document_type: "Casing & Cementing Report",
    filename: "CementingReport_W076.pdf",
    date: "2024-11-02",
    author: "OIL Well Engineering & Cementing Services",
    pages: 9,
    formation: "Tipam Sandstone",
    depth_interval: "2,400 m – 3,100 m",
    summary: "9-5/8\" Intermediate Casing & Differential Sticking Incident Report in Tipam Sandstone at 2,780 m.",
    extracted_entities: {
      well: "W-076",
      depth_m: 2780.0,
      formation: "Tipam Sandstone",
      event: "Differential Pipe Sticking",
      severity: "MEDIUM",
      loss_rate_bbl_hr: 1.5,
      mitigation: "15 bbl surfactant pipe-lax pill + low-density lightweight lead cement slurry (1.42 sg)",
      outcome: "String freed in 3.5 hrs; 9-5/8\" casing cemented with 98% bond log index"
    },
    verbatim_excerpt: "OPERATIONAL SUMMARY: Differential sticking encountered at 2,780 m across high-permeability (520 mD) Tipam sandstone due to 340 psi hydrostatic overbalance. Freed pipe using 15 bbl organic surfactant spotting fluid. Subsequent 9-5/8\" casing cementing utilized fiber-laced 1.42 sg lead slurry to prevent breakdown across weak Tipam-Barail transition."
  },
  {
    document_id: "DOC-OIL-RES-2025",
    well_id: "FIELD-STUDY",
    document_type: "Research Paper & Technical Study",
    filename: "OIL_UpperAssam_Barail_Loss_Study_2025.pdf",
    date: "2025-12-10",
    author: "Center of Excellence for Energy Studies (CoEES) & Oil India R&D, Duliajan",
    pages: 18,
    formation: "Barail Coal-Shale (Regional)",
    depth_interval: "3,380 m – 3,470 m",
    summary: "Geomechanical & Cleat-Permeability Study of Oligocene Barail Coal-Shale across 24 Wells in Greater Duliajan and Nahorkatiya Fields.",
    extracted_entities: {
      well: "REGIONAL-ASSAM",
      depth_m: 3400.0,
      formation: "Barail Coal-Shale",
      event: "Regional Cleat Fracture Loss & Wellbore Instability",
      severity: "HIGH",
      loss_rate_bbl_hr: 14.5,
      mitigation: "Proactive Stress-Caging at 3,385 m using bimodal CaCO3 (50/150 micron) + Nut-Plug + Mica pill prior to penetrating 3,400 m coal horizon",
      outcome: "Reduces Barail non-productive time (NPT) by 74% across field trials"
    },
    verbatim_excerpt: "EXECUTIVE FINDINGS (CoEES / OIL R&D): Statistical analysis of 24 directional wells in Block NHR-04 and NHR-05 reveals a 68% incidence of severe lost circulation (10–22 bbl/hr) and subsequent coal-packoff stuck pipe within a narrow 50-meter depth window (3,400 m to 3,450 m MD) inside the middle Barail Coal-Shale member. Because Barail coal cleats possess aperture widths of 80–220 microns, conventional bentonite mud fails to bridge until massive losses occur. Proactive wellbore strengthening ('Stress Caging') must be initiated 15 to 25 meters ABOVE the 3,400 m top—specifically at 3,380–3,390 m—by staging a 25 bbl bimodal LCM pill (15 ppb Nut-Plug + 10 ppb Flake Mica + 8 ppb Sized CaCO3) and restricting ECD below 1.28 sg."
  }
].map((doc) => ({
  ...doc,
  sha256_fingerprint: sha256(doc.document_id + doc.verbatim_excerpt)
}));

// 7. Initial Immutable Audit Trail Entries
const auditLogs = [
  {
    log_id: "AUD-2026-001",
    timestamp: "2026-09-24T06:00:12Z",
    user_id: "SYSTEM-INGEST-DAEMON",
    role: "SYSTEM_ADMIN",
    action: "DOCUMENT_CORPUS_VERIFIED",
    target_id: "6_OFFSET_REPORTS",
    details: "Verified SHA-256 cryptographic hashes for W-093, W-087, W-098, W-105, W-076 reports and CoEES Regional Study.",
    sha256_signature: sha256("AUD-2026-001-VERIFIED")
  },
  {
    log_id: "AUD-2026-002",
    timestamp: "2026-09-24T06:15:44Z",
    user_id: "ENG-DULIAJAN-482",
    role: "DRILLING_ENGINEER",
    action: "ACTIVE_WELL_SYNC",
    target_id: "W-101",
    details: "Synchronized eRTMAC real-time WITSML stream for Well W-101 (Nahorkatiya-101) at 3,385.0 m in Barail Coal-Shale.",
    sha256_signature: sha256("AUD-2026-002-SYNC")
  },
  {
    log_id: "AUD-2026-003",
    timestamp: "2026-09-24T06:16:02Z",
    user_id: "NWIS-RISK-ENGINE",
    role: "AI_DECISION_SUPPORT",
    action: "PROACTIVE_ALERT_ISSUED",
    target_id: "ALT-W101-3400-BARAIL",
    details: "Lookahead buffer detected high-risk Barail coal-fracture interval (3,400–3,450 m) 15.0 m ahead of bit. 4 of 7 offset wells affected.",
    sha256_signature: sha256("AUD-2026-003-ALERT")
  }
];

const fullDataset = {
  metadata: {
    system_name: "eRTMAC-NWIS: Nearby Wells Intelligence System",
    problem_statement: "SIH26121 - Oil India Limited (OIL)",
    basin: "Upper Assam Basin (Greater Duliajan / Nahorkatiya Block)",
    generated_at: new Date().toISOString(),
    security: {
      air_gapped_local_ai: true,
      encryption: "AES-256-GCM",
      integrity: "SHA-256 Document Fingerprinting",
      zero_cloud_egress: true
    }
  },
  formations,
  wells,
  events,
  trajectories,
  wellLogs,
  documents: rawDocuments,
  auditLogs
};

const outPath = path.join(__dirname, "nwis_dataset.json");
fs.writeFileSync(outPath, JSON.stringify(fullDataset, null, 2), "utf-8");
console.log("Successfully generated Upper Assam Basin dataset at:", outPath);
