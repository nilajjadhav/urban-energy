import React, { useState } from 'react';
import { ASSETS } from '../data/gridData';

export const BrandLogo: React.FC<{ className?: string }> = ({ className = 'h-8 w-8' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    fill="none"
    className={`shrink-0 ${className}`}
    aria-label="Urban Energy Intelligence Logo"
  >
    <rect width="100" height="100" rx="24" fill="#12263C" />
    <circle cx="50" cy="50" r="38" stroke="#63C7C8" strokeWidth="2" strokeDasharray="4 3" opacity="0.5" />
    <circle cx="50" cy="50" r="28" stroke="#3C9EA8" strokeWidth="1.5" opacity="0.72" />
    <circle cx="50" cy="22" r="3.5" fill="#A6E5E5" />
    <circle cx="74" cy="36" r="3.5" fill="#A6E5E5" />
    <circle cx="74" cy="64" r="3.5" fill="#A6E5E5" />
    <circle cx="50" cy="78" r="3.5" fill="#A6E5E5" />
    <circle cx="26" cy="64" r="3.5" fill="#A6E5E5" />
    <circle cx="26" cy="36" r="3.5" fill="#A6E5E5" />
    <line x1="50" y1="22" x2="74" y2="36" stroke="#63C7C8" strokeWidth="1.5" opacity="0.8" />
    <line x1="74" y1="36" x2="74" y2="64" stroke="#63C7C8" strokeWidth="1.5" opacity="0.8" />
    <line x1="74" y1="64" x2="50" y2="78" stroke="#63C7C8" strokeWidth="1.5" opacity="0.8" />
    <line x1="50" y1="78" x2="26" y2="64" stroke="#63C7C8" strokeWidth="1.5" opacity="0.8" />
    <line x1="26" y1="64" x2="26" y2="36" stroke="#63C7C8" strokeWidth="1.5" opacity="0.8" />
    <line x1="26" y1="36" x2="50" y2="22" stroke="#63C7C8" strokeWidth="1.5" opacity="0.8" />
    <polygon points="53,28 39,52 49,52 45,72 63,46 51,46" fill="#8CE0D0" stroke="#5BC8B5" strokeWidth="0.5" />
  </svg>
);

export const OperatorAvatar: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => {
  const [imgError, setImgError] = useState(false);

  if (imgError) {
    return (
      <div
        className={`${className} rounded-full bg-primary-container text-tertiary-fixed flex items-center justify-center font-headline-sm text-xs font-bold shrink-0`}
      >
        RD
      </div>
    );
  }

  return (
    <img
      src={ASSETS.avatar}
      alt="R. Deshmukh, Senior Field Engineer"
      referrerPolicy="no-referrer"
      onError={() => setImgError(true)}
      className={`${className} rounded-full object-cover shrink-0`}
    />
  );
};
