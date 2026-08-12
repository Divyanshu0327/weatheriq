import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import {
  CloudSun,
  User,
  Mail,
  Lock,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ArrowLeft,
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import PasswordStrengthMeter from '../../components/common/PasswordStrengthMeter';

const RegisterPage = () => {
  const navigate = useNavigate();

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password Visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // States
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  // OTP Verification Step
  const [otpInput, setOtpInput] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSuccess, setOtpSuccess] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
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

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your entries.');
      return;
    }

    setLoading(true);

    try {
      const res = await authService.register({ name, email, password });
      if (res.success) {
        setRegisteredEmail(email);
        setResendMessage(res.message || 'OTP code generated and sent to your email.');
        startCooldownTimer(60);
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!otpInput || otpInput.length !== 6) {
      setError('Please enter a valid 6-digit numeric OTP code.');
      return;
    }

    setOtpLoading(true);

    try {
      const res = await authService.verifyOtp({ email: registeredEmail, otp: otpInput });
      if (res.success) {
        setOtpSuccess(true);
      }
    } catch (err) {
      setError(err.message || 'OTP verification failed');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0 || !registeredEmail) return;
    setOtpLoading(true);
    setResendMessage('');
    setError('');

    try {
      const res = await authService.resendOtp({ email: registeredEmail });
      if (res.success) {
        setResendMessage(res.message || 'A new 6-digit OTP code has been sent to your email.');
        startCooldownTimer(60);
      }
    } catch (err) {
      setError(err.message || 'Failed to resend OTP code');
    } finally {
      setOtpLoading(false);
    }
  };

  // STEP 3: OTP VERIFICATION SUCCESS VIEW
  if (otpSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mx-auto shadow-lg">
            <ShieldCheck className="h-10 w-10" />
          </div>

          <div>
            <h1 className="text-2xl font-extrabold text-white font-heading">
              Account Activated!
            </h1>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Your email address <strong className="text-blue-400">{registeredEmail}</strong> has been verified successfully.
            </p>
          </div>

          <button
            onClick={() => navigate('/login')}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-blue-600/30"
          >
            Login to WeatherIQ
          </button>
        </div>
      </div>
    );
  }

  // STEP 2: 6-DIGIT OTP VERIFICATION SCREEN
  if (registeredEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/30 mx-auto">
            <KeyRound className="h-7 w-7" />
          </div>

          <div>
            <h1 className="text-2xl font-extrabold text-white font-heading">
              Enter Verification OTP
            </h1>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Security code sent for:<br />
              <strong className="text-blue-400 font-semibold">{registeredEmail}</strong>
            </p>
            <p className="text-[11px] text-slate-400 mt-1">This code expires in 10 minutes (5 attempts max)</p>
          </div>

          {resendMessage && (
            <div className="flex items-start gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs font-semibold text-emerald-400 text-left">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{resendMessage}</span>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs font-semibold text-rose-400 text-left">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
            <input
              type="text"
              required
              maxLength={6}
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
              placeholder="••••••"
              className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3.5 text-center text-2xl font-mono tracking-[12px] text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none"
            />

            <button
              type="submit"
              disabled={otpLoading || otpInput.length !== 6}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-blue-600/30 disabled:opacity-50"
            >
              {otpLoading ? 'Verifying OTP...' : 'Verify OTP & Activate Account'}
            </button>
          </form>

          <div className="space-y-3 pt-2">
            <button
              onClick={handleResendOtp}
              disabled={otpLoading || cooldown > 0}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {cooldown > 0 ? (
                `Resend Verification OTP (${cooldown}s)`
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" /> Resend Verification OTP
                </>
              )}
            </button>

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
  }

  // STEP 1: REGISTRATION FORM
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/30 mb-3">
            <CloudSun className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-white font-heading">
            Create Account
          </h1>
          <p className="text-xs text-slate-400 mt-1">Join WeatherIQ for automated personal city alerts</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 mb-6 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs font-semibold text-rose-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full rounded-xl border border-slate-800 bg-slate-950/60 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
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
                className="w-full rounded-xl border border-slate-800 bg-slate-950/60 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Strong Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Must meet policy requirements"
                className="w-full rounded-xl border border-slate-800 bg-slate-950/60 pl-10 pr-12 py-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
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

          {/* Password Strength Indicator */}
          <PasswordStrengthMeter password={password} email={email} name={name} />

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full rounded-xl border border-slate-800 bg-slate-950/60 pl-10 pr-12 py-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 disabled:opacity-50 pt-2"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <UserPlus className="w-4 h-4" /> Register & Request OTP
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-blue-400 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
