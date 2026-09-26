"""
Geospatial Proximity & Stratigraphic Correlation Engine (Module 1)
Supports both PostGIS ST_DWithin and standalone Haversine spatial filtering.
"""
import math
from typing import List, Dict, Any

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2.0) ** 2
    return round(R * 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a)), 2)

def filter_nearby_wells(
    active_well: Dict[str, Any],
    all_wells: List[Dict[str, Any]],
    radius_km: float = 10.0
) -> List[Dict[str, Any]]:
    results = []
    for w in all_wells:
        if w["well_id"] == active_well["well_id"]:
            continue
        dist = haversine_distance_km(
            active_well["latitude"], active_well["longitude"],
            w["latitude"], w["longitude"]
        )
        if dist <= radius_km:
            w_copy = dict(w)
            w_copy["distance_km"] = dist
            results.append(w_copy)
    return sorted(results, key=lambda x: x["distance_km"])
