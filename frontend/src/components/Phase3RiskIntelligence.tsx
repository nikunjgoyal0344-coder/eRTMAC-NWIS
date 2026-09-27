import React, { useState } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  Activity,
  Cpu,
  CheckCircle2,
  FileText,
  HelpCircle,
  TrendingUp,
  ExternalLink,
  Target
} from 'lucide-react';
import { WellSummary, DrillingEvent, TelemetrySample } from '../types';
import { RiskEngineSimulator } from './RiskEngineSimulator';

interface Phase3RiskIntelligenceProps {
  wells: WellSummary[];
  events: DrillingEvent[];
  activeDepth: number;
  radiusKm: number;
  currentTelemetry: TelemetrySample;
  onSelectWell: (wellId: string) => void;
  onNavigateTab: (tab: any) => void;
  onOpenExplainModal: () => void;
  onLogMitigationAction: (details: string) => void;
}

export const Phase3RiskIntelligence: React.FC<Phase3RiskIntelligenceProps> = ({
  wells,
  events,
  activeDepth,
  radiusKm,
  currentTelemetry,
  onSelectWell,
  onNavigateTab,
  onOpenExplainModal,
  onLogMitigationAction
}) => {
  const [selectedAnalogId, setSelectedAnalogId] = useState<string>('W-093');

  const offsetWells = wells.filter((w) => w.well_id !== 'W-101' && w.distance_km <= radiusKm);
  const selectedAnalog =
    offsetWells.find((w) => w.well_id === selectedAnalogId) || offsetWells[0] || wells[1];

  const analogEvents = events.filter((e) => e.well_id === selectedAnalog?.well_id);

  const distToHazard = Math.max(0, 3400 - activeDepth);
  const inHazardZone = activeDepth >= 3400 && activeDepth <= 3455;
  const compositeRiskScore = inHazardZone
    ? 88
    : Math.round(Math.min(86, Math.max(22, 84 * Math.exp(-Math.pow(distToHazard / 38, 2)) + 14)));

  const lookAheadCurve = [
    { depth: 3320, lossRisk: 14, stuckRisk: 10, label: 'Tipam Safe' },
    { depth: 3350, lossRisk: 22, stuckRisk: 15, label: 'Tipam Base' },
    { depth: 3380, lossRisk: 48, stuckRisk: 31, label: 'Transition' },
    { depth: 3400, lossRisk: 78, stuckRisk: 54, label: 'Barail Top' },
    { depth: 3428, lossRisk: 92, stuckRisk: 74, label: 'W-093 Loss Peak' },
    { depth: 3450, lossRisk: 66, stuckRisk: 58, label: 'Barail Coal' },
    { depth: 3480, lossRisk: 28, stuckRisk: 32, label: 'Kopili Top' },
    { depth: 3500, lossRisk: 19, stuckRisk: 24, label: 'Kopili Shale' }
  ];

  return (
    <div className="space-y-5">
      {/* Top Banner Header Card */}
      <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-black text-[#1E3A8A] tracking-tight">
                Offset Risk Analysis &amp; Analog Similarity Engine
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
                HIGH ALERT • BARAIL LOSS ZONE (+{distToHazard.toFixed(0)} m)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Cosine Litho-Hydraulic Similarity Ranking across {offsetWells.length} Offset Wells within{' '}
              <span className="font-bold text-[#1E3A8A]">{radiusKm} km</span> radius of Active Rig{' '}
              <span className="font-bold text-blue-700">W-101 (Duliajan-101)</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenExplainModal}
            className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-xs font-bold text-[#1E3A8A] flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-blue-600" />
            Why This Alert? (6-Point XAI)
          </button>
          <button
            onClick={() => onNavigateTab('logs')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Activity className="w-4 h-4" />
            Open Cross-Well Log Correlation
          </button>
        </div>
      </div>

      {/* 4 Top Executive Risk KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-blue-100 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Composite Look-Ahead Risk
            </span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-red-600 font-mono">{compositeRiskScore}%</span>
            <span className="text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
              CRITICAL
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">
            Peak mud loss probability at <span className="font-bold text-slate-700">3,400–3,450 m</span>
          </p>
        </div>

        <div className="bg-white border border-blue-100 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Primary Offset Twin
            </span>
            <Target className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-[#1E3A8A] font-mono">W-093</span>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              96.4% Match
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">
            1.42 km NE • 312 bbl mud loss at <span className="font-bold text-slate-700">3,428 m</span>
          </p>
        </div>

        <div className="bg-white border border-blue-100 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Safe Benchmark Analog
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-emerald-700 font-mono">W-098</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              0 hrs NPT
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">
            1.95 km NW • Drilled safely via <span className="font-bold text-emerald-700">45 ppb CaCO₃</span>
          </p>
        </div>

        <div className="bg-white border border-blue-100 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Active ECD Overbalance
            </span>
            <Cpu className="w-4 h-4 text-orange-500" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-[#1E3A8A] font-mono">
              {(currentTelemetry?.ecd_sg ?? 1.268).toFixed(3)} SG
            </span>
            <span className="text-xs font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
              Frac: 1.275 SG
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">
            Margin to Barail fracture breakdown:{' '}
            <span className="font-bold text-red-600">
              {(1.275 - (currentTelemetry?.ecd_sg ?? 1.268)).toFixed(3)} SG
            </span>
          </p>
        </div>
      </div>

      {/* Main Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 bg-white border border-blue-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3.5 border-b border-blue-50">
            <div>
              <h3 className="text-sm font-black text-[#1E3A8A] uppercase tracking-tight">
                Offset Well Multi-Variate Similarity Ranking
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Weighted Cosine Similarity (35% Lithology, 30% Pore Pressure, 20% Trajectory, 15% Proximity)
              </p>
            </div>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
              Click row to inspect
            </span>
          </div>

          <div className="overflow-x-auto mt-3">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-blue-100 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider bg-[#F8FAFF]">
                  <th className="py-2.5 px-3">Well ID</th>
                  <th className="py-2.5 px-3">Dist / Azimuth</th>
                  <th className="py-2.5 px-3">Cosine Match</th>
                  <th className="py-2.5 px-3">Barail Outcome</th>
                  <th className="py-2.5 px-3">Events</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-50 text-xs">
                {offsetWells.map((well) => {
                  const isSelected = well.well_id === selectedAnalog?.well_id;
                  const similarityPct = well.overall_similarity_pct ?? 92.0;
                  const isSafeBenchmark = well.well_id === 'W-098' || well.risk_rating === 'LOW';
                  const isHighHazard =
                    well.risk_rating === 'CRITICAL' || well.risk_rating === 'HIGH';

                  return (
                    <tr
                      key={well.well_id}
                      onClick={() => {
                        setSelectedAnalogId(well.well_id);
                        onSelectWell(well.well_id);
                      }}
                      className={`transition-colors cursor-pointer ${
                        isSelected ? 'bg-blue-50/90 font-semibold' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              isSafeBenchmark
                                ? 'bg-emerald-500'
                                : isHighHazard
                                ? 'bg-red-500'
                                : 'bg-amber-500'
                            }`}
                          />
                          <div>
                            <div className="font-black text-[#1E3A8A]">{well.well_id}</div>
                            <div className="text-[10px] text-slate-500">{well.well_name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-700">
                        {well.distance_km.toFixed(2)} km ({well.azimuth_deg}°)
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 rounded-full bg-blue-100 overflow-hidden">
                            <div
                              className="h-full bg-blue-600 rounded-full"
                              style={{ width: `${similarityPct}%` }}
                            />
                          </div>
                          <span className="font-mono font-black text-[#1E3A8A]">
                            {similarityPct}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            isSafeBenchmark
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : isHighHazard
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {isSafeBenchmark
                            ? 'SAFE BENCHMARK'
                            : isHighHazard
                            ? 'SEVERE LOSS / STUCK'
                            : 'MODERATE SEEPAGE'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-700">
                        {well.events_count} events
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectWell(well.well_id);
                            onNavigateTab('logs');
                          }}
                          className="text-[11px] font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                        >
                          Correlate <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Depth-Synchronized Look-Ahead Hazard Profile + Selected Analog Details */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-blue-50">
              <div>
                <h3 className="text-sm font-black text-[#1E3A8A] uppercase tracking-tight">
                  100m Ahead-of-Bit Hazard Probability Curve
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Synchronized with Active Bit at{' '}
                  <span className="font-bold text-emerald-700">{activeDepth.toFixed(1)} m</span>
                </p>
              </div>
              <TrendingUp className="w-4 h-4 text-red-600" />
            </div>

            <div className="space-y-2.5 mt-3.5">
              {lookAheadCurve.map((pt) => {
                const isNearBit = Math.abs(pt.depth - activeDepth) <= 18;
                const isPeakHazard = pt.depth >= 3400 && pt.depth <= 3450;
                return (
                  <div
                    key={pt.depth}
                    className={`p-2 rounded-xl border transition-all ${
                      isNearBit
                        ? 'bg-emerald-50/80 border-emerald-300'
                        : isPeakHazard
                        ? 'bg-red-50/50 border-red-200'
                        : 'bg-[#F8FAFF] border-blue-50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-[#1E3A8A]">{pt.depth} m</span>
                        <span className="text-slate-600 font-semibold">{pt.label}</span>
                        {isNearBit && (
                          <span className="px-1.5 py-0.2 bg-emerald-600 text-white rounded text-[9px] font-black">
                            ACTIVE BIT
                          </span>
                        )}
                      </div>
                      <span
                        className={`font-mono font-black ${
                          pt.lossRisk >= 70
                            ? 'text-red-600'
                            : pt.lossRisk >= 40
                            ? 'text-amber-600'
                            : 'text-emerald-700'
                        }`}
                      >
                        Loss: {pt.lossRisk}% | Stuck: {pt.stuckRisk}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden flex">
                      <div
                        className={`h-full ${
                          pt.lossRisk >= 70
                            ? 'bg-red-500'
                            : pt.lossRisk >= 40
                            ? 'bg-amber-500'
                            : 'bg-blue-500'
                        }`}
                        style={{ width: `${pt.lossRisk}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-black text-[#1E3A8A] uppercase">
                  Selected Offset Dossier: {selectedAnalog?.well_id} ({selectedAnalog?.well_name})
                </h4>
              </div>
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                {analogEvents.length} Recorded Events
              </span>
            </div>

            {analogEvents.length > 0 && (
              <div className="mt-3 space-y-2">
                {analogEvents.map((ev) => (
                  <div
                    key={ev.event_id}
                    className="p-2.5 rounded-xl bg-red-50/50 border border-red-200 text-xs"
                  >
                    <div className="flex items-center justify-between font-bold text-red-800">
                      <span>
                        {ev.event_type} @ {ev.depth} m ({ev.formation})
                      </span>
                      <span className="font-mono">{ev.npt_hours} hrs NPT</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1">{ev.description}</p>
                    <div className="mt-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      Mitigation Lesson: {ev.mitigation}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Interactive Simulator */}
      <RiskEngineSimulator
        activeDepth={activeDepth}
        onLogMitigationAction={onLogMitigationAction}
      />
    </div>
  );
};
