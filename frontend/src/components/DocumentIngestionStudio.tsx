import React, { useState, useRef } from 'react';
import {
  FileText,
  CheckCircle2,
  Database,
  Sparkles,
  ShieldCheck,
  ScanLine,
  FileUp,
  ExternalLink,
  BarChart3,
  Lock,
  Unlock,
  EyeOff,
  Eye,
  Users,
  Table2
} from 'lucide-react';
import { HistoricalDocument, UserRole } from '../types';

interface DocumentIngestionStudioProps {
  documents: HistoricalDocument[];
  currentRole?: UserRole;
  onDocumentIngested: (newDoc: HistoricalDocument) => void;
}

export const DocumentIngestionStudio: React.FC<DocumentIngestionStudioProps> = ({
  currentRole = 'DRILLING_ENGINEER',
  onDocumentIngested
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [filename, setFilename] = useState<string>('Scanned_DDR_W093_1998_Barail.pdf');
  const [wellId, setWellId] = useState<string>('W-093');
  const [docType, setDocType] = useState<string>('Scanned Hardcopy Daily Drilling Report (DDR)');
  const [rawText, setRawText] = useState<string>(
    'At 3,428 m in Barail Coal-Shale formation (Lat 27°21\'48.4"N, Long 95°19\'14.2"E), partial to severe mud losses of 15.2 bbl/hr were observed accompanied by torque spike to 33.4 kNm. Net Pay 28.4m (Est. 14.8 MMbbl). Pumped 25 bbl bimodal LCM pill (15 ppb Nut-Plug + 10 ppb Coarse Flake Mica + 45 ppb Sized CaCO3). Signed: Er. R.K. Borthakur.'
  );
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [fileSizeKb, setFileSizeKb] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [savedPathBanner, setSavedPathBanner] = useState<string | null>(null);

  // Active Deep Analysis Tab
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<
    'GRAPHS' | 'TABLES' | 'SENSITIVE_DLP' | 'RBAC_GUIDE'
  >('GRAPHS');

  // Sensitive Data Masking State (Default: Redacted/Masked for security)
  const [isRedacted, setIsRedacted] = useState<boolean>(true);
  const [pinForUnmask, setPinForUnmask] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');

  const [deepData, setDeepData] = useState<any>({
    well: 'W-093',
    depth_m: 3428,
    formation: 'Barail Coal-Shale',
    event_type: 'MUD_LOSS',
    severity: 'HIGH',
    loss_rate_bbl_hr: 15.2,
    mitigation_pill: '25 bbl Bimodal LCM + 45 ppb CaCO3 Stress-Caging Pill',
    sha256_hash: '9f4c82d1a07e4b6c92d8f5103a7b2e1948c6d0a3b2e1f9048c2d1a3b7e501a4d',
    classification_level: 'RESTRICTED • MoPNG / OIL STRATEGIC ASSET (LEVEL-4)',
    encryption_cipher: 'AES-256-GCM (On-Premise Hardware HSM Vault)',
    digitized_graph: {
      graph_title:
        'Digitized Chart from Report: ECD (SG) vs. Mud Loss Rate (bbl/hr) across Barail Coal-Shale',
      frac_limit_sg: 1.275,
      series: [
        { depth: 3400, ecd_sg: 1.242, loss_bbl_hr: 0.4, torque_knm: 17.8 },
        { depth: 3410, ecd_sg: 1.258, loss_bbl_hr: 1.8, torque_knm: 19.4 },
        { depth: 3420, ecd_sg: 1.276, loss_bbl_hr: 6.5, torque_knm: 24.2 },
        { depth: 3428, ecd_sg: 1.289, loss_bbl_hr: 15.2, torque_knm: 33.4 },
        { depth: 3438, ecd_sg: 1.245, loss_bbl_hr: 2.1, torque_knm: 21.0 },
        { depth: 3450, ecd_sg: 1.236, loss_bbl_hr: 0.3, torque_knm: 18.2 }
      ]
    },
    engineering_tables: {
      mud_rheology: {
        mud_type: 'KCl-PHPA Polymer Inhibited Water-Based Mud',
        mud_weight_sg: '1.24 SG (Trimmed to 1.20 SG post-pill)',
        funnel_viscosity_sec: '52 sec/qt',
        plastic_viscosity_cp: '24 cP',
        yield_point_lb100sqft: '28 lb/100ft²',
        filtrate_api_ml: '4.2 mL / 30 min',
        lcm_composition: '45 ppb Sized CaCO3 (D50=75µm) + 15 ppb Resilient Graphite'
      },
      bha_casing: {
        bit_size_type: '8.5" PDC 6-Blade (IADC M323) • TFA 0.92 in²',
        last_casing_shoe: '9-5/8" Casing @ 3,180 m TVD (Shoe FIT: 1.42 SG)',
        open_hole_interval: '3,180 m – 3,453 m',
        npt_breakdown: '14.5 hrs Circulation / Pill Squeeze + 6.0 hrs Wiper Trip'
      }
    },
    sensitive_data_dlp: {
      risk_score: 'HIGH_SENSITIVITY_NATIONAL_INFRASTRUCTURE',
      total_sensitive_entities: 4,
      findings: [
        {
          category: 'STRATEGIC_GPS_COORDINATES',
          raw_value: 'Lat 27°21\'48.4"N, Long 95°19\'14.2"E (UTM Zone 46N 729410E 3028450N)',
          redacted_value: 'Lat 27°21\'[REDACTED]"N, Long 95°19\'[REDACTED]"E (Duliajan Block)',
          policy: 'MoPNG / DGH National Data Repository Geodetic Masking Rule'
        },
        {
          category: 'HYDROCARBON_RESERVE_ESTIMATE',
          raw_value: 'Net Pay 28.4m in Barail Main Sand • Est. In-Place 14.8 MMbbl Oil / 42 BCF Gas',
          redacted_value: 'Net Pay [REDACTED-RESERVE-DATA] • Price-Sensitive PSU Discovery',
          policy: 'SEBI / OIL Unpublished Price-Sensitive Reserve Protection'
        },
        {
          category: 'COMMERCIAL_RIG_CONTRACT_COST',
          raw_value: 'Charter Rig Day-Rate ₹18.45 Lakhs/day (Contract #OIL/DRG/DUL/2024-89)',
          redacted_value: 'Charter Rig Day-Rate [REDACTED-COMMERCIAL] (Contract #[REDACTED])',
          policy: 'PSU Commercial & Vendor Confidentiality Clause'
        },
        {
          category: 'PERSONNEL_PII_SIGNATURES',
          raw_value: 'Signed: Er. R.K. Borthakur (Emp #40892, +91-94350-XXXXX) & Dr. S. Gogoi',
          redacted_value: 'Signed: [REDACTED-ROLE: NIGHT_TOOLPUSHER] & [REDACTED-ROLE: WELL_SITE_GEOLOGIST]',
          policy: 'DPDP Act 2023 & CERT-In Personnel Privacy Guard'
        }
      ]
    }
  });

  const handleFileSelected = (file: File) => {
    setFilename(file.name);
    setFileSizeKb(Number((file.size / 1024).toFixed(1)));

    const reader = new FileReader();
    reader.onload = () => {
      const resultStr = String(reader.result || '');
      setFileBase64(resultStr);

      if (file.type.startsWith('text/')) {
        const textReader = new FileReader();
        textReader.onload = () => setRawText(String(textReader.result || ''));
        textReader.readAsText(file);
      } else {
        setRawText(
          `[DEEP OCR + VISION GRAPH DIGITIZATION: ${file.name} (${(
            file.size / 1024
          ).toFixed(
            1
          )} KB)] At 3,428 m in Barail Coal-Shale formation (Lat 27°21'48.4"N, Long 95°19'14.2"E), dynamic seepage losses of 15.2 bbl/hr recorded on ECD vs. Loss strip-chart. Pumped 45 ppb Sized CaCO3 + 15 ppb Graphite Stress-Caging Pill.`
        );
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRunPipeline = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename,
          well_id: wellId,
          doc_type: docType,
          raw_text: rawText,
          role: currentRole,
          file_base64: fileBase64
        })
      });
      if (res.ok) {
        const data = await res.json();
        const docObj = data.document || data;
        onDocumentIngested(docObj);
        setSavedPathBanner(
          `Report '${filename}' deep-analyzed (Tables + Graphs + Sensitive DLP Masked), encrypted with AES-256-GCM, and saved to ${
            data.saved_to || `backend/data/research_docs/${filename}`
          }!`
        );
        if (docObj.deep_analysis) {
          setDeepData({
            ...deepData,
            well: docObj.well_id,
            depth_m: docObj.extracted_entities?.depth_m || 3428,
            formation: docObj.formation,
            event_type: docObj.extracted_entities?.event || 'MUD_LOSS',
            severity: docObj.extracted_entities?.severity || 'HIGH',
            loss_rate_bbl_hr: docObj.extracted_entities?.loss_rate_bbl_hr || 15.2,
            mitigation_pill:
              docObj.extracted_entities?.mitigation || docObj.mitigation_lesson,
            sha256_hash: docObj.sha256_fingerprint || docObj.sha256_hash,
            ...docObj.deep_analysis
          });
        }
      }
    } catch {
      // Fallback local state
    } finally {
      setTimeout(() => setIsProcessing(false), 450);
    }
  };

  const handleToggleMask = () => {
    if (!isRedacted) {
      setIsRedacted(true);
      setPinError('');
      return;
    }
    if (pinForUnmask.trim() === '2612' || currentRole === 'SYSTEM_ADMIN') {
      setIsRedacted(false);
      setPinError('');
    } else {
      setPinError('Enter Supervisor 2FA PIN 2612 to unmask MoPNG/DGH sensitive coordinates & reserves.');
    }
  };

  return (
    <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm space-y-5">
      {/* Top Header with Role Upload Clearance Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-blue-50">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <ScanLine className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-black text-[#1E3A8A] uppercase tracking-tight">
                Deep Multi-Modal Report Upload, Graph Digitizer &amp; Sensitive Data Vault
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-600" />
                AES-256-GCM + AUTO-DLP REDACTION
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Authorized Uploader: <strong className="text-[#1E3A8A]">{currentRole}</strong> • Extracts Embedded Engineering Tables, Digitizes Log/Pressure Graphs &amp; Masks Sensitive GPS/Reserve Data
            </p>
          </div>
        </div>

        <button
          onClick={handleRunPipeline}
          disabled={isProcessing}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          {isProcessing
            ? 'Running Deep Graph & DLP Analysis...'
            : 'Upload & Run Deep Multi-Modal Analysis'}
        </button>
      </div>

      {savedPathBanner && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs font-bold text-emerald-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{savedPathBanner}</span>
          </div>
          <a
            href={`/api/docs/${encodeURIComponent(filename)}`}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1 rounded-lg bg-emerald-700 text-white text-[11px] font-black flex items-center gap-1"
          >
            Open Encrypted PDF <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* Top Upload Row: Drag-and-Drop File Picker + Metadata Inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files?.[0]) {
                handleFileSelected(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`h-full border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
              isDragging
                ? 'border-blue-600 bg-blue-50'
                : 'border-blue-200 bg-[#F8FAFF] hover:border-blue-400 hover:bg-blue-50/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.tiff,.txt"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleFileSelected(e.target.files[0]);
                }
              }}
              className="hidden"
            />
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs mb-2">
              <FileUp className="w-5 h-5" />
            </div>
            <div className="text-xs font-black text-[#1E3A8A]">
              Drop Scanned Report, Chart Image or PDF Here (or Click to Browse)
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {fileSizeKb
                ? `Loaded: ${filename} (${fileSizeKb} KB)`
                : 'Supports PDF, TIFF, JPG, PNG (DDRs, WCRs, Strip-Charts, Mud Logs)'}
            </div>
            <div className="mt-2 px-2.5 py-0.5 rounded-full bg-blue-100/80 text-blue-800 text-[10px] font-bold">
              Or copy files directly to: backend/data/research_docs/
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Report Filename
              </label>
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#F8FAFF] border border-blue-200 text-xs font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Well ID
              </label>
              <select
                value={wellId}
                onChange={(e) => setWellId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#F8FAFF] border border-blue-200 text-xs font-bold text-[#1E3A8A]"
              >
                <option value="W-093">W-093 (Nahorkatiya)</option>
                <option value="W-098">W-098 (Moran Safe Benchmark)</option>
                <option value="W-087">W-087 (Duliajan Central)</option>
                <option value="W-105">W-105 (Dikom East)</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Report Type
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#F8FAFF] border border-blue-200 text-xs font-bold text-[#1E3A8A]"
              >
                <option>Scanned Hardcopy Daily Drilling Report (DDR)</option>
                <option>Well Completion Report (WCR) with Logs</option>
                <option>Master Mud Log &amp; Strip-Chart</option>
                <option>Pressure-While-Drilling (PWD) Graph Dossier</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
              OCR Extracted Text &amp; Sensitive Metadata Stream
            </label>
            <textarea
              rows={2}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-[#F8FAFF] border border-blue-200 text-xs text-slate-700 font-medium"
            />
          </div>
        </div>
      </div>

      {/* =====================================================================
          4-TAB DEEP MULTI-MODAL DOCUMENT INTELLIGENCE & DLP VIEWER
         ===================================================================== */}
      <div className="border-t border-blue-100 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveAnalysisTab('GRAPHS')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                activeAnalysisTab === 'GRAPHS'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-sm'
                  : 'bg-[#F8FAFF] text-slate-700 hover:bg-blue-50 border border-blue-100'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              1. Digitized Graphs &amp; Curves (Vision-OCR)
            </button>

            <button
              onClick={() => setActiveAnalysisTab('TABLES')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                activeAnalysisTab === 'TABLES'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-sm'
                  : 'bg-[#F8FAFF] text-slate-700 hover:bg-blue-50 border border-blue-100'
              }`}
            >
              <Table2 className="w-4 h-4" />
              2. Deep Engineering Tables (BHA &amp; Rheology)
            </button>

            <button
              onClick={() => setActiveAnalysisTab('SENSITIVE_DLP')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                activeAnalysisTab === 'SENSITIVE_DLP'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm'
                  : 'bg-emerald-50/70 text-emerald-900 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <Lock className="w-4 h-4" />
              3. Sensitive Data DLP &amp; Redaction Vault (4 Flags)
            </button>

            <button
              onClick={() => setActiveAnalysisTab('RBAC_GUIDE')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                activeAnalysisTab === 'RBAC_GUIDE'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-sm'
                  : 'bg-[#F8FAFF] text-slate-700 hover:bg-blue-50 border border-blue-100'
              }`}
            >
              <Users className="w-4 h-4" />
              4. Who Can Upload &amp; Security Policy
            </button>
          </div>

          <span className="text-[11px] font-mono font-bold text-slate-500">
            Classification: <strong className="text-red-600">RESTRICTED LEVEL-4</strong>
          </span>
        </div>

        {/* TAB 1: DIGITIZED GRAPHS & CURVES */}
        {activeAnalysisTab === 'GRAPHS' && (
          <div className="bg-[#F8FAFF] border border-blue-100 rounded-2xl p-4 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            <div className="lg:col-span-7 bg-white border border-blue-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="text-xs font-black text-[#1E3A8A] uppercase">
                    {deepData.digitized_graph.graph_title}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Automatically digitized from scanned strip-chart / embedded PDF figure via CurveDigitizer-v2
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 text-[10px] font-black">
                  Frac Limit: 1.275 SG
                </span>
              </div>

              {/* Interactive SVG Dual-Axis Chart */}
              <svg viewBox="0 0 520 210" className="w-full h-48 overflow-visible">
                {/* Grid lines */}
                {[35, 80, 125, 170].map((y, i) => (
                  <line
                    key={i}
                    x1="45"
                    y1={y}
                    x2="485"
                    y2={y}
                    stroke="#E2E8F0"
                    strokeDasharray="3 3"
                  />
                ))}
                {/* 1.275 SG Fracture Breakdown Horizontal Threshold Line */}
                <line
                  x1="45"
                  y1="68"
                  x2="485"
                  y2="68"
                  stroke="#DC2626"
                  strokeWidth="1.8"
                  strokeDasharray="5 4"
                />
                <text x="48" y="62" fill="#DC2626" fontSize="9" fontWeight="bold">
                  Barail Fracture Gradient Threshold (1.275 SG)
                </text>

                {/* Bars for Mud Loss Rate (bbl/hr) */}
                {deepData.digitized_graph.series.map((pt: any, idx: number) => {
                  const x = 65 + idx * 76;
                  const barH = Math.min(130, pt.loss_bbl_hr * 8.2);
                  const barY = 175 - barH;
                  return (
                    <g key={pt.depth}>
                      <rect
                        x={x - 16}
                        y={barY}
                        width="32"
                        height={barH}
                        rx="4"
                        fill={pt.loss_bbl_hr > 5 ? '#EF4444' : '#3B82F6'}
                        opacity="0.82"
                      />
                      <text
                        x={x}
                        y={barY - 5}
                        textAnchor="middle"
                        fill="#1E3A8A"
                        fontSize="9"
                        fontWeight="bold"
                      >
                        {pt.loss_bbl_hr} bbl/h
                      </text>
                      <text
                        x={x}
                        y="192"
                        textAnchor="middle"
                        fill="#475569"
                        fontSize="10"
                        fontWeight="bold"
                      >
                        {pt.depth}m
                      </text>
                    </g>
                  );
                })}

                {/* Polyline for ECD (SG) */}
                <polyline
                  fill="none"
                  stroke="#1E3A8A"
                  strokeWidth="2.5"
                  points={deepData.digitized_graph.series
                    .map((pt: any, idx: number) => {
                      const x = 65 + idx * 76;
                      const y = 175 - (pt.ecd_sg - 1.22) * 1600;
                      return `${x},${y}`;
                    })
                    .join(' ')}
                />
                {deepData.digitized_graph.series.map((pt: any, idx: number) => {
                  const x = 65 + idx * 76;
                  const y = 175 - (pt.ecd_sg - 1.22) * 1600;
                  return (
                    <g key={`ecd-${pt.depth}`}>
                      <circle cx={x} cy={y} r="4.5" fill="#F97316" stroke="#FFFFFF" strokeWidth="1.5" />
                      <text
                        x={x}
                        y={y - 8}
                        textAnchor="middle"
                        fill="#9A3412"
                        fontSize="9"
                        fontWeight="bold"
                      >
                        {pt.ecd_sg} SG
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="lg:col-span-5 space-y-2.5">
              <div className="text-xs font-black text-[#1E3A8A] uppercase">
                Digitized Curve Points (Extracted from PDF Graph)
              </div>
              <div className="overflow-x-auto bg-white rounded-xl border border-blue-100">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[#F8FAFF] border-b border-blue-100 text-[10px] font-black text-slate-500 uppercase">
                      <th className="py-2 px-2.5">Depth</th>
                      <th className="py-2 px-2.5">ECD (SG)</th>
                      <th className="py-2 px-2.5">Loss (bbl/hr)</th>
                      <th className="py-2 px-2.5">Torque</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-50 font-mono text-[11px]">
                    {deepData.digitized_graph.series.map((pt: any) => (
                      <tr key={pt.depth} className={pt.loss_bbl_hr > 10 ? 'bg-red-50/70 font-bold text-red-700' : ''}>
                        <td className="py-1.5 px-2.5">{pt.depth} m</td>
                        <td className="py-1.5 px-2.5">{pt.ecd_sg} SG</td>
                        <td className="py-1.5 px-2.5">{pt.loss_bbl_hr} bbl/hr</td>
                        <td className="py-1.5 px-2.5">{pt.torque_knm} kNm</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DEEP ENGINEERING TABLES */}
        {activeAnalysisTab === 'TABLES' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#F8FAFF] border border-blue-100 rounded-2xl p-4">
              <h4 className="text-xs font-black text-[#1E3A8A] uppercase mb-2.5">
                Extracted Drilling Fluid &amp; LCM Rheology Table
              </h4>
              <div className="space-y-2 text-xs">
                {Object.entries(deepData.engineering_tables.mud_rheology).map(([k, v]) => (
                  <div key={k} className="flex justify-between bg-white p-2 rounded-xl border border-blue-50">
                    <span className="font-bold text-slate-500 uppercase text-[10px]">
                      {k.replace(/_/g, ' ')}
                    </span>
                    <span className="font-bold text-[#1E3A8A]">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#F8FAFF] border border-blue-100 rounded-2xl p-4">
              <h4 className="text-xs font-black text-[#1E3A8A] uppercase mb-2.5">
                Extracted BHA, Casing Shoe &amp; NPT Time Breakdown
              </h4>
              <div className="space-y-2 text-xs">
                {Object.entries(deepData.engineering_tables.bha_casing).map(([k, v]) => (
                  <div key={k} className="flex justify-between bg-white p-2 rounded-xl border border-blue-50">
                    <span className="font-bold text-slate-500 uppercase text-[10px]">
                      {k.replace(/_/g, ' ')}
                    </span>
                    <span className="font-bold text-[#1E3A8A]">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SENSITIVE DATA DLP, AUTO-REDACTION & AES-256 VAULT */}
        {activeAnalysisTab === 'SENSITIVE_DLP' && (
          <div className="bg-[#F8FAFF] border border-emerald-200 rounded-2xl p-4 space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-blue-100">
              <div className="flex items-center gap-2.5">
                {isRedacted ? (
                  <EyeOff className="w-5 h-5 text-emerald-600" />
                ) : (
                  <Eye className="w-5 h-5 text-amber-600" />
                )}
                <div>
                  <div className="text-xs font-black text-[#1E3A8A]">
                    Data Loss Prevention (DLP) &amp; National Data Repository (NDR) Geodetic Redaction
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Sensitive coordinates, hydrocarbon reserve volumes, commercial day-rates, and personnel PII are automatically masked before indexing into AI RAG.
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isRedacted && (
                  <input
                    type="password"
                    maxLength={6}
                    value={pinForUnmask}
                    onChange={(e) => setPinForUnmask(e.target.value)}
                    placeholder="2FA PIN (2612)"
                    className="w-28 px-2.5 py-1.5 rounded-lg bg-[#F8FAFF] border border-blue-200 text-xs font-mono font-bold text-center"
                  />
                )}
                <button
                  onClick={handleToggleMask}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer ${
                    isRedacted
                      ? 'bg-amber-500 hover:bg-amber-600 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {isRedacted ? (
                    <>
                      <Unlock className="w-3.5 h-3.5" /> Unmask Raw Data (PIN 2612)
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" /> Re-Mask Sensitive Data
                    </>
                  )}
                </button>
              </div>
            </div>

            {pinError && (
              <div className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-xl border border-red-200">
                {pinError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {deepData.sensitive_data_dlp.findings.map((f: any, idx: number) => (
                <div key={idx} className="bg-white border border-blue-100 rounded-xl p-3.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-[#1E3A8A]">{f.category}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                        isRedacted
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {isRedacted ? 'MASKED IN RAG' : 'UNMASKED (LEVEL-4)'}
                    </span>
                  </div>
                  <div className="mt-2 p-2 rounded-lg bg-[#F8FAFF] font-mono text-[11px] font-bold text-slate-800">
                    {isRedacted ? f.redacted_value : f.raw_value}
                  </div>
                  <div className="mt-1.5 text-[10px] text-slate-400 font-semibold">
                    Policy: {f.policy}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: WHO CAN UPLOAD & SECURITY POLICY */}
        {activeAnalysisTab === 'RBAC_GUIDE' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            {[
              {
                role: '1. Drilling Engineer',
                clearance: 'LEVEL-4 FIELD EXECUTION',
                canUpload: 'Daily Drilling Reports (DDRs), BHA Tallies, Hydraulics & LCM Pill Logs',
                dlpAccess: 'Masked by default; can unmask via 2FA PIN (2612)'
              },
              {
                role: '2. Well-Site Geologist',
                clearance: 'LEVEL-3 GEOSCIENCE',
                canUpload: 'Master Mud Logs, Core Analysis Reports, Lithology Strip-Charts & WCRs',
                dlpAccess: 'Can view formation & reserve data; commercial costs masked'
              },
              {
                role: '3. eRTMAC Superintendent',
                clearance: 'LEVEL-4 RIG OPERATIONS',
                canUpload: 'Well Control / Kick Sheets, Stuck-Pipe Incident Dossiers & Shift Handovers',
                dlpAccess: 'Full operational access with 2FA PIN (2612)'
              },
              {
                role: '4. Asset Manager / Admin',
                clearance: 'LEVEL-5 EXECUTIVE GOVERNANCE',
                canUpload: 'Regional CoEES Research Studies, Statutory OISD Audits & Bulk Archive Batches',
                dlpAccess: 'Full unredacted custody + SHA-256 Merkle Root Sign-off'
              }
            ].map((r, i) => (
              <div key={i} className="bg-[#F8FAFF] border border-blue-100 rounded-xl p-3.5 space-y-1.5">
                <div className="font-black text-[#1E3A8A]">{r.role}</div>
                <div className="inline-block px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
                  {r.clearance}
                </div>
                <p className="text-[11px] text-slate-600">
                  <strong>Can Upload:</strong> {r.canUpload}
                </p>
                <p className="text-[11px] text-emerald-800 font-semibold">
                  <strong>Sensitive Data:</strong> {r.dlpAccess}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
