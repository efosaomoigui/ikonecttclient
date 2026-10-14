import React from 'react';
import { OPTION_03_CONTENT as C } from '../data/content';
import { ArrowRight, Headphones, Phone, Mail, MessageSquare } from 'lucide-react';

interface SupportSectionProps {
  onOpenSupport: () => void;
}

export const SupportSection: React.FC<SupportSectionProps> = ({
  onOpenSupport,
}) => {
  return (
    <section className="w-full bg-[#FFFFFF] text-[#1D1D1F] py-20 lg:py-28 border-t border-black/5">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center gap-8">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F5F5F7] border border-black/5 text-xs font-semibold uppercase tracking-wider text-[#ED101A]">
            <Headphones className="w-3.5 h-3.5 text-[#ED101A]" />
            <span>Dedicated Customer Care</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#1D1D1F]">
            {C.support.heading}
          </h2>

          <p className="text-lg sm:text-xl text-[#52525B] font-light max-w-xl">
            {C.support.supportingLine}
          </p>

          {/* Three Restrained Communication Channels */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl my-2 text-left">
            {C.support.channels.map((chan, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-[#F5F5F7] border border-black/5 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#71717A] mb-1">
                    {chan.title}
                  </h3>
                  <p className="text-sm font-bold text-[#1D1D1F] break-all">
                    {chan.detail}
                  </p>
                </div>
                <p className="text-[11px] text-[#A1A1AA] mt-3">
                  {chan.sub}
                </p>
              </div>
            ))}
          </div>

          {/* Direct Support CTA */}
          <div className="pt-2">
            <button
              onClick={onOpenSupport}
              className="btn-pill-dark text-sm sm:text-base font-semibold !px-8 !py-4 shadow-lg flex items-center gap-2 group"
            >
              <span>{C.support.cta}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};
