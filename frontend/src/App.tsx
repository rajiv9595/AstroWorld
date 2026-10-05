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

import {
  computeCanonicalChart,
  DEFAULT_BIRTH_PROFILE,
  getLiveDailyPanchanga,
  detectRegionalChartStyle,
} from './engine/canonicalChart.ts';
import { BirthProfile, PlanetName } from './engine/types.ts';
import { fetchUserCharts, saveUserChart, SavedKundliRecord } from './services/chartService.ts';
import {
  getCurrentSupabaseUser,
  signOutFromSupabase,
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
} from 'lucide-react';

export default function App() {
  // Authentication State

  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; email: string } | null>(null);

  const [authRedirectReason, setAuthRedirectReason] = useState<string>(
    'Please sign in or create a free account to generate and access your detailed Kundli.'
  );
  const [pendingProfile, setPendingProfile] = useState<BirthProfile | null>(null);
  const [targetTabAfterAuth, setTargetTabAfterAuth] = useState<ProductTab>('overview');

  // Chart & Profile State
  const [profile, setProfile] = useState<BirthProfile>(DEFAULT_BIRTH_PROFILE);
  const [userCharts, setUserCharts] = useState<SavedKundliRecord[]>([]);
  const [isChartsDropdownOpen, setIsChartsDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ProductTab>('home');
  const [chartStyle, setChartStyle] = useState<'NORTH_INDIAN' | 'SOUTH_INDIAN'>('NORTH_INDIAN');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isOnboardingMode, setIsOnboardingMode] = useState(false);

  // Sync Auth session on mount
  useEffect(() => {
    const syncSession = async () => {
      const user = await getCurrentSupabaseUser();
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
        setUserCharts([]);
      }
    };
    syncSession();
  }, []);

  // Fetch saved charts whenever user logs in or changes
  useEffect(() => {
    const loadCharts = async () => {
      if (currentUser?.id || currentUser?.email) {
        const charts = await fetchUserCharts(currentUser.id);
        setUserCharts(charts);
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
  const handleRequireAuthForKundli = (newProfile: BirthProfile) => {
    setPendingProfile(newProfile);
    setTargetTabAfterAuth('overview');
    setAuthRedirectReason('Please sign in or create an account to compute and save your personalized Kundli.');
    setActiveTab('auth');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Auth gate when user clicks any calculation service
  const handleRequireAuthForService = (targetTab: ProductTab) => {
    setTargetTabAfterAuth(targetTab);
    setAuthRedirectReason('Please sign in or create an account to access our detailed astrological services.');
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
    setCurrentUser(user);
    const uId = user.id;

    if (pendingProfile) {
      setProfile(pendingProfile);
      const saved = await saveUserChart(uId, pendingProfile, chartStyle);
      setUserCharts((prev) => [saved, ...prev]);
      setPendingProfile(null);
      setActiveTab(targetTabAfterAuth || 'overview');
    } else {
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
        setActiveTab(targetTabAfterAuth || 'overview');
      } else {
        // First-time user without birth details -> Trigger onboarding modal
        setProfile({
          name: user.name || '',
          year: 2000,
          month: 1,
          day: 1,
          hour: 12,
          minute: 0,
          second: 0,
          latitude: 28.6139,
          longitude: 77.2090,
          timezone: 'Asia/Kolkata',
          cityName: '',
        });
        setIsOnboardingMode(true);
        setIsProfileModalOpen(true);
        setActiveTab('overview');
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    await signOutFromSupabase();
    localStorage.removeItem('astroworld_user');
    setCurrentUser(null);
    setUserCharts([]);
    setActiveTab('home');
  };

  const handleTabChange = (tab: ProductTab) => {
    if (tab === 'overview' && !currentUser) {
      handleRequireAuthForService('overview');
      return;
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
  const isKundliWorkspace = [
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
  ].includes(activeTab);

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
            handleTabChange('ai');
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
              currentProfile={profile}
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
          <AuthView
            onSuccess={handleAuthSuccess}
            onBackToHome={() => setActiveTab('home')}
            redirectReason={authRedirectReason}
          />
        )}

        {/* 6. Protected Kundli Workspace (Accessible after login / Dashboard) */}
        {isKundliWorkspace && (
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
                  <span>{profile.name}</span>
                  <span className="text-[10px] text-orange-700/80 font-mono">
                    ({profile.day}/{profile.month}/{profile.year})
                  </span>
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

            {activeTab === 'ai' && <AIAstrologerView context={canonicalContext} />}

            {activeTab === 'research' && <ResearchView context={canonicalContext} />}
          </div>
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
    </div>
  );
}

