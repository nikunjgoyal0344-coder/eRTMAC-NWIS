"""
Multi-Factor Similarity & Predictive Risk Engine (Module 5)
Computes composite operational risk and generates 6-point explainable lookahead warnings.
"""
import math
from typing import Dict, Any, List

def evaluate_lookahead_risk(
    active_depth: float,
    formation: str,
    rop_m_hr: float,
    torque_knm: float,
    mud_weight_sg: float,
    flow_lpm: float,
    lcm_ppb: float = 0.0
) -> Dict[str, Any]:
    # Distance to historical Barail fracture window (3,400 - 3,450 m)
    dist_to_zone = max(0.0, 3400.0 - active_depth)
    in_zone = 3400.0 <= active_depth <= 3455.0
    depth_factor = 1.0 if in_zone else math.exp(-((dist_to_zone / 35.0) ** 2))

    # ECD calculation based on Mud Weight and Flow Rate
    annular_loss_sg = (flow_lpm / 2100.0) ** 1.8 * 0.065
    ecd_sg = round(mud_weight_sg + annular_loss_sg, 3)

    # Fracture threshold in Barail Coal-Shale is 1.275 sg without LCM stress-caging
    effective_fracture_grad = 1.275 + (lcm_ppb / 25.0) * 0.055
    overbalance_factor = max(0.0, (ecd_sg - effective_fracture_grad) * 8.5)

    # Composite probabilities
    raw_mud_loss = (0.45 * depth_factor + 0.35 * min(1.0, overbalance_factor) + 0.20) * 100.0
    mitigation_reduction = min(52.0, lcm_ppb * 1.85)
    mud_loss_prob = round(max(8.0, min(96.0, raw_mud_loss - mitigation_reduction)), 1)

    torque_anomaly = max(0.0, (torque_knm - 24.0) / 14.0)
    stuck_pipe_prob = round(max(6.0, min(92.0, (0.5 * (mud_loss_prob / 100.0) + 0.5 * torque_anomaly) * 100.0 - mitigation_reduction * 0.7)), 1)

    kick_prob = round(max(5.0, min(65.0, (1.28 - mud_weight_sg) * 180.0 + 14.0)), 1)

    estimated_npt_saved_hrs = round((mitigation_reduction / 52.0) * 24.5, 1)

    return {
        "active_depth": active_depth,
        "formation": formation,
        "computed_ecd_sg": ecd_sg,
        "effective_fracture_gradient_sg": round(effective_fracture_grad, 3),
        "mud_loss_probability_pct": mud_loss_prob,
        "stuck_pipe_probability_pct": stuck_pipe_prob,
        "kick_probability_pct": kick_prob,
        "estimated_npt_saved_hours": estimated_npt_saved_hrs,
        "estimated_cost_saved_lakhs_inr": round(estimated_npt_saved_hrs * 1.85, 1),
        "recommendation": (
            "OPTIMAL REGIME: Pre-emptive LCM pill & reduced flow keeps ECD below Barail coal fracture gradient."
            if ecd_sg <= effective_fracture_grad
            else "ELEVATED FRACTURE RISK: ECD exceeds Barail cleat gradient (1.275 sg). Lower pump rate to 1,750 LPM and spot 25 bbl Bimodal LCM pill."
        )
    }
