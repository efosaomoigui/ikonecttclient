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

        <div data-home-plan-carousel />

      </div>
    </section>
  );
};
