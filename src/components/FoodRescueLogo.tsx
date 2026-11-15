import React from 'react';

export const FoodRescueLogo: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 48,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background glow circle */}
      <circle cx="60" cy="60" r="56" fill="#F0FDF4" />

      {/* Sprouting green leaves from bowl */}
      <path
        d="M60 48C58 30 75 18 88 18C88 32 76 46 60 48Z"
        fill="#4CAF50"
      />
      <path
        d="M60 48C62 26 44 14 32 16C32 30 46 45 60 48Z"
        fill="#8BC34A"
      />
      <path
        d="M60 48C60 32 65 24 60 22C55 24 59 34 60 48Z"
        fill="#2E7D32"
      />

      {/* Fresh food grains & warm nourishment in bowl */}
      <path
        d="M32 55C32 50 42 45 60 45C78 45 88 50 88 55C88 58 78 62 60 62C42 62 32 58 32 55Z"
        fill="#F5A623"
      />
      <ellipse cx="60" cy="54" rx="22" ry="5" fill="#F7B944" />
      <circle cx="48" cy="53" r="2.5" fill="#FFE082" />
      <circle cx="68" cy="53" r="2.5" fill="#FFE082" />
      <circle cx="58" cy="52" r="2" fill="#FFE082" />

      {/* Green rounded bowl with high-gloss finish */}
      <path
        d="M24 54C24 54 26 88 60 88C94 88 96 54 96 54C96 54 84 57 60 57C36 57 24 54 24 54Z"
        fill="url(#bowlGradient)"
      />
      {/* Bowl rim highlight */}
      <path
        d="M24 54C34 58 86 58 96 54C86 51 34 51 24 54Z"
        fill="#0A8F30"
      />
      {/* Bowl base */}
      <path
        d="M48 87C48 91 72 91 72 87H48Z"
        fill="#065F20"
      />

      <defs>
        <linearGradient id="bowlGradient" x1="24" y1="54" x2="96" y2="88" gradientUnits="userSpaceOnUse">
          <stop stopColor="#087A28" />
          <stop offset="0.6" stopColor="#0A8F30" />
          <stop offset="1" stopColor="#05531B" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export const GlobeIllustration: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Soft warm hand cradling the earth */}
      <path
        d="M30 115C38 108 55 106 65 110C75 114 90 112 108 102C118 97 122 104 116 112C102 128 75 135 48 132C38 130 25 125 30 115Z"
        fill="#F5D0A9"
      />
      <circle cx="70" cy="65" r="45" fill="#4CAF50" />
      {/* Earth continents in vibrant blue / green */}
      <circle cx="70" cy="65" r="43" fill="#388E3C" />
      <path
        d="M50 45C55 42 62 48 65 52C68 56 60 68 52 65C45 62 45 48 50 45Z"
        fill="#66BB6A"
      />
      <path
        d="M75 35C82 32 92 40 90 48C88 56 78 60 74 54C70 48 72 38 75 35Z"
        fill="#81C784"
      />
      <path
        d="M60 78C68 72 82 75 88 85C82 92 70 95 62 90C55 85 55 82 60 78Z"
        fill="#A5D6A7"
      />
      {/* Sprouting leaf on top of earth */}
      <path
        d="M70 24C68 15 78 8 85 8C85 15 78 22 70 24Z"
        fill="#8BC34A"
      />
    </svg>
  );
};
