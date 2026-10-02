/**
 * ASTROWORLD — Production Authentication View (Sign In & Sign Up)
 * Clean, seamless split-screen design harmonizing with the main navigation header:
 * - Left: Deep Vedic Navy (#141b41) with celestial starfield & canonical wisdom
 * - Right: Crisp pure white form with streamlined credentials input
 * - Zero logo duplication (main header already shows brand)
 */

import React, { useState } from 'react';
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  ChevronLeft,
  KeyRound,
  Compass,
  Star,
} from 'lucide-react';

interface AuthViewProps {
  onSuccess: (user: { id: string; name: string; email: string }) => void;
  onBackToHome: () => void;
  redirectReason?: string;
}

export const AuthView: React.FC<AuthViewProps> = ({
  onSuccess,
  onBackToHome,
  redirectReason = 'Sign in or create a free account to access and save your detailed Kundli.',
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const SLIDES = [
    {
      title: 'Unlock the Wisdom of the Stars',
      subtitle: 'Discover your karmic path, understand your strengths, and navigate life with ancient Vedic precision.',
    },
    {
      title: '16 Divisional Charts & Mahadashas',
      subtitle: 'BPHS canonical calculations covering D1 to D60 vargas, Vimshottari timelines, and Shadbala potencies.',
    },
    {
      title: 'Grounded Classical AI Consultations',
      subtitle: 'AI astrological insights computed strictly from your verified astronomical chart facts with zero hallucinations.',
    },
  ];

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // 1. Email Format Check
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    // 2. Forgot Password Flow
    if (mode === 'forgot') {
      setLoading(true);
      try {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail }),
        });
        const data = await res.json();
        setLoading(false);
        if (data.success) {
          setSuccessMessage(data.message || `Password reset link sent to ${cleanEmail}. Please check your inbox.`);
        } else {
          setErrorMessage(data.error || 'Failed to send reset link. Please try again.');
        }
      } catch {
        setLoading(false);
        setErrorMessage('Failed to connect to server. Please try again.');
      }
      return;
    }

    // 3. Password Length Check
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    // 4. Sign Up Flow
    if (mode === 'signup') {
      const cleanName = fullName.trim();
      if (!cleanName || cleanName.length < 2) {
        setErrorMessage('Please enter your full name (minimum 2 characters).');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please verify your password.');
        return;
      }

      setLoading(true);
      try {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: cleanName,
            email: cleanEmail,
            password,
          }),
        });
        const data = await res.json();
        setLoading(false);

        if (!res.ok || !data.success || !data.user) {
          setErrorMessage(data.error || 'Failed to create account. Please try again.');
          return;
        }

        setSuccessMessage('Account created successfully! Logging you in...');
        if (rememberMe) {
          localStorage.setItem('astroworld_user', JSON.stringify(data.user));
        }
        setTimeout(() => {
          onSuccess(data.user);
        }, 500);
      } catch {
        setLoading(false);
        setErrorMessage('Network error occurred during registration. Please try again.');
      }
      return;
    }

    // 5. Sign In Flow
    if (mode === 'login') {
      setLoading(true);
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: cleanEmail,
            password,
          }),
        });
        const data = await res.json();
        setLoading(false);

        if (!res.ok || !data.success || !data.user) {
          setErrorMessage(data.error || 'Invalid email or password. Please try again.');
          return;
        }

        setSuccessMessage('Welcome back! Loading your profile...');
        if (rememberMe) {
          localStorage.setItem('astroworld_user', JSON.stringify(data.user));
        }
        setTimeout(() => {
          onSuccess(data.user);
        }, 400);
      } catch {
        setLoading(false);
        setErrorMessage('Failed to connect to authentication service. Please try again.');
      }
    }
  };

  // One-click Guest Demo Login
  const handleGuestLogin = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/auth/guest-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      setLoading(false);
      if (data.success && data.user) {
        setSuccessMessage('Entering as Guest...');
        localStorage.setItem('astroworld_user', JSON.stringify(data.user));
        setTimeout(() => {
          onSuccess(data.user);
        }, 400);
      } else {
        setErrorMessage(data.error || 'Failed to start guest session.');
      }
    } catch {
      setLoading(false);
      setErrorMessage('Network error starting guest session.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] w-full flex flex-col lg:flex-row bg-[#FBF9F5] border-t border-slate-200/80">
      {/* LEFT COLUMN: Celestial Cosmic Visual Matching Header Navy */}
      <div className="lg:w-1/2 bg-gradient-to-br from-[#141b41] via-[#162058] to-[#0f1435] text-white p-8 sm:p-14 lg:p-18 flex flex-col justify-between relative overflow-hidden min-h-[420px] lg:min-h-full border-r border-slate-200/20">
        {/* Glow Spheres & Cosmic Ambient Lights */}
        <div className="absolute top-10 left-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>

        {/* Top Vedic Authority Badge (NO duplicate logo) */}
        <div className="relative z-10 flex items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-amber-400/30 text-amber-300 text-xs font-semibold backdrop-blur-md shadow-xs">
            <Compass size={14} className="text-amber-400" />
            <span>Canonical Vedic Portal &bull; BPHS Engine</span>
          </div>
        </div>

        {/* Center Headline & Value Proposition */}
        <div className="relative z-10 my-10 sm:my-14 space-y-5 max-w-lg">
          <div className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-mono font-semibold tracking-wider uppercase">
            <Star size={13} />
            <span>Ancient Wisdom Meets Modern Ephemeris</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white leading-tight tracking-tight">
            {SLIDES[activeSlide].title}
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {SLIDES[activeSlide].subtitle}
          </p>

          {/* Carousel Slide Dots */}
          <div className="flex items-center gap-2 pt-3">
            {SLIDES.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveSlide(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  activeSlide === idx ? 'w-8 bg-orange-500' : 'w-2 bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Bottom Security Footer */}
        <div className="relative z-10 pt-5 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span className="flex items-center gap-1.5 text-slate-300">
            <ShieldCheck size={14} className="text-amber-400" />
            <span>256-bit Encrypted Private Cloud</span>
          </span>
          <span>IAU Sidereal Ephemeris</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Crisp Pure White Form */}
      <div className="lg:w-1/2 bg-white flex flex-col justify-between p-6 sm:p-12 lg:p-18">
        {/* Top Back Link */}
        <div className="flex justify-end mb-4">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-orange-600 transition-colors cursor-pointer"
          >
            <ChevronLeft size={16} />
            <span>Back to Home</span>
          </button>
        </div>

        {/* Main Authentication Card Container */}
        <div className="max-w-md w-full mx-auto space-y-6">
          {/* Header Title */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#162058]">
              {mode === 'login' && 'Welcome Back'}
              {mode === 'signup' && 'Create Your Free Account'}
              {mode === 'forgot' && 'Reset Your Password'}
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1.5">
              {mode === 'login' && 'Sign in to access your saved charts and Vedic calculations.'}
              {mode === 'signup' && 'Register in seconds to generate and save your personalized Kundli.'}
              {mode === 'forgot' && 'Enter your registered email to receive recovery instructions.'}
            </p>
          </div>

          {/* Redirect Reason Banner */}
          {redirectReason && mode === 'login' && (
            <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
              <Sparkles size={14} className="text-amber-600 shrink-0 mt-0.5" />
              <span>{redirectReason}</span>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2 animate-fadeIn">
              <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2 animate-fadeIn">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {/* Full Name (Sign Up Only) */}
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full bg-[#FAF7F2] border border-slate-300 focus:border-orange-500 focus:bg-white rounded-xl py-3 pl-10 pr-4 text-sm text-[#162058] placeholder-slate-400 focus:outline-none transition"
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Username / Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full bg-[#FAF7F2] border border-slate-300 focus:border-orange-500 focus:bg-white rounded-xl py-3 pl-10 pr-4 text-sm text-[#162058] placeholder-slate-400 focus:outline-none transition"
                />
              </div>
            </div>

            {/* Password (Login & Sign Up) */}
            {mode !== 'forgot' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-[#FAF7F2] border border-slate-300 focus:border-orange-500 focus:bg-white rounded-xl py-3 pl-10 pr-10 text-sm text-[#162058] placeholder-slate-400 focus:outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            {/* Confirm Password (Sign Up Only) */}
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound size={16} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="w-full bg-[#FAF7F2] border border-slate-300 focus:border-orange-500 focus:bg-white rounded-xl py-3 pl-10 pr-4 text-sm text-[#162058] placeholder-slate-400 focus:outline-none transition"
                  />
                </div>
              </div>
            )}

            {/* Options Row: Remember Me & Forgot Password */}
            {mode === 'login' && (
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-orange-500 border-slate-300 focus:ring-orange-400 accent-orange-500 cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="font-bold text-orange-600 hover:text-orange-700 cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Primary Submit CTA */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 transform hover:-translate-y-0.5 mt-3"
            >
              {loading ? (
                <span>AUTHENTICATING...</span>
              ) : mode === 'login' ? (
                <>
                  <span>SIGN IN TO ACCOUNT</span>
                  <ArrowRight size={15} />
                </>
              ) : mode === 'signup' ? (
                <>
                  <span>CREATE FREE ACCOUNT</span>
                  <ArrowRight size={15} />
                </>
              ) : (
                <span>SEND RECOVERY LINK</span>
              )}
            </button>
          </form>

          {/* Social / Guest Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <span className="bg-white px-3">Or continue with</span>
            </div>
          </div>

          {/* Guest Demo Login */}
          <button
            type="button"
            onClick={handleGuestLogin}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:border-orange-400 hover:bg-[#FAF7F2] text-[#162058] text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Sparkles size={14} className="text-amber-500" />
            <span>Instant Guest Access (Demo)</span>
          </button>

          {/* Mode Switcher */}
          <div className="text-center text-xs text-slate-600 pt-3">
            {mode === 'login' && (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="font-bold text-orange-600 hover:text-orange-700 hover:underline cursor-pointer"
                >
                  Register Free
                </button>
              </p>
            )}

            {mode === 'signup' && (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="font-bold text-orange-600 hover:text-orange-700 hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </p>
            )}

            {mode === 'forgot' && (
              <p>
                Remembered your password?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="font-bold text-orange-600 hover:text-orange-700 hover:underline cursor-pointer"
                >
                  Back to Sign In
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Bottom Terms Note */}
        <div className="text-center text-[11px] text-slate-400 mt-6">
          By continuing, you agree to AstroWorld's Terms of Vedic Service &amp; Privacy Policy.
        </div>
      </div>
    </div>
  );
};
