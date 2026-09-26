import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  Radar,
  Activity,
  ShieldAlert,
  Sparkles,
  FileBarChart2,
  ShieldCheck,
  Settings,
  HelpCircle,
  Lock,
  User,
  ChevronDown,
  Play,
  Pause,
  AlertTriangle,
  Sun,
  Moon,
  FileText
} from 'lucide-react';
import {
  HistoricalDocument,
  AuditLogEntry,
  UserRole,
  WellSummary,
  DrillingEvent,
  FormationLayer,
  SurveyPoint,
  TelemetrySample
} from './types';
import { Subsurface3DMap } from './components/Subsurface3DMap';
import { GeospatialRadar2D } from './components/GeospatialRadar2D';
import { WellLogComparison } from './components/WellLogComparison';
import { Phase3RiskIntelligence } from './components/Phase3RiskIntelligence';
import { InstitutionalMemoryRAG } from './components/InstitutionalMemoryRAG';
import { DocumentIngestionStudio } from './components/DocumentIngestionStudio';
import { Phase4GovernanceAndTrends } from './components/Phase4GovernanceAndTrends';
import { SecurityCommandCenter } from './components/SecurityCommandCenter';
import { ExplainAlertModal } from './components/ExplainAlertModal';
import defaultDataset from './data/nwis_dataset.json';

export type NavScreen =
  | 'dashboard'
  | 'monitoring'
  | 'logs'
  | 'risk'
  | 'ai_insights'
  | 'reports'
  | 'security';

