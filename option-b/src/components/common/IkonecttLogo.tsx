import React from 'react';

interface IkonecttLogoProps {
  className?: string;
  variant?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg';
}

export const IkonecttLogo: React.FC<IkonecttLogoProps> = ({
  className = '',
  variant = 'dark',
  size = 'md',
}) => {
  const isLight = variant === 'light';
  const logoSrc = isLight ? '/ikonectt-logo-white.png' : '/ikonectt-logo.png';

  const sizeClasses = {
    sm: 'h-8 sm:h-9',
    md: 'h-10 sm:h-11 md:h-12',
    lg: 'h-13 sm:h-15',
  };

  return (
    <div className={`inline-flex items-center shrink-0 select-none overflow-visible ${className}`}>
      <img
        src={logoSrc}
        alt="iKonectt®"
        className={`${sizeClasses[size]} w-auto object-contain block transition-transform duration-200 hover:scale-[1.02]`}
        loading="eager"
      />
    </div>
  );
};
