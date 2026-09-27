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
  FileText,
  Gauge,
  Droplets,
  Flame,
  Zap,
  CheckCircle2,
  X,
  TrendingUp,
  PanelLeftClose,
  PanelLeftOpen,
  Radio,
  Layers,
  Compass,
  SlidersHorizontal,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { LoginPage } from './components/LoginPage';
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
  const [activeScreen, setActiveScreen] = useState<NavScreen>('dashboard');
  const [selectedWellId, setSelectedWellId] = useState<string>('W-093');
  const [radiusKm, setRadiusKm] = useState<number>(10);
  const [activeDepth, setActiveDepth] = useState<number>(3385.0);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [currentRole, setCurrentRole] = useState<UserRole>('DRILLING_ENGINEER');
  const [isExplainModalOpen, setIsExplainModalOpen] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'info') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  const [sensorNoise, setSensorNoise] = useState({
    rop: 0,
    wob: 0,
    torque: 0,
    spp: 0,
    mw: 0,
    flow: 0,
    gas: 0
  });
  useEffect(() => {
    if (!isStreaming) return;
    const noiseTimer = setInterval(() => {
      setSensorNoise({
        rop: Number((Math.random() * 0.8 - 0.4).toFixed(1)),
        wob: Number((Math.random() * 0.4 - 0.2).toFixed(1)),
        torque: Number((Math.random() * 0.6 - 0.3).toFixed(1)),
        spp: Math.round(Math.random() * 30 - 15),
        mw: Number((Math.random() * 0.006 - 0.003).toFixed(3)),
        flow: Number((Math.random() * 8 - 4).toFixed(1)),
        gas: Math.round(Math.random() * 4 - 2)
      });
    }, 1200);
    return () => clearInterval(noiseTimer);
  }, [isStreaming]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }) + ' ' +
        now.toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }) + ' (IST)'
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Claymorphism Theme State (Default: Porcelain Light Clay, toggleable to Obsidian Dark Clay)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ertmac_clay_theme');
      if (saved) return saved === 'dark';
    }
    return false;
  });
  const [mfaUnlocked, setMfaUnlocked] = useState<boolean>(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ertmac_authenticated') === 'true';
    }
    return false;
  });
  const [currentUserEmail, setCurrentUserEmail] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ertmac_user_email') || 'engineer@oilindia.in';
    }
    return 'engineer@oilindia.in';
  });

  const handleLoginSuccess = (role: UserRole, userEmail: string) => {
    setCurrentRole(role);
    setCurrentUserEmail(userEmail);
    setIsAuthenticated(true);
    localStorage.setItem('ertmac_authenticated', 'true');
    localStorage.setItem('ertmac_user_email', userEmail);
    showToast(`Access granted: ${userEmail.split('@')[0]} (${role.replace(/_/g, ' ')})`, 'success');
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('ertmac_authenticated');
    showToast('Console session locked. Signed out.', 'info');
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('ertmac_clay_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('ertmac_clay_theme', 'light');
    }
  }, [isDarkMode]);

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
    showToast(`Action Logged: ${action.replace(/_/g, ' ')}`, 'success');
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

  if (!isAuthenticated) {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        isDarkMode={isDarkMode}
        onToggleTheme={() => {
          const next = !isDarkMode;
          setIsDarkMode(next);
          showToast(next ? 'Obsidian Dark Mode activated' : 'Clay Daylight Mode activated', 'info');
        }}
      />
    );
  }

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? 'dark bg-[#0B0F19] text-[#F8FAFC]' : 'bg-[#E8EEF6] text-[#0F172A]'
      } flex flex-col font-sans antialiased transition-colors duration-300`}
    >
      {/* =====================================================================
          REDESIGNED MISSION CONTROL TOP TASKBAR (Clean, Segmented, Dynamic)
         ===================================================================== */}
      <header className="w-full bg-white/95 dark:bg-[#111625]/95 backdrop-blur-md border-b border-slate-200 dark:border-white/10 px-3 sm:px-4 py-2 sticky top-0 z-40 shadow-xs transition-colors duration-200">
        <div className="flex items-center justify-between gap-3 flex-wrap xl:flex-nowrap">
          {/* LEFT: Sidebar Toggle + Oil India Limited Identity Pod + eRTMAC-NWIS Badge */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Sidebar Collapse Toggle Button */}
            <button
              onClick={() => setIsSidebarCollapsed((prev) => !prev)}
              className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 cursor-pointer transition-colors"
              title={isSidebarCollapsed ? 'Expand Navigation Sidebar' : 'Collapse Navigation Sidebar'}
              aria-label="Toggle Navigation Sidebar"
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>

            {/* Official Oil India Limited Bilingual Crest & Typography */}
            <div className="flex items-center gap-2 pr-3 border-r border-slate-200 dark:border-white/10">
              <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-white/10 flex items-center justify-center overflow-hidden p-0.5 shadow-2xs shrink-0">
                <svg viewBox="0 0 48 48" className="w-7 h-7">
                  <path d="M4 4 H24 V44 H4 Z" fill="#DC2626" />
                  <path d="M24 4 H44 V44 H24 Z" fill="#1E293B" />
                  <circle cx="24" cy="17" r="7.5" fill="#FFFFFF" />
                  <path d="M19 22 L15 41 H33 L29 22 Z" fill="#FFFFFF" />
                  <circle cx="24" cy="17" r="3.2" fill="#1E293B" />
                </svg>
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-black text-slate-900 dark:text-slate-100 tracking-tight">
                    OIL INDIA LIMITED
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[8px] font-black bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 uppercase tracking-wider">
                    Prototype
                  </span>
                </div>
                <div className="text-[9px] font-bold text-slate-500 dark:text-slate-400">
                  ऑयल इंडिया लिमिटेड • Duliajan
                </div>
              </div>
            </div>

            {/* eRTMAC-NWIS Badge */}
            <div className="hidden sm:flex items-center gap-1.5 pl-0.5">
              <span className="px-2 py-0.5 rounded-lg text-xs font-black bg-blue-50 dark:bg-blue-950/70 text-[#1D4ED8] dark:text-blue-300 border border-blue-200 dark:border-blue-800/80 tracking-tight">
                eRTMAC-NWIS
              </span>
              <span className="hidden 2xl:inline text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                Nearby Wells Intelligence
              </span>
            </div>
          </div>

          {/* CENTER: Field Location & Reservoir Formation Context */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-white/10 text-xs shadow-2xs">
            <span className="font-extrabold text-slate-800 dark:text-slate-200">
              Greater Duliajan / Nahorkatiya Block
            </span>
            <span className="text-slate-300 dark:text-white/20">•</span>
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              Upper Assam Basin
            </span>
            <span className="text-slate-300 dark:text-white/20">•</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
              Target: 3,400m Barail
            </span>
          </div>

          {/* RIGHT: Active Telemetry Scrubber Capsule + Rig Status + Theme + Role Profile */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {/* Quick Upload Report Button */}
            <button
              onClick={() => setActiveScreen('reports')}
              className="clay-btn-primary px-3 py-1.5 text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Upload Scanned Hardcopy / PDF Reports & Run Deep Analysis"
            >
              <FileBarChart2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">+ Upload</span>
            </button>

            {/* Compact Real-Time Bit Depth Scrubber Capsule */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-white/10 text-xs shadow-2xs">
              <div className="flex items-center gap-1 font-mono">
                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase">
                  W-101
                </span>
                <span className="font-black text-emerald-600 dark:text-emerald-400">
                  {activeDepth.toFixed(0)}m
                </span>
              </div>
              <input
                type="range"
                min={3330}
                max={3470}
                step={1}
                value={activeDepth}
                onChange={(e) => setActiveDepth(parseFloat(e.target.value))}
                className="w-16 sm:w-20 clay-range-slider cursor-pointer"
                title="Scrub Well W-101 Bit Depth (3,330m - 3,470m)"
              />
              <button
                onClick={() => {
                  const next = !isStreaming;
                  setIsStreaming(next);
                  showToast(
                    next
                      ? 'Live WITSML telemetry streaming active (900ms cycle)'
                      : 'Drilling telemetry paused',
                    next ? 'success' : 'info'
                  );
                }}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-black flex items-center gap-1 cursor-pointer transition-all ${
                  isStreaming ? 'clay-btn-danger text-white' : 'clay-btn-primary text-white'
                }`}
                title="Toggle live telemetry streaming"
              >
                {isStreaming ? <Pause className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5" />}
                <span>{isStreaming ? 'Live' : 'Sim'}</span>
              </button>
            </div>

            {/* Rig Status Beacon */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Rig Online</span>
            </div>

            {/* Clay Daylight / Obsidian Dark Mode Switcher */}
            <button
              onClick={() => {
                const next = !isDarkMode;
                setIsDarkMode(next);
                showToast(
                  next ? 'Obsidian Dark Mode activated' : 'Clay Daylight Mode activated',
                  'info'
                );
              }}
              className={`p-1.5 sm:px-2.5 sm:py-1 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all border ${
                isDarkMode
                  ? 'bg-[#182032] text-amber-300 border-amber-400/40 hover:bg-[#202b44]'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
              title="Toggle theme mode"
            >
              {isDarkMode ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-amber-300 fill-amber-300/30" />
                  <span className="hidden md:inline text-[11px] font-extrabold text-amber-300">
                    Dark
                  </span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-500 fill-amber-500/30" />
                  <span className="hidden md:inline text-[11px] font-extrabold text-slate-700">
                    Light
                  </span>
                </>
              )}
            </button>

            {/* Role Profile Selector */}
            <div className="relative inline-flex items-center pl-1 border-l border-slate-200 dark:border-white/10">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center mr-1 shadow-2xs text-[10px] font-bold">
                <User className="w-3 h-3" />
              </div>
              <select
                value={currentRole}
                onChange={(e) => {
                  const r = e.target.value as UserRole;
                  setCurrentRole(r);
                  showToast(`Role updated: ${r.replace(/_/g, ' ')}`, 'info');
                }}
                className="appearance-none bg-transparent pr-4 text-xs font-extrabold text-[#1E3A8A] dark:text-blue-300 focus:outline-none cursor-pointer"
              >
                <option value="DRILLING_ENGINEER" className="dark:bg-[#141A26]">
                  Drilling Engineer
                </option>
                <option value="OPERATIONS_GEOLOGIST" className="dark:bg-[#141A26]">
                  Well Geologist
                </option>
                <option value="ERTMAC_SUPERINTENDENT" className="dark:bg-[#141A26]">
                  eRTMAC Supt.
                </option>
                <option value="SYSTEM_ADMIN" className="dark:bg-[#141A26]">
                  Asset Manager
                </option>
              </select>
              <ChevronDown className="w-3 h-3 text-slate-500 pointer-events-none -ml-3" />
            </div>

            {/* Lock Console / Sign Out Button */}
            <button
              onClick={handleSignOut}
              className="p-1.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer border border-slate-200 dark:border-white/10 hover:border-red-300 dark:hover:border-red-800 ml-0.5 shadow-2xs"
              title="Lock Console & Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================================
          BODY LAYOUT: LEFT VERTICAL SIDEBAR + MAIN WORKSPACE
         ===================================================================== */}
      <div className="flex flex-1 min-h-0">
        {/* Left Vertical Navigation Taskbar (Collapsible to compact icon bar) */}
        <aside
          className={`${
            isSidebarCollapsed ? 'w-16 px-2' : 'w-64 px-3'
          } bg-white dark:bg-[#141A28] border-r border-slate-200 dark:border-white/10 flex flex-col justify-between py-3.5 shrink-0 select-none overflow-y-auto transition-all duration-300`}
        >
          <div className="space-y-4">
            {/* GROUP 1: OPERATIONS */}
            <div>
              {!isSidebarCollapsed && (
                <div className="text-[10px] font-black tracking-wider text-slate-400 dark:text-slate-500 uppercase px-2 mb-1.5">
                  Operations &amp; Wells
                </div>
              )}
              <div className="space-y-1">
                <button
                  onClick={() => setActiveScreen('dashboard')}
                  className={`w-full flex items-center ${
                    isSidebarCollapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-3 py-2'
                  } rounded-xl text-xs transition-all cursor-pointer ${
                    activeScreen === 'dashboard'
                      ? 'clay-btn-primary shadow-xs'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 font-semibold'
                  }`}
                  title="Dashboard Overview"
                >
                  <div className="flex items-center gap-2.5">
                    <LayoutDashboard
                      className={`w-4 h-4 shrink-0 ${
                        activeScreen === 'dashboard' ? 'text-white' : 'text-blue-600 dark:text-blue-400'
                      }`}
                    />
                    {!isSidebarCollapsed && <span>Dashboard</span>}
                  </div>
                </button>

                <button
                  onClick={() => setActiveScreen('monitoring')}
                  className={`w-full flex items-center ${
                    isSidebarCollapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-3 py-2'
                  } rounded-xl text-xs transition-all cursor-pointer ${
                    activeScreen === 'monitoring'
                      ? 'clay-btn-primary shadow-xs'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 font-semibold'
                  }`}
                  title="3D Subsurface Map"
                >
                  <div className="flex items-center gap-2.5">
                    <Radar
                      className={`w-4 h-4 shrink-0 ${
                        activeScreen === 'monitoring' ? 'text-white' : 'text-blue-600 dark:text-blue-400'
                      }`}
                    />
                    {!isSidebarCollapsed && <span>3D Subsurface Map</span>}
                  </div>
                  {!isSidebarCollapsed && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300">
                      3D
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveScreen('logs')}
                  className={`w-full flex items-center ${
                    isSidebarCollapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-3 py-2'
                  } rounded-xl text-xs transition-all cursor-pointer ${
                    activeScreen === 'logs'
                      ? 'clay-btn-primary shadow-xs'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 font-semibold'
                  }`}
                  title="6-Track Well Log Correlation"
                >
                  <div className="flex items-center gap-2.5">
                    <Activity
                      className={`w-4 h-4 shrink-0 ${
                        activeScreen === 'logs' ? 'text-white' : 'text-blue-600 dark:text-blue-400'
                      }`}
                    />
                    {!isSidebarCollapsed && <span>6-Track Correlation</span>}
                  </div>
                  {!isSidebarCollapsed && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400">
                      Live
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* GROUP 2: ADVANCED INTELLIGENCE */}
            <div>
              {!isSidebarCollapsed && (
                <div className="text-[10px] font-black tracking-wider text-slate-400 dark:text-slate-500 uppercase px-2 mb-1.5">
                  Intelligence &amp; AI
                </div>
              )}
              <div className="space-y-1">
                <button
                  onClick={() => setActiveScreen('risk')}
                  className={`w-full flex items-center ${
                    isSidebarCollapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-3 py-2'
                  } rounded-xl text-xs transition-all cursor-pointer ${
                    activeScreen === 'risk'
                      ? 'clay-btn-primary shadow-xs'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 font-semibold'
                  }`}
                  title="Offset Risk Intelligence & What-If Simulator"
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldAlert
                      className={`w-4 h-4 shrink-0 ${
                        activeScreen === 'risk' ? 'text-white' : 'text-amber-500 dark:text-amber-400'
                      }`}
                    />
                    {!isSidebarCollapsed && <span>Offset Risk &amp; What-If</span>}
                  </div>
                  {!isSidebarCollapsed && activeDepth >= 3400 && activeDepth <= 3455 && (
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 animate-pulse">
                      Hazard
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveScreen('ai_insights')}
                  className={`w-full flex items-center ${
                    isSidebarCollapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-3 py-2'
                  } rounded-xl text-xs transition-all cursor-pointer ${
                    activeScreen === 'ai_insights'
                      ? 'clay-btn-primary shadow-xs'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 font-semibold'
                  }`}
                  title="AI Insights & Institutional Memory RAG"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles
                      className={`w-4 h-4 shrink-0 ${
                        activeScreen === 'ai_insights' ? 'text-white' : 'text-purple-500 dark:text-purple-400'
                      }`}
                    />
                    {!isSidebarCollapsed && <span>Institutional RAG</span>}
                  </div>
                  {!isSidebarCollapsed && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300">
                      RAG
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* GROUP 3: GOVERNANCE & SECURITY */}
            <div>
              {!isSidebarCollapsed && (
                <div className="text-[10px] font-black tracking-wider text-slate-400 dark:text-slate-500 uppercase px-2 mb-1.5">
                  Governance &amp; Trust
                </div>
              )}
              <div className="space-y-1">
                <button
                  onClick={() => setActiveScreen('reports')}
                  className={`w-full flex items-center ${
                    isSidebarCollapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-3 py-2'
                  } rounded-xl text-xs transition-all cursor-pointer ${
                    activeScreen === 'reports'
                      ? 'clay-btn-primary shadow-xs'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 font-semibold'
                  }`}
                  title="Reports & DDR Document Ingestion"
                >
                  <div className="flex items-center gap-2.5">
                    <FileBarChart2
                      className={`w-4 h-4 shrink-0 ${
                        activeScreen === 'reports' ? 'text-white' : 'text-blue-600 dark:text-blue-400'
                      }`}
                    />
                    {!isSidebarCollapsed && <span>Reports &amp; Handover</span>}
                  </div>
                </button>

                <button
                  onClick={() => setActiveScreen('security')}
                  className={`w-full flex items-center ${
                    isSidebarCollapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-3 py-2'
                  } rounded-xl text-xs transition-all cursor-pointer ${
                    activeScreen === 'security'
                      ? 'clay-btn-success shadow-xs'
                      : 'text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 font-semibold'
                  }`}
                  title="5-Layer Defense-in-Depth Security"
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck
                      className={`w-4 h-4 shrink-0 ${
                        activeScreen === 'security' ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    />
                    {!isSidebarCollapsed && <span>Security &amp; 2FA</span>}
                  </div>
                  {!isSidebarCollapsed && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      Level-5
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Active Rig Quick Summary Card inside Sidebar (Hidden when collapsed) */}
            {!isSidebarCollapsed && (
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-white/10">
                <div className="bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-white/10 rounded-2xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-[#1E3A8A] dark:text-blue-300 uppercase">
                      Well W-101
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                      DRILLING
                    </span>
                  </div>

                  {/* Visual Bit Progress Gauge */}
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1 font-mono">
                      <span>3,330m</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {activeDepth.toFixed(0)}m
                      </span>
                      <span className="text-red-500">3,400m Hazard</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          activeDepth >= 3400 ? 'bg-red-500' : 'bg-emerald-500'
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(0, ((activeDepth - 3330) / (3470 - 3330)) * 100)
                          )}%`
                        }}
                      />
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1 font-medium pt-1">
                    <div className="flex justify-between">
                      <span>Horizon:</span>
                      <span className="font-bold text-[#1E3A8A] dark:text-blue-300">
                        {activeDepth >= 3400 && activeDepth <= 3455
                          ? 'Barail Fracture'
                          : activeDepth > 3455
                          ? 'Kopili Marine'
                          : 'Tipam Sand'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Barail Target:</span>
                      <span className="font-mono font-bold text-red-600 dark:text-red-400">
                        3,400 m (+{Math.max(0, 3400 - activeDepth).toFixed(0)}m)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Search Radius:</span>
                      <span className="font-mono font-bold text-blue-700 dark:text-blue-300">
                        {radiusKm} km
                      </span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={3}
                    max={10}
                    step={0.5}
                    value={radiusKm}
                    onChange={(e) => setRadiusKm(parseFloat(e.target.value))}
                    className="w-full clay-range-slider cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Bottom Utility Links */}
          <div className="pt-3 border-t border-slate-200 dark:border-white/10 space-y-1 mt-3">
            <button
              onClick={() => setActiveScreen('security')}
              className={`w-full flex items-center ${
                isSidebarCollapsed ? 'justify-center py-2' : 'gap-3 px-3 py-2'
              } text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl cursor-pointer text-left transition-colors`}
              title="Security & Settings"
            >
              <Settings className="w-4 h-4 text-slate-400 shrink-0" />
              {!isSidebarCollapsed && <span>Settings</span>}
            </button>
            <button
              onClick={() => setIsExplainModalOpen(true)}
              className={`w-full flex items-center ${
                isSidebarCollapsed ? 'justify-center py-2' : 'gap-3 px-3 py-2'
              } text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl cursor-pointer text-left transition-colors`}
              title="Help & 6-Point XAI Documentation"
            >
              <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
              {!isSidebarCollapsed && <span>Help &amp; Support</span>}
            </button>
            <button
              onClick={handleSignOut}
              className={`w-full flex items-center ${
                isSidebarCollapsed ? 'justify-center py-2' : 'gap-3 px-3 py-2'
              } text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl cursor-pointer text-left transition-colors`}
              title="Lock Console & Sign Out"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>Lock &amp; Sign Out</span>}
            </button>
          </div>
        </aside>

        {/* ===================================================================
            MAIN WORKSPACE AREA
           =================================================================== */}
        <main className="flex-1 p-5 overflow-y-auto space-y-5">
          {/* ===================================================================
              IN-PAGE MISSION CONTROL TASKBAR (Situated Inside the Page)
             =================================================================== */}
          <div className="bg-white dark:bg-[#141A28] border border-slate-200 dark:border-white/10 rounded-2xl p-2.5 shadow-xs flex flex-wrap items-center justify-between gap-3 transition-colors">
            {/* In-Page Navigation Taskbar Tabs */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'monitoring', label: '3D Subsurface Map', icon: Radar, badge: '3D' },
                { id: 'logs', label: '6-Track Logs', icon: Activity, badge: 'Live' },
                {
                  id: 'risk',
                  label: 'Offset Risk & What-If',
                  icon: ShieldAlert,
                  isAlert: activeDepth >= 3400 && activeDepth <= 3455
                },
                { id: 'ai_insights', label: 'Institutional RAG', icon: Sparkles, badge: 'pgvector' },
                { id: 'reports', label: 'Reports & DDR', icon: FileBarChart2 },
                { id: 'security', label: 'Security & 2FA', icon: ShieldCheck, badge: 'Level-5' }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeScreen === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveScreen(tab.id as NavScreen)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                      isActive
                        ? 'clay-btn-primary text-white shadow-xs'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 font-semibold'
                    }`}
                    title={`Switch to ${tab.label}`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-white' : 'text-blue-600 dark:text-blue-400'
                      }`}
                    />
                    <span>{tab.label}</span>
                    {tab.badge && !isActive && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400">
                        {tab.badge}
                      </span>
                    )}
                    {tab.isAlert && (
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse ml-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* In-Page Quick Operational Status Strip */}
            <div className="hidden lg:flex items-center gap-3 text-xs pr-2 font-mono">
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-slate-800 dark:text-slate-100">W-101:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{activeDepth.toFixed(1)}m</span>
              </div>
              <span className="text-slate-300 dark:text-white/20">|</span>
              <div className="text-slate-600 dark:text-slate-300">
                <span className="text-slate-400 font-sans">Loss Gap: </span>
                <span
                  className={`font-bold ${
                    activeDepth >= 3400 && activeDepth <= 3455 ? 'text-red-500' : 'text-amber-500'
                  }`}
                >
                  {activeDepth >= 3400 && activeDepth <= 3455
                    ? 'ACTIVE HAZARD'
                    : `+${Math.max(0, 3400 - activeDepth).toFixed(0)}m`}
                </span>
              </div>
              <span className="text-slate-300 dark:text-white/20">|</span>
              <div className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                <span>12ms WITSML</span>
              </div>
            </div>
          </div>

          {/* SCREEN 1: DASHBOARD */}
          {activeScreen === 'dashboard' && (
            <div className="space-y-5">
              {/* Dynamic Subsurface Look-Ahead Hazard Banner */}
              {(() => {
                const distToHazard = Math.round(3400 - activeDepth);
                const isInsideHazard = activeDepth >= 3400 && activeDepth <= 3455;
                const isPastHazard = activeDepth > 3455;

                if (isInsideHazard) {
                  return (
                    <div className="bg-white dark:bg-[#141A28] border-2 border-red-500 dark:border-red-600 rounded-2xl p-4.5 shadow-sm flex flex-wrap items-center justify-between gap-4 animate-pulse">
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-red-100 dark:bg-red-950/80 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                          <AlertTriangle className="w-6 h-6 animate-bounce" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-600 text-white uppercase shadow-xs">
                              CRITICAL HAZARD ZONE • ACTIVE PENETRATION ({activeDepth.toFixed(1)}m TVD)
                            </span>
                            <span className="text-xs font-black text-red-700 dark:text-red-300">
                              Active Barail Fractured Loss &amp; Sloughing Horizon [High Risk: 88%]
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 dark:text-slate-200 mt-1">
                            Bit currently traversing high-loss fractured sandstone. Offset twin <strong>W-093</strong> suffered <strong>312 bbl mud loss</strong> at 3,428m. Immediate action: keep ECD &le; 1.28 SG, pump <strong>45 ppb CaCO₃ stress-caging pill</strong>, continuously monitor pit volume.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setIsExplainModalOpen(true)}
                          className="clay-btn px-3.5 py-2 text-xs font-bold text-red-700 dark:text-red-300 cursor-pointer"
                        >
                          6-Point XAI Proof
                        </button>
                        <button
                          onClick={() => setActiveScreen('logs')}
                          className="clay-btn-danger px-4 py-2 text-white text-xs font-black cursor-pointer shadow-md"
                        >
                          Trigger Loss Mitigation Pill →
                        </button>
                      </div>
                    </div>
                  );
                }

                if (isPastHazard) {
                  return (
                    <div className="bg-white dark:bg-[#141A28] border-2 border-emerald-300 dark:border-emerald-800/60 rounded-2xl p-4.5 shadow-sm flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white uppercase shadow-xs">
                              FORMATION CLEARED • PENETRATING KOPILI SHALE ({activeDepth.toFixed(1)}m TVD)
                            </span>
                            <span className="text-xs font-black text-emerald-800 dark:text-emerald-300">
                              Subsurface Barrier Restored • Zero Loss Observed
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                            Bit has exited the Barail fractured loss zone safely. Lithology transitioned into impermeable marine Kopili shale. Normal drilling hydraulics and casing seat preparation authorized under standard protocol.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setIsExplainModalOpen(true)}
                          className="clay-btn px-3.5 py-2 text-xs font-bold text-[#1E3A8A] dark:text-blue-300 cursor-pointer"
                        >
                          Formation Logs
                        </button>
                        <button
                          onClick={() => setActiveScreen('logs')}
                          className="clay-btn-success px-4 py-2 text-white text-xs font-black cursor-pointer"
                        >
                          View 6-Track Logs →
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="bg-white dark:bg-[#141A28] border-2 border-amber-300 dark:border-amber-800/60 rounded-2xl p-4.5 shadow-sm flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white uppercase shadow-xs">
                            LOOK-AHEAD ADVISORY • +{Math.max(0, distToHazard)}m AHEAD
                          </span>
                          <span className="text-xs font-black text-[#1E3A8A] dark:text-blue-300">
                            Approaching Barail Fractured Loss &amp; Coal-Sloughing Zone (3,400–3,450 m TVD)
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                          Primary Offset Twin <strong>W-093 (1.42 km NE, 96.4% match)</strong> suffered{' '}
                          <strong className="text-red-600 dark:text-red-400">15.4 bbl/hr mud loss (312 bbl total)</strong> at 3,428 m. Safe Benchmark{' '}
                          <strong className="text-emerald-700 dark:text-emerald-400">W-098 (1.95 km NW)</strong> achieved{' '}
                          <strong className="text-emerald-700 dark:text-emerald-400">0 hrs NPT</strong> via <strong>1.20 SG MW + 45 ppb CaCO₃ Stress-Caging</strong>.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsExplainModalOpen(true)}
                        className="clay-btn px-3.5 py-2 text-xs font-bold text-[#1E3A8A] dark:text-blue-300 cursor-pointer"
                      >
                        6-Point XAI Proof
                      </button>
                      <button
                        onClick={() => setActiveScreen('logs')}
                        className="clay-btn-primary px-4 py-2 text-white text-xs font-black cursor-pointer"
                      >
                        Open Log Correlation &amp; Simulator →
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Real-Time Live Rig Sensor Telemetry Ribbon */}
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
                {/* 1. Rate of Penetration */}
                <div className="bg-white dark:bg-[#141A28] border border-slate-200 dark:border-white/10 rounded-2xl p-3 shadow-xs hover:border-amber-400 dark:hover:border-amber-500/40 transition-all">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                    <span className="font-bold flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-amber-500" />
                      ROP (Live)
                    </span>
                    <span className={`w-1.5 h-1.5 rounded-full ${isStreaming ? 'bg-amber-500 animate-ping' : 'bg-slate-400'}`} />
                  </div>
                  <div className="text-lg font-black font-mono text-slate-800 dark:text-white">
                    {Math.max(0, currentTelemetry.rop_m_hr + (isStreaming ? sensorNoise.rop : 0)).toFixed(1)}
                    <span className="text-[10px] font-semibold text-slate-500 ml-1">m/hr</span>
                  </div>
                  <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 flex justify-between">
                    <span>W-098 Twin</span>
                    <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">14.5 m/h</span>
                  </div>
                </div>

                {/* 2. Weight on Bit */}
                <div className="bg-white dark:bg-[#141A28] border border-slate-200 dark:border-white/10 rounded-2xl p-3 shadow-xs hover:border-blue-400 dark:hover:border-blue-500/40 transition-all">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                    <span className="font-bold flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                      WOB
                    </span>
                    <span className={`w-1.5 h-1.5 rounded-full ${isStreaming ? 'bg-blue-500 animate-ping' : 'bg-slate-400'}`} />
                  </div>
                  <div className="text-lg font-black font-mono text-slate-800 dark:text-white">
                    {Math.max(0, currentTelemetry.wob_tonnes + (isStreaming ? sensorNoise.wob : 0)).toFixed(1)}
                    <span className="text-[10px] font-semibold text-slate-500 ml-1">tonnes</span>
                  </div>
                  <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 flex justify-between">
                    <span>Safety Limit</span>
                    <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">22.0 t Max</span>
                  </div>
                </div>

                {/* 3. Standpipe Pressure */}
                <div className="bg-white dark:bg-[#141A28] border border-slate-200 dark:border-white/10 rounded-2xl p-3 shadow-xs hover:border-purple-400 dark:hover:border-purple-500/40 transition-all">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                    <span className="font-bold flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-purple-500" />
                      SPP
                    </span>
                    <span className={`w-1.5 h-1.5 rounded-full ${isStreaming ? 'bg-purple-500 animate-ping' : 'bg-slate-400'}`} />
                  </div>
                  <div className="text-lg font-black font-mono text-slate-800 dark:text-white">
                    {Math.round(currentTelemetry.spp_psi + (isStreaming ? sensorNoise.spp : 0))}
                    <span className="text-[10px] font-semibold text-slate-500 ml-1">psi</span>
                  </div>
                  <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 flex justify-between">
                    <span>Window</span>
                    <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">2.8k-3.1k</span>
                  </div>
                </div>

                {/* 4. Active Mud Weight */}
                <div className="bg-white dark:bg-[#141A28] border border-slate-200 dark:border-white/10 rounded-2xl p-3 shadow-xs hover:border-cyan-400 dark:hover:border-cyan-500/40 transition-all">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                    <span className="font-bold flex items-center gap-1.5">
                      <Droplets className="w-3.5 h-3.5 text-cyan-500" />
                      Mud Weight
                    </span>
                    <span className={`w-1.5 h-1.5 rounded-full ${isStreaming ? 'bg-cyan-500 animate-ping' : 'bg-slate-400'}`} />
                  </div>
                  <div className="text-lg font-black font-mono text-slate-800 dark:text-white">
                    {(currentTelemetry.mud_weight_sg + (isStreaming ? sensorNoise.mw : 0)).toFixed(3)}
                    <span className="text-[10px] font-semibold text-slate-500 ml-1">SG</span>
                  </div>
                  <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 flex justify-between">
                    <span>Pore Pressure</span>
                    <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">1.180 SG</span>
                  </div>
                </div>

                {/* 5. Flow Delta / Loss Rate */}
                <div className="bg-white dark:bg-[#141A28] border border-slate-200 dark:border-white/10 rounded-2xl p-3 shadow-xs hover:border-rose-400 dark:hover:border-rose-500/40 transition-all">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                    <span className="font-bold flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-rose-500" />
                      Flow Delta
                    </span>
                    <span className={`w-1.5 h-1.5 rounded-full ${isStreaming ? 'bg-rose-500 animate-ping' : 'bg-slate-400'}`} />
                  </div>
                  <div className={`text-lg font-black font-mono ${
                    (currentTelemetry.mud_loss_bbl_hr || 0) > 2 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {(currentTelemetry.flow_out_lpm - currentTelemetry.flow_in_lpm + (isStreaming ? sensorNoise.flow : 0)).toFixed(1)}
                    <span className="text-[10px] font-semibold text-slate-500 ml-1">LPM</span>
                  </div>
                  <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 flex justify-between">
                    <span>Pit Loss</span>
                    <span className="font-mono text-slate-600 dark:text-slate-300 font-bold">{currentTelemetry.mud_loss_bbl_hr} bbl/h</span>
                  </div>
                </div>

                {/* 6. Gas Units & ECD */}
                <div className="bg-white dark:bg-[#141A28] border border-slate-200 dark:border-white/10 rounded-2xl p-3 shadow-xs hover:border-orange-400 dark:hover:border-orange-500/40 transition-all">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                    <span className="font-bold flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-orange-500" />
                      Gas Units
                    </span>
                    <span className={`w-1.5 h-1.5 rounded-full ${isStreaming ? 'bg-orange-500 animate-ping' : 'bg-slate-400'}`} />
                  </div>
                  <div className="text-lg font-black font-mono text-slate-800 dark:text-white">
                    {Math.max(0, currentTelemetry.gas_units + (isStreaming ? sensorNoise.gas : 0))}
                    <span className="text-[10px] font-semibold text-slate-500 ml-1">units</span>
                  </div>
                  <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 flex justify-between">
                    <span>ECD Live</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{currentTelemetry.ecd_sg} SG</span>
                  </div>
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
                    isLightMode={!isDarkMode}
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
                isLightMode={!isDarkMode}
              />
              <GeospatialRadar2D
                wells={wells}
                selectedWellId={selectedWellId}
                onSelectWell={setSelectedWellId}
                radiusKm={radiusKm}
                onRadiusChange={setRadiusKm}
                onInspectEvent={() => setActiveScreen('ai_insights')}
              />
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
          {/* In-Page Bottom Telemetry & Operational HUD (Inside Page Content) */}
          <div className="w-full bg-white dark:bg-[#141A28] border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-2.5 text-xs select-none shadow-xs flex flex-wrap items-center justify-between gap-3 font-medium transition-colors mt-6">
            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-slate-800 dark:text-slate-100">RIG W-101:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  {activeDepth.toFixed(1)} m TVD
                </span>
              </div>
              <span className="text-slate-300 dark:text-white/20">|</span>
              <div className="flex items-center gap-1">
                <span className="text-slate-500 dark:text-slate-400">Horizon:</span>
                <span className="font-bold text-[#1E3A8A] dark:text-blue-300">
                  {activeDepth >= 3400 && activeDepth <= 3455
                    ? 'Barail Fractured Sandstone'
                    : activeDepth > 3455
                    ? 'Kopili Marine Shale'
                    : 'Tipam Sandstone'}
                </span>
              </div>
              <span className="hidden sm:inline text-slate-300 dark:text-white/20">|</span>
              <div className="hidden sm:flex items-center gap-1">
                <span className="text-slate-500 dark:text-slate-400">Hazard Gap:</span>
                <span
                  className={`font-mono font-bold ${
                    activeDepth >= 3400 && activeDepth <= 3455
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {activeDepth >= 3400 && activeDepth <= 3455
                    ? 'ACTIVE IN LOSS ZONE'
                    : `+${Math.max(0, 3400 - activeDepth).toFixed(0)}m to Barail Top`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
              <div className="flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                <span>WITSML Stream: {isStreaming ? 'Active (900ms)' : 'Paused'}</span>
              </div>
              <span className="hidden md:inline text-slate-300 dark:text-white/20">|</span>
              <div className="hidden md:flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>MFA Level-5: Active</span>
              </div>
              <span className="hidden lg:inline text-slate-300 dark:text-white/20">|</span>
              <div className="font-mono text-slate-700 dark:text-slate-300 font-bold">
                {currentTime}
              </div>
            </div>
          </div>
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
      {/* Dynamic Floating Toast Notification System */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 pointer-events-auto transition-all duration-300">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-lg backdrop-blur-md transition-all ${
              toast.type === 'success'
                ? 'bg-emerald-50/95 dark:bg-emerald-950/90 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-100 shadow-emerald-500/10'
                : toast.type === 'warning'
                ? 'bg-amber-50/95 dark:bg-amber-950/90 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-100 shadow-amber-500/10'
                : 'bg-blue-50/95 dark:bg-blue-950/90 border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-100 shadow-blue-500/10'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />}
            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />}
            {toast.type === 'info' && <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />}
            <span className="text-xs font-bold leading-snug">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
