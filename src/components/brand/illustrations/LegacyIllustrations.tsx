import React from 'react';

/** Abstract book/knowledge icon — layered pages with a warm accent */
export function IllustrationStudy({ className = '', size = 120 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="24" y="20" width="72" height="88" rx="4" fill="currentColor" opacity="0.06" />
      <rect x="28" y="16" width="72" height="88" rx="4" fill="currentColor" opacity="0.1" />
      <rect x="32" y="12" width="72" height="88" rx="4" fill="currentColor" opacity="0.05" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.15" />
      <line x1="44" y1="32" x2="88" y2="32" stroke="currentColor" strokeWidth="2" strokeOpacity="0.2" strokeLinecap="round" />
      <line x1="44" y1="42" x2="80" y2="42" stroke="currentColor" strokeWidth="2" strokeOpacity="0.15" strokeLinecap="round" />
      <line x1="44" y1="52" x2="84" y2="52" stroke="currentColor" strokeWidth="2" strokeOpacity="0.12" strokeLinecap="round" />
      <line x1="44" y1="62" x2="72" y2="62" stroke="currentColor" strokeWidth="2" strokeOpacity="0.1" strokeLinecap="round" />
      <path d="M82 12V36L88 30L94 36V12" fill="var(--primary, #c85a32)" fillOpacity="0.8" />
    </svg>
  );
}

/** Abstract clock/countdown — concentric rings with a sweeping hand */
export function IllustrationCountdown({ className = '', size = 120 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="60" cy="60" r="48" stroke="currentColor" strokeWidth="1" strokeOpacity="0.1" />
      <circle cx="60" cy="60" r="38" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.12" />
      <circle cx="60" cy="60" r="28" stroke="currentColor" strokeWidth="1" strokeOpacity="0.08" />
      <circle cx="60" cy="60" r="38" stroke="var(--primary, #c85a32)" strokeWidth="2.5" strokeOpacity="0.6"
        strokeLinecap="round" strokeDasharray="180 239" transform="rotate(-90 60 60)" />
      <line x1="60" y1="60" x2="60" y2="30" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" strokeLinecap="round" />
      <line x1="60" y1="60" x2="78" y2="46" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.2" strokeLinecap="round" />
      <circle cx="60" cy="60" r="3" fill="var(--primary, #c85a32)" fillOpacity="0.8" />
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => (
        <circle key={angle} cx={60 + 44 * Math.cos((angle - 90) * Math.PI / 180)} cy={60 + 44 * Math.sin((angle - 90) * Math.PI / 180)} r="1.5" fill="currentColor" fillOpacity="0.15" />
      ))}
    </svg>
  );
}

/** Abstract shield/security — layered shield with a checkmark */
export function IllustrationSecurity({ className = '', size = 120 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M60 14L96 32V60C96 80 80 98 60 106C40 98 24 80 24 60V32L60 14Z"
        fill="currentColor" fillOpacity="0.04" stroke="currentColor" strokeWidth="1" strokeOpacity="0.1" />
      <path d="M60 24L86 38V60C86 76 74 90 60 96C46 90 34 76 34 60V38L60 24Z"
        fill="currentColor" fillOpacity="0.06" stroke="currentColor" strokeWidth="1" strokeOpacity="0.08" />
      <path d="M44 60L54 72L76 48" stroke="var(--primary, #c85a32)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.8" />
    </svg>
  );
}

/** Abstract ID card — minimalist card with chip and lines */
export function IllustrationIdCard({ className = '', size = 120 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="14" y="28" width="92" height="64" rx="6" fill="currentColor" fillOpacity="0.05"
        stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.12" />
      <rect x="24" y="40" width="16" height="12" rx="2" fill="var(--primary, #c85a32)" fillOpacity="0.5" />
      <line x1="28" y1="40" x2="28" y2="52" stroke="var(--primary, #c85a32)" strokeWidth="0.5" strokeOpacity="0.4" />
      <line x1="32" y1="40" x2="32" y2="52" stroke="var(--primary, #c85a32)" strokeWidth="0.5" strokeOpacity="0.4" />
      <line x1="36" y1="40" x2="36" y2="52" stroke="var(--primary, #c85a32)" strokeWidth="0.5" strokeOpacity="0.4" />
      <line x1="24" y1="46" x2="40" y2="46" stroke="var(--primary, #c85a32)" strokeWidth="0.5" strokeOpacity="0.4" />
      <line x1="24" y1="64" x2="64" y2="64" stroke="currentColor" strokeWidth="2" strokeOpacity="0.2" strokeLinecap="round" />
      <line x1="24" y1="74" x2="52" y2="74" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.12" strokeLinecap="round" />
      <rect x="76" y="44" width="22" height="22" rx="2" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="1" strokeOpacity="0.1" />
      <rect x="80" y="48" width="6" height="6" rx="1" fill="currentColor" fillOpacity="0.12" />
      <rect x="88" y="48" width="6" height="6" rx="1" fill="currentColor" fillOpacity="0.12" />
      <rect x="80" y="56" width="6" height="6" rx="1" fill="currentColor" fillOpacity="0.12" />
      <rect x="88" y="56" width="6" height="6" rx="1" fill="currentColor" fillOpacity="0.08" />
    </svg>
  );
}

/** Abstract chart/analytics — rising bars with trend line */
export function IllustrationAnalytics({ className = '', size = 120 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <line x1="20" y1="96" x2="100" y2="96" stroke="currentColor" strokeWidth="1" strokeOpacity="0.1" />
      <line x1="20" y1="76" x2="100" y2="76" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.06" />
      <line x1="20" y1="56" x2="100" y2="56" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.06" />
      <line x1="20" y1="36" x2="100" y2="36" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.06" />
      <rect x="26" y="72" width="10" height="24" rx="2" fill="currentColor" fillOpacity="0.08" />
      <rect x="42" y="58" width="10" height="38" rx="2" fill="currentColor" fillOpacity="0.1" />
      <rect x="58" y="48" width="10" height="48" rx="2" fill="currentColor" fillOpacity="0.12" />
      <rect x="74" y="38" width="10" height="58" rx="2" fill="var(--primary, #c85a32)" fillOpacity="0.25" />
      <rect x="90" y="28" width="10" height="68" rx="2" fill="var(--primary, #c85a32)" fillOpacity="0.4" />
      <path d="M31 70 L47 56 L63 46 L79 36 L95 26" stroke="var(--primary, #c85a32)" strokeWidth="2" strokeOpacity="0.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="95" cy="26" r="3" fill="var(--primary, #c85a32)" fillOpacity="0.8" />
    </svg>
  );
}

/** Abstract flame/streak — stylized fire icon */
export function IllustrationStreak({ className = '', size = 120 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M60 16C60 16 40 44 40 68C40 82 48 96 60 100C72 96 80 82 80 68C80 44 60 16 60 16Z"
        fill="var(--primary, #c85a32)" fillOpacity="0.12" stroke="var(--primary, #c85a32)" strokeWidth="1.5" strokeOpacity="0.3" />
      <path d="M60 40C60 40 50 56 50 70C50 78 54 86 60 90C66 86 70 78 70 70C70 56 60 40 60 40Z"
        fill="var(--primary, #c85a32)" fillOpacity="0.25" />
      <path d="M60 58C60 58 56 66 56 74C56 78 58 82 60 84C62 82 64 78 64 74C64 66 60 58 60 58Z"
        fill="var(--primary, #c85a32)" fillOpacity="0.6" />
    </svg>
  );
}
