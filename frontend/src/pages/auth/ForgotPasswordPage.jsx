import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { Mail, Lock, KeyRound, CheckCircle2, AlertCircle, ArrowLeft, Eye, EyeOff, ShieldCheck, UserPlus } from 'lucide-react';
import PasswordStrengthMeter from '../../components/common/PasswordStrengthMeter';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  // Form States
  const [step, setStep] = useState(1); // 1: Email, 2: Reset OTP & New Password, 3: Success
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password Visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Statuses
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isNotRegistered, setIsNotRegistered] = useState(false);
  const [loading, setLoading] = useState(false);

  // STEP 1: Request Password Reset OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsNotRegistered(false);
    setLoading(true);

    try {
      const res = await authService.forgotPassword({ email });
      if (res.success) {
        setMessage(res.message || 'Password reset 6-digit OTP code has been sent to your email.');
        setStep(2);
      }
    } catch (err) {
      const msg = err.message || 'No registered account found with this email address.';
      setError(msg);
      if (msg.toLowerCase().includes('not found') || msg.toLowerCase().includes('not registered') || msg.toLowerCase().includes('no registered account')) {
        setIsNotRegistered(true);
      }
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify Reset OTP & Update Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify your entries.');
      return;
    }

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit numeric OTP code.');
      return;
    }

    setLoading(true);

    try {
      const res = await authService.resetPassword({ email, otp, newPassword });
      if (res.success) {
        setStep(3);
      }
    } catch (err) {
      setError(err.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
        {/* STEP 3: SUCCESS SCREEN */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mx-auto shadow-lg">
              <ShieldCheck className="h-10 w-10" />
            </div>

            <div>
              <h1 className="text-2xl font-extrabold text-white font-heading">
                Password Reset Complete!
              </h1>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Your password has been updated successfully. Previous tokens have been invalidated.
              </p>
            </div>

            <button
              onClick={() => navigate('/login')}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-blue-600/30"
            >
              Login with New Password
            </button>
          </div>
        )}

        {/* STEP 1: ENTER REGISTERED EMAIL */}
        {step === 1 && (
          <div className="space-y-6 text-left">
            <div className="text-center">
              <div className="inline-flex p-3 bg-blue-500/20 text-blue-400 rounded-2xl mb-3">
                <KeyRound className="w-8 h-8" />
              </div>
              <h1 className="text-xl font-bold text-white font-heading">Forgot Password?</h1>
              <p className="text-xs text-slate-400 mt-1">Enter your registered email address to receive a 6-digit reset OTP code.</p>
            </div>

            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs font-semibold text-rose-400 space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
                {isNotRegistered && (
                  <div className="pt-1">
                    <Link
                      to="/register"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-[11px] transition shadow-md"
                    >
                      <UserPlus className="w-3.5 h-3.5" /> Create New Account Now
                    </Link>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Registered Email Address
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Verifying Email & Sending OTP...' : 'Send Password Reset OTP'}
              </button>
            </form>

            <div className="text-center pt-2">
              <Link to="/login" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition">
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </Link>
            </div>
          </div>
        )}

        {/* STEP 2: VERIFY OTP & ENTER NEW STRONG PASSWORD */}
        {step === 2 && (
          <div className="space-y-6 text-left">
            <div className="text-center">
              <div className="inline-flex p-3 bg-purple-500/20 text-purple-400 rounded-2xl mb-3">
                <Lock className="w-8 h-8" />
              </div>
              <h1 className="text-xl font-bold text-white font-heading">Reset Password</h1>
              <p className="text-xs text-slate-400 mt-1">Enter the 6-digit OTP code sent to <strong className="text-blue-400">{email}</strong> and create a new password.</p>
            </div>

            {message && (
              <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs font-semibold text-emerald-400">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{message}</span>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs font-semibold text-rose-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  6-Digit Reset OTP Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••••"
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-center text-xl font-mono tracking-[8px] text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  New Strong Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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

              {/* Password Strength Meter */}
              <PasswordStrengthMeter password={newPassword} email={email} />

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
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
                {loading ? 'Resetting Password...' : 'Verify OTP & Update Password'}
              </button>
            </form>

            <div className="text-center pt-2">
              <button
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition"
              >
                <ArrowLeft className="w-4 h-4" /> Request New OTP Code
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
