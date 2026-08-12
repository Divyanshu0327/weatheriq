import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { KeyRound, CheckCircle2, AlertCircle, RefreshCw, LogIn, ArrowRight } from 'lucide-react';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const tokenParam = searchParams.get('token');
  const navigate = useNavigate();

  const [tokenInput, setTokenInput] = useState(tokenParam || '');
  const [loading, setLoading] = useState(!!tokenParam);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const emailParam = searchParams.get('email') || '';
  const [emailInput, setEmailInput] = useState(emailParam);

  const executeVerification = async (otpToVerify, targetEmail = emailInput) => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await authService.verifyOtp({ email: targetEmail, otp: otpToVerify });
      if (res.success) {
        setVerifiedSuccess(true);
        setMessage(res.message || 'Your email has been verified successfully.');
      }
    } catch (err) {
      setVerifiedSuccess(false);
      setError(err.message || 'Verification code is invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tokenParam && emailParam) {
      executeVerification(tokenParam, emailParam);
    } else {
      setLoading(false);
    }
  }, [tokenParam, emailParam]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (tokenInput.trim() && emailInput.trim()) {
      executeVerification(tokenInput.trim(), emailInput.trim());
    } else {
      setError('Please provide both your registered email address and 6-digit OTP code.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
        {/* Loading State */}
        {loading && (
          <div className="py-8 space-y-4">
            <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <h2 className="text-lg font-bold text-white font-heading">Verifying your email...</h2>
            <p className="text-xs text-slate-400">Please wait while we validate your verification token with WeatherIQ.</p>
          </div>
        )}

        {/* Success State */}
        {!loading && verifiedSuccess && (
          <div className="space-y-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mx-auto shadow-lg">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div>
              <h1 className="text-2xl font-extrabold text-white font-heading">Email Verified!</h1>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">{message}</p>
            </div>

            <Link
              to="/login"
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
            >
              <LogIn className="w-4.5 h-4.5" /> Login to WeatherIQ <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Failure / Expiry State */}
        {!loading && error && (
          <div className="space-y-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-500/20 text-rose-400 border border-rose-500/30 mx-auto shadow-lg">
              <AlertCircle className="h-10 w-10" />
            </div>

            <div>
              <h1 className="text-xl font-bold text-white font-heading">Verification Failed</h1>
              <p className="text-xs text-rose-400 mt-2 leading-relaxed">{error}</p>
            </div>

            <div className="space-y-3 pt-2">
              <Link
                to="/verify-email-pending"
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Resend Verification Email
              </Link>

              <Link
                to="/login"
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition flex items-center justify-center gap-2"
              >
                Back to Login
              </Link>
            </div>
          </div>
        )}

        {/* Manual Input Fallback */}
        {!loading && !tokenParam && !verifiedSuccess && !error && (
          <div className="space-y-6">
            <div className="inline-flex p-3 bg-blue-500/20 text-blue-400 rounded-2xl">
              <KeyRound className="w-8 h-8" />
            </div>

            <div>
              <h1 className="text-xl font-bold text-white font-heading">Verify Your Email</h1>
              <p className="text-xs text-slate-400 mt-1">Enter your verification token below.</p>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Registered Email</label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">6-Digit OTP Code</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••••"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-center text-lg font-mono tracking-[4px] text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-blue-600/30"
              >
                Verify Email
              </button>
            </form>

            <p className="text-xs text-slate-400">
              Back to <Link to="/login" className="font-bold text-blue-400 hover:underline">Sign In</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
