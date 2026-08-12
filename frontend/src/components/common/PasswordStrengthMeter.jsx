import React from 'react';
import { Check, X, ShieldAlert, ShieldCheck } from 'lucide-react';

const PasswordStrengthMeter = ({ password, email = '', name = '' }) => {
  if (!password) return null;

  const checks = [
    { label: 'At least 8 characters', valid: password.length >= 8 },
    { label: 'At least 1 uppercase letter (A-Z)', valid: /[A-Z]/.test(password) },
    { label: 'At least 1 lowercase letter (a-z)', valid: /[a-z]/.test(password) },
    { label: 'At least 1 number (0-9)', valid: /[0-9]/.test(password) },
    { label: 'At least 1 special character (!@#$%^&*)', valid: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) },
  ];

  const lowerPass = password.toLowerCase();
  const blacklisted = ['12345678', 'password', 'password123', 'qwerty123'].includes(lowerPass);

  const passedCount = checks.filter((c) => c.valid).length;

  let strengthLabel = 'Weak';
  let strengthColor = 'bg-rose-500 text-rose-400';
  let progressWidth = '20%';

  if (passedCount >= 5 && !blacklisted) {
    strengthLabel = 'Very Strong';
    strengthColor = 'bg-emerald-500 text-emerald-400';
    progressWidth = '100%';
  } else if (passedCount >= 4) {
    strengthLabel = 'Strong';
    strengthColor = 'bg-blue-500 text-blue-400';
    progressWidth = '80%';
  } else if (passedCount >= 3) {
    strengthLabel = 'Medium';
    strengthColor = 'bg-amber-500 text-amber-400';
    progressWidth = '50%';
  }

  return (
    <div className="space-y-3 p-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Password Strength</span>
        <span className={`font-extrabold text-[11px] uppercase ${strengthColor.split(' ')[1]}`}>
          {blacklisted ? 'Common / Weak Password' : strengthLabel}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${blacklisted ? 'bg-rose-500' : strengthColor.split(' ')[0]}`}
          style={{ width: blacklisted ? '15%' : progressWidth }}
        />
      </div>

      {/* Requirement Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
        {checks.map((check, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            {check.valid ? (
              <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
            )}
            <span className={check.valid ? 'text-slate-300 font-medium' : 'text-slate-500'}>
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;
