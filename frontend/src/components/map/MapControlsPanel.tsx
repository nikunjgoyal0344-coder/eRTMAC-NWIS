import React from 'react';
import { WellSummary, FormationLayer, DrillingEvent } from '../../types';
import { Search, Sliders, Layers, Eye, ShieldAlert, Compass } from 'lucide-react';

export interface MapControlsPanelProps {
  wells: WellSummary[];
  activeWell: WellSummary;
  radiusKm: number;
  onRadiusChange: (radius: number) => void;
  showTrajectories: boolean;
  onToggleTrajectories: () => void;
  showFormations: boolean;
  onToggleFormations: () => void;
  showIncidents: boolean;
  onToggleIncidents: () => void;
  showTerrain: boolean;
  onToggleTerrain: () => void;
  selectedWellId?: string;
  onSelectWell: (wellId: string) => void;
  isLightMode?: boolean;
}

export const MapControlsPanel: React.FC<MapControlsPanelProps> = ({
  wells,
  activeWell,
  radiusKm,
  onRadiusChange,
  showTrajectories,
  onToggleTrajectories,
  showFormations,
  onToggleFormations,
  showIncidents,
  onToggleIncidents,
  showTerrain,
  onToggleTerrain,
  selectedWellId,
  onSelectWell,
  isLightMode = true,
}) => {
  const nearbyWells = wells.filter((w) => {
    if (w.well_id === activeWell.well_id) return true;
    return (w.distance_km || 0) <= radiusKm;
  });

  return (
    <div className="w-80 bg-white dark:bg-[#141A28] border-r border-slate-200 dark:border-white/10 p-5 flex flex-col justify-between overflow-y-auto space-y-6 shrink-0 transition-colors select-none">
      <div className="space-y-5">
        {/* Title */}
        <div>
          <div className="flex items-center gap-2 text-[#1E3A8A] dark:text-blue-400 font-black text-sm">
            <Compass className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3>3D Subsurface Controls</h3>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
            Spatial radius &amp; geological layer filters
          </p>
        </div>

        {/* 1. Proximity Radius Selector */}
        <div className="bg-slate-50 dark:bg-[#090D16] p-3.5 rounded-xl border border-slate-200 dark:border-white/10">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-slate-700 dark:text-slate-200">Offset Search Radius:</span>
            <span className="font-extrabold text-blue-600 dark:text-blue-400 font-mono">{radiusKm} km</span>
          </div>
          <input
            type="range"
            min="2"
            max="20"
            step="0.5"
            value={radiusKm}
            onChange={(e) => onRadiusChange(Number(e.target.value))}
            className="w-full accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
            <span>2 km</span>
            <span>10 km</span>
            <span>20 km</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Wells in Range:{' '}
            <strong className="text-slate-800 dark:text-slate-100">{nearbyWells.length}</strong>{' '}
            (Active + {Math.max(0, nearbyWells.length - 1)} Offset)
          </p>
        </div>

        {/* 2. Layer Visibility Toggles */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Layer Overlays
          </span>

          <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-white/10 text-xs cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
            <span className="text-slate-700 dark:text-slate-200 font-semibold">Wellbore Trajectories</span>
            <input
              type="checkbox"
              checked={showTrajectories}
              onChange={onToggleTrajectories}
              className="accent-blue-600 w-4 h-4 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-white/10 text-xs cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
            <span className="text-slate-700 dark:text-slate-200 font-semibold">Stratigraphic Horizons</span>
            <input
              type="checkbox"
              checked={showFormations}
              onChange={onToggleFormations}
              className="accent-blue-600 w-4 h-4 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-white/10 text-xs cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
            <span className="text-slate-700 dark:text-slate-200 font-semibold">Historical NPT Event Pins</span>
            <input
              type="checkbox"
              checked={showIncidents}
              onChange={onToggleIncidents}
              className="accent-blue-600 w-4 h-4 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-white/10 text-xs cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
            <span className="text-slate-700 dark:text-slate-200 font-semibold">Surface Grid &amp; Radar Ring</span>
            <input
              type="checkbox"
              checked={showTerrain}
              onChange={onToggleTerrain}
              className="accent-blue-600 w-4 h-4 rounded cursor-pointer"
            />
          </label>
        </div>

        {/* 3. Nearby Wells List in Radius */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Wells in Selected Radius
          </span>
          <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
            {nearbyWells.map((w) => {
              const isAct = w.well_id === activeWell.well_id;
              const isSelected = selectedWellId === w.well_id;
              const isHighRisk = w.risk_rating === 'CRITICAL' || w.risk_rating === 'HIGH';

              return (
                <div
                  key={w.well_id}
                  onClick={() => onSelectWell(w.well_id)}
                  className={`p-2 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 font-bold text-blue-700 dark:text-blue-300'
                      : isAct
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 font-bold text-emerald-800 dark:text-emerald-300'
                      : 'bg-white dark:bg-[#090D16] border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        isAct
                          ? 'bg-emerald-500'
                          : isHighRisk
                          ? 'bg-red-500'
                          : 'bg-blue-500'
                      }`}
                    />
                    <span className="truncate">{w.well_name}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono shrink-0">
                    {isAct ? 'Active' : `${w.distance_km} km`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="pt-4 border-t border-slate-200 dark:border-white/10 space-y-2 text-[11px] text-slate-600 dark:text-slate-400">
        <span className="font-bold text-slate-700 dark:text-slate-300 text-xs block mb-1">
          Subsurface Legend
        </span>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-1.5 bg-blue-600 rounded-full" />
          <span>Active eRTMAC Well Path</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full" />
          <span>Offset Well Trajectory</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-red-600 rounded-full shadow-xs" />
          <span>Loss / Kick / Stuck Incident Pin</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-2 bg-slate-300 dark:bg-slate-600 rounded opacity-60" />
          <span>Formation Horizon Plane</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-1.5 bg-emerald-500 rounded-full" />
          <span>Active Drill Bit (Cone)</span>
        </div>
      </div>
    </div>
  );
};
