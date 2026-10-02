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
  GOLDEN_BENCHMARK_PROFILE,
} from './engine/canonicalChart.ts';
import { BirthProfile, PlanetName } from './engine/types.ts';
import { fetchUserCharts, saveUserChart, SavedKundliRecord } from './services/chartService.ts';

// Views
import { AuthView } from './views/AuthView.tsx';
import { AboutView } from './views/AboutView.tsx';
import { BlogView } from './views/BlogView.tsx';
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
import { Compass, RotateCcw, User, Bookmark, ChevronDown, Check } from 'lucide-react';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<{ id?: string; name: string; email: string } | null>(() => {
    try {
      const saved = localStorage.getItem('astroworld_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [authRedirectReason, setAuthRedirectReason] = useState<string>(
    'Please sign in or create a free account to generate and access your detailed Kundli.'
  );
  const [pendingProfile, setPendingProfile] = useState<BirthProfile | null>(null);
  const [targetTabAfterAuth, setTargetTabAfterAuth] = useState<ProductTab>('overview');

  // Chart & Profile State
  const [profile, setProfile] = useState<BirthProfile>(GOLDEN_BENCHMARK_PROFILE);
  const [userCharts, setUserCharts] = useState<SavedKundliRecord[]>([]);
  const [isChartsDropdownOpen, setIsChartsDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ProductTab>('home');
  const [chartStyle, setChartStyle] = useState<'NORTH_INDIAN' | 'SOUTH_INDIAN'>('NORTH_INDIAN');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Fetch saved charts whenever user logs in or changes
  useEffect(() => {
    const loadCharts = async () => {
      if (currentUser?.id || currentUser?.email) {
        const uId = currentUser.id || currentUser.email;
        const charts = await fetchUserCharts(uId);
        setUserCharts(charts);
        if (charts.length > 0) {
          const latest = charts[0];
          setProfile({
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
          });
          if (latest.chartStyle) {
            setChartStyle(latest.chartStyle);
          }
        }
      }
    };
    loadCharts();
  }, [currentUser]);

  // Compute canonical chart facts deterministically
  const canonicalContext = useMemo(() => {
    return computeCanonicalChart(profile);
  }, [profile]);

  const handleSelectPlanet = (_planet: PlanetName) => {
    setActiveTab('planets');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetToGolden = () => {
    setProfile(GOLDEN_BENCHMARK_PROFILE);
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
    if (currentUser) {
      const uId = currentUser.id || currentUser.email;
      const saved = await saveUserChart(uId, newProfile, chartStyle);
      setUserCharts((prev) => [saved, ...prev.filter((c) => c.name !== newProfile.name)]);
    }
    setActiveTab('overview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Successful Login / Signup Callback
  const handleAuthSuccess = async (user: { id?: string; name: string; email: string }) => {
    setCurrentUser(user);
    const uId = user.id || user.email;

    if (pendingProfile) {
      setProfile(pendingProfile);
      const saved = await saveUserChart(uId, pendingProfile, chartStyle);
      setUserCharts((prev) => [saved, ...prev]);
      setPendingProfile(null);
    } else {
      const existingCharts = await fetchUserCharts(uId);
      setUserCharts(existingCharts);
      if (existingCharts.length > 0) {
        const latest = existingCharts[0];
        setProfile({
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
        });
        if (latest.chartStyle) {
          setChartStyle(latest.chartStyle);
        }
      }
    }
    setActiveTab(targetTabAfterAuth || 'overview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    localStorage.removeItem('astroworld_user');
    setCurrentUser(null);
    setUserCharts([]);
    setActiveTab('home');
  };

  const handleTabChange = (tab: ProductTab) => {
    if (tab === 'services') {
      if (activeTab === 'home') {
        document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' });
      } else {
        setActiveTab('home');
        setTimeout(() => {
          document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
      return;
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectSavedChart = (chart: SavedKundliRecord) => {
    setProfile({
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
    });
    if (chart.chartStyle) {
      setChartStyle(chart.chartStyle);
    }
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
      {/* Primary Unified AstroWorld Navigation Header: HOME, ABOUT, SERVICES, BLOG, LOGIN, CHAT NOW */}
      <AstroWorldHeader
        activeTab={activeTab}
        onSelectTab={handleTabChange}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenChat={() => {
          if (!currentUser) {
            handleRequireAuthForService('ai');
          } else {
            setActiveTab('ai');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
      />

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
              panchanga={canonicalContext.panchanga}
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

        {/* 2. About Page */}
        {activeTab === 'about' && (
          <div className="px-4 py-8">
            <AboutView onGetKundliClick={handleScrollToKundliForm} />
          </div>
        )}

        {/* 3. Blog Page */}
        {activeTab === 'blog' && (
          <div className="px-4 py-8">
            <BlogView />
          </div>
        )}

        {/* 4. Login / Signup Auth Page */}
        {activeTab === 'auth' && (
          <AuthView
            onSuccess={handleAuthSuccess}
            onBackToHome={() => setActiveTab('home')}
            redirectReason={authRedirectReason}
          />
        )}

        {/* 5. Protected Kundli Workspace (Accessible after login) */}
        {isKundliWorkspace && (
          <div className="max-w-7xl w-full mx-auto px-4 py-6 space-y-6">
            {/* Clean Sub-Bar for Kundli Workspace */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap relative">
                {/* Active Subject Pill with click-to-edit */}
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-900 text-xs font-bold transition-colors"
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
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-semibold transition-colors"
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
                            className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
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
                  className="px-2.5 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1"
                >
                  <Compass size={13} className="text-amber-600" />
                  <span>{chartStyle === 'NORTH_INDIAN' ? 'North Diamond' : 'South Square'}</span>
                </button>

                <button
                  onClick={handleResetToGolden}
                  title="Reset to Golden Anchor"
                  className="p-1.5 rounded-xl hover:bg-amber-100 text-amber-700 transition-colors"
                >
                  <RotateCcw size={14} />
                </button>
              </div>

              {/* Workspace Tab Strip */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none w-full md:w-auto text-xs font-bold text-[#162058]">
                {[
                  { id: 'overview', label: 'Charts' },
                  { id: 'vargas', label: 'Vargas' },
                  { id: 'dasha', label: 'Dasha' },
                  { id: 'planets', label: 'Planets' },
                  { id: 'yogas', label: 'Yogas' },
                  { id: 'strength', label: 'Shadbala' },
                  { id: 'ashtakavarga', label: 'Ashtakavarga' },
                  { id: 'transits', label: 'Transits' },
                  { id: 'predictions', label: 'Predictions' },
                  { id: 'report', label: 'Dossier' },
                  { id: 'ai', label: 'AI Astrologer' },
                  { id: 'research', label: 'API & Tests' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as ProductTab)}
                    className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                      activeTab === item.id
                        ? 'bg-orange-500 text-white shadow-xs'
                        : 'bg-[#FAF7F2] text-slate-700 hover:bg-amber-100/60 border border-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sub-view Content */}
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
      <AstroWorldFooter onSelectTab={handleTabChange} />

      {/* Profile Input Modal */}
      <BirthInputModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentProfile={profile}
        onSave={async (newProfile) => {
          setProfile(newProfile);
          if (currentUser) {
            const uId = currentUser.id || currentUser.email;
            const saved = await saveUserChart(uId, newProfile, chartStyle);
            setUserCharts((prev) => [saved, ...prev.filter((c) => c.name !== newProfile.name)]);
          }
        }}
      />
    </div>
  );
}
