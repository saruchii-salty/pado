import React, { useId } from 'react';
import type { CurrencyInfo } from '../data/chapters';

interface FlagBadgeProps {
  type: CurrencyInfo['flagType'];
  size?: number;
}

export const FlagBadge: React.FC<FlagBadgeProps> = ({ type, size = 36 }) => {
  const clipId = useId();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      className="shrink-0 rounded-full ring-1 ring-black/10"
      aria-hidden="true"
    >
      <defs>
        <clipPath id={clipId}>
          <circle cx="18" cy="18" r="18" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        {type === 'us' && (
          <>
            <rect width="36" height="36" fill="#FFFFFF" />
            {[0, 2, 4, 6].map((i) => (
              <rect key={i} y={i * 5.15} width="36" height="5.15" fill="#E03E45" />
            ))}
            <rect width="18" height="19" fill="#2B4C9B" />
            {[5, 10, 14].map((x) =>
              [5, 10, 14].map((y) => (
                <circle key={`${x}-${y}`} cx={x} cy={y} r="1" fill="#FFFFFF" />
              )),
            )}
          </>
        )}
        {type === 'jp' && (
          <>
            <rect width="36" height="36" fill="#FFFFFF" />
            <circle cx="18" cy="18" r="8" fill="#E12D48" />
          </>
        )}
        {type === 'eu' && (
          <>
            <rect width="36" height="36" fill="#1E4DB7" />
            {Array.from({ length: 8 }).map((_, i) => {
              const a = (i / 8) * Math.PI * 2;
              return (
                <circle
                  key={i}
                  cx={18 + Math.cos(a) * 10}
                  cy={18 + Math.sin(a) * 10}
                  r="1.6"
                  fill="#FFD43B"
                />
              );
            })}
          </>
        )}
        {type === 'gb' && (
          <>
            <rect width="36" height="36" fill="#1B3B8B" />
            <path d="M0 0 L36 36 M36 0 L0 36" stroke="#FFFFFF" strokeWidth="6" />
            <rect x="14" width="8" height="36" fill="#FFFFFF" />
            <rect y="14" width="36" height="8" fill="#FFFFFF" />
            <rect x="15.5" width="5" height="36" fill="#DC2E3E" />
            <rect y="15.5" width="36" height="5" fill="#DC2E3E" />
          </>
        )}
        {type === 'ch' && (
          <>
            <rect width="36" height="36" fill="#E0353B" />
            <rect x="15" y="8" width="6" height="20" rx="1" fill="#FFFFFF" />
            <rect x="8" y="15" width="20" height="6" rx="1" fill="#FFFFFF" />
          </>
        )}
        {type === 'ca' && (
          <>
            <rect width="36" height="36" fill="#E0353B" />
            <rect x="9" width="18" height="36" fill="#FFFFFF" />
            <circle cx="18" cy="18" r="5" fill="#E0353B" />
          </>
        )}
        {type === 'au' && (
          <>
            <rect width="36" height="36" fill="#143278" />
            <rect width="17" height="16" fill="#1B3B8B" />
            <rect x="7" width="3" height="16" fill="#FFFFFF" />
            <rect y="6.5" width="17" height="3" fill="#FFFFFF" />
            <circle cx="27" cy="12" r="2" fill="#FFFFFF" />
            <circle cx="25" cy="24" r="2.2" fill="#FFFFFF" />
          </>
        )}
        {type === 'sg' && (
          <>
            <rect width="36" height="18" fill="#E0353B" />
            <rect y="18" width="36" height="18" fill="#FFFFFF" />
            <circle cx="11" cy="9" r="5" fill="#FFFFFF" />
            <circle cx="13" cy="9" r="4.3" fill="#E0353B" />
          </>
        )}
      </g>
    </svg>
  );
};
