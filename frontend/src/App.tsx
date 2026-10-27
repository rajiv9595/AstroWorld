/**
 * ASTROWORLD — Unified Vedic Astrology Application
 * Strict authentication gate: Generating Kundli requires login/signup.
 * Direct Supabase PostgreSQL synchronization for fast chart retrieval on return.
 */

import React, { useMemo, useState, useEffect } from 'react';
import { AstroWorldHeader, ProductTab } from './components/AstroWorldHeader.tsx';
import { HeroSection } from './components/HeroSection.tsx';
import { PanchangaStrip } from './components/PanchangaStrip.tsx';
import { GenerateKundliSection } from './components/GenerateKundliSection.tsx';
import { ServicesGrid } from './components/ServicesGrid.tsx';
import { AstroWorldFooter } from './components/AstroWorldFooter.tsx';
import { BirthInputModal } from './components/BirthInputModal.tsx';
import { VedicSageComingSoonModal } from './components/VedicSageComingSoonModal.tsx';

import {
  computeCanonicalChart,
  DEFAULT_BIRTH_PROFILE,
  getLiveDailyPanchanga,
  detectRegionalChartStyle,
} from './engine/canonicalChart.ts';
import { BirthProfile, PlanetName, isDemoOrDummyName } from './engine/types.ts';
import { fetchUserCharts, saveUserChart, SavedKundliRecord } from './services/chartService.ts';
import {
  getCurrentSupabaseUser,
  signOutFromSupabase,
  syncGoogleClientSession,
} from './lib/supabase.ts';

// Views
import { AuthView } from './views/AuthView.tsx';
import { AboutView } from './views/AboutView.tsx';
import { BlogView } from './views/BlogView.tsx';
import { ServicesView } from './views/ServicesView.tsx';
import { OverviewView } from './views/OverviewView.tsx';
import { VargasView } from './views/VargasView.tsx';
import { PlanetsView } from './views/PlanetsView.tsx';
import { PanchangaView } from './views/PanchangaView.tsx';
import { DashaView } from './views/DashaView.tsx';
import { StrengthView } from './views/StrengthView.tsx';
import { YogasView } from './views/YogasView.tsx';
import { JaiminiView } from './views/JaiminiView.tsx';
import { AshtakavargaView } from './views/AshtakavargaView.tsx';
import { TransitsView } from './views/TransitsView.tsx';
import { PredictionsView } from './views/PredictionsView.tsx';
import { ReportView } from './views/ReportView.tsx';
import { AIAstrologerView } from './views/AIAstrologerView.tsx';
import { ResearchView } from './views/ResearchView.tsx';
import {
  Compass,
  User,
  Bookmark,
  ChevronDown,
  Check,
  Bot,
  Sparkles,
  Layers,
  Clock,
  Star,
  Shield,
  TrendingUp,
  Calendar,
  Heart,
  FileText,
  Lock,
} from 'lucide-react';

