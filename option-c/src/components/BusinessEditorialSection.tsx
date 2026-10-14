import React from 'react';
import { OPTION_03_CONTENT as C } from '../data/content';
import { ArrowRight, Building2, Server, ShieldCheck, Network } from 'lucide-react';
import bizImg from '../assets/images/nigerian_business_collaboration.jpg';

interface BusinessEditorialSectionProps {
  onExploreBusiness: () => void;
}

export const BusinessEditorialSection: React.FC<BusinessEditorialSectionProps> = ({
  onExploreBusiness,
}) => {
  return (
    <section id="business-editorial" className="w-full bg-[#101010] text-white py-20 lg:py-32 border-t border-white/5">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column (Inverted from Residential): Large Enterprise Editorial Image */}
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 aspect-[4/3] lg:aspect-[5/4] bg-neutral-900">
              <img
                src={bizImg}
                alt="Contemporary Nigerian enterprise team collaborating over Ikonectt fibre"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090909]/80 via-transparent to-transparent pointer-events-none" />
              
              {/* Enterprise Telemetry Pill */}
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-xs text-white/90 bg-[#151517]/85 backdrop-blur-md p-4 rounded-2xl border border-white/15">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="font-semibold">Enterprise Core Network</span>
                </div>
                <span className="text-white/60 font-mono text-[11px]">Redundant Transit</span>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Copy */}
          <div className="lg:col-span-6 order-1 lg:order-2 flex flex-col items-start gap-6">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-semibold uppercase tracking-wider text-[#FF616A]">
              <Building2 className="w-3.5 h-3.5 text-[#ED101A]" />
              <span>Enterprise & Commercial Infrastructure</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-[1.12]">
              {C.businessEditorial.heading}
            </h2>

            <p className="text-lg sm:text-xl text-[#A1A1AA] font-light leading-relaxed">
              {C.businessEditorial.supportingLine}
            </p>

            <div className="space-y-4 text-sm sm:text-base text-white/80 leading-relaxed font-light">
              {C.businessEditorial.paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>

            {/* Enterprise Service Highlights */}
            <div className="grid grid-cols-2 gap-4 w-full pt-2">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 text-white font-semibold text-sm mb-1">
                  <Server className="w-4 h-4 text-[#ED101A]" />
                  <span>Dedicated Trunking</span>
                </div>
                <p className="text-xs text-white/60">Contention-free optical link directly to your server room.</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 text-white font-semibold text-sm mb-1">
                  <ShieldCheck className="w-4 h-4 text-[#ED101A]" />
                  <span>Service Guarantees</span>
                </div>
                <p className="text-xs text-white/60">Direct field response teams and proactive line monitoring.</p>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={onExploreBusiness}
                className="btn-pill-primary text-sm font-semibold !px-7 !py-3.5 shadow-xl shadow-[#ED101A]/20 flex items-center gap-2 group"
              >
                <span>{C.businessEditorial.cta}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
