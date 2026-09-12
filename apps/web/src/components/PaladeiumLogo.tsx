import React from 'react';

interface PaladeiumLogoProps {
  size?: number;
  tint?: string;
  gradient?: boolean;
}

export function PaladeiumLogo({
  size = 80,
  tint = '#121324',
  gradient = false,
}: PaladeiumLogoProps) {
  const gradId = 'paladeium-logo-grad-web';

  return (
    <div style={{ width: size, height: size * 0.55, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg
        viewBox="0 0 150 80"
        width={size}
        height={size * 0.55}
      >
        {gradient && (
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6C63FF" />
              <stop offset="50%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#43E97B" />
            </linearGradient>
          </defs>
        )}

        <g fill={gradient ? `url(#${gradId})` : tint}>
          <path
            d="M10 42 C25 38 60 34 90 36 C105 37 115 39 120 41 C115 43 105 45 90 44 C60 46 25 48 10 42 Z"
            opacity={0.95}
          />
          <path
            d="M55 36 C60 28 80 18 110 12 C115 11 118 12 116 15 C100 22 75 32 60 38 Z"
            opacity={0.9}
          />
          <path
            d="M55 38 C65 34 95 28 118 22 C120 25 116 30 100 36 C80 42 62 42 55 38 Z"
            opacity={0.6}
          />
          <path
            d="M60 44 C70 50 95 58 125 65 C128 68 126 70 122 69 C100 63 72 52 60 44 Z"
            opacity={0.85}
          />
          <path
            d="M10 42 C5 40 0 35 2 30 C5 32 8 36 14 40 Z"
            opacity={0.9}
          />
          <path
            d="M10 42 C5 44 0 50 2 55 C5 53 8 48 14 44 Z"
            opacity={0.9}
          />
          <path
            d="M118 39 C122 37 128 38 132 40 C130 44 124 45 120 43 Z"
            opacity={1}
          />
          <path
            d="M130 40 C136 39 145 40 148 41 C145 42 136 42 130 41 Z"
            opacity={0.9}
          />
          <path
            d="M118 38 C122 34 128 34 132 37 C128 38 122 38 118 38 Z"
            fill={gradient ? undefined : '#1A1A2E'}
            opacity={gradient ? 0 : 0.85}
          />
        </g>
      </svg>
    </div>
  );
}