export default function App() {
  // Authentication State

  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [isSageComingSoonOpen, setIsSageComingSoonOpen] = useState(false);

  const [authRedirectReason, setAuthRedirectReason] = useState<string>(
    'Please sign in or create a free account to generate and access your detailed Kundli.'
  );
  const [targetTabAfterAuth, setTargetTabAfterAuth] = useState<ProductTab>('overview');

  // Purge any stale pending or draft profiles from localStorage on mount
  useEffect(() => {
    try {
      localStorage.removeItem('astroworld_pending_birth_profile');
      localStorage.removeItem('astroworld_kundli_form_draft');
    } catch {
      // ignore
    }
  }, []);

  // Chart & Profile State
  const [profile, setProfile] = useState<BirthProfile>(DEFAULT_BIRTH_PROFILE);
  const [userCharts, setUserCharts] = useState<SavedKundliRecord[]>([]);
  const [isChartsDropdownOpen, setIsChartsDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ProductTab>('home');
  const [chartStyle, setChartStyle] = useState<'NORTH_INDIAN' | 'SOUTH_INDIAN'>('NORTH_INDIAN');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isOnboardingMode, setIsOnboardingMode] = useState(false);
  const [isChartsLoading, setIsChartsLoading] = useState(false);

  // Sync Auth session on mount (including OAuth redirect callbacks)
  useEffect(() => {
    const syncSession = async () => {
      // Handle OAuth return redirect params or hash tokens
      if (typeof window !== 'undefined') {
        try {
          const urlParams = new URLSearchParams(window.location.search);
          const hash = window.location.hash;

          // Check for error returned by OAuth provider
          const authError = urlParams.get('authError');
          if (authError) {
            setAuthRedirectReason(`Google Sign-in: ${authError}`);
            setActiveTab('auth');
            window.history.replaceState({}, document.title, window.location.pathname);
          }

          // Check for implicit grant access_token in URL hash
          if (hash && hash.includes('access_token=')) {
            const hashParams = new URLSearchParams(hash.replace(/^#/, ''));
            const accessToken = hashParams.get('access_token');
            const refreshToken = hashParams.get('refresh_token');
            if (accessToken && refreshToken) {
              await syncGoogleClientSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });
            }
            window.history.replaceState({}, document.title, window.location.pathname);
          } else if (urlParams.get('auth') === 'success') {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        } catch {
          // ignore parsing error
        }
      }

      const user = await getCurrentSupabaseUser();
      if (user) {
        setCurrentUser(user);
        // If user is authenticated, directly route to dashboard ('overview')
        setActiveTab((prev) => (prev === 'auth' ? 'overview' : prev));
      } else {
        setCurrentUser(null);
        setUserCharts([]);
      }
    };
    syncSession();
  }, []);

  // Guard: Logged-in users must never remain on the login/signup auth page
  useEffect(() => {
    if (currentUser && activeTab === 'auth') {
      setActiveTab('overview');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentUser, activeTab]);

  // Fetch saved charts whenever user logs in or changes
  useEffect(() => {
    const loadCharts = async () => {
      if (currentUser?.id || currentUser?.email) {
        setIsChartsLoading(true);
        try {
          const charts = await fetchUserCharts(currentUser.id);
          setUserCharts(charts);

          // Restore default chart from saved charts
          if (charts.length > 0) {
            const latest = charts[0];
            const prof: BirthProfile = {
              name: latest.name,
              year: latest.year,
              month: latest.month,
              day: latest.day,
              hour: latest.hour,
              minute: latest.minute,
              second: latest.second ?? 0,
              latitude: Number(latest.latitude),
              longitude: Number(latest.longitude),
              timezone: latest.timezone,
              cityName: latest.cityName,
            };
            setProfile(prof);
            setChartStyle(detectRegionalChartStyle(prof));
            setIsOnboardingMode(false);
          } else {
            setProfile((prev) => ({
              ...prev,
              name: currentUser.name || 'Your Birth Chart',
            }));
            setIsOnboardingMode(true);
            setIsProfileModalOpen(true);
          }
        } finally {
          setIsChartsLoading(false);
        }
      }
    };
    loadCharts();
  }, [currentUser]);

  // Compute canonical chart facts deterministically for native subject
  const canonicalContext = useMemo(() => {
    return computeCanonicalChart(profile);
  }, [profile]);

  // Real-time live daily Panchang computed for today's exact astronomical positions
  const liveDailyPanchanga = useMemo(() => {
    return getLiveDailyPanchanga(new Date());
  }, []);

  const handleSelectPlanet = (_planet: PlanetName) => {
    setActiveTab('planets');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetToDefault = () => {
    setProfile(DEFAULT_BIRTH_PROFILE);
    setChartStyle(detectRegionalChartStyle(DEFAULT_BIRTH_PROFILE));
  };

  const handleScrollToKundliForm = () => {
    if (activeTab !== 'home') {
      setActiveTab('home');
      setTimeout(() => {
        document.getElementById('kundli-generator')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById('kundli-generator')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Auth gate when user tries to generate Kundli
  const handleRequireAuthForKundli = () => {
    setTargetTabAfterAuth('overview');
    setAuthRedirectReason('Please sign in or create an account to compute and save your personalized Kundli.');
    setActiveTab('auth');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Auth gate when user clicks any calculation service or AI Astrologer
  const handleRequireAuthForService = (targetTab: ProductTab) => {
    setTargetTabAfterAuth(targetTab);
    setAuthRedirectReason(
      targetTab === 'ai'
        ? 'Please sign in or create an account to consult with our canonical AI Astrologer.'
        : 'Please sign in or create an account to access our detailed astrological services.'
    );
    setActiveTab('auth');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // When logged-in user generates Kundli
  const handleGenerateAndOpenKundli = async (newProfile: BirthProfile) => {
    setProfile(newProfile);
    const autoStyle = detectRegionalChartStyle(newProfile);
    setChartStyle(autoStyle);
    if (currentUser) {
      const saved = await saveUserChart(currentUser.id, newProfile, autoStyle);
      setUserCharts((prev) => [saved, ...prev.filter((c) => c.name !== newProfile.name)]);
    }
    setActiveTab('overview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Successful Login / Signup Callback
  const handleAuthSuccess = async (user: { id: string; name: string; email: string }) => {
    if (!user || !user.id) return;
    setCurrentUser(user);
    // Directly route user to dashboard immediately!
    setActiveTab('overview');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const uId = user.id;
    setIsChartsLoading(true);
    try {
      const existingCharts = await fetchUserCharts(uId);
      setUserCharts(existingCharts);
      if (existingCharts.length > 0) {
        const latest = existingCharts[0];
        const prof: BirthProfile = {
          name: latest.name,
          year: latest.year,
          month: latest.month,
          day: latest.day,
          hour: latest.hour,
          minute: latest.minute,
          second: latest.second ?? 0,
          latitude: Number(latest.latitude),
          longitude: Number(latest.longitude),
          timezone: latest.timezone,
          cityName: latest.cityName,
        };
        setProfile(prof);
        setChartStyle(detectRegionalChartStyle(prof));
        setIsOnboardingMode(false);
        setIsProfileModalOpen(false);
      } else {
        setProfile((prev) => ({
          ...prev,
          name: user.name || 'Your Birth Chart',
        }));
        setIsOnboardingMode(true);
        setIsProfileModalOpen(true);
      }
    } finally {
      setIsChartsLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOutFromSupabase();
    localStorage.removeItem('astroworld_user');
    setCurrentUser(null);
    setUserCharts([]);
    setProfile(DEFAULT_BIRTH_PROFILE);
    setChartStyle(detectRegionalChartStyle(DEFAULT_BIRTH_PROFILE));
    setActiveTab('home');
  };

  const KUNDLI_WORKSPACE_TABS: ProductTab[] = [
    'overview',
    'vargas',
    'planets',
    'panchanga',
    'dasha',
    'strength',
    'yogas',
    'jaimini',
    'ashtakavarga',
    'transits',
    'predictions',
    'report',
    'ai',
    'research',
  ];

  const handleTabChange = (tab: ProductTab) => {
    if (KUNDLI_WORKSPACE_TABS.includes(tab) && !currentUser) {
      handleRequireAuthForService(tab);
      return;
    }
    if (KUNDLI_WORKSPACE_TABS.includes(tab) && currentUser && userCharts.length === 0) {
      setIsOnboardingMode(true);
      setIsProfileModalOpen(true);
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectSavedChart = (chart: SavedKundliRecord) => {
    const prof: BirthProfile = {
      name: chart.name,
      year: chart.year,
      month: chart.month,
      day: chart.day,
      hour: chart.hour,
      minute: chart.minute,
      second: chart.second ?? 0,
      latitude: Number(chart.latitude),
      longitude: Number(chart.longitude),
      timezone: chart.timezone,
      cityName: chart.cityName,
    };
    setProfile(prof);
    setChartStyle(detectRegionalChartStyle(prof));
    setIsChartsDropdownOpen(false);
  };

  // Is the current view inside the Kundli workspace?
  const isKundliWorkspace = KUNDLI_WORKSPACE_TABS.includes(activeTab);

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-slate-800 flex flex-col font-sans selection:bg-orange-500/20 selection:text-orange-900">
      {/* Primary Unified AstroWorld Navigation Header */}
      <div className="no-print">
        <AstroWorldHeader
          activeTab={activeTab}
          onSelectTab={handleTabChange}
          currentUser={currentUser}
          onLogout={handleLogout}
          savedChartsCount={userCharts.length}
          onOpenChat={() => {
            setIsSageComingSoonOpen(true);
          }}
        />
      </div>

      {/* Main Body Router */}
      <main className="flex-1 flex flex-col">
        {/* 1. Home / Landing Page */}
        {activeTab === 'home' && (
          <div className="flex-1 flex flex-col">
            <HeroSection
              onGetKundliClick={handleScrollToKundliForm}
              onExploreServicesClick={() => {
                document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            <PanchangaStrip
              panchanga={liveDailyPanchanga}
              onExplorePanchanga={() => {
                if (!currentUser) {
                  handleRequireAuthForService('panchanga');
                } else {
                  setActiveTab('panchanga');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
            />

            <GenerateKundliSection
              currentProfile={currentUser && userCharts.length > 0 && !isDemoOrDummyName(profile.name) ? profile : undefined}
              isLoggedIn={!!currentUser}
              onGenerate={handleGenerateAndOpenKundli}
              onRequireAuth={handleRequireAuthForKundli}
            />

            <ServicesGrid
              onSelectService={(tab) => {
                setActiveTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              isLoggedIn={!!currentUser}
              onRequireAuth={handleRequireAuthForService}
            />
          </div>
        )}

        {/* 2. Services Page */}
        {activeTab === 'services' && (
          <ServicesView
            onSelectService={handleTabChange}
            isLoggedIn={!!currentUser}
            onRequireAuth={handleRequireAuthForService}
          />
        )}

        {/* 3. About Page */}
        {activeTab === 'about' && (
          <div className="px-4 py-8">
            <AboutView onGetKundliClick={handleScrollToKundliForm} />
          </div>
        )}

        {/* 4. Blog Page */}
        {activeTab === 'blog' && (
          <div className="px-4 py-8">
            <BlogView />
          </div>
        )}

        {/* 5. Login / Signup Auth Page */}
        {activeTab === 'auth' && (
          currentUser ? (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh]">
              <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-semibold text-slate-500 mt-2 uppercase tracking-wider">
                Opening your dashboard...
              </p>
            </div>
          ) : (
            <AuthView
              onSuccess={handleAuthSuccess}
              onBackToHome={() => setActiveTab('home')}
              redirectReason={authRedirectReason}
            />
          )
        )}

        {/* 6. Protected Kundli Workspace (Accessible after login / Dashboard) */}
        {isKundliWorkspace && (
          currentUser ? (
            isChartsLoading ? (
              <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Loading your Vedic charts...
                </p>
              </div>
            ) : (
              <div className="max-w-7xl w-full mx-auto px-4 py-6 space-y-6 print:p-0 print:m-0 print:max-w-none">
            {/* Clean, Minimalist Sub-Bar for Kundli Workspace */}
            <div className="no-print bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap relative">
                {/* Active Subject Pill with click-to-edit */}
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-900 text-xs font-bold transition-colors cursor-pointer"
                >
                  <User size={13} className="text-orange-600" />
                  <span>
                    {userCharts.length === 0
                      ? (currentUser?.name || 'Enter Birth Details')
                      : profile.name}
                  </span>
                  {userCharts.length > 0 && (
                    <span className="text-[10px] text-orange-700/80 font-mono">
                      ({profile.day}/{profile.month}/{profile.year})
                    </span>
                  )}
                </button>

                {/* Saved Charts Selector (Quick switch for returning users) */}
                {userCharts.length > 1 && (
                  <div className="relative">
                    <button
                      onClick={() => setIsChartsDropdownOpen(!isChartsDropdownOpen)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Bookmark size={13} className="text-orange-500" />
                      <span>Saved ({userCharts.length})</span>
                      <ChevronDown size={12} />
                    </button>

                    {isChartsDropdownOpen && (
                      <div className="absolute left-0 top-full mt-1.5 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-2 py-1">
                          Saved Kundli Charts
                        </span>
                        {userCharts.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => handleSelectSavedChart(c)}
                            className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                              c.name === profile.name
                                ? 'bg-orange-50 text-orange-900 font-bold'
                                : 'hover:bg-[#FAF7F2] text-slate-700'
                            }`}
                          >
                            <div>
                              <div>{c.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                {c.day}/{c.month}/{c.year} • {c.cityName || 'India'}
                              </div>
                            </div>
                            {c.name === profile.name && <Check size={14} className="text-orange-500" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* North / South Style Switcher */}
                <button
                  onClick={() =>
                    setChartStyle((prev) => (prev === 'NORTH_INDIAN' ? 'SOUTH_INDIAN' : 'NORTH_INDIAN'))
                  }
                  className="px-2.5 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Compass size={13} className="text-amber-600" />
                  <span>{chartStyle === 'NORTH_INDIAN' ? 'North Diamond' : 'South Square'}</span>
                </button>
              </div>

              {/* View More Services Quick Link */}
              <button
                onClick={() => setActiveTab('services')}
                className="text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-xl border border-orange-200 transition flex items-center gap-1 cursor-pointer"
              >
                <span>All Services</span>
                <span>→</span>
              </button>
            </div>

            {/* Kundli Workspace Navigation Tabs Bar */}
            <div className="no-print bg-white border border-slate-200 rounded-2xl p-1.5 shadow-xs overflow-x-auto scrollbar-none flex items-center gap-1 text-xs">
              <button
                onClick={() => handleTabChange('ai')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 ${
                  activeTab === 'ai'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs'
                    : 'bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200'
                }`}
              >
                <Sparkles size={13} className={activeTab === 'ai' ? 'animate-spin' : 'text-amber-500'} />
                <span>AI Astrologer</span>
              </button>

              <button
                onClick={() => handleTabChange('overview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer shrink-0 ${
                  activeTab === 'overview'
                    ? 'bg-[#162058] text-white font-bold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Compass size={13} />
                <span>Kundli (D1)</span>
              </button>

              <button
                onClick={() => handleTabChange('vargas')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer shrink-0 ${
                  activeTab === 'vargas'
                    ? 'bg-[#162058] text-white font-bold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Layers size={13} />
                <span>Vargas (D9/D10)</span>
              </button>

              <button
                onClick={() => handleTabChange('planets')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer shrink-0 ${
                  activeTab === 'planets'
                    ? 'bg-[#162058] text-white font-bold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>Planets</span>
              </button>

              <button
                onClick={() => handleTabChange('dasha')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer shrink-0 ${
                  activeTab === 'dasha'
                    ? 'bg-[#162058] text-white font-bold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Clock size={13} />
                <span>Vimshottari Dasha</span>
              </button>

              <button
                onClick={() => handleTabChange('yogas')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer shrink-0 ${
                  activeTab === 'yogas'
                    ? 'bg-[#162058] text-white font-bold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Star size={13} />
                <span>Yogas &amp; Doshas</span>
              </button>

              <button
                onClick={() => handleTabChange('strength')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer shrink-0 ${
                  activeTab === 'strength'
                    ? 'bg-[#162058] text-white font-bold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Shield size={13} />
                <span>Shadbala</span>
              </button>

              <button
                onClick={() => handleTabChange('predictions')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer shrink-0 ${
                  activeTab === 'predictions'
                    ? 'bg-[#162058] text-white font-bold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <TrendingUp size={13} />
                <span>Predictions</span>
              </button>

              <button
                onClick={() => handleTabChange('transits')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer shrink-0 ${
                  activeTab === 'transits'
                    ? 'bg-[#162058] text-white font-bold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Calendar size={13} />
                <span>Transits</span>
              </button>

              <button
                onClick={() => handleTabChange('jaimini')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer shrink-0 ${
                  activeTab === 'jaimini'
                    ? 'bg-[#162058] text-white font-bold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Heart size={13} />
                <span>Jaimini</span>
              </button>

              <button
                onClick={() => handleTabChange('ashtakavarga')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer shrink-0 ${
                  activeTab === 'ashtakavarga'
                    ? 'bg-[#162058] text-white font-bold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>Ashtakavarga</span>
              </button>

              <button
                onClick={() => handleTabChange('panchanga')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer shrink-0 ${
                  activeTab === 'panchanga'
                    ? 'bg-[#162058] text-white font-bold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>Panchanga</span>
              </button>

              <button
                onClick={() => handleTabChange('report')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer shrink-0 ${
                  activeTab === 'report'
                    ? 'bg-[#162058] text-white font-bold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <FileText size={13} />
                <span>Report PDF</span>
              </button>
            </div>
            {activeTab === 'overview' && (
              <OverviewView
                context={canonicalContext}
                chartStyle={chartStyle}
                onSelectPlanet={handleSelectPlanet}
              />
            )}

            {activeTab === 'vargas' && (
              <VargasView
                context={canonicalContext}
                chartStyle={chartStyle}
                onSelectPlanet={handleSelectPlanet}
              />
            )}

            {activeTab === 'planets' && (
              <PlanetsView context={canonicalContext} onSelectPlanet={handleSelectPlanet} />
            )}

            {activeTab === 'panchanga' && <PanchangaView context={canonicalContext} />}

            {activeTab === 'dasha' && <DashaView context={canonicalContext} />}

            {activeTab === 'strength' && <StrengthView context={canonicalContext} />}

            {activeTab === 'yogas' && <YogasView context={canonicalContext} />}

            {activeTab === 'jaimini' && <JaiminiView context={canonicalContext} />}

            {activeTab === 'ashtakavarga' && <AshtakavargaView context={canonicalContext} />}

            {activeTab === 'transits' && <TransitsView context={canonicalContext} />}

            {activeTab === 'predictions' && <PredictionsView context={canonicalContext} />}

            {activeTab === 'report' && <ReportView context={canonicalContext} />}

            {activeTab === 'ai' && (
              <AIAstrologerView
                context={canonicalContext}
                currentUser={currentUser}
                onRequireAuth={() => handleRequireAuthForService('ai')}
              />
            )}

            {activeTab === 'research' && <ResearchView context={canonicalContext} />}
          </div>
        )
      ) : (
            <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6 animate-fadeIn">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600 shadow-sm">
                <Lock size={32} />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-serif font-bold text-[#162058]">
                  {activeTab === 'ai' ? 'Sign In to Consult AI Astrologer' : 'Authentication Required'}
                </h2>
                <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
                  {activeTab === 'ai'
                    ? 'Personalized Vedic Jyotish consultations with our classical AI Astrologer require an active account to safeguard your birth chart data and privacy.'
                    : 'Please sign in or create a free account to access full Shodashavarga charts, Vimshottari timelines, and astrological calculations.'}
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => handleRequireAuthForService(activeTab)}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-md text-sm transition cursor-pointer"
                >
                  Sign In / Create Free Account
                </button>
                <button
                  onClick={() => setActiveTab('home')}
                  className="bg-white hover:bg-slate-100 text-slate-700 font-semibold px-5 py-2.5 rounded-xl border border-slate-300 text-sm transition cursor-pointer"
                >
                  Back to Home
                </button>
              </div>
            </div>
          )
        )}
      </main>

      {/* Unified Footer */}
      <div className="no-print">
        <AstroWorldFooter onSelectTab={handleTabChange} />
      </div>

      {/* Profile Input Modal & Onboarding */}
      <BirthInputModal
        isOpen={isProfileModalOpen}
        isOnboarding={isOnboardingMode}
        onClose={() => {
          setIsProfileModalOpen(false);
          setIsOnboardingMode(false);
        }}
        currentProfile={profile}
        onSave={async (newProfile) => {
          setProfile(newProfile);
          const autoStyle = detectRegionalChartStyle(newProfile);
          setChartStyle(autoStyle);
          if (currentUser) {
            const uId = currentUser.id || currentUser.email;
            const saved = await saveUserChart(uId, newProfile, autoStyle);
            setUserCharts((prev) => [saved, ...prev.filter((c) => c.name !== newProfile.name)]);
          }
          setIsOnboardingMode(false);
        }}
      />

      {/* 3D Vedic Sage Chatbot Coming Soon Modal */}
      <VedicSageComingSoonModal
        isOpen={isSageComingSoonOpen}
        onClose={() => setIsSageComingSoonOpen(false)}
      />
    </div>
  );
}

