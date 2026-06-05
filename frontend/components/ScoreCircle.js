'use client';
import { useEffect, useRef } from 'react';

export default function ScoreCircle({ score, size = 160 }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 75 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444';
  const label = score >= 75 ? 'Excellent Match' : score >= 65 ? 'Good Match' : score >= 50 ? 'Fair Match' : 'Needs Work';

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--border)" strokeWidth="10" />
        <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeLinecap="round" strokeDasharray={circ}
          strokeDashoffset={offset} transform="rotate(-90 60 60)"
          style={{ transition: 'stroke-dashoffset 1.5s ease-out' }} />
        <text x="60" y="54" textAnchor="middle" dominantBaseline="middle"
          fontSize="22" fontWeight="bold" fill={color}>{score}%</text>
        <text x="60" y="72" textAnchor="middle" fontSize="9" fill="var(--muted)">Match Score</text>
      </svg>
      <span className="text-sm font-semibold" style={{ color }}>{label}</span>
    </div>
  );
}
