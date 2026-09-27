import React from 'react';
import {
  Radar,
  AlertCircle,
  FileText,
  ExternalLink,
  Target,
  Compass
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 select-none">
      {/* Left 7 Cols: 2D GIS Radar Card */}
      <div className="lg:col-span-7 bg-white dark:bg-[#141A28] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm flex flex-col justify-between transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 border-b border-slate-100 dark:border-white/10">
          <div>
            <h3 className="text-sm font-extrabold text-[#1E3A8A] dark:text-blue-300 flex items-center gap-2">
              <Radar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              2D GIS Nearby Offset Well Radar — Greater Duliajan Block
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Spatial query centered on Active Rig <strong className="text-slate-800 dark:text-slate-200">W-101</strong> ({activeWell.latitude}°N, {activeWell.longitude}°E)
            </p>
          </div>

          <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-[#090D16] px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-white/10">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Radius:</span>
            <input
              type="range"
              min={2}
              max={16}
              step={0.5}
              value={radiusKm}
              onChange={(e) => onRadiusChange(Number(e.target.value))}
              className="w-24 accent-blue-600 cursor-pointer"
            />
            <span className="text-xs font-mono font-black text-blue-600 dark:text-blue-400">{radiusKm} km</span>
          </div>
        </div>

        <div className="relative flex items-center justify-center my-3 bg-slate-50 dark:bg-[#090D16] rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden">
          <svg viewBox="0 0 500 420" className="w-full max-h-[410px] select-none">
            <rect width="500" height="420" fill="currentColor" className="text-slate-50 dark:text-[#090D16]" />

            {[4, 8, 12, 16].map((km) => {
              const rPx = km * 1000 * SCALE;
              return (
                <g key={km}>
                  <circle
                    cx="250"
                    cy="210"
                    r={rPx}
                    fill="none"
                    stroke="currentColor"
                    className="text-slate-300 dark:text-slate-700/60"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={254}
                    y={210 - rPx + 12}
                    fill="currentColor"
                    className="text-slate-400 dark:text-slate-500"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    {km} km
                  </text>
                </g>
              );
            })}

            <line x1="250" y1="10" x2="250" y2="410" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="1" />
            <line x1="20" y1="210" x2="480" y2="210" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="1" />

            <circle
              cx="250"
              cy="210"
              r={radiusKm * 1000 * SCALE}
              fill="rgba(37, 99, 235, 0.08)"
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
                : w.risk_rating === 'HIGH'
                ? '#EA580C'
                : '#2563EB';

              return (
                <g
                  key={w.well_id}
                  className="cursor-pointer transition-transform"
                  onClick={() => onSelectWell(w.well_id)}
                >
                  {isSel && (
                    <circle
                      cx={wx}
                      cy={wy}
                      r="16"
                      fill="none"
                      stroke="#2563EB"
                      strokeWidth="2"
                      strokeDasharray="3 3"
                      className="animate-spin origin-center"
                      style={{ transformOrigin: `${wx}px ${wy}px` }}
                    />
                  )}
                  <circle
                    cx={wx}
                    cy={wy}
                    r={isActive ? 11 : isSel ? 9 : 7}
                    fill={color}
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    className="drop-shadow-sm transition-all hover:scale-125"
                  />
                  <text
                    x={wx + 11}
                    y={wy + 4}
                    fill="currentColor"
                    className={`text-[11px] ${
                      isSel
                        ? 'font-black text-blue-600 dark:text-blue-400'
                        : 'font-bold text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {w.well_id}
                  </text>
                  {inRad && !isActive && (
                    <text
                      x={wx + 11}
                      y={wy + 15}
                      fill="currentColor"
                      className="text-[9px] font-mono text-slate-400 dark:text-slate-500"
                    >
                      {w.distance_km}km
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        <div className="flex flex-wrap items-center justify-between text-xs pt-3 border-t border-slate-100 dark:border-white/10 text-slate-600 dark:text-slate-400 font-medium">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              Active Rig (W-101)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
              Critical Hazard Offset
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              Offset Analog
            </span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {wellsInRadius.length} offset wells inside {radiusKm}km perimeter
          </span>
        </div>
      </div>

      {/* Right 5 Cols: Selected Well Dossier Card */}
      <div className="lg:col-span-5 bg-white dark:bg-[#141A28] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm flex flex-col justify-between transition-colors">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
            <div>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Selected Offset Well Dossier
              </span>
              <h3 className="text-base font-black text-[#1E3A8A] dark:text-blue-300 mt-1">
                {selectedWell.well_id} — {selectedWell.well_name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {selectedWell.field} • {selectedWell.latitude}°N, {selectedWell.longitude}°E
              </p>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Distance</div>
              <div className="text-lg font-black text-blue-600 dark:text-blue-400 font-mono">
                {selectedWell.distance_km} km
              </div>
            </div>
          </div>

          <div className="mt-3.5 bg-slate-50 dark:bg-[#090D16] p-3.5 rounded-xl border border-slate-200 dark:border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#1E3A8A] dark:text-blue-300">
                Multi-Factor Offset Similarity
              </span>
              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {selectedWell.overall_similarity_pct}% Match
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  <span>Formation Alignment (Barail Coal-Shale):</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                    {selectedWell.formation_similarity_pct}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${selectedWell.formation_similarity_pct}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  <span>Drilling Mechanics &amp; Mud Regime:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {selectedWell.parameter_similarity_pct}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full"
                    style={{ width: `${selectedWell.parameter_similarity_pct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2.5">
            <div className="text-xs font-extrabold text-[#1E3A8A] dark:text-blue-300 flex items-center justify-between">
              <span>Recorded Drilling Incidents ({selectedWell.events?.length || 0})</span>
              <span className="text-slate-500 dark:text-slate-400 font-mono font-medium">
                TD: {selectedWell.total_depth} m
              </span>
            </div>

            {selectedWell.events && selectedWell.events.length > 0 ? (
              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                {selectedWell.events.map((ev) => (
                  <div
                    key={ev.event_id}
                    onClick={() => onInspectEvent(ev)}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-white/10 hover:border-blue-400 dark:hover:border-blue-600 transition cursor-pointer space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1E3A8A] dark:text-blue-300 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                        {ev.event_type.replace('_', ' ')} @ {ev.depth} m
                      </span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/70 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800">
                        {ev.severity} • NPT {ev.npt_hours}h
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-snug">
                      {ev.description}
                    </p>
                    <div className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-lg">
                      <strong>Mitigation:</strong> {ev.mitigation}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                      <span className="flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400">
                        <FileText className="w-3.5 h-3.5" />
                        {ev.source_doc} (Page {ev.source_page})
                      </span>
                      <a
                        href={`/api/docs/${ev.source_doc}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-0.5"
                      >
                        Open PDF <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-white/10 text-xs text-slate-600 dark:text-slate-400 text-center">
                Active Well W-101 is drilling at {selectedWell.current_depth} m. Select an offset well on the map to inspect historical incidents.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
