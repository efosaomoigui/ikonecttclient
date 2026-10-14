import React, { useState } from 'react';

interface BrandLogoProps {
  className?: string;
  variant?: 'light' | 'dark';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = 'h-10 sm:h-11 md:h-12',
  variant = 'light',
}) => {
  // Try local public asset first, then remote CDN, then SVG vector fallback
  const [srcIndex, setSrcIndex] = useState(0);

  const isDark = variant === 'dark';
  const logoSrc = isDark ? '/ikonectt-logo-white.png' : '/ikonectt-logo.png';

  const sources = [
    logoSrc,
    isDark ? '/ikonectt-logo.png' : '/ikonectt-logo-white.png',
    'https://lh3.googleusercontent.com/aida/AEtjO1X98oTfwNQkFjO28CjGpysj42JcV1BPKwoIYhMGDF1j3kOxS0fm8aH_rEJN6nmPK4IsTZw01CZ3Oe2a_rtdmd1r3-vQlAoL3F04KW9yOqSDc1k_VM-7FYxOgnsgSS2-JKZH28QYLfG8GEj3KyhBdI3dmcAyVU1jihdZYjcGvJ0asg7V-ThUEkYcFbJL9ADkPwdbrVFXIbEqJ8Ns27vwD6ci7PPAgvfTrfyqUMCee3FlvdUF7uxgMKzouOUe',
  ];

  const handleImageError = () => {
    if (srcIndex < sources.length - 1) {
      setSrcIndex(srcIndex + 1);
    } else {
      setSrcIndex(sources.length); // triggers SVG fallback
    }
  };

  return (
    <div className="flex items-center shrink-0 overflow-visible py-0.5">
      {srcIndex < sources.length ? (
        <img
          src={sources[srcIndex]}
          alt="iKonectt®"
          className={`${className} w-auto object-contain object-left block overflow-visible transition-opacity`}
          onError={handleImageError}
          referrerPolicy="no-referrer"
          loading="eager"
        />
      ) : (
        /* Pixel-faithful vector SVG fallback of the official Ikonectt® logo with generous padding so nothing is cut */
        <svg
          className={`${className} w-auto overflow-visible`}
          viewBox="0 0 348 88"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Ikonectt®"
        >
          {/* Dot of the letter i */}
          <circle cx="21" cy="20" r="9.5" fill={isDark ? '#FF616A' : '#ED101A'} />

          {/* Stem of the letter i with iconic lightning bolt notch */}
          <path
            d="M12 38H30L20 56H31L13 80L19 58H12V38Z"
            fill={isDark ? '#FF616A' : '#ED101A'}
          />

          {/* Letter K */}
          <path
            d="M48 14H61V46.5L78 26H94L74 48L96 78H80L63.5 54L61 57V78H48V14Z"
            fill={isDark ? '#FF616A' : '#ED101A'}
          />

          {/* Letter o */}
          <path
            d="M118 38C130.5 38 139 47 139 58.5C139 70 130.5 79 118 79C105.5 79 97 70 97 58.5C97 47 105.5 38 118 38ZM118 49C112.5 49 109 53 109 58.5C109 64 112.5 68 118 68C123.5 68 127 64 127 58.5C127 53 123.5 49 118 49Z"
            fill={isDark ? '#FF616A' : '#ED101A'}
          />

          {/* Letter n */}
          <path
            d="M148 39H159.5V45C162.5 41 167.5 38.5 174 38.5C184 38.5 189 44.5 189 54V78H177V56C177 50.5 174.5 48 170 48C164.5 48 160 52 160 58V78H148V39Z"
            fill={isDark ? '#FF616A' : '#ED101A'}
          />

          {/* Letter e */}
          <path
            d="M211 60H197C197.5 65.5 201 69 206.5 69C210 69 213 67.5 214.5 65L223 70C219.5 76 213.5 79 206 79C194 79 186 70.5 186 58.5C186 46.5 194 38 205.5 38C217 38 224 46.5 224 58.5V60H211ZM211.5 52C211 47.5 208 45 205 45C201.5 45 198 47.5 197.5 52H211.5Z"
            fill={isDark ? '#FF616A' : '#ED101A'}
          />

          {/* Letter c */}
          <path
            d="M241 49.5C243.5 49.5 246 50.5 247.5 52.5L255 45C251 40.5 245.5 38 239.5 38C227.5 38 219.5 47 219.5 58.5C219.5 70 227.5 79 239.5 79C246 79 251.5 76 255.5 71.5L247.5 64.5C246 66.5 243.5 67.5 240.5 67.5C235 67.5 231.5 63.5 231.5 58.5C231.5 53.5 235 49.5 241 49.5Z"
            fill={isDark ? '#FF616A' : '#ED101A'}
          />

          {/* Letter t (first) */}
          <path
            d="M260 27H270V39H277V48H270V66C270 68.5 271.5 69.5 274 69.5C275.5 69.5 277 69 278 68L280 77C277.5 78.5 274 79 271 79C263.5 79 260 74.5 260 66V48H255V39H260V27Z"
            fill={isDark ? '#FF616A' : '#ED101A'}
          />

          {/* Letter t (second) */}
          <path
            d="M284 27H294V39H301V48H294V66C294 68.5 295.5 69.5 298 69.5C299.5 69.5 301 69 302 68L304 77C301.5 78.5 298 79 295 79C287.5 79 284 74.5 284 66V48H279V39H284V27Z"
            fill={isDark ? '#FF616A' : '#ED101A'}
          />

          {/* Registered trademark mark (R) */}
          <circle
            cx="318"
            cy="30"
            r="6.5"
            stroke={isDark ? '#FF616A' : '#ED101A'}
            strokeWidth="1.2"
            fill="none"
          />
          <text
            x="318"
            y="33.5"
            fill={isDark ? '#FF616A' : '#ED101A'}
            fontSize="7"
            fontWeight="bold"
            textAnchor="middle"
            fontFamily="system-ui, sans-serif"
          >
            R
          </text>
        </svg>
      )}
    </div>
  );
};
