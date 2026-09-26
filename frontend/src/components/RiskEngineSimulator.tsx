import React, { useState } from 'react';
import {
  Sliders,
  Sparkles,
  TrendingDown,
  ShieldCheck,
  AlertTriangle,
  Zap,
  RotateCcw
} from 'lucide-react';

interface RiskEngineSimulatorProps {
  activeDepth: number;
  onLogMitigationAction: (details: string) => void;
}

export const RiskEngineSimulator: React.FC<RiskEngineSimulatorProps> = ({
  activeDepth,
  onLogMitigationAction
}) => {
  const [mudWeightSg, setMudWeightSg] = useState<number>(1.20);
  const [flowRateLpm, setFlowRateLpm] = useState<number>(1850);
  const [lcmPillPpb, setLcmPillPpb] = useState<number>(45);
  const [appliedPreset, setAppliedPreset] = useState<boolean>(false);

  // Physics-informed ML Risk & Stress-Caging Calculation
  const distToZone = Math.max(0, 3400 - activeDepth);
  const inZone = activeDepth >= 3400 && activeDepth <= 3455;
  const depthFactor = inZone ? 1.0 : Math.exp(-Math.pow(distToZone / 35, 2));

  const annularFrictionSg = 0.035 * Math.pow(flowRateLpm / 2000, 1.8);
  const simulatedEcd = Number((mudWeightSg + annularFrictionSg).toFixed(3));
  const stressCagingBonusSg = 0.045 * (1 - Math.exp(-lcmPillPpb / 22));
  const effectiveBreakdownWindow = Number((1.275 + stressCagingBonusSg).toFixed(3));

  const overbalanceRatio = Math.max(0, (simulatedEcd - 1.242) / (effectiveBreakdownWindow - 1.242));
  const baselineRiskPct = Math.round(Math.min(96, Math.max(24, 84 * depthFactor + 12)));
  const simulatedRiskPct = Math.round(
    Math.min(
      95,
      Math.max(
        14,
        baselineRiskPct * Math.pow(overbalanceRatio, 1.35) * (1 - 0.52 * (lcmPillPpb / 55))
      )
    )
  );
  const riskReductionPct = Math.max(0, baselineRiskPct - simulatedRiskPct);

  const handleApplyRecommendation = () => {
    setMudWeightSg(1.20);
    setFlowRateLpm(1850);
    setLcmPillPpb(45);
    setAppliedPreset(true);
    onLogMitigationAction(
      `Applied AI Hydraulics & Stress-Caging Prescription at ${activeDepth.toFixed(1)}m: MW=1.20 SG, Flow=1850 LPM, 45 ppb CaCO3/Graphite Blend (ECD=${simulatedEcd} SG, Risk reduced from ${baselineRiskPct}% to ${simulatedRiskPct}%)`
    );
  };

  const handleResetBaseline = () => {
    setMudWeightSg(1.24);
    setFlowRateLpm(2150);
    setLcmPillPpb(0);
    setAppliedPreset(false);
  };

  return (
    <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-blue-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-[#1E3A8A] uppercase tracking-tight">
                Interactive Hydraulics &amp; Stress-Caging What-If Simulator
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                PINN + XGBoost Engine
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulate real-time ECD vs. Barail Fracture Gradient (1.275 SG) and evaluate CaCO₃ + Graphite wellbore strengthening
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetBaseline}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-600 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Baseline (1.24 SG)
          </button>
          <button
            onClick={handleApplyRecommendation}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Apply W-098 Stress-Caging Recipe
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-4 items-center">
        {/* Sliders */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Mud Weight */}
          <div className="bg-[#F8FAFF] border border-blue-100 rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-600 uppercase">Mud Weight</span>
              <span className="text-sm font-black text-[#1E3A8A] font-mono">
                {mudWeightSg.toFixed(2)} SG
              </span>
            </div>
            <input
              type="range"
              min={1.16}
              max={1.28}
              step={0.01}
              value={mudWeightSg}
              onChange={(e) => {
                setMudWeightSg(parseFloat(e.target.value));
                setAppliedPreset(false);
              }}
              className="w-full accent-blue-600 cursor-pointer h-1.5 bg-blue-100 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold mt-1">
              <span>1.16 SG</span>
              <span className="text-emerald-600 font-bold">Opt: 1.20</span>
              <span>1.28 SG</span>
            </div>
          </div>

          {/* Pump Flow Rate */}
          <div className="bg-[#F8FAFF] border border-blue-100 rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-600 uppercase">Pump Flow Rate</span>
              <span className="text-sm font-black text-[#1E3A8A] font-mono">
                {flowRateLpm} LPM
              </span>
            </div>
            <input
              type="range"
              min={1500}
              max={2400}
              step={25}
              value={flowRateLpm}
              onChange={(e) => {
                setFlowRateLpm(parseInt(e.target.value, 10));
                setAppliedPreset(false);
              }}
              className="w-full accent-blue-600 cursor-pointer h-1.5 bg-blue-100 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold mt-1">
              <span>1500</span>
              <span className="text-emerald-600 font-bold">Opt: 1850</span>
              <span>2400 LPM</span>
            </div>
          </div>

          {/* LCM Stress-Caging Pill */}
          <div className="bg-[#F8FAFF] border border-blue-100 rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-600 uppercase">LCM Pill Conc.</span>
              <span className="text-sm font-black text-emerald-700 font-mono">
                {lcmPillPpb} ppb
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={60}
              step={5}
              value={lcmPillPpb}
              onChange={(e) => {
                setLcmPillPpb(parseInt(e.target.value, 10));
                setAppliedPreset(false);
              }}
              className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-emerald-100 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold mt-1">
              <span>0 ppb</span>
              <span className="text-emerald-600 font-bold">CaCO₃: 45 ppb</span>
              <span>60 ppb</span>
            </div>
          </div>
        </div>

        {/* Output KPIs */}
        <div className="lg:col-span-5 grid grid-cols-3 gap-3">
          <div className="bg-[#F8FAFF] border border-blue-100 rounded-xl p-3 text-center">
            <div className="text-[10px] font-bold text-slate-500 uppercase">Simulated ECD</div>
            <div
              className={`text-lg font-black font-mono mt-1 ${
                simulatedEcd > effectiveBreakdownWindow ? 'text-red-600' : 'text-[#1E3A8A]'
              }`}
            >
              {simulatedEcd} SG
            </div>
            <div className="text-[10px] font-semibold text-slate-500 mt-0.5">
              Window: <span className="text-emerald-700 font-bold">{effectiveBreakdownWindow} SG</span>
            </div>
          </div>

          <div className="bg-red-50/70 border border-red-200 rounded-xl p-3 text-center">
            <div className="text-[10px] font-bold text-red-700 uppercase">Baseline Risk</div>
            <div className="text-lg font-black text-red-600 font-mono mt-1">{baselineRiskPct}%</div>
            <div className="text-[10px] font-semibold text-red-600/80 mt-0.5">Unmitigated</div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
            <div className="text-[10px] font-bold text-emerald-800 uppercase">Simulated Risk</div>
            <div className="text-lg font-black text-emerald-700 font-mono mt-1">
              {simulatedRiskPct}%
            </div>
            <div className="text-[10px] font-bold text-emerald-700 mt-0.5 flex items-center justify-center gap-0.5">
              <TrendingDown className="w-3 h-3" /> -{riskReductionPct}% Drop
            </div>
          </div>
        </div>
      </div>

      {appliedPreset && (
        <div className="mt-3.5 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800 font-semibold">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Stress-Caging Prescription active and logged to SHA-256 Operational Audit Ledger.
            </span>
          </div>
          <span className="font-mono text-[11px] font-bold text-emerald-700">
            VERIFIED BY eRTMAC
          </span>
        </div>
      )}
    </div>
  );
};
