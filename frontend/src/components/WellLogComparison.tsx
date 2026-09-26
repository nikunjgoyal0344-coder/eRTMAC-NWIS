import React, { useState } from 'react';
import {
  Layers,
  Settings,
  BarChart3,
  Clock,
  Coins,
  ArrowRight,
  ChevronDown
} from 'lucide-react';
import { TelemetrySample, FormationLayer, DrillingEvent } from '../types';

interface WellLogComparisonProps {
  wellLogs: Record<string, TelemetrySample[]>;
  formations: FormationLayer[];
  events: DrillingEvent[];
  activeDepth: number;
  onApplyScenario?: (details: string) => void;
}

export const WellLogComparison: React.FC<WellLogComparisonProps> = ({
  wellLogs,
  activeDepth,
  onApplyScenario
}) => {
  const [offsetWellId, setOffsetWellId] = useState<string>('W-093');
  const [secondaryOffsetId, setSecondaryOffsetId] = useState<string>('W-087');

  // What-If Simulator State matching the reference UI defaults (1.22 sg, 1750 LPM, 25 ppb)
  const [mudWeightSg, setMudWeightSg] = useState<number>(1.22);
  const [flowRateLpm, setFlowRateLpm] = useState<number>(1750);
  const [lcmPillPpb, setLcmPillPpb] = useState<number>(25);
  const [scenarioApplied, setScenarioApplied] = useState<boolean>(false);

  const w101Logs = (wellLogs['W-101'] || []).filter((s) => s.depth <= activeDepth);
  const offset1Logs = wellLogs[offsetWellId] || [];
  const offset2Logs = wellLogs[secondaryOffsetId] || [];

  const MIN_D = 3250;
  const MAX_D = 3550;
  const H = 450;

  const depthToY = (d: number) => ((d - MIN_D) / (MAX_D - MIN_D)) * H;

  const buildPolyline = (
    samples: TelemetrySample[],
    key: keyof TelemetrySample,
    minVal: number,
    maxVal: number,
    trackWidth: number
  ) => {
    const pts = samples
      .filter((s) => s.depth >= MIN_D && s.depth <= MAX_D)
      .map((s) => {
        const val = Number(s[key]);
        const x = Math.max(6, Math.min(trackWidth - 6, ((val - minVal) / (maxVal - minVal)) * trackWidth));
        const y = depthToY(s.depth);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      });
    return pts.join(' ');
  };

  // Compute AI Scenario Results dynamically from the 3 sliders
  const annularLoss = Math.pow(flowRateLpm / 2100, 1.8) * 0.068;
  const ecd = mudWeightSg + annularLoss;
  const fracGrad = 1.275 + (lcmPillPpb / 25) * 0.055;
  const overbalance = Math.max(0, (ecd - fracGrad) * 9.0);
  const baselineRisk = 84;
  const lcmReduction = Math.min(66, Math.round(lcmPillPpb * 2.1 + (flowRateLpm <= 1800 ? 14 : 0)));
  const reducedRisk = Math.max(12, Math.min(92, Math.round(baselineRisk - lcmReduction + overbalance * 18)));
  const nptSavedHrs = Number(((baselineRisk - reducedRisk) * 0.37).toFixed(1));
  const inrSavedLakhs = Number((nptSavedHrs * 1.85).toFixed(1));

  const dangerYTop = depthToY(3400);
  const dangerYBot = depthToY(3450);
  const activeBitY = depthToY(activeDepth);

  const trackConfigs = [
    {
      id: 'rop',
      title: 'Rate of Penetration (ROP)',
      unit: '(m/hr)',
      ticks: [0, 10, 20, 30, 35],
      key: 'rop_m_hr' as keyof TelemetrySample,
      min: 0,
      max: 35
    },
    {
      id: 'torque',
      title: 'Surface Torque',
      unit: '(kNm)',
      ticks: [15, 20, 25, 30, 35, 42],
      key: 'torque_knm' as keyof TelemetrySample,
      min: 15,
      max: 42
    },
    {
      id: 'spp',
      title: 'Standpipe Pressure (SPP)',
      unit: '(psi)',
      ticks: ['1,900', '2,200', '2,500', '2,800', '3,200'],
      key: 'spp_psi' as keyof TelemetrySample,
      min: 1900,
      max: 3200
    },
    {
      id: 'loss',
      title: 'Dynamic Mud Loss Rate',
      unit: '(bbl/hr)',
      ticks: [0, 5, 10, 15, 20],
      key: 'mud_loss_bbl_hr' as keyof TelemetrySample,
      min: 0,
      max: 20
    },
    {
      id: 'gas',
      title: 'Total Hydrocarbon Gas',
      unit: '(units)',
      ticks: [0, 20, 40, 60, 90],
      key: 'gas_units' as keyof TelemetrySample,
      min: 0,
      max: 90
    }
  ];

  const handleTriggerScenario = () => {
    setScenarioApplied(true);
    if (onApplyScenario) {
      onApplyScenario(
        `Applied Hydraulics & Stress-Caging Scenario on W-101: MW=${mudWeightSg} sg, Q=${flowRateLpm} LPM, LCM=${lcmPillPpb} ppb. Mud Loss Risk reduced from ${baselineRisk}% to ${reducedRisk}% (${nptSavedHrs} hrs NPT / INR ${inrSavedLakhs} Lakhs saved).`
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Page Title Header */}
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-sm shrink-0">
          <Layers className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-[#1E3A8A] tracking-tight">
            Cross-Well Stratigraphic and Composite Well-Log Correlation
          </h2>
          <p className="text-sm text-slate-600">
            Synchronized TVD comparison for Active Well <strong className="text-slate-900">W-101</strong> and offset wells.
          </p>
        </div>
      </div>

      {/* Top Filter & Well Legend Bar */}
      <div className="bg-white rounded-2xl border border-blue-100 px-5 py-3.5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        {/* Selected Wells Pills */}
        <div className="space-y-1.5">
          <div className="text-xs font-bold text-[#1E3A8A]">Selected Wells for Comparison</div>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-emerald-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span>W-101 (Active Well)</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>

            <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <select
                value={offsetWellId}
                onChange={(e) => setOffsetWellId(e.target.value)}
                className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer"
              >
                <option value="W-093">W-093 (6.1 km NW)</option>
                <option value="W-098">W-098 (7.2 km E)</option>
              </select>
            </div>

            <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
              <select
                value={secondaryOffsetId}
                onChange={(e) => setSecondaryOffsetId(e.target.value)}
                className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer"
              >
                <option value="W-087">W-087 (6.8 km W)</option>
                <option value="W-098">W-098 (7.2 km E)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Depth Range (TVD) */}
        <div className="space-y-1.5 border-l border-slate-200 pl-5">
          <div className="text-xs font-bold text-[#1E3A8A]">Depth Range (TVD)</div>
          <div className="flex items-center gap-2 text-xs">
            <span className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-[#1E3A8A]">
              3,250 m
            </span>
            <span className="text-slate-500 font-medium">to</span>
            <span className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-[#1E3A8A]">
              3,550 m
            </span>
          </div>
        </div>

        {/* Well Legend */}
        <div className="space-y-1.5 border-l border-slate-200 pl-5">
          <div className="text-xs font-bold text-[#1E3A8A]">Well Legend</div>
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700 pt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-0.5 bg-emerald-600 inline-block rounded" />
              W-101 (Active Well)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-0.5 bg-blue-600 inline-block rounded" />
              {offsetWellId} (6.1 km NW)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-0.5 border-b-2 border-dashed border-orange-500 inline-block" />
              {secondaryOffsetId} (6.8 km W)
            </span>
          </div>
        </div>
      </div>

      {/* 6-Track Composite Well-Log Correlation Card */}
      <div className="bg-white rounded-2xl border border-blue-100 p-4 shadow-sm overflow-x-auto">
        <div className="relative min-w-[980px] grid grid-cols-12 gap-0">
          {/* Full-Width Red Shaded Barail Loss Zone Band (3,400 - 3,450 m) across all tracks */}
          <div
            className="absolute left-[42px] right-2 bg-red-500/10 border-y border-red-300/80 pointer-events-none z-10"
            style={{
              top: `${56 + dangerYTop}px`,
              height: `${dangerYBot - dangerYTop}px`
            }}
          />

          {/* Track 0: Depth & Stratigraphy Column (2 Cols) */}
          <div className="col-span-2 pr-3 border-r border-slate-200 flex flex-col">
            <div className="h-14 flex flex-col justify-center items-center pb-2">
              <span className="text-xs font-extrabold text-[#1E3A8A]">Depth & Stratigraphy</span>
              <span className="text-[11px] font-semibold text-slate-500 self-start pl-1 mt-1">TVD (m)</span>
            </div>

            <div className="relative flex w-full" style={{ height: `${H}px` }}>
              {/* TVD Depth Scale Numbers on Left */}
              <div className="w-12 relative text-[11px] font-semibold text-slate-600 select-none">
                {[3250, 3275, 3300, 3325, 3350, 3375, 3400, 3425, 3450, 3475, 3500, 3525, 3550].map((d) => (
                  <div
                    key={d}
                    className="absolute right-1.5 flex items-center gap-1"
                    style={{ top: `${depthToY(d) - 7}px` }}
                  >
                    <span>{d.toLocaleString()}</span>
                    <span className="w-1.5 border-b border-slate-400" />
                  </div>
                ))}
              </div>

              {/* Realistic Lithology Rock Column */}
              <div className="flex-1 relative rounded border border-slate-300 overflow-hidden shadow-inner">
                {/* Tipam Sandstone (3250 - 3315m) */}
                <div
                  className="w-full litho-sandstone border-b border-amber-900/30 flex items-center justify-center"
                  style={{ height: `${depthToY(3315)}px` }}
                >
                  <span className="px-2 py-0.5 rounded bg-amber-100/90 text-slate-900 font-extrabold text-[11px] shadow-sm">
                    Tipam Sandstone
                  </span>
                </div>

                {/* Barail Coal-Shale (3315 - 3465m) */}
                <div
                  className="w-full litho-coal-shale border-b border-slate-700 flex flex-col items-center justify-start pt-4"
                  style={{ height: `${depthToY(3465) - depthToY(3315)}px` }}
                >
                  <span className="px-2 py-0.5 rounded bg-stone-800/90 text-amber-100 font-bold text-[11px] border border-amber-200/30 shadow">
                    Barail Coal-Shale
                  </span>
                </div>

                {/* Kopili Shale (3465 - 3550m) */}
                <div
                  className="w-full litho-kopili-shale flex items-center justify-center"
                  style={{ height: `${H - depthToY(3465)}px` }}
                >
                  <span className="px-2 py-0.5 rounded bg-slate-200/95 text-slate-900 font-extrabold text-[11px] shadow-sm">
                    Kopili Shale
                  </span>
                </div>

                {/* Active Bit Green Badge at activeDepth */}
                {activeDepth >= MIN_D && activeDepth <= MAX_D && (
                  <div
                    className="absolute -left-1 -right-2 z-20 flex items-center"
                    style={{ top: `${activeBitY - 10}px` }}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white mr-1" />
                    <span className="bg-emerald-100 border border-emerald-400 text-emerald-900 text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap">
                      ACTIVE BIT: {activeDepth.toLocaleString()} m
                    </span>
                  </div>
                )}

                {/* Red Hazard Zone Label Box inside Lithology Column */}
                <div
                  className="absolute inset-x-1 bg-red-100/95 border border-red-400 rounded flex flex-col items-center justify-center p-1 z-20 shadow-sm"
                  style={{
                    top: `${dangerYTop + 6}px`,
                    height: `${dangerYBot - dangerYTop - 12}px`
                  }}
                >
                  <span className="text-[10px] font-extrabold text-red-800 leading-tight">
                    3,400 – 3,450 m
                  </span>
                  <span className="text-[9px] font-black uppercase text-red-700 tracking-tight">
                    BARAIL LOSS ZONE
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tracks 1 to 5 (2 Cols each) */}
          {trackConfigs.map((tk) => {
            const TW = 160;
            const poly101 = buildPolyline(w101Logs, tk.key, tk.min, tk.max, TW);
            const polyOff1 = buildPolyline(offset1Logs, tk.key, tk.min, tk.max, TW);
            const polyOff2 = buildPolyline(offset2Logs, tk.key, tk.min, tk.max, TW);

            return (
              <div key={tk.id} className="col-span-2 px-2 border-r border-slate-200 last:border-r-0 flex flex-col">
                {/* Track Header & Top Ruler */}
                <div className="h-14 flex flex-col justify-between pb-1.5">
                  <div className="text-center">
                    <div className="text-xs font-extrabold text-[#1E3A8A] leading-tight">{tk.title}</div>
                    <div className="text-[11px] font-medium text-slate-500">{tk.unit}</div>
                  </div>
                  <div className="flex justify-between text-[10px] font-semibold text-slate-500 border-b border-slate-300 pb-0.5 px-0.5">
                    {tk.ticks.map((t, i) => (
                      <span key={i}>{t}</span>
                    ))}
                  </div>
                </div>

                {/* Track SVG Plot */}
                <div className="relative w-full" style={{ height: `${H}px` }}>
                  <svg
                    viewBox={`0 0 ${TW} ${H}`}
                    className="w-full h-full overflow-visible"
                  >
                    {/* Vertical Dashed Grid Lines */}
                    {[0.2, 0.4, 0.6, 0.8].map((f) => (
                      <line
                        key={f}
                        x1={TW * f}
                        y1={0}
                        x2={TW * f}
                        y2={H}
                        stroke="#E2E8F0"
                        strokeWidth="1"
                        strokeDasharray="2 3"
                      />
                    ))}

                    {/* Horizontal Depth Grid Lines */}
                    {[3275, 3300, 3325, 3350, 3375, 3400, 3425, 3450, 3475, 3500, 3525].map((d) => (
                      <line
                        key={d}
                        x1={0}
                        y1={depthToY(d)}
                        x2={TW}
                        y2={depthToY(d)}
                        stroke="#F1F5F9"
                        strokeWidth="1"
                      />
                    ))}

                    {/* Secondary Offset Curve (Orange Dashed) */}
                    <polyline
                      fill="none"
                      stroke="#F97316"
                      strokeWidth="1.8"
                      strokeDasharray="4 3"
                      points={polyOff2}
                    />

                    {/* Primary Offset Curve (Blue Solid) */}
                    <polyline
                      fill="none"
                      stroke="#2563EB"
                      strokeWidth="2.0"
                      points={polyOff1}
                    />

                    {/* Active Well W-101 Curve (Green Solid) */}
                    <polyline
                      fill="none"
                      stroke="#16A34A"
                      strokeWidth="2.4"
                      points={poly101}
                    />

                    {/* Active Bit Horizontal Green Dashed Line */}
                    {activeDepth >= MIN_D && activeDepth <= MAX_D && (
                      <line
                        x1={0}
                        y1={activeBitY}
                        x2={TW}
                        y2={activeBitY}
                        stroke="#16A34A"
                        strokeWidth="1.5"
                        strokeDasharray="4 3"
                      />
                    )}

                    {/* Callout Dot on Surface Torque Track */}
                    {tk.id === 'torque' && (
                      <circle cx={TW * 0.56} cy={depthToY(3398)} r="4" fill="#2563EB" stroke="#fff" strokeWidth="1.5" />
                    )}

                    {/* Callout Red Peak Dot on Dynamic Mud Loss Track */}
                    {tk.id === 'loss' && (
                      <circle cx={TW * 0.77} cy={depthToY(3428)} r="5.5" fill="#DC2626" stroke="#fff" strokeWidth="2" />
                    )}
                  </svg>

                  {/* Floating Callout Pill on Torque Track */}
                  {tk.id === 'torque' && (
                    <div
                      className="absolute right-1 bg-red-50/95 border border-red-200 rounded-lg px-2 py-1 shadow-sm z-20 pointer-events-none"
                      style={{ top: `${depthToY(3378)}px` }}
                    >
                      <div className="text-[10px] font-bold text-red-700 leading-tight">Torque Spike</div>
                      <div className="text-[10px] font-extrabold text-red-800">3,385 – 3,430 m</div>
                    </div>
                  )}

                  {/* Floating Callout Pill on Mud Loss Track */}
                  {tk.id === 'loss' && (
                    <div
                      className="absolute -right-3 bg-red-50/95 border border-red-300 rounded-lg px-2.5 py-1 shadow-md z-20 pointer-events-none"
                      style={{ top: `${depthToY(3412)}px` }}
                    >
                      <div className="text-[10px] font-bold text-red-700 leading-tight">W-093 Peak</div>
                      <div className="text-[10px] font-extrabold text-red-900">3,428 m</div>
                      <div className="text-[10px] font-extrabold text-red-700">(15.4 bbl/hr)</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Interactive Hydraulics and Stress-Caging What-If Simulator Card */}
      <div className="bg-white rounded-2xl border border-blue-100 p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5">
          <Settings className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-extrabold text-[#1E3A8A]">
            Interactive Hydraulics and Stress-Caging What-If Simulator
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          {/* 3 Slider Cards (7 Cols) */}
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Slider 1: Mud Weight */}
            <div className="bg-[#F8FAFC] border border-blue-100 rounded-xl p-3.5 space-y-2">
              <div className="text-xs font-bold text-[#1E3A8A]">Mud Weight (MW)</div>
              <div className="text-[11px] text-slate-500">sg</div>
              <div className="flex items-center gap-2.5">
                <input
                  type="range"
                  min={1.0}
                  max={1.6}
                  step={0.01}
                  value={mudWeightSg}
                  onChange={(e) => setMudWeightSg(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <span className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-sm font-extrabold text-[#1E3A8A] shadow-sm">
                  {mudWeightSg.toFixed(2)}
                </span>
              </div>
              <div className="text-[11px] text-slate-500">Range: 1.00 – 1.60 sg</div>
            </div>

            {/* Slider 2: Pump Flow Rate */}
            <div className="bg-[#F8FAFC] border border-blue-100 rounded-xl p-3.5 space-y-2">
              <div className="text-xs font-bold text-[#1E3A8A]">Pump Flow Rate (Q)</div>
              <div className="text-[11px] text-slate-500">LPM</div>
              <div className="flex items-center gap-2.5">
                <input
                  type="range"
                  min={500}
                  max={2500}
                  step={25}
                  value={flowRateLpm}
                  onChange={(e) => setFlowRateLpm(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <span className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-sm font-extrabold text-[#1E3A8A] shadow-sm">
                  {flowRateLpm.toLocaleString()}
                </span>
              </div>
              <div className="text-[11px] text-slate-500">Range: 500 – 2,500 LPM</div>
            </div>

            {/* Slider 3: Bimodal LCM Pill Concentration */}
            <div className="bg-[#F8FAFC] border border-blue-100 rounded-xl p-3.5 space-y-2">
              <div className="text-xs font-bold text-[#1E3A8A]">Bimodal LCM Pill Concentration</div>
              <div className="text-[11px] text-slate-500">ppb</div>
              <div className="flex items-center gap-2.5">
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={lcmPillPpb}
                  onChange={(e) => setLcmPillPpb(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <span className="bg-white border border-slate-200 rounded-lg px-3 py-1 text-sm font-extrabold text-[#1E3A8A] shadow-sm">
                  {lcmPillPpb}
                </span>
              </div>
              <div className="text-[11px] text-slate-500">Range: 0 – 100 ppb</div>
            </div>
          </div>

          {/* Scenario Results Mint-Green Box (3.5 Cols) */}
          <div className="lg:col-span-3 bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span>Scenario Results (AI Estimated)</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 items-center">
              <div className="border-r border-emerald-200 pr-2">
                <div className="text-[11px] font-bold text-slate-700">Mud Loss Risk</div>
                <div className="text-[11px] text-slate-500">Reduced:</div>
                <div className="text-xl font-black mt-0.5 flex items-center gap-1">
                  <span className="text-red-600">{baselineRisk}%</span>
                  <span className="text-slate-400 text-sm">→</span>
                  <span className="text-emerald-700">{reducedRisk}%</span>
                </div>
              </div>

              <div className="pl-1 space-y-1">
                <div className="text-[11px] text-slate-600 font-medium">Estimated Savings:</div>
                <div className="flex items-center gap-1 text-xs font-extrabold text-[#1E3A8A]">
                  <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>{nptSavedHrs} hrs NPT</span>
                </div>
                <div className="flex items-center gap-1 text-xs font-extrabold text-[#1E3A8A]">
                  <Coins className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>INR {inrSavedLakhs} Lakhs</span>
                </div>
              </div>
            </div>
          </div>

          {/* Apply Scenario CTA Button (1.5 Cols) */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center text-center space-y-1.5">
            <button
              onClick={handleTriggerScenario}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5 transition"
            >
              <span>{scenarioApplied ? 'Scenario Active ✓' : 'Apply Scenario'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <span className="text-[11px] text-slate-500 leading-tight">
              Simulate and update wellbore response
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
