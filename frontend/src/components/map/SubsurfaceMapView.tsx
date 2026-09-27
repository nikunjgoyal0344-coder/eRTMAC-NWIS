import React, { useState, useMemo, useRef, useEffect } from 'react';
import { WellSummary, FormationLayer, DrillingEvent, SurveyPoint } from '../../types';
import { ThreeSubsurfaceMap } from './ThreeSubsurfaceMap';
import { MapControlsPanel } from './MapControlsPanel';
import {
  RotateCcw,
  Layers,
  Maximize2,
  Minimize2,
  Compass,
  AlertTriangle,
  Sliders,
  ShieldAlert,
  Info,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

export interface SubsurfaceMapViewProps {
  wells: WellSummary[];
  formations: FormationLayer[];
  events: DrillingEvent[];
  trajectories?: Record<string, SurveyPoint[]>;
  activeDepth?: number;
  radiusKm?: number;
  onRadiusChange?: (radius: number) => void;
  selectedWellId?: string;
  onSelectWell?: (wellId: string) => void;
  isLightMode?: boolean;
}

export const SubsurfaceMapView: React.FC<SubsurfaceMapViewProps> = ({
  wells,
  formations,
  events,
  trajectories = {},
  activeDepth = 3385,
  radiusKm: externalRadiusKm,
  onRadiusChange: externalOnRadiusChange,
  selectedWellId: externalSelectedWellId,
  onSelectWell: externalOnSelectWell,
  isLightMode = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const activeWell =
    wells.find((w) => w.well_id === 'W-101' || w.status?.toUpperCase() === 'DRILLING') ||
    wells[0] ||
    ({
      well_id: 'W-101',
      well_name: 'Duliajan-101 (Active Rig)',
      total_depth: 3850,
      current_depth: activeDepth,
      status: 'DRILLING',
      distance_km: 0,
    } as any);

  // Map state
  const [internalRadiusKm, setInternalRadiusKm] = useState<number>(externalRadiusKm || 10);
  const radiusKm = externalRadiusKm !== undefined ? externalRadiusKm : internalRadiusKm;
  const handleRadiusChange = (r: number) => {
    setInternalRadiusKm(r);
    if (externalOnRadiusChange) externalOnRadiusChange(r);
  };

  const [selectedWellId, setSelectedWellId] = useState<string>(
    externalSelectedWellId || activeWell.well_id
  );
  const handleSelectWell = (id: string) => {
    setSelectedWellId(id);
    if (externalOnSelectWell) externalOnSelectWell(id);
  };

  const [inspectedDepth, setInspectedDepth] = useState<number>(
    activeDepth || activeWell.current_depth || 3385
  );
  const [showTrajectories, setShowTrajectories] = useState(true);
  const [showFormations, setShowFormations] = useState(true);
  const [showIncidents, setShowIncidents] = useState(true);
  const [showTerrain, setShowTerrain] = useState(true);
  const [is2DView, setIs2DView] = useState(false);
  const [controlsCollapsed, setControlsCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Handle Fullscreen API & Fallbacks
  const toggleFullscreen = () => {
    if (!document.fullscreenElement && !isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {
          setIsFullscreen(true);
        });
      } else {
        setIsFullscreen(true);
      }
    } else {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {
          setIsFullscreen(false);
        });
      } else {
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Depth calculations
  const totalTD = activeWell.total_depth || 3850;
  const bitDepth = activeDepth || activeWell.current_depth || 3385;
  const bitPercent = Math.min(100, (inspectedDepth / totalTD) * 100);

  // Identify formation at inspected depth
  const currentFormation = useMemo(() => {
    return (
      formations.find(
        (f) => inspectedDepth >= f.top_depth && inspectedDepth <= f.bottom_depth
      ) ||
      formations[formations.length - 1] || {
        name: 'Barail Coal-Shale Sequence',
        description: 'Complex fractured coal-shale zone with low fracture gradient.',
      }
    );
  }, [formations, inspectedDepth]);

  // Identify incidents near inspected depth (within 40m)
  const nearbyIncidents = useMemo(() => {
    return events.filter((e) => Math.abs(e.depth - inspectedDepth) <= 40);
  }, [events, inspectedDepth]);

  const milestones = [
    { label: 'Surface', depth: 0, tag: '0m' },
    { label: 'Girujan', depth: 1200, tag: '1,200m' },
    { label: 'Tipam Sand', depth: 2400, tag: '2,400m' },
    { label: 'Barail Top', depth: 3100, tag: '3,100m' },
    { label: 'Active Bit', depth: bitDepth, tag: `${Math.round(bitDepth)}m` },
    { label: 'Loss Zone', depth: 3428, tag: '3,428m', hazard: true },
    { label: 'Kopili Top', depth: 3700, tag: '3,700m' },
    { label: 'Target TD', depth: totalTD, tag: `${totalTD}m` },
  ];

  return (
    <div
      ref={containerRef}
      className={`bg-white dark:bg-[#141A28] border border-slate-200 dark:border-white/10 shadow-sm flex flex-col ${
        isFullscreen
          ? 'fixed inset-0 z-[100] w-screen h-screen rounded-none bg-slate-900 border-none'
          : 'h-[640px] min-h-[580px] rounded-2xl'
      } overflow-hidden transition-all duration-150`}
    >
      {/* Top Map Header */}
      <div className="px-5 py-3 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-[#090D16] select-none shrink-0">
        <div className="flex items-center gap-3">
          {/* Collapse/Expand Left Controls Toggle Button */}
          <button
            onClick={() => setControlsCollapsed(!controlsCollapsed)}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            title={controlsCollapsed ? 'Show Controls Panel' : 'Hide Controls Panel (Maximize Canvas)'}
          >
            {controlsCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            ) : (
              <PanelLeftClose className="w-4 h-4 text-slate-500" />
            )}
          </button>

          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h2 className="text-sm font-extrabold text-[#1E3A8A] dark:text-blue-300">
              3D Subsurface Digital Twin &amp; Offset Proximity
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline font-medium">
              • Upper Assam Basin Formation Model
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Inspected Depth Display */}
          <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-[#141A28] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-mono shadow-2xs">
            <span className="text-slate-500 dark:text-slate-400 font-sans text-[11px]">
              Depth Slice:
            </span>
            <strong className="text-blue-600 dark:text-blue-400 font-black">
              {inspectedDepth} m MD
            </strong>
          </div>

          {/* 2D / 3D Toggle */}
          <div className="flex items-center bg-slate-200 dark:bg-slate-800 p-0.5 rounded-xl text-xs font-bold">
            <button
              onClick={() => setIs2DView(false)}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                !is2DView
                  ? 'bg-white dark:bg-[#141A28] text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              3D Ortho
            </button>
            <button
              onClick={() => setIs2DView(true)}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                is2DView
                  ? 'bg-white dark:bg-[#141A28] text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              2D Plan View
            </button>
          </div>

          {/* Prominent Fullscreen Toggle Button */}
          <button
            onClick={toggleFullscreen}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer ${
              isFullscreen
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'clay-btn-primary text-white'
            }`}
            title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Expand to Fullscreen View'}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Exit Fullscreen</span>
                <span className="text-[10px] bg-white/25 px-1 py-0.2 rounded font-mono ml-0.5">
                  ESC
                </span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Fullscreen</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Map Body: Left Controls + Center WebGL Canvas */}
      <div className="flex-1 flex overflow-hidden relative min-h-0">
        {/* Left Panel */}
        {!controlsCollapsed && (
          <MapControlsPanel
            wells={wells}
            activeWell={activeWell}
            radiusKm={radiusKm}
            onRadiusChange={handleRadiusChange}
            showTrajectories={showTrajectories}
            onToggleTrajectories={() => setShowTrajectories(!showTrajectories)}
            showFormations={showFormations}
            onToggleFormations={() => setShowFormations(!showFormations)}
            showIncidents={showIncidents}
            onToggleIncidents={() => setShowIncidents(!showIncidents)}
            showTerrain={showTerrain}
            onToggleTerrain={() => setShowTerrain(!showTerrain)}
            selectedWellId={selectedWellId}
            onSelectWell={handleSelectWell}
            isLightMode={isLightMode}
          />
        )}

        {/* Center WebGL Canvas */}
        <div className="flex-1 relative bg-slate-100 dark:bg-[#0B0F19] flex flex-col overflow-hidden min-h-0">
          <ThreeSubsurfaceMap
            wells={wells}
            activeWell={activeWell}
            formations={formations}
            events={events}
            trajectories={trajectories}
            radiusKm={radiusKm}
            inspectedDepth={inspectedDepth}
            showTrajectories={showTrajectories}
            showFormations={showFormations}
            showIncidents={showIncidents}
            showTerrain={showTerrain}
            is2DView={is2DView}
            onSelectWell={handleSelectWell}
            isLightMode={isLightMode}
          />

          {/* INGESTED SCANNED WELL FLOATING INDICATOR */}
          {wells.find((w) => (w as any).isUploaded) && (() => {
            const uploadedWell = wells.find((w) => (w as any).isUploaded)!;
            return (
              <div className="absolute top-4 left-4 bg-white/95 dark:bg-[#141A28]/95 backdrop-blur-xs px-3.5 py-2 rounded-xl border-2 border-emerald-500 shadow-md flex items-center gap-3 text-xs z-10 animate-in fade-in duration-300 select-none">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-slate-800 dark:text-slate-100 text-[11px]">
                      Ingested Scanned Site:
                    </span>
                    <span className="px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-black rounded">
                      LIVE IN 3D
                    </span>
                  </div>
                  <div className="text-slate-700 dark:text-slate-300 font-bold text-xs">
                    {uploadedWell.well_name}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Depth: {uploadedWell.total_depth}m • {uploadedWell.distance_km}km offset • Extracted Loss at 3,428m
                  </div>
                </div>
                <button
                  onClick={() => setInspectedDepth(3428)}
                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg shadow-xs transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                  title="Move 3D depth slice to extracted 3,428m loss zone"
                >
                  <span>Focus Loss Depth</span>
                  <span className="font-mono text-[10px] bg-emerald-700 px-1 rounded">3,428m</span>
                </button>
              </div>
            );
          })()}

          {/* FLOATING VERTICAL DEPTH INDICATOR HUD (Right side) */}
          <div className="absolute top-4 right-4 bg-white/95 dark:bg-[#141A28]/95 backdrop-blur-xs p-3.5 rounded-xl border border-slate-200 dark:border-white/10 shadow-lg flex gap-3 text-xs z-10 select-none">
            {/* Clickable Vertical Depth Bar */}
            <div
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickY = e.clientY - rect.top;
                const ratio = Math.max(0, Math.min(1, clickY / rect.height));
                setInspectedDepth(Math.round(ratio * totalTD));
              }}
              className={`relative w-6 ${
                isFullscreen ? 'h-80' : 'h-56'
              } bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 flex flex-col overflow-hidden shadow-inner cursor-pointer transition-all`}
              title="Click on vertical gauge to scrub depth slice"
            >
              <div
                className="h-[18%] bg-amber-100 dark:bg-amber-950/60 border-b border-slate-300 dark:border-slate-700"
                title="Dhekiajuli (0-1,200m)"
              />
              <div
                className="h-[28%] bg-slate-200 dark:bg-slate-700 border-b border-slate-300 dark:border-slate-700"
                title="Girujan Clay (1,200-2,400m)"
              />
              <div
                className="h-[20%] bg-amber-200 dark:bg-amber-900/60 border-b border-slate-300 dark:border-slate-700"
                title="Tipam Sandstone (2,400-3,100m)"
              />
              <div
                className="h-[22%] bg-red-100 dark:bg-red-950/70 border-b border-slate-300 dark:border-slate-700 relative"
                title="Barail Coal Sequence (3,100-3,700m)"
              >
                <div
                  className="absolute top-[52%] left-0 right-0 h-1.5 bg-red-600 animate-pulse"
                  title="Barail Loss Hazard at 3,428m"
                />
              </div>
              <div className="flex-1 bg-purple-200 dark:bg-purple-950/60" title="Kopili Shale (3,700-4,200m)" />

              {/* Inspected Depth Cursor Line */}
              <div
                className="absolute left-0 right-0 h-1.5 bg-blue-600 shadow-xs z-20 pointer-events-none"
                style={{ top: `${bitPercent}%` }}
              />
            </div>

            {/* Depth Numbers & Formation Labels */}
            <div className="flex flex-col justify-between text-[11px] font-mono py-0.5">
              <button
                onClick={() => setInspectedDepth(0)}
                className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 text-left cursor-pointer"
              >
                <span className="font-extrabold text-slate-800 dark:text-slate-100">0 m</span>
                <span className="text-slate-400 text-[10px] font-sans">Surface</span>
              </button>
              <button
                onClick={() => setInspectedDepth(1200)}
                className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 text-left cursor-pointer"
              >
                <span className="text-slate-600 dark:text-slate-400">1,200 m</span>
                <span className="text-slate-400 text-[10px] font-sans">Girujan</span>
              </button>
              <button
                onClick={() => setInspectedDepth(2400)}
                className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 text-left cursor-pointer"
              >
                <span className="text-slate-600 dark:text-slate-400">2,400 m</span>
                <span className="text-amber-700 dark:text-amber-400 text-[10px] font-sans font-semibold">
                  Tipam
                </span>
              </button>
              <button
                onClick={() => setInspectedDepth(bitDepth)}
                className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-lg border border-emerald-300 dark:border-emerald-700 -mx-1 text-left cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span className="font-black text-emerald-800 dark:text-emerald-300 text-[11px]">
                  {Math.round(bitDepth)} m
                </span>
                <span className="text-emerald-700 dark:text-emerald-400 text-[10px] font-sans font-bold">
                  Live Bit
                </span>
              </button>
              <button
                onClick={() => setInspectedDepth(3428)}
                className="flex items-center gap-1.5 text-red-700 dark:text-red-400 font-black hover:underline text-left cursor-pointer"
              >
                <span>3,428 m</span>
                <span className="text-[10px] font-sans font-bold">⚠️ Loss Zone</span>
              </button>
              <button
                onClick={() => setInspectedDepth(3700)}
                className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 text-left cursor-pointer"
              >
                <span className="text-slate-600 dark:text-slate-400">3,700 m</span>
                <span className="text-purple-700 dark:text-purple-400 text-[10px] font-sans">
                  Kopili
                </span>
              </button>
              <button
                onClick={() => setInspectedDepth(totalTD)}
                className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 text-left cursor-pointer"
              >
                <span className="font-extrabold text-slate-800 dark:text-slate-100">
                  {totalTD} m
                </span>
                <span className="text-slate-400 text-[10px] font-sans">Target TD</span>
              </button>
            </div>
          </div>

          {/* FLOATING DEPTH INSPECTION CARD (Bottom Left of Canvas) */}
          <div
            className={`absolute ${
              isFullscreen ? 'bottom-28 left-6 max-w-md' : 'bottom-24 left-4 max-w-sm'
            } bg-white/95 dark:bg-[#141A28]/95 backdrop-blur-xs p-3.5 rounded-xl border border-slate-200 dark:border-white/10 shadow-lg w-full text-xs space-y-2 z-20 select-none transition-all`}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100">
                <Sliders className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Depth Horizon Inspector</span>
              </div>
              <span className="font-mono font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-lg border border-blue-200 dark:border-blue-800">
                {inspectedDepth} m
              </span>
            </div>

            <div className="text-slate-600 dark:text-slate-300">
              <div className="font-extrabold text-slate-900 dark:text-white">
                {currentFormation.name}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                {currentFormation.description}
              </p>
            </div>

            {/* If nearby incident found at this depth */}
            {nearbyIncidents.length > 0 ? (
              <div className="p-2 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg text-[11px] text-red-800 dark:text-red-300 space-y-0.5">
                <div className="flex items-center gap-1 font-bold">
                  <AlertTriangle className="w-3 h-3 text-red-600 dark:text-red-400 shrink-0" />
                  <span>Historical Offset Hazard at this Depth:</span>
                </div>
                <p className="font-medium text-[11px] leading-tight">
                  {nearbyIncidents[0].well_name} at {nearbyIncidents[0].depth}m:{' '}
                  {nearbyIncidents[0].description}
                </p>
              </div>
            ) : (
              <div className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <Info className="w-3 h-3 text-slate-400 shrink-0" />
                <span>No historical lost circulation or kicks recorded at this depth.</span>
              </div>
            )}
          </div>

          {/* INTERACTIVE DEPTH NAVIGATOR SCRUBBER BAR (Bottom Center) */}
          <div
            className={`bg-white/95 dark:bg-[#141A28]/95 border-t border-slate-200 dark:border-white/10 ${
              isFullscreen ? 'px-8 py-3.5' : 'px-6 py-2.5'
            } z-20 space-y-2 select-none shrink-0 transition-all`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">
                  Scrub Subsurface Depth:
                </span>
                <span className="font-mono font-extrabold text-blue-600 dark:text-blue-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  {inspectedDepth} m
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  (
                  {inspectedDepth === bitDepth
                    ? 'Active Drill Bit Position'
                    : `${Math.abs(inspectedDepth - bitDepth).toFixed(0)}m ${
                        inspectedDepth > bitDepth ? 'ahead of bit' : 'above bit'
                      }`}
                  )
                </span>
              </div>

              {/* Quick Jump Buttons */}
              <div className="flex flex-wrap items-center gap-1 text-[11px]">
                {milestones.map((m, i) => (
                  <button
                    key={i}
                    onClick={() => setInspectedDepth(m.depth)}
                    className={`px-2.5 py-1 rounded-lg font-mono text-[10px] transition-colors cursor-pointer ${
                      inspectedDepth === m.depth
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : m.hazard
                        ? 'bg-red-50 dark:bg-red-950/60 hover:bg-red-100 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {m.label} ({m.tag})
                  </button>
                ))}
              </div>
            </div>

            {/* Depth Range Slider */}
            <input
              type="range"
              min="0"
              max={totalTD}
              step="5"
              value={inspectedDepth}
              onChange={(e) => setInspectedDepth(Number(e.target.value))}
              className="w-full accent-blue-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>

          {/* Bottom Toolbar Info */}
          <div className="h-9 bg-slate-50 dark:bg-[#090D16] border-t border-slate-200 dark:border-white/10 px-4 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 select-none shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setControlsCollapsed(!controlsCollapsed)}
                className="hover:text-blue-600 dark:hover:text-blue-400 font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>{controlsCollapsed ? 'Show Layer Filters' : 'Hide Layer Filters'}</span>
              </button>
              <span>•</span>
              <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">
                Target Formation: Barail Coal-Shale / Kopili
              </span>
            </div>

            <button
              onClick={() => {
                setIs2DView(false);
                setInspectedDepth(bitDepth);
              }}
              className="flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-bold cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset to Bit Depth ({Math.round(bitDepth)} m)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
