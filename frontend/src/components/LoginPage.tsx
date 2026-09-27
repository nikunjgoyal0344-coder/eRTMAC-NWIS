import React, { useState, useEffect } from 'react';
import {
  Lock,
  Mail,
  Key,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sun,
  Moon,
  Radio,
  Activity,
  Sparkles,
  Database,
  Cpu,
  UserCheck
} from 'lucide-react';
import { UserRole } from '../types';

interface LoginPageProps {
  onLoginSuccess: (role: UserRole, userEmail: string) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

interface RolePreset {
  role: UserRole;
  label: string;
  department: string;
  email: string;
  empId: string;
  accessBadge: string;
  avatarBg: string;
}

const ROLE_PRESETS: RolePreset[] = [
  {
    role: 'DRILLING_ENGINEER',
    label: 'Drilling Engineer',
    department: 'Well-Site Engineering (W-101 Rig)',
    email: 'engineer@oilindia.in',
    empId: 'ENG-DULIAJAN-01',
    accessBadge: 'Active Operations',
    avatarBg: 'bg-blue-600'
  },
  {
    role: 'OPERATIONS_GEOLOGIST',
    label: 'Well Geologist',
    department: 'Subsurface & Stratigraphy',
    email: 'geologist@oilindia.in',
    empId: 'GEO-DULIAJAN-02',
    accessBadge: 'Log Correlation',
    avatarBg: 'bg-amber-600'
  },
  {
    role: 'ERTMAC_SUPERINTENDENT',
    label: 'eRTMAC Superintendent',
    department: 'Real-Time Monitoring Operations',
    email: 'superintendent@oilindia.in',
    empId: 'SUP-DULIAJAN-HQ',
    accessBadge: 'Supervisory Command',
    avatarBg: 'bg-purple-600'
  },
  {
    role: 'SYSTEM_ADMIN',
    label: 'Asset General Manager',
    department: 'Nahorkatiya Field Directorate',
    email: 'admin@oilindia.in',
    empId: 'MGR-DULIAJAN-ASSET',
    accessBadge: 'Full Executive',
    avatarBg: 'bg-emerald-600'
  }
];

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  isDarkMode,
  onToggleTheme
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('DRILLING_ENGINEER');
  const [email, setEmail] = useState<string>('engineer@oilindia.in');
  const [password, setPassword] = useState<string>('••••••••••••');
  const [mfaCode, setMfaCode] = useState<string>('849201');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const LOADING_STAGES = [
    { label: 'Establishing WITSML 2.1 Rig-to-Cloud telemetry handshake...', progress: 20 },
    { label: 'Connecting to Duliajan Subsurface Data Lake (W-101, W-093, W-098)...', progress: 45 },
    { label: 'Loading Barail & Tipam 3D fracture geomechanics models...', progress: 70 },
    { label: 'Verifying 5-Layer Defense-in-Depth Zero-Trust Token...', progress: 90 },
    { label: 'Access verified. Initializing eRTMAC Command Console...', progress: 100 }
  ];

  const handleSelectPreset = (preset: RolePreset) => {
    setSelectedRole(preset.role);
    setEmail(preset.email);
    setPassword('••••••••••••');
    setErrorMessage(null);
  };

