import React, { useState } from 'react';
import { ASSETS } from '../../data/assets';
import { CoverageChecker } from './CoverageChecker';
import { Plan } from '../../data/telecomData';
import { ArrowRight, ChevronRight, Check } from 'lucide-react';

interface HomePageProps {
  onNavigate: (tab: 'home' | 'residential' | 'business' | 'coverage' | 'about') => void;
  onSelectPlan: (plan: Plan) => void;
  onOpenMyIkonectt: () => void;
  onViewPlans?: (audience: 'residential' | 'business') => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onSelectPlan,
  onOpenMyIkonectt,
  onViewPlans,
}) => {
  return (
    <div className="w-full bg-white">
      {/* 1. HERO SECTION: Full-bleed panoramic photographic composition */}
      <section className="relative min-h-[600px] lg:min-h-[720px] flex items-end bg-[#18181b] overflow-hidden text-white">
        {/* Background panoramic image with subtle measured contrast scrim */}
        <div className="absolute inset-0 z-0">
          <img
            src={ASSETS.heroFamily}
            alt="Nigerian family enjoying fiber broadband in a modern home"
            className="w-full h-full object-cover object-center"
            referrerPolicy="no-referrer"
          />
          {/* Measured gradient scrim preserving legibility per WCAG AA */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pb-20 lg:pb-28 pt-32 w-full">
          <div className="max-w-2xl flex flex-col gap-6">
            {/* Clean eyebrow */}
            <p className="text-sm font-semibold tracking-wide text-[#FF616A] uppercase">
              Fibre internet for a brighter Nigeria
            </p>

            {/* Confident Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.08]">
              Connectivity without limits.
            </h1>

            {/* Editorial Lead Paragraph */}
            <p className="text-lg sm:text-xl text-white/90 font-light leading-relaxed max-w-xl">
              Fibre broadband for homes, businesses and everything you do online.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onNavigate('coverage')}
                className="ik-btn-primary"
              >
                <span>Check Coverage</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onViewPlans ? onViewPlans('residential') : onNavigate('residential')}
                className="ik-btn-on-dark"
              >
                Explore Plans
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. COVERAGE LAUNCHER */}
      <section className="w-full bg-[#f5f5f7] py-16 lg:py-20 border-b border-[#e0e0e0]">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center flex flex-col items-center gap-4">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#1d1d1f] tracking-tight">
            Is Ikonectt available in your area?
          </h2>
          <p className="text-base text-[#333333] max-w-lg">
            Check service availability at your address.
          </p>

          <div className="w-full max-w-2xl mt-4">
            <CoverageChecker onSelectPlan={() => onNavigate('residential')} variant="compact" />
          </div>

          <p className="text-sm text-[#7a7a7a] mt-2">
            Availability is subject to address verification.
          </p>
        </div>
      </section>

      {/* 3. AUDIENCE INTRODUCTIONS: Edge-to-edge photographic split */}
      <section className="w-full grid grid-cols-1 lg:grid-cols-2">
        {/* Residential Card */}
        <article className="relative min-h-[520px] lg:min-h-[600px] flex items-end text-white overflow-hidden group">
          <img
            src={ASSETS.residentialLivingRoom}
            alt="Residential fibre broadband for modern homes"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
          <div className="relative w-full p-8 sm:p-12 lg:p-16 flex flex-col gap-4 max-w-[560px]">
            <span className="text-sm font-semibold tracking-wide text-[#FF616A] uppercase">
              Residential
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
              Internet for every day.
            </h2>
            <p className="text-base text-white/90 leading-relaxed">
              Stay connected at home for work, learning and entertainment.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('residential')}
                className="ik-link ik-link-on-dark text-base font-medium"
              >
                <span>Explore Residential</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </article>

        {/* Business Card */}
        <article className="relative min-h-[520px] lg:min-h-[600px] flex items-end text-white overflow-hidden group">
          <img
            src={ASSETS.businessWorkspace}
            alt="Business broadband solutions for modern enterprise workplaces"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
          <div className="relative w-full p-8 sm:p-12 lg:p-16 flex flex-col gap-4 max-w-[560px]">
            <span className="text-sm font-semibold tracking-wide text-[#FF616A] uppercase">
              Business
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
              Connectivity that works for business.
            </h2>
            <p className="text-base text-white/90 leading-relaxed">
              Explore broadband options for your team, office or organisation.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('business')}
                className="ik-link ik-link-on-dark text-base font-medium"
              >
                <span>Explore Business</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </article>
      </section>

      {/* 4. FEATURED PLANS: Clean architectural preview cards */}
      <section className="w-full py-20 lg:py-24 bg-white border-b border-[#e0e0e0]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="max-w-2xl mx-auto text-center flex flex-col gap-3 mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1d1d1f] tracking-tight">
              Find your connection.
            </h2>
            <p className="text-base text-[#333333] leading-relaxed">
              Browse available plans and choose what suits your needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <button
              onClick={() => onViewPlans ? onViewPlans('residential') : onNavigate('residential')}
              className="p-8 rounded-2xl bg-[#f5f5f7] hover:bg-[#ececef] text-left flex items-center justify-between gap-6 transition-colors border border-[#e0e0e0]"
            >
              <div className="flex flex-col gap-2">
                <span className="text-xs uppercase font-semibold text-[#7a7a7a]">Residential</span>
                <span className="text-xl font-bold text-[#1d1d1f]">Explore home broadband plans</span>
                <span className="text-sm text-[#7a7a7a]">Options designed for everyday streaming, remote work and family households.</span>
              </div>
              <ArrowRight className="w-5 h-5 text-[#ED101A] shrink-0" />
            </button>

            <button
              onClick={() => onViewPlans ? onViewPlans('business') : onNavigate('business')}
              className="p-8 rounded-2xl bg-[#f5f5f7] hover:bg-[#ececef] text-left flex items-center justify-between gap-6 transition-colors border border-[#e0e0e0]"
            >
              <div className="flex flex-col gap-2">
                <span className="text-xs uppercase font-semibold text-[#7a7a7a]">Business</span>
                <span className="text-xl font-bold text-[#1d1d1f]">Explore business connectivity</span>
                <span className="text-sm text-[#7a7a7a]">Reliable broadband solutions for commercial teams, offices and enterprise operations.</span>
              </div>
              <ArrowRight className="w-5 h-5 text-[#ED101A] shrink-0" />
            </button>
          </div>

          <div className="mt-12 flex flex-col items-center gap-4 text-center">
            <button
              onClick={() => onViewPlans ? onViewPlans('residential') : onNavigate('residential')}
              className="ik-link text-base font-semibold"
            >
              <span>View All Plans</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <p className="text-xs text-[#7a7a7a] max-w-md">
              Plan availability and installation are subject to location verification and applicable terms.
            </p>
          </div>
        </div>
      </section>

      {/* 5. COMPANY CONFIDENCE: Dark canvas section */}
      <section className="w-full bg-[#272729] text-white py-20 lg:py-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center flex flex-col items-center gap-5">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Connecting people and possibilities.
          </h2>
          <p className="text-lg text-[#cccccc] font-light leading-relaxed max-w-2xl">
            Ikonectt is the broadband brand of Intelivision Technologies, serving homes and businesses.
          </p>
          <div className="pt-3">
            <button
              onClick={() => onNavigate('about')}
              className="ik-link ik-link-on-dark text-base font-semibold"
            >
              <span>About Ikonectt</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 6. PORTAL PANEL */}
      <section className="w-full bg-[#f5f5f7] py-20 lg:py-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center flex flex-col items-center gap-5">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#1d1d1f] tracking-tight">
            Manage your services with My Ikonectt.
          </h2>
          <p className="text-base text-[#333333] max-w-xl leading-relaxed">
            Access your account, view your services and find support in one place.
          </p>
          <div className="pt-2">
            <button
              onClick={onOpenMyIkonectt}
              className="ik-btn-primary"
            >
              My Ikonectt
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
