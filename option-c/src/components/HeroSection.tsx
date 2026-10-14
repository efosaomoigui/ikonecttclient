import React from 'react';
import { OPTION_03_CONTENT as C } from '../data/content';
import { ArrowRight, ChevronDown } from 'lucide-react';
import heroImage from '../assets/images/hero_nigerian_family_gigabit_1791941970852.jpg';

interface HeroSectionProps {
  onExploreResidential: () => void;
  onExploreBusiness: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreResidential,
  onExploreBusiness,
}) => {
  return (
    <section className="relative w-full min-h-[92vh] lg:min-h-screen flex items-end justify-start bg-[#090909] text-white overflow-hidden pt-28 pb-20 lg:pb-32">
      
      {/* 1. Continuous Full-Bleed Photographic Composition */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Modern Nigerian home powered by Ikonectt optical fibre broadband"
          className="w-full h-full object-cover object-center lg:object-right-top scale-[1.02] transform transition-transform duration-1000 ease-out"
        />

        {/* 2. Measured Starlink-Restrained Graded Legibility Scrim */}
        {/* Left-to-right gradient for text legibility without obscuring the photography */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#090909]/95 via-[#090909]/75 to-transparent lg:w-3/4" />
        {/* Bottom vignette for structural grounding */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090909] via-transparent to-black/30" />
      </div>

      {/* 3. Hero Content — Strictly Eyebrow, Headline, Supporting Line, and 2 CTAs */}
      <div className="relative z-10 container-custom w-full">
        <div className="max-w-2xl flex flex-col items-start gap-6 sm:gap-8">
          
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ED101A]"></span>
            <span className="text-xs sm:text-sm font-semibold tracking-[0.25em] text-[#FF616A] uppercase">
              {C.hero.eyebrow}
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.05]">
            {C.hero.headline}
          </h1>

          {/* Supporting line */}
          <p className="text-lg sm:text-xl lg:text-2xl text-white/90 font-light leading-relaxed max-w-xl">
            {C.hero.supportingLine}
          </p>

          {/* Two CTAs — strictly no forms or inputs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={onExploreResidential}
              className="btn-pill-primary text-sm sm:text-base font-semibold !px-6 sm:!px-8 !py-3.5 sm:!py-4 shadow-xl shadow-[#ED101A]/30 group"
            >
              <span>{C.hero.primaryCta}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onExploreBusiness}
              className="btn-pill-secondary text-sm sm:text-base font-semibold !px-6 sm:!px-8 !py-3.5 sm:!py-4"
            >
              <span>{C.hero.secondaryCta}</span>
            </button>
          </div>

        </div>
      </div>

      {/* Subtle scroll cue indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-1 text-white/40 text-xs font-medium pointer-events-none">
        <span>Scroll to explore</span>
        <ChevronDown className="w-4 h-4 animate-bounce text-white/50" />
      </div>

    </section>
  );
};
