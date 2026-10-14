import React from 'react';
import { OPTION_03_CONTENT as C } from '../data/content';
import { ArrowRight, MapPin, CheckCircle2 } from 'lucide-react';

interface CoverageActionSectionProps {
  onCheckCoverage: () => void;
}

export const CoverageActionSection: React.FC<CoverageActionSectionProps> = ({
  onCheckCoverage,
}) => {
  return (
    <section className="w-full bg-[#0E0E10] text-white py-20 lg:py-28 border-t border-white/5 relative overflow-hidden">
      
      {/* Restrained background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#ED101A]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container-custom relative z-10">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-6">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold uppercase tracking-wider text-[#FF616A]">
            <MapPin className="w-3.5 h-3.5 text-[#ED101A]" />
            <span>Network Footprint</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            {C.coverageAction.heading}
          </h2>

          <p className="text-base sm:text-lg text-[#A1A1AA] font-light max-w-xl">
            {C.coverageAction.supportingLine}
          </p>

          {/* Active Deployment Hub Chips (strictly verified locations from content.md) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-3xl my-4 text-left">
            {C.coverageAction.verifiedHubs.map((hub, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-[#151517] border border-white/10 flex flex-col gap-1">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-[#ED101A]" />
                  {hub.city}
                </span>
                <span className="text-[11px] text-[#A1A1AA] line-clamp-1">{hub.areas}</span>
              </div>
            ))}
          </div>

          {/* Action CTA */}
          <div className="pt-2">
            <button
              onClick={onCheckCoverage}
              className="btn-pill-primary text-sm sm:text-base font-semibold !px-8 !py-4 shadow-xl shadow-[#ED101A]/25 flex items-center gap-2 group"
            >
              <span>{C.coverageAction.cta}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};
