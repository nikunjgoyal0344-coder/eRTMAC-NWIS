export type UserRole = 'DRILLING_ENGINEER' | 'OPERATIONS_GEOLOGIST' | 'ERTMAC_SUPERINTENDENT' | 'SYSTEM_ADMIN';

export interface FormationLayer {
  formation_id: string;
  name: string;
  top_depth: number;
  bottom_depth: number;
  lithology: string;
  color: string;
  porosity_pct: number;
  permeability_md: number;
  risk_level: string;
  typical_hazards: string[];
  description: string;
}

export interface DrillingEvent {
  event_id: string;
  well_id: string;
  well_name: string;
  depth: number;
  depth_end: number;
  formation: string;
  event_type: string;
  severity: string;
  loss_rate_bbl_hr: number;
  npt_hours: number;
  description: string;
  root_cause: string;
  mitigation: string;
  outcome: string;
  source_doc: string;
  source_page: number;
  date: string;
}

export interface WellSummary {
  well_id: string;
  well_name: string;
  latitude: number;
  longitude: number;
  field: string;
  block: string;
  status: string;
  spud_date: string;
  completion_date: string | null;
  current_depth: number;
  total_depth: number;
  current_formation: string;
  distance_km: number;
  formation_similarity_pct: number;
  parameter_similarity_pct: number;
  overall_similarity_pct: number;
  risk_rating: string;
  rig_name: string;
  elevation_m: number;
  surface_offset_x: number;
  surface_offset_z: number;
  azimuth_deg: number;
  max_inclination_deg: number;
  events_count: number;
  events: DrillingEvent[];
}

export interface SurveyPoint {
  md: number;
  tvd: number;
  inclination: number;
  azimuth: number;
  north_m: number;
  east_m: number;
  formation: string;
  drilled: boolean;
}

export interface TelemetrySample {
  depth: number;
  formation: string;
  rop_m_hr: number;
  wob_tonnes: number;
  rpm: number;
  torque_knm: number;
  spp_psi: number;
  mud_weight_sg: number;
  flow_in_lpm: number;
  flow_out_lpm: number;
  mud_loss_bbl_hr: number;
  gas_units: number;
  ecd_sg: number;
}

export interface HistoricalDocument {
  document_id: string;
  well_id: string;
  document_type: string;
  filename: string;
  date: string;
  author: string;
  pages: number;
  formation: string;
  depth_interval: string;
  summary: string;
  extracted_entities: {
    well: string;
    depth_m: number;
    formation: string;
    event: string;
    severity: string;
    loss_rate_bbl_hr: number;
    mitigation: string;
    outcome: string;
    [key: string]: any;
  };
  verbatim_excerpt: string;
  sha256_fingerprint: string;
}

export interface AuditLogEntry {
  log_id: string;
  timestamp: string;
  user_id: string;
  role: string;
  action: string;
  target_id: string;
  details: string;
  sha256_signature: string;
}

export interface NWISDataset {
  metadata: any;
  formations: FormationLayer[];
  wells: WellSummary[];
  events: DrillingEvent[];
  trajectories: Record<string, SurveyPoint[]>;
  wellLogs: Record<string, TelemetrySample[]>;
  documents: HistoricalDocument[];
  auditLogs: AuditLogEntry[];
}
