import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authService } from '../../services/authService';
import { Mail, RefreshCw, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';

const VerifyEmailPendingPage = () => {
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get('email') || '';

  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);

  const startCooldownTimer = (seconds = 60) => {
    setCooldown(seconds);
    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResend = async (e) => {
    e.preventDefault();
    if (!email || cooldown > 0) return;

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await authService.resendVerification({ email });
      if (res.success) {
        setMessage(res.message || 'Verification link sent to your email address.');
        startCooldownTimer(60);
      }
    } catch (err) {
      setError(err.message || 'Failed to resend verification email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-500/30 mx-auto shadow-lg">
          <Mail className="h-9 w-9" />
        </div>

        <div>
          <h1 className="text-2xl font-extrabold text-white font-heading">
            Email Verification Required
          </h1>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            Your WeatherIQ account is not yet verified. Please verify your email address to log in.
          </p>
        </div>

        {message && (
          <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs font-semibold text-emerald-400">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs font-semibold text-rose-400 text-left">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleResend} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Registered Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your registered email"
              className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading || cooldown > 0}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : cooldown > 0 ? (
              `Resend Verification Email (${cooldown}s)`
            ) : (
              <>
                <RefreshCw className="w-4 h-4" /> Resend Verification Email
              </>
            )}
          </button>
        </form>

        <div className="pt-2">
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPendingPage;
