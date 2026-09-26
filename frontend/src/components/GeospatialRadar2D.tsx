import React from 'react';
import {
  Radar,
  AlertCircle,
  FileText,
  ExternalLink
} from 'lucide-react';
import { WellSummary, DrillingEvent } from '../types';

interface GeospatialRadar2DProps {
  wells: WellSummary[];
  radiusKm: number;
  onRadiusChange: (r: number) => void;
  selectedWellId: string;
  onSelectWell: (wellId: string) => void;
  onInspectEvent: (ev: DrillingEvent) => void;
}

export const GeospatialRadar2D: React.FC<GeospatialRadar2DProps> = ({
  wells,
  radiusKm,
  onRadiusChange,
  selectedWellId,
  onSelectWell,
  onInspectEvent
}) => {
  const activeWell = wells.find((w) => w.well_id === 'W-101') || wells[0];
  const selectedWell = wells.find((w) => w.well_id === selectedWellId) || wells[1] || activeWell;
  const wellsInRadius = wells.filter((w) => w.well_id !== 'W-101' && w.distance_km <= radiusKm);

  const SCALE = 210 / 12500;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Left 7 Cols: 2D GIS Radar Card */}
      <div className="lg:col-span-7 bg-white border border-blue-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold text-[#1E3A8A] flex items-center gap-2">
              <Radar className="w-5 h-5 text-blue-600" />
              2D GIS Nearby Offset Well Radar — Greater Duliajan Block
            </h3>
            <p className="text-xs text-slate-500">
              Spatial query centered on Active Well <strong className="text-slate-800">W-101</strong> ({activeWell.latitude}°N, {activeWell.longitude}°E)
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[#F8FAFC] px-3.5 py-1.5 rounded-xl border border-blue-100">
            <span className="text-xs font-bold text-[#1E3A8A]">Search Radius:</span>
            <input
              type="range"
              min={2}
              max={16}
              step={0.5}
              value={radiusKm}
              onChange={(e) => onRadiusChange(Number(e.target.value))}
              className="w-24 accent-blue-600 cursor-pointer"
            />
            <span className="text-xs font-mono font-extrabold text-blue-600">{radiusKm} km</span>
          </div>
        </div>

        <div className="relative flex items-center justify-center my-3 bg-[#F8FAFC] rounded-xl border border-blue-100 overflow-hidden">
          <svg viewBox="0 0 500 420" className="w-full max-h-[410px] select-none">
            <rect width="500" height="420" fill="#F8FAFC" />

            {[4, 8, 12, 16].map((km) => {
              const rPx = km * 1000 * SCALE;
              return (
                <g key={km}>
                  <circle
                    cx="250"
                    cy="210"
                    r={rPx}
                    fill="none"
                    stroke="#CBD5E1"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={254}
                    y={210 - rPx + 12}
                    fill="#64748B"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    {km} km
                  </text>
                </g>
              );
            })}

            <line x1="250" y1="10" x2="250" y2="410" stroke="#E2E8F0" strokeWidth="1" />
            <line x1="20" y1="210" x2="480" y2="210" stroke="#E2E8F0" strokeWidth="1" />

            <circle
              cx="250"
              cy="210"
              r={radiusKm * 1000 * SCALE}
              fill="rgba(37, 99, 235, 0.06)"
              stroke="#2563EB"
              strokeWidth="2"
            />

            {wells.map((w) => {
              if (w.well_id === 'W-101') return null;
              const wx = 250 + w.surface_offset_x * SCALE;
              const wy = 210 - w.surface_offset_z * SCALE;
              const inRad = w.distance_km <= radiusKm;
              const isSel = w.well_id === selectedWellId;

              return (
                <g key={`vec-${w.well_id}`}>
                  {inRad && (
                    <line
                      x1="250"
                      y1="210"
                      x2={wx}
                      y2={wy}
                      stroke={isSel ? '#2563EB' : '#94A3B8'}
                      strokeWidth={isSel ? '2.2' : '1.2'}
                      strokeDasharray={isSel ? 'none' : '3 3'}
                    />
                  )}
                </g>
              );
            })}

            {wells.map((w) => {
              const wx = 250 + w.surface_offset_x * SCALE;
              const wy = 210 - w.surface_offset_z * SCALE;
              const isActive = w.well_id === 'W-101';
              const inRad = isActive || w.distance_km <= radiusKm;
              const isSel = w.well_id === selectedWellId;

              const color = isActive
                ? '#16A34A'
                : !inRad
                ? '#94A3B8'
                : w.risk_rating === 'CRITICAL'
                ? '#DC2626'
                : '#2563EB';

              return (
                <g
                  key={w.well_id}
                  onClick={() => onSelectWell(w.well_id)}
                  className="cursor-pointer"
                >
                  {isSel && (
                    <circle
                      cx={wx}
                      cy={wy}
                      r="14"
                      fill="rgba(37, 99, 235, 0.12)"
                      stroke="#2563EB"
                      strokeWidth="2"
                    />
                  )}
                  <circle
                    cx={wx}
                    cy={wy}
                    r={isActive ? 8 : 6.5}
                    fill={color}
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />
                  <text
                    x={wx + 10}
                    y={wy + 4}
                    fill={isSel ? '#1E3A8A' : '#334155'}
                    fontSize="11"
                    fontWeight="bold"
                  >
                    {w.well_id} {isActive ? '★' : `(${w.distance_km} km)`}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="flex items-center justify-between text-xs bg-[#F8FAFC] px-4 py-2 rounded-xl border border-blue-100">
          <span className="text-slate-700 font-medium">
            Wells within <strong>{radiusKm} km</strong>:{' '}
            <strong className="text-blue-600">{wellsInRadius.length} Offset Wells</strong>
          </span>
          <div className="flex items-center gap-4 font-semibold">
            <span className="text-emerald-600">● Active Well</span>
            <span className="text-red-600">● Critical Loss/Stuck</span>
            <span className="text-blue-600">● Offset Well</span>
          </div>
        </div>
      </div>

      {/* Right 5 Cols: Selected Well Dossier Card */}
      <div className="lg:col-span-5 bg-white border border-blue-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Selected Offset Well Dossier
              </span>
              <h3 className="text-lg font-extrabold text-[#1E3A8A] mt-1">
                {selectedWell.well_id} — {selectedWell.well_name}
              </h3>
              <p className="text-xs text-slate-500">
                {selectedWell.field} • {selectedWell.latitude}°N, {selectedWell.longitude}°E
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500">Distance</div>
              <div className="text-xl font-black text-blue-600">{selectedWell.distance_km} km</div>
            </div>
          </div>

          <div className="mt-3 bg-[#F8FAFC] p-3.5 rounded-xl border border-blue-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-[#1E3A8A]">
                Multi-Factor Offset Similarity
              </span>
              <span className="text-sm font-black text-emerald-600">
                {selectedWell.overall_similarity_pct}% Match
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between text-slate-700 font-medium mb-1">
                  <span>Formation Alignment (Barail Coal-Shale):</span>
                  <span className="font-bold text-blue-600">{selectedWell.formation_similarity_pct}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600"
                    style={{ width: `${selectedWell.formation_similarity_pct}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-700 font-medium mb-1">
                  <span>Drilling Mechanics & Mud Regime:</span>
                  <span className="font-bold text-emerald-600">{selectedWell.parameter_similarity_pct}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600"
                    style={{ width: `${selectedWell.parameter_similarity_pct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2.5">
            <div className="text-xs font-extrabold text-[#1E3A8A] flex items-center justify-between">
              <span>Recorded Drilling Incidents ({selectedWell.events?.length || 0})</span>
              <span className="text-slate-500 font-medium">TD: {selectedWell.total_depth} m</span>
            </div>

            {selectedWell.events && selectedWell.events.length > 0 ? (
              <div className="space-y-2.5 max-h-[240px] overflow-y-auto pr-1">
                {selectedWell.events.map((ev) => (
                  <div
                    key={ev.event_id}
                    onClick={() => onInspectEvent(ev)}
                    className="p-3.5 rounded-xl bg-[#F8FAFC] border border-blue-100 hover:border-blue-300 transition cursor-pointer space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-[#1E3A8A] flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        {ev.event_type.replace('_', ' ')} @ {ev.depth} m
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                        {ev.severity} • NPT {ev.npt_hours}h
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{ev.description}</p>
                    <div className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                      <strong>Mitigation:</strong> {ev.mitigation}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span className="flex items-center gap-1 font-semibold text-blue-600">
                        <FileText className="w-3.5 h-3.5" />
                        {ev.source_doc} (Page {ev.source_page})
                      </span>
                      <a
                        href={`/api/docs/${ev.source_doc}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-blue-600 font-bold hover:underline flex items-center gap-0.5"
                      >
                        Open PDF <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 text-center">
                Active Well W-101 is drilling at {selectedWell.current_depth} m. Select an offset well on the map to inspect its historical events.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
