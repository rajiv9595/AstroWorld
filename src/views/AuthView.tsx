/**
 * ASTROWORLD — Production Authentication (Login / Sign Up)
 * Completely clean, customer-grade interface with zero developer telemetry or jargon.
 * Strictly calls /api/auth/login and /api/auth/signup.
 */

import React, { useState, useEffect } from 'react';
import {
  Sun,
  Lock,
  Mail,
  User,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

interface AuthViewProps {
  onSuccess: (user: { id: string; name: string; email: string }) => void;
  onBackToHome: () => void;
  redirectReason?: string;
}

export const AuthView: React.FC<AuthViewProps> = ({
  onSuccess,
  onBackToHome,
  redirectReason = 'Please sign in or create an account to generate and view your detailed Kundli.',
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Clean any stale key relics from local storage on mount
  useEffect(() => {
    localStorage.removeItem('astroworld_supabase_url');
    localStorage.removeItem('astroworld_supabase_anon_key');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // 1. Strict Email Format Check
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setErrorMessage('Please enter a valid email address (e.g. name@domain.com).');
      return;
    }

    // 2. Strict Password Length Check
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    // 3. Sign Up Validations
    if (mode === 'signup') {
      const cleanName = name.trim();
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

        if (!res.ok || !data.success) {
          setErrorMessage(data.error || 'Failed to create account. Please try again.');
          return;
        }

        const userObj = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
        };
        localStorage.setItem('astroworld_user', JSON.stringify(userObj));
        onSuccess(userObj);
      } catch (err: any) {
        setLoading(false);
        setErrorMessage('Connection error. Please check your network and try again.');
      }
    } else {
      // Sign In Request
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

        if (!res.ok || !data.success) {
          setErrorMessage(data.error || 'Invalid email or password. Please verify your credentials.');
          return;
        }

        const userObj = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
        };
        localStorage.setItem('astroworld_user', JSON.stringify(userObj));
        onSuccess(userObj);
      } catch (err: any) {
        setLoading(false);
        setErrorMessage('Connection error. Please check your network and try again.');
      }
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-xl shadow-slate-900/5 border border-slate-200 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Column: Deep Royal Blue Brand Banner with Ganesha Artwork */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#162058] via-[#1a286b] to-[#121a48] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="space-y-6 relative z-10">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md">
                <Sun size={18} />
              </div>
              <span className="font-serif font-bold text-xl text-white">AstroWorld</span>
            </div>

            {/* Circular Ganesha Art Medallion */}
            <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-2 border-amber-400/40 p-1 bg-amber-500/10 shadow-lg">
              <img
                src="/ganesha_circle.png"
                alt="Lord Ganesha"
                className="w-full h-full object-cover rounded-full"
              />
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white mb-2 text-center lg:text-left">
                Unlock the Wisdom of the Stars
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed text-center lg:text-left">
                Create your account to compute precision Vedic horoscopes, track your Vimshottari Dasha cycles, and securely save your family charts.
              </p>
            </div>

            <div className="space-y-2 pt-2 text-xs text-amber-200/90">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-orange-400" />
                <span>Canonical BPHS astrological calculations</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-orange-400" />
                <span>Private &amp; persistent horoscope storage</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-orange-400" />
                <span>Grounded AI Astrologer consultations</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-white/10 text-center lg:text-left">
            <button
              onClick={onBackToHome}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              &larr; Back to Home
            </button>
          </div>
        </div>

        {/* Right Column: Clean White Authentication Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
          {redirectReason && (
            <div className="mb-5 p-3 rounded-xl bg-orange-50 border border-orange-200 text-xs text-orange-900 flex items-center gap-2">
              <ShieldCheck size={16} className="text-orange-600 flex-shrink-0" />
              <span>{redirectReason}</span>
            </div>
          )}

          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-serif font-bold text-2xl text-[#162058]">
                {mode === 'login' ? 'Sign In to AstroWorld' : 'Create Free Account'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {mode === 'login'
                  ? 'Enter your credentials to access your saved Kundlis.'
                  : 'Register your account to compute and view your chart.'}
              </p>
            </div>

            {/* Toggle Switch */}
            <div className="flex bg-[#FAF7F2] p-1 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                }}
                className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                  mode === 'login'
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-[#162058]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMessage(null);
                }}
                className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                  mode === 'signup'
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-[#162058]'
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle size={15} className="text-red-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-[#FAF7F2] border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[#162058] focus:outline-none focus:border-orange-500 focus:bg-white transition-colors"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full bg-[#FAF7F2] border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[#162058] focus:outline-none focus:border-orange-500 focus:bg-white transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">
                Password <span className="text-red-500">*</span> (min 6 characters)
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#FAF7F2] border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[#162058] focus:outline-none focus:border-orange-500 focus:bg-white transition-colors"
                  required
                />
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#FAF7F2] border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[#162058] focus:outline-none focus:border-orange-500 focus:bg-white transition-colors"
                    required
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-orange-500/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-98 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>PROCESSING...</span>
                </>
              ) : (
                <>
                  <span>{mode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            {mode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button
                  onClick={() => {
                    setMode('signup');
                    setErrorMessage(null);
                  }}
                  className="text-orange-600 font-bold hover:underline"
                >
                  Create free account
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                  }}
                  className="text-orange-600 font-bold hover:underline"
                >
                  Sign in here
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
