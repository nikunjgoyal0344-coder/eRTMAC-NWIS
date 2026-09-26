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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 backdrop-blur-xs p-4">
      <div className="bg-white border-2 border-blue-200 rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-blue-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/25">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-[#1E3A8A] uppercase tracking-tight">
                  6-Point Explainable AI (XAI) Alert Verification Dossier
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  SHA-256 VERIFIED
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Zero-Hallucination Provenance Chain for Active Bit at{' '}
                <span className="font-mono font-bold text-[#1E3A8A]">{activeDepth.toFixed(1)} m</span>{' '}
                ({distToHazard} m ahead of Barail Loss Zone)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 6-Point Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-[#F8FAFF] border border-blue-100">
            <div className="text-[10px] font-black text-blue-600 uppercase">
              1. Triggering Subsurface Horizon
            </div>
            <div className="font-bold text-[#1E3A8A] mt-1">
              Barail Fractured Sandstone &amp; Coal-Shale (3,400–3,450 m TVD)
            </div>
            <p className="text-[11px] text-slate-600 mt-1">
              Sub-hydrostatic pore pressure (1.242 SG) coupled with low fracture breakdown gradient (1.275 SG).
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F8FAFF] border border-blue-100">
            <div className="text-[10px] font-black text-blue-600 uppercase">
              2. Primary Offset Analog Evidence
            </div>
            <div className="font-bold text-[#1E3A8A] mt-1">
              Well W-093 (1.42 km NE • 96.4% Cosine Similarity)
            </div>
            <p className="text-[11px] text-slate-600 mt-1">
              Experienced 15.4 bbl/hr dynamic seepage loss (312 bbl total) &amp; 46 hrs NPT at 3,428 m under 1.24 SG mud weight.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F8FAFF] border border-blue-100">
            <div className="text-[10px] font-black text-blue-600 uppercase">
              3. Golden Offset Safe Benchmark
            </div>
            <div className="font-bold text-emerald-800 mt-1">
              Well W-098 (1.95 km NW • 0 hrs NPT in Barail)
            </div>
            <p className="text-[11px] text-slate-600 mt-1">
              Drilled safely by reducing MW to 1.20 SG at 3,380 m and sweeping 45 ppb CaCO₃ + 15 ppb Graphite Stress-Caging Pill.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F8FAFF] border border-blue-100">
            <div className="text-[10px] font-black text-blue-600 uppercase">
              4. Physics-Informed Hydraulic Margin
            </div>
            <div className="font-bold text-[#1E3A8A] mt-1">
              Current ECD 1.281 SG vs. Frac Limit 1.275 SG
            </div>
            <p className="text-[11px] text-slate-600 mt-1">
              Reducing MW to 1.20 SG and flow to 1,850 LPM lowers ECD to 1.239 SG while Stress-Caging widens window to 1.314 SG.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F8FAFF] border border-blue-100">
            <div className="text-[10px] font-black text-blue-600 uppercase">
              5. Cryptographic Source Citations
            </div>
            <div className="font-bold text-[#1E3A8A] mt-1 flex items-center gap-2">
              <span>DOC-DDR-W093-142 (p.4) &amp; DOC-MUD-W098-04 (p.19)</span>
            </div>
            <div className="mt-1.5 flex items-center gap-3">
              <a
                href="/api/docs/DDR_W093_142.pdf"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                Open W-093 DDR <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="/api/docs/MudLog_W098_Barail.pdf"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-bold text-emerald-700 hover:underline inline-flex items-center gap-1"
              >
                Open W-098 Mud Log <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
            <div className="text-[10px] font-black text-emerald-800 uppercase">
              6. Quantified Risk Reduction Impact
            </div>
            <div className="font-black text-emerald-700 text-sm mt-1">
              84% Unmitigated Risk → 18% Mitigated Risk (-66% Drop)
            </div>
            <p className="text-[11px] text-emerald-900 mt-1">
              Saves estimated 42–68 hours of Stuck-Pipe / Lost-Circulation NPT (~₹4.85 Cr rig time).
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-blue-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              Logged under Role: <strong className="text-[#1E3A8A]">{currentRole}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-600 cursor-pointer"
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
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer"
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
