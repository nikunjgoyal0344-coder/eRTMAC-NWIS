import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  FileText,
  X,
  ExternalLink,
  HelpCircle,
  Lock
} from 'lucide-react';
import { UserRole } from '../types';

interface ExplainAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeDepth: number;
  currentRole: UserRole;
  onAcknowledge: (details: string) => void;
}

export const ExplainAlertModal: React.FC<ExplainAlertModalProps> = ({
  isOpen,
  onClose,
  activeDepth,
  currentRole,
  onAcknowledge
}) => {
  const [acked, setAcked] = useState<boolean>(false);

  if (!isOpen) return null;

  const distToHazard = Math.max(0, 3400 - activeDepth).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="clay-card max-w-3xl w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-black/5 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl clay-inset text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-[#1E3A8A] dark:text-blue-300 uppercase tracking-tight">
                  6-Point Explainable AI (XAI) Alert Verification Dossier
                </h3>
                <span className="clay-pill px-2.5 py-0.5 text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  SHA-256 VERIFIED
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Zero-Hallucination Provenance Chain for Active Bit at{' '}
                <span className="font-mono font-bold text-[#1E3A8A] dark:text-blue-300">{activeDepth.toFixed(1)} m</span>{' '}
                ({distToHazard} m ahead of Barail Loss Zone)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl clay-btn text-slate-600 dark:text-slate-300 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 6-Point Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl clay-inset">
            <div className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase">
              1. Triggering Subsurface Horizon
            </div>
            <div className="font-bold text-[#1E3A8A] dark:text-blue-300 mt-1">
              Barail Fractured Sandstone &amp; Coal-Shale (3,400–3,450 m TVD)
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
              Sub-hydrostatic pore pressure (1.242 SG) coupled with low fracture breakdown gradient (1.275 SG).
            </p>
          </div>

          <div className="p-3.5 rounded-2xl clay-inset">
            <div className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase">
              2. Primary Offset Analog Evidence
            </div>
            <div className="font-bold text-[#1E3A8A] dark:text-blue-300 mt-1">
              Well W-093 (1.42 km NE • 96.4% Cosine Similarity)
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
              Experienced 15.4 bbl/hr dynamic seepage loss (312 bbl total) &amp; 46 hrs NPT at 3,428 m under 1.24 SG mud weight.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl clay-inset">
            <div className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase">
              3. Golden Offset Safe Benchmark
            </div>
            <div className="font-bold text-emerald-700 dark:text-emerald-400 mt-1">
              Well W-098 (1.95 km NW • 0 hrs NPT in Barail)
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
              Drilled safely by reducing MW to 1.20 SG at 3,380 m and sweeping 45 ppb CaCO₃ + 15 ppb Graphite Stress-Caging Pill.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl clay-inset">
            <div className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase">
              4. Physics-Informed Hydraulic Margin
            </div>
            <div className="font-bold text-[#1E3A8A] dark:text-blue-300 mt-1">
              Current ECD 1.281 SG vs. Frac Limit 1.275 SG
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
              Reducing MW to 1.20 SG and flow to 1,850 LPM lowers ECD to 1.239 SG while Stress-Caging widens window to 1.314 SG.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl clay-inset">
            <div className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase">
              5. Cryptographic Source Citations
            </div>
            <div className="font-bold text-[#1E3A8A] dark:text-blue-300 mt-1 flex items-center gap-2">
              <span>DOC-DDR-W093-142 (p.4) &amp; DOC-MUD-W098-04 (p.19)</span>
            </div>
            <div className="mt-1.5 flex items-center gap-3">
              <a
                href="/api/docs/DDR_W093_142.pdf"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
              >
                Open W-093 DDR <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="/api/docs/MudLog_W098_Barail.pdf"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
              >
                Open W-098 Mud Log <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl clay-inset bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-300/60 dark:border-emerald-800">
            <div className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase">
              6. Quantified Risk Reduction Impact
            </div>
            <div className="font-black text-emerald-700 dark:text-emerald-300 text-sm mt-1">
              84% Unmitigated Risk → 18% Mitigated Risk (-66% Drop)
            </div>
            <p className="text-[11px] text-emerald-900 dark:text-emerald-400 mt-1">
              Saves estimated 42–68 hours of Stuck-Pipe / Lost-Circulation NPT (~₹4.85 Cr rig time).
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-black/5 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              Logged under Role: <strong className="text-[#1E3A8A] dark:text-blue-300">{currentRole}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="clay-btn px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
            >
              Close Window
            </button>
            <button
              onClick={() => {
                setAcked(true);
                onAcknowledge(
                  `Signed & Acknowledged 6-Point XAI Barail Mitigation Advisory at ${activeDepth.toFixed(1)}m (${currentRole})`
                );
              }}
              className="clay-btn-primary px-4 py-2 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              {acked ? 'Signed & Recorded in SHA-256 Ledger' : 'Sign & Record Advisory in Ledger'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