  const handleTriggerLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email) {
      setErrorMessage('Please enter your OIL Employee Email or ID.');
      return;
    }
    setErrorMessage(null);
    setIsAuthenticating(true);
    setLoadingStep(0);
  };

  useEffect(() => {
    if (!isAuthenticating) return;
    const interval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev < LOADING_STAGES.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            onLoginSuccess(selectedRole, email);
          }, 450);
          return prev;
        }
      });
    }, 380);
    return () => clearInterval(interval);
  }, [isAuthenticating, selectedRole, email, onLoginSuccess]);

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? 'dark bg-[#080C14] text-[#F8FAFC]' : 'bg-[#E4EAF4] text-[#0F172A]'
      } flex flex-col justify-between font-sans antialiased transition-colors duration-300 relative overflow-hidden`}
    >
      {/* Background Subsurface Topo Wireframe Graphic Accents */}
      <div className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-10 overflow-hidden">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-pattern" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="currentColor" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        </svg>
      </div>

      {/* Top Navbar: Brand Title + Theme Toggle */}
      <header className="relative z-10 w-full px-5 py-3.5 flex items-center justify-between border-b border-slate-200/60 dark:border-white/5 backdrop-blur-md bg-white/40 dark:bg-[#111625]/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white dark:bg-[#141A28] border border-slate-200 dark:border-white/10 flex items-center justify-center p-0.5 shadow-xs shrink-0">
            <svg viewBox="0 0 48 48" className="w-8 h-8">
              <path d="M4 4 H24 V44 H4 Z" fill="#DC2626" />
              <path d="M24 4 H44 V44 H24 Z" fill="#1E293B" />
              <circle cx="24" cy="17" r="7.5" fill="#FFFFFF" />
              <path d="M19 22 L15 41 H33 L29 22 Z" fill="#FFFFFF" />
              <circle cx="24" cy="17" r="3.2" fill="#1E293B" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-tight text-slate-900 dark:text-slate-100">
                OIL INDIA LIMITED
              </span>
              <span className="px-1.5 py-0.2 rounded text-[8px] font-black bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 uppercase tracking-wider">
                Prototype
              </span>
            </div>
            <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
              ऑयल इंडिया लिमिटेड • Duliajan Corporate Gateway
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Telemetry Server 2.1 Online</span>
          </div>

          <button
            onClick={onToggleTheme}
            className={`p-2 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all border ${
              isDarkMode
                ? 'bg-[#182032] text-amber-300 border-amber-400/40 hover:bg-[#202b44]'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            title="Toggle Theme"
          >
            {isDarkMode ? (
              <Moon className="w-4 h-4 text-amber-300 fill-amber-300/30" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500 fill-amber-500/30" />
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area: Centered Login & Loading Modal Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-xl">
          {isAuthenticating ? (
            /* =================================================================
               HIGH-TECH INDUSTRIAL LOADING SEQUENCE CARD
               ================================================================= */
            <div className="clay-card p-6 sm:p-8 space-y-6 text-center animate-fade-in">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 animate-ping" />
                <div className="w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-950/60 border-2 border-blue-500 flex items-center justify-center text-blue-600 dark:text-blue-400 mx-auto shadow-md">
                  <Radio className="w-8 h-8 animate-pulse" />
                </div>
              </div>

              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Authenticating eRTMAC-NWIS Console
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
                  Role: <strong className="text-blue-600 dark:text-blue-400">{selectedRole}</strong> • Session ID: OIL-{Date.now().toString().slice(-6)}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="w-full h-2.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300"
                    style={{ width: `${LOADING_STAGES[loadingStep]?.progress || 10}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  <span>Step {loadingStep + 1} of {LOADING_STAGES.length}</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {LOADING_STAGES[loadingStep]?.progress}% Complete
                  </span>
                </div>
              </div>

              {/* Live Stage Output */}
              <div className="clay-inset p-3.5 rounded-xl text-left font-mono text-xs text-slate-700 dark:text-slate-300 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{LOADING_STAGES[loadingStep]?.label}</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Target: Greater Duliajan / Nahorkatiya Block • Subsurface Formation: Tipam / Barail (3,400m)
                </div>
              </div>
            </div>
          ) : (
            /* =================================================================
               AUTHENTICATION / SIGN IN CARD
               ================================================================= */
            <div className="clay-card p-6 sm:p-8 space-y-6">
              {/* Header inside Card */}
              <div className="text-center space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[11px] font-extrabold text-blue-700 dark:text-blue-300 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>5-Layer Defense-in-Depth Zero-Trust Portal</span>
                </div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Sign In to eRTMAC-NWIS
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Nearby Wells Subsurface Intelligence System • Upper Assam Asset
                </p>
              </div>

              {/* 1-Click Role Presets Selection */}
              <div>
                <label className="block text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Select Role / One-Click Test Profile
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ROLE_PRESETS.map((preset) => {
                    const isSelected = selectedRole === preset.role;
                    return (
                      <button
                        key={preset.role}
                        type="button"
                        onClick={() => handleSelectPreset(preset)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50/90 dark:bg-blue-950/50 border-blue-500 shadow-sm'
                            : 'bg-white dark:bg-[#141A28] border-slate-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-900 dark:text-white">
                            {preset.label}
                          </span>
                          <span
                            className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                              isSelected
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {preset.accessBadge}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                          {preset.department}
                        </div>
                        <div className="text-[10px] font-mono text-blue-600 dark:text-blue-400 mt-1 font-semibold">
                          {preset.empId}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Manual Credentials Form */}
              <form onSubmit={handleTriggerLogin} className="space-y-4">
                {errorMessage && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-xs font-bold text-red-700 dark:text-red-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Employee ID or Corporate Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. engineer@oilindia.in or ENG-DULIAJAN-01"
                      className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full pl-9 pr-9 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      MFA Hardware Token / TOTP
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Key className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={mfaCode}
                        onChange={(e) => setMfaCode(e.target.value)}
                        placeholder="6-digit TOTP"
                        className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono tracking-widest font-black"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span>Remember secure credentials</span>
                  </label>
                  <span className="text-slate-400 dark:text-slate-500 text-[11px]">
                    256-Bit TLS 1.3
                  </span>
                </div>

                {/* Primary Sign In Button */}
                <button
                  type="submit"
                  className="w-full clay-btn-primary py-2.5 px-4 rounded-xl text-xs font-black text-white flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Launch eRTMAC Subsurface Console</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Quick Guest Inspection Bypass */}
              <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">Fast Evaluator Mode:</span>
                <button
                  type="button"
                  onClick={() => onLoginSuccess('DRILLING_ENGINEER', 'guest.evaluator@oilindia.in')}
                  className="text-xs font-extrabold text-[#1E3A8A] dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Enter as Guest Evaluator →</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer: Legal & Security Notice */}
      <footer className="relative z-10 w-full px-5 py-3 text-center border-t border-slate-200/60 dark:border-white/5 backdrop-blur-md bg-white/40 dark:bg-[#111625]/40 text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <span>Oil India Limited (OIL) • eRTMAC Real-Time Well Monitoring System</span>
          <span>•</span>
          <span>Ministry of Petroleum &amp; Natural Gas (MoPNG)</span>
          <span>•</span>
          <span>Zero-Trust Architecture Compliant</span>
        </div>
      </footer>
    </div>
  );
};
