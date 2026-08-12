import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { Lock, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';

const ResetPasswordPage = () => {
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await authService.resetPassword({ token, newPassword });
      setMessage(res.message || 'Password reset successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message || 'Invalid or expired password reset token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="p-3 bg-blue-500/20 text-blue-400 rounded-2xl mb-3">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-white font-heading">Set New Password</h1>
          <p className="text-xs text-slate-400 mt-1">Enter reset token and your new account password.</p>
        </div>

        {message && (
          <div className="p-3 mb-6 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs font-semibold text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="p-3 mb-6 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs font-semibold text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Reset Token
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500" />
              <input
                type="text"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Reset Token"
                className="w-full rounded-xl border border-slate-800 bg-slate-950/60 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500" />
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full rounded-xl border border-slate-800 bg-slate-950/60 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-blue-600/30 disabled:opacity-50"
          >
            {loading ? 'Resetting Password...' : 'Confirm New Password'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          Remember password? <Link to="/login" className="font-bold text-blue-400 hover:underline">Return to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
