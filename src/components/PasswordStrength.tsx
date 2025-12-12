import React from 'react';

const strengthLabels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'];

function scorePassword(password: string) {
  let score = 0;
  if (!password) return 0;
  // length
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  // variety
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  // normalize to 0-4
  return Math.min(4, Math.floor((score / 6) * 4));
}

export const PasswordStrength: React.FC<{ password: string }> = ({ password }) => {
  const score = scorePassword(password);
  const pct = ((score + 1) / 5) * 100;
  const color = score <= 1 ? 'bg-red-500' : score === 2 ? 'bg-yellow-400' : score === 3 ? 'bg-amber-400' : 'bg-emerald-500';

  return (
    <div className="mt-2">
      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
        <div className={`${color} h-2`} style={{ width: `${pct}%`, transition: 'width 300ms ease' }} />
      </div>
      <div className="text-xs text-gray-600 mt-1">{password ? strengthLabels[score] : 'Enter a password'}</div>
    </div>
  );
};

export default PasswordStrength;
