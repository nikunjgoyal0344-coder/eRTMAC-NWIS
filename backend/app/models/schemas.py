from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class FormationLayer(BaseModel):
    formation_id: str
    name: str
    top_depth: float
    bottom_depth: float
    lithology: str
    color: str
    porosity_pct: float
    permeability_md: float
    risk_level: str
    typical_hazards: List[str]
    description: str

class SurveyPoint(BaseModel):
    md: float
    tvd: float
    inclination: float
    azimuth: float
    north_m: float
    east_m: float
    formation: str

class DrillingEvent(BaseModel):
    event_id: str
    well_id: str
    well_name: str
    depth: float
    depth_end: float
    formation: str
    event_type: str  # MUD_LOSS, STUCK_PIPE, TORQUE_SPIKE, KICK, WELLBORE_INSTABILITY
    severity: str    # LOW, MEDIUM, HIGH, CRITICAL
    loss_rate_bbl_hr: Optional[float] = 0.0
    npt_hours: float
    description: str
    root_cause: str
    mitigation: str
    outcome: str
    source_doc: str
    source_page: int
    date: str

class WellSummary(BaseModel):
    well_id: str
    well_name: str
    latitude: float
    longitude: float
    field: str
    block: str
    status: str  # DRILLING, COMPLETED, SUSPENDED
    spud_date: str
    completion_date: Optional[str] = None
    current_depth: float
    total_depth: float
    current_formation: str
    distance_km: Optional[float] = 0.0
    formation_similarity_pct: float
    parameter_similarity_pct: float
    overall_similarity_pct: float
    risk_rating: str  # LOW, MEDIUM, HIGH, CRITICAL
    rig_name: str
    elevation_m: float
    events_count: int

class TelemetrySample(BaseModel):
    depth: float
    formation: str
    rop_m_hr: float
    wob_tonnes: float
    rpm: float
    torque_knm: float
    spp_psi: float
    mud_weight_sg: float
    flow_in_lpm: float
    flow_out_lpm: float
    mud_loss_bbl_hr: float
    gas_units: float
    ecd_sg: float

class ProactiveAlert(BaseModel):
    alert_id: str
    active: bool
    severity: str
    title: str
    current_well: str
    current_depth: float
    current_formation: str
    danger_zone_top: float
    danger_zone_bottom: float
    distance_to_zone_m: float
    primary_hazard: str
    secondary_hazard: str
    affected_offset_wells: int
    total_offset_wells_in_radius: int
    closest_similar_well: str
    closest_well_distance_km: float
    closest_well_similarity_pct: float
    confidence_pct: float
    why_seeing_this: List[str]
    recommended_actions: List[str]
    lcm_recipe: str
    evidence_citations: List[Dict[str, Any]]

class SearchQuery(BaseModel):
    query: str
    formation_filter: Optional[str] = None
    event_type_filter: Optional[str] = None
    max_radius_km: Optional[float] = 15.0

class AuditLogEntry(BaseModel):
    log_id: str
    timestamp: str
    user_id: str
    role: str
    action: str
    target_id: str
    details: str
    sha256_signature: str
