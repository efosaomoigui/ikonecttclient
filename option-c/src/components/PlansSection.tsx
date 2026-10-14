import React from 'react';
import { OPTION_03_CONTENT as C } from '../data/content';
import { ArrowRight, Check, Home, Building2, ShieldCheck, Zap } from 'lucide-react';

interface PlansSectionProps {
  onSelectAudience: (audience: 'residential' | 'business') => void;
  onOpenCoverage: () => void;
}

export const PlansSection: React.FC<PlansSectionProps> = ({
  onSelectAudience,
  onOpenCoverage,
}) => {
  return (
    <section id="plans" className="w-full bg-[#101010] text-white py-20 lg:py-28 border-t border-white/5">
      <div className="container-custom">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#ED101A]"></span>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#FF616A]">
              Connectivity Pathways
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4">
            {C.plans.heading}
          </h2>

          <p className="text-base sm:text-lg text-[#A1A1AA] font-light max-w-xl mx-auto">
            {C.plans.supportingLine}
          </p>
        </div>

        {/* Two Audience-Level Pathway Cards — Starlink-Restrained */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
          
          {/* Residential Plans Card */}
          <div className="rounded-3xl bg-[#151517] border border-white/10 hover:border-[#ED101A]/40 transition-all duration-300 p-8 sm:p-10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="p-3 rounded-2xl bg-white/5 text-[#ED101A] border border-white/10">
                  <Home className="w-6 h-6" />
                </span>
                <span className="text-xs font-medium text-white/50 tracking-wider uppercase px-3 py-1 rounded-full bg-white/5">
                  Homes & Apartments
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                {C.plans.cards[0].title}
              </h3>

              <p className="text-sm text-white/70 leading-relaxed mb-8">
                {C.plans.cards[0].description}
              </p>

              {/* Verified Key Attributes */}
              <div className="space-y-3.5 mb-8">
                {C.plans.cards[0].features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-white/90">
                    <Check className="w-4 h-4 text-[#ED101A] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => onSelectAudience('residential')}
                className="w-full btn-pill-primary text-xs sm:text-sm font-semibold !py-3 flex items-center justify-center gap-2 group"
              >
                <span>{C.plans.cards[0].cta}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Business Plans Card */}
          <div className="rounded-3xl bg-[#151517] border border-white/10 hover:border-[#ED101A]/40 transition-all duration-300 p-8 sm:p-10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="p-3 rounded-2xl bg-white/5 text-[#ED101A] border border-white/10">
                  <Building2 className="w-6 h-6" />
                </span>
                <span className="text-xs font-medium text-white/50 tracking-wider uppercase px-3 py-1 rounded-full bg-white/5">
                  Corporate & SME
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                {C.plans.cards[1].title}
              </h3>

              <p className="text-sm text-white/70 leading-relaxed mb-8">
                {C.plans.cards[1].description}
              </p>

              {/* Verified Key Attributes */}
              <div className="space-y-3.5 mb-8">
                {C.plans.cards[1].features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-white/90">
                    <Check className="w-4 h-4 text-[#ED101A] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => onSelectAudience('business')}
                className="w-full btn-pill-secondary text-xs sm:text-sm font-semibold !py-3 flex items-center justify-center gap-2 group hover:!border-[#ED101A]/50"
              >
                <span>{C.plans.cards[1].cta}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#ED101A] group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

        </div>

        {/* Global CTA */}
        <div className="text-center">
          <button
            onClick={onOpenCoverage}
            className="btn-pill-secondary text-xs sm:text-sm !px-6 !py-2.5 inline-flex items-center gap-2 hover:!border-white/40"
          >
            <span>{C.plans.allPlansCta}</span>
            <ArrowRight className="w-3.5 h-3.5 text-white/70" />
          </button>
        </div>

      </div>
    </section>
  );
};