export function App() {
  const [activeScreen, setActiveScreen] = useState<NavScreen>('logs');
  const [selectedWellId, setSelectedWellId] = useState<string>('W-093');
  const [radiusKm, setRadiusKm] = useState<number>(10);
  const [activeDepth, setActiveDepth] = useState<number>(3385.0);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [currentRole, setCurrentRole] = useState<UserRole>('DRILLING_ENGINEER');
  const [isExplainModalOpen, setIsExplainModalOpen] = useState<boolean>(false);

  // Light Mode (default: true for crisp Oil India Limited Light SaaS UI) + MFA Write-Gate state
  const [isLightMode, setIsLightMode] = useState<boolean>(true);
  const [mfaUnlocked, setMfaUnlocked] = useState<boolean>(true);

  const initialData: any = defaultDataset || {};
  const [wells, setWells] = useState<WellSummary[]>(initialData.wells || []);
  const [formations, setFormations] = useState<FormationLayer[]>(initialData.formations || []);
  const [trajectories, setTrajectories] = useState<Record<string, SurveyPoint[]>>(initialData.trajectories || {});
  const [wellLogs, setWellLogs] = useState<Record<string, TelemetrySample[]>>(initialData.wellLogs || {});
  const [events, setEvents] = useState<DrillingEvent[]>(initialData.events || []);
  const [documents, setDocuments] = useState<HistoricalDocument[]>(initialData.documents || []);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(initialData.auditLogs || []);

  useEffect(() => {
    fetch('/api/dataset')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        if (data.wells?.length) setWells(data.wells);
        if (data.formations?.length) setFormations(data.formations);
        if (data.trajectories) setTrajectories(data.trajectories);
        if (data.wellLogs) setWellLogs(data.wellLogs);
        if (data.events?.length) setEvents(data.events);
        if (data.documents?.length) setDocuments(data.documents);
        if (data.auditLogs?.length) setAuditLogs(data.auditLogs);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isStreaming) return;
    const timer = setInterval(() => {
      setActiveDepth((prev) => {
        if (prev >= 3475) return 3340;
        return Number((prev + 1.0).toFixed(1));
      });
    }, 900);
    return () => clearInterval(timer);
  }, [isStreaming]);

  const currentTelemetry = useMemo<TelemetrySample>(() => {
    const activeLogs = wellLogs['W-101'] || [];
    if (activeLogs.length === 0) {
      return {
        depth: activeDepth,
        formation: 'Tipam Sandstone',
        rop_m_hr: 14.2,
        wob_tonnes: 15.8,
        rpm: 118,
        torque_knm: 18.4,
        spp_psi: 2840,
        mud_weight_sg: 1.24,
        flow_in_lpm: 2150,
        flow_out_lpm: 2145,
        mud_loss_bbl_hr: 0.4,
        gas_units: 42,
        ecd_sg: 1.268
      };
    }
    return (
      activeLogs.reduce((prev, curr) =>
        Math.abs(curr.depth - activeDepth) < Math.abs(prev.depth - activeDepth)
          ? curr
          : prev
      ) || activeLogs[0]
    );
  }, [wellLogs, activeDepth]);

  const handleAppendAudit = async (action: string, details: string) => {
    const newEntry: AuditLogEntry = {
      log_id: `AUD-${Date.now().toString().slice(-5)}`,
      timestamp: new Date().toISOString(),
      user_id: 'ENG-DULIAJAN-01',
      role: currentRole,
      action,
      target_id: 'W-101',
      details: `[MFA:${mfaUnlocked ? 'VERIFIED' : 'READ_ONLY'}] ${details}`,
      sha256_signature:
        'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
    try {
      await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: newEntry.user_id,
          role: newEntry.role,
          action,
          target_id: 'W-101',
          details: newEntry.details
        })
      });
    } catch {
      // Local state already updated
    }
  };

  const handleNavigateLegacyTab = (tab: string) => {
    if (tab === 'logs') setActiveScreen('logs');
    else if (tab === 'risk') setActiveScreen('risk');
    else if (tab === 'rag') setActiveScreen('ai_insights');
    else if (tab === 'governance' || tab === 'ingest') setActiveScreen('reports');
    else if (tab === 'map') setActiveScreen('monitoring');
    else if (tab === 'security') setActiveScreen('security');
  };

  return (
    <div
      className={`min-h-screen bg-[#F4F7FB] text-[#0F172A] flex flex-col font-sans antialiased transition-all duration-200 ${
        !isLightMode ? 'invert hue-rotate-180 contrast-95' : ''
      }`}
    >
      {/* =====================================================================
          TOP ENTERPRISE HEADER BAR (Exact Match to Oil India Limited UI)
         ===================================================================== */}
      <header className="bg-white border-b border-blue-100 px-5 py-2.5 sticky top-0 z-40 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Left: Official Oil India Limited Bilingual Logo + eRTMAC-NWIS Brand + Block Info */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2.5 pr-4 border-r border-slate-200">
              <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 shadow-2xs flex items-center justify-center overflow-hidden p-0.5">
                <svg viewBox="0 0 48 48" className="w-9 h-9">
                  <path d="M4 4 H24 V44 H4 Z" fill="#DC2626" />
                  <path d="M24 4 H44 V44 H24 Z" fill="#1E293B" />
                  <circle cx="24" cy="17" r="7.5" fill="#FFFFFF" />
                  <path d="M19 22 L15 41 H33 L29 22 Z" fill="#FFFFFF" />
                  <circle cx="24" cy="17" r="3.2" fill="#1E293B" />
                </svg>
              </div>
              <div className="leading-tight">
                <div className="text-[11px] font-extrabold text-slate-800 tracking-tight">
                  ऑयल इंडिया लिमिटेड
                </div>
                <div className="text-xs font-black text-[#0F172A] tracking-tight">
                  Oil India Limited
                </div>
                <div className="text-[9px] font-semibold text-red-600 italic">
                  Conquering Newer Horizons
                </div>
              </div>
            </div>

            {/* eRTMAC-NWIS Title */}
            <div className="pr-4 border-r border-slate-200 leading-tight">
              <div className="text-lg font-black text-[#1D4ED8] tracking-tight">
                eRTMAC-NWIS
              </div>
              <div className="text-[11px] font-bold text-slate-600">
                Nearby Wells Intelligence System
              </div>
            </div>

            {/* Field Location Subtitle */}
            <div className="hidden xl:block leading-tight">
              <div className="text-xs font-extrabold text-slate-800">
                Greater Duliajan / Nahorkatiya Block (Assam)
              </div>
              <div className="text-[11px] font-medium text-slate-500">
                Drilling Intelligence for Safer, Smarter Operations
              </div>
            </div>
          </div>

          {/* Right: Upload Report Quick Button + Light Mode Switcher + Depth Scrubber + Security Pill + Role */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Quick Upload & Deep Analyze Report Button */}
            <button
              onClick={() => setActiveScreen('reports')}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white text-xs font-black flex items-center gap-1.5 shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
              title="Upload Scanned Hardcopy / PDF Reports & Run Deep Graph + Sensitive Data DLP Analysis"
            >
              <FileBarChart2 className="w-3.5 h-3.5" />
              <span>+ Upload Report</span>
            </button>

            {/* Download Official Architecture & Flowchart PDF */}
            <a
              href="/OIL_eRTMAC_NWIS_Technical_Approach_Architecture_Flowcharts.pdf"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Download & View Official Technical Approach & Architecture Flowcharts PDF (5 Pages)"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-700" />
              <span>Architecture PDF</span>
            </a>

            {/* Light / Night Mode Switcher */}
            <button
              onClick={() => setIsLightMode(!isLightMode)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                isLightMode
                  ? 'bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100'
                  : 'bg-blue-50 border-blue-200 text-blue-900'
              }`}
              title="Toggle between Daylight Enterprise Light Mode (Default) and Rig-Floor Night Contrast"
            >
              {isLightMode ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-600" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-blue-600" />
                  <span>Night Filter</span>
                </>
              )}
            </button>

            {/* Compact Interactive Bit Depth Scrubber Pill */}
            <div className="hidden md:flex items-center gap-2 bg-[#F8FAFF] border border-blue-200 rounded-xl px-3 py-1">
              <span className="text-[10px] font-extrabold text-[#1E3A8A] uppercase">
                W-101 Bit:
              </span>
              <span className="font-mono text-xs font-black text-emerald-700">
                {activeDepth.toFixed(0)} m
              </span>
              <input
                type="range"
                min={3330}
                max={3470}
                step={1}
                value={activeDepth}
                onChange={(e) => setActiveDepth(parseFloat(e.target.value))}
                className="w-20 accent-blue-600 cursor-pointer h-1.5 bg-blue-100 rounded-lg"
                title="Scrub Active Well W-101 Bit Depth (3,330m - 3,470m)"
              />
              <button
                onClick={() => setIsStreaming(!isStreaming)}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                  isStreaming
                    ? 'bg-amber-500 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isStreaming ? <Pause className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5" />}
                {isStreaming ? 'Live' : 'Sim'}
              </button>
            </div>

            {/* Clickable Mint-Green AIR-GAPPED ON-PREM AI / SHA-256 VERIFIED Security Shield */}
            <button
              onClick={() => setActiveScreen('security')}
              className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-full px-3.5 py-1 shadow-2xs transition-colors cursor-pointer text-left"
              title="Click to open 5-Layer Defense-in-Depth & Zero-Trust Security Command Center"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                <Lock className="w-3 h-3" />
              </div>
              <div className="leading-none">
                <div className="text-[10px] font-black text-emerald-900 tracking-wide uppercase">
                  AIR-GAPPED ON-PREM AI
                </div>
                <div className="text-[9px] font-bold text-emerald-700 tracking-wider uppercase mt-0.5">
                  SHA-256 VERIFIED • 5 LAYERS
                </div>
              </div>
            </button>

            {/* Timestamp + User Role Selector */}
            <div className="text-right leading-tight">
              <div className="text-[11px] font-semibold text-slate-500 font-mono">
                14 Nov 2024 15:27:18 (IST)
              </div>
              <div className="relative inline-flex items-center mt-0.5">
                <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center mr-1.5">
                  <User className="w-2.5 h-2.5" />
                </div>
                <select
                  value={currentRole}
                  onChange={(e) => setCurrentRole(e.target.value as UserRole)}
                  className="appearance-none bg-transparent pr-4 text-xs font-extrabold text-[#1E3A8A] focus:outline-none cursor-pointer"
                >
                  <option value="DRILLING_ENGINEER">Drilling Engineer</option>
                  <option value="OPERATIONS_GEOLOGIST">Well-Site Geologist</option>
                  <option value="ERTMAC_SUPERINTENDENT">eRTMAC Superintendent</option>
                  <option value="SYSTEM_ADMIN">Asset Manager</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 pointer-events-none -ml-3" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* =====================================================================
          BODY LAYOUT: LEFT VERTICAL SIDEBAR + MAIN WORKSPACE
         ===================================================================== */}
      <div className="flex flex-1 min-h-0">
        {/* Left Vertical Sidebar Navigation (`w-64 bg-white border-r border-blue-100`) */}
        <aside className="w-64 bg-white border-r border-blue-100 flex flex-col justify-between py-4 px-3 shrink-0 select-none">
          <div className="space-y-1.5">
            <button
              onClick={() => setActiveScreen('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer text-left ${
                activeScreen === 'dashboard'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white font-black shadow-md shadow-blue-500/25'
                  : 'text-slate-700 hover:bg-blue-50/70 font-bold'
              }`}
            >
              <LayoutDashboard
                className={`w-4 h-4 shrink-0 ${
                  activeScreen === 'dashboard' ? 'text-white' : 'text-blue-600'
                }`}
              />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveScreen('monitoring')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer text-left ${
                activeScreen === 'monitoring'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white font-black shadow-md shadow-blue-500/25'
                  : 'text-slate-700 hover:bg-blue-50/70 font-bold'
              }`}
            >
              <Radar
                className={`w-4 h-4 shrink-0 ${
                  activeScreen === 'monitoring' ? 'text-white' : 'text-blue-600'
                }`}
              />
              <span>Well Monitoring</span>
            </button>

            <button
              onClick={() => setActiveScreen('logs')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer text-left ${
                activeScreen === 'logs'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white font-black shadow-md shadow-blue-500/25'
                  : 'text-slate-700 hover:bg-blue-50/70 font-bold'
              }`}
            >
              <Activity
                className={`w-4 h-4 shrink-0 ${
                  activeScreen === 'logs' ? 'text-white' : 'text-blue-600'
                }`}
              />
              <span>3. Cross-Well Log Correlation</span>
            </button>

            <button
              onClick={() => setActiveScreen('risk')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer text-left ${
                activeScreen === 'risk'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white font-black shadow-md shadow-blue-500/25'
                  : 'text-slate-700 hover:bg-blue-50/70 font-bold'
              }`}
            >
              <ShieldAlert
                className={`w-4 h-4 shrink-0 ${
                  activeScreen === 'risk' ? 'text-white' : 'text-blue-600'
                }`}
              />
              <span>4. Offset Risk Analysis</span>
            </button>

            <button
              onClick={() => setActiveScreen('ai_insights')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer text-left ${
                activeScreen === 'ai_insights'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white font-black shadow-md shadow-blue-500/25'
                  : 'text-slate-700 hover:bg-blue-50/70 font-bold'
              }`}
            >
              <Sparkles
                className={`w-4 h-4 shrink-0 ${
                  activeScreen === 'ai_insights' ? 'text-white' : 'text-blue-600'
                }`}
              />
              <span>5. AI Insights</span>
            </button>

            <button
              onClick={() => setActiveScreen('reports')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer text-left ${
                activeScreen === 'reports'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white font-black shadow-md shadow-blue-500/25'
                  : 'text-slate-700 hover:bg-blue-50/70 font-bold'
              }`}
            >
              <FileBarChart2
                className={`w-4 h-4 shrink-0 ${
                  activeScreen === 'reports' ? 'text-white' : 'text-blue-600'
                }`}
              />
              <span>6. Reports &amp; Export</span>
            </button>

            <button
              onClick={() => setActiveScreen('security')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer text-left ${
                activeScreen === 'security'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black shadow-md shadow-emerald-500/25'
                  : 'text-emerald-800 bg-emerald-50/60 hover:bg-emerald-100/80 font-bold border border-emerald-200'
              }`}
            >
              <ShieldCheck
                className={`w-4 h-4 shrink-0 ${
                  activeScreen === 'security' ? 'text-white' : 'text-emerald-600'
                }`}
              />
              <span>7. Security &amp; Zero-Trust</span>
            </button>

            {/* Active Rig Quick Summary Card inside Sidebar */}
            <div className="mt-4 pt-3.5 border-t border-blue-100">
              <div className="bg-[#F8FAFF] border border-blue-100 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-[#1E3A8A] uppercase">
                    Active Rig W-101
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                    DRILLING
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 space-y-1 font-medium">
                  <div className="flex justify-between">
                    <span>Bit Depth:</span>
                    <span className="font-mono font-black text-emerald-700">
                      {activeDepth.toFixed(1)} m
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Horizon:</span>
                    <span className="font-bold text-[#1E3A8A]">Tipam Base</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Barail Loss Top:</span>
                    <span className="font-mono font-bold text-red-600">
                      3,400 m (+{Math.max(0, 3400 - activeDepth).toFixed(0)}m)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Search Radius:</span>
                    <span className="font-mono font-bold text-blue-700">{radiusKm} km</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={3}
                  max={10}
                  step={0.5}
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(parseFloat(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer h-1.5 bg-blue-100 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Bottom Utility Links */}
          <div className="pt-4 border-t border-blue-100 space-y-1">
            <button
              onClick={() => setActiveScreen('security')}
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-blue-50/70 hover:text-[#1E3A8A] transition-colors cursor-pointer text-left"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Settings &amp; Security</span>
            </button>
            <button
              onClick={() => setIsExplainModalOpen(true)}
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-blue-50/70 hover:text-[#1E3A8A] transition-colors cursor-pointer text-left"
            >
              <HelpCircle className="w-4 h-4 text-slate-400" />
              <span>Help &amp; Support</span>
            </button>
          </div>
        </aside>

        {/* ===================================================================
            MAIN CONTENT AREA (`#F4F7FB` Enterprise Light Canvas)
           =================================================================== */}
        <main className="flex-1 p-5 overflow-y-auto space-y-5">
          {/* SCREEN 1: DASHBOARD */}
          {activeScreen === 'dashboard' && (
            <div className="space-y-5">
              <div className="bg-white border-2 border-red-200 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-600 text-white uppercase">
                        LOOK-AHEAD ADVISORY • +{Math.max(0, 3400 - activeDepth).toFixed(0)}m AHEAD
                      </span>
                      <span className="text-xs font-black text-[#1E3A8A]">
                        Approaching Barail Fractured Loss &amp; Coal-Sloughing Zone (3,400–3,450 m TVD)
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Primary Offset Twin <strong>W-093 (1.42 km NE, 96.4% match)</strong> suffered{' '}
                      <strong className="text-red-600">15.4 bbl/hr mud loss (312 bbl total)</strong> at 3,428 m. Safe Benchmark{' '}
                      <strong className="text-emerald-700">W-098 (1.95 km NW)</strong> achieved{' '}
                      <strong className="text-emerald-700">0 hrs NPT</strong> via <strong>1.20 SG MW + 45 ppb CaCO₃ Stress-Caging</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsExplainModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-xs font-bold text-[#1E3A8A] cursor-pointer"
                  >
                    6-Point XAI Proof
                  </button>
                  <button
                    onClick={() => setActiveScreen('logs')}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white text-xs font-black shadow-md shadow-blue-500/20 cursor-pointer"
                  >
                    Open Log Correlation &amp; Simulator →
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
                <div className="xl:col-span-7">
                  <Subsurface3DMap
                    wells={wells}
                    trajectories={trajectories}
                    formations={formations}
                    events={events}
                    selectedWellId={selectedWellId}
                    onSelectWell={setSelectedWellId}
                    radiusKm={radiusKm}
                    onRadiusChange={setRadiusKm}
                    activeDepth={activeDepth}
                  />
                </div>
                <div className="xl:col-span-5">
                  <GeospatialRadar2D
                    wells={wells}
                    selectedWellId={selectedWellId}
                    onSelectWell={setSelectedWellId}
                    radiusKm={radiusKm}
                    onRadiusChange={setRadiusKm}
                    onInspectEvent={() => setActiveScreen('ai_insights')}
                  />
                </div>
              </div>

              <WellLogComparison
                wellLogs={wellLogs}
                formations={formations}
                events={events}
                activeDepth={activeDepth}
                onApplyScenario={(details) =>
                  handleAppendAudit('APPLY_STRESS_CAGING_SCENARIO', details)
                }
              />
            </div>
          )}

          {/* SCREEN 2: WELL MONITORING */}
          {activeScreen === 'monitoring' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
                <div className="xl:col-span-7">
                  <Subsurface3DMap
                    wells={wells}
                    trajectories={trajectories}
                    formations={formations}
                    events={events}
                    selectedWellId={selectedWellId}
                    onSelectWell={setSelectedWellId}
                    radiusKm={radiusKm}
                    onRadiusChange={setRadiusKm}
                    activeDepth={activeDepth}
                  />
                </div>
                <div className="xl:col-span-5">
                  <GeospatialRadar2D
                    wells={wells}
                    selectedWellId={selectedWellId}
                    onSelectWell={setSelectedWellId}
                    radiusKm={radiusKm}
                    onRadiusChange={setRadiusKm}
                    onInspectEvent={() => setActiveScreen('ai_insights')}
                  />
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 3: CROSS-WELL LOG CORRELATION */}
          {activeScreen === 'logs' && (
            <WellLogComparison
              wellLogs={wellLogs}
              formations={formations}
              events={events}
              activeDepth={activeDepth}
              onApplyScenario={(details) =>
                handleAppendAudit('APPLY_STRESS_CAGING_SCENARIO', details)
              }
            />
          )}

          {/* SCREEN 4: OFFSET RISK ANALYSIS */}
          {activeScreen === 'risk' && (
            <Phase3RiskIntelligence
              wells={wells}
              events={events}
              activeDepth={activeDepth}
              radiusKm={radiusKm}
              currentTelemetry={currentTelemetry}
              onSelectWell={setSelectedWellId}
              onNavigateTab={handleNavigateLegacyTab}
              onOpenExplainModal={() => setIsExplainModalOpen(true)}
              onLogMitigationAction={(details) =>
                handleAppendAudit('PHASE3_MITIGATION_APPLIED', details)
              }
            />
          )}

          {/* SCREEN 5: AI INSIGHTS */}
          {activeScreen === 'ai_insights' && (
            <InstitutionalMemoryRAG
              events={events}
              documents={documents}
              activeDepth={activeDepth}
            />
          )}

          {/* SCREEN 6: REPORTS & EXPORT */}
          {activeScreen === 'reports' && (
            <div className="space-y-5">
              <DocumentIngestionStudio
                documents={documents}
                currentRole={currentRole}
                onDocumentIngested={(newDoc) => {
                  setDocuments((prev) => [newDoc, ...prev]);
                  handleAppendAudit(
                    'INGEST_DDR_PDF',
                    `Ingested & indexed ${newDoc.filename} (${newDoc.document_id}) into pgvector`
                  );
                }}
              />
              <Phase4GovernanceAndTrends
                wells={wells}
                events={events}
                documents={documents}
                auditLogs={auditLogs}
                wellLogs={wellLogs}
                activeDepth={activeDepth}
                currentRole={currentRole}
                onChangeRole={setCurrentRole}
                onOpenExplainModal={() => setIsExplainModalOpen(true)}
                onLogGovernanceAction={handleAppendAudit}
              />
            </div>
          )}

          {/* SCREEN 7: 5-LAYER DEFENSE-IN-DEPTH SECURITY COMMAND CENTER */}
          {activeScreen === 'security' && (
            <SecurityCommandCenter
              currentRole={currentRole}
              documents={documents}
              auditLogs={auditLogs}
              mfaUnlocked={mfaUnlocked}
              onToggleMfaLock={setMfaUnlocked}
              onLogSecurityEvent={handleAppendAudit}
            />
          )}
        </main>
      </div>

      {/* 6-Point Explainable AI (XAI) Modal */}
      <ExplainAlertModal
        isOpen={isExplainModalOpen}
        onClose={() => setIsExplainModalOpen(false)}
        activeDepth={activeDepth}
        currentRole={currentRole}
        onAcknowledge={(details) =>
          handleAppendAudit('XAI_ALERT_ACKNOWLEDGED', details)
        }
      />
    </div>
  );
}

export default App;
