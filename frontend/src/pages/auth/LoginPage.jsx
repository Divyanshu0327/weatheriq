import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CloudSun, Mail, Lock, LogIn, AlertCircle, MailWarning, Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isUnverified, setIsUnverified] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsUnverified(false);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.message || 'Invalid email or password';
      setError(msg);
      if (msg.includes('EMAIL_NOT_VERIFIED') || msg.toLowerCase().includes('verify your email')) {
        setIsUnverified(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        {/* Branding */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/30 mb-3">
            <CloudSun className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-white font-heading">
            Weather<span className="text-blue-500">IQ</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Sign in to your Weather Intelligence account</p>
        </div>

        {error && (
          <div className={`p-4 mb-6 rounded-2xl border text-xs font-semibold ${
            isUnverified ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}>
            <div className="flex items-start gap-3">
              {isUnverified ? <MailWarning className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />}
              <div className="space-y-2">
                <p>{error}</p>
                {isUnverified && (
                  <Link
                    to={`/verify-email-pending?email=${encodeURIComponent(email)}`}
                    className="inline-block px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 font-bold rounded-lg text-[11px] transition"
                  >
                    Resend Verification OTP Code
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full rounded-xl border border-slate-800 bg-slate-950/60 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Password
              </label>
              <Link to="/forgot-password" className="text-xs text-blue-400 hover:underline font-medium">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-800 bg-slate-950/60 pl-10 pr-12 py-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" /> Sign In
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-blue-400 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
