import React from 'react';
import { OPTION_03_CONTENT as C } from '../data/content';
import { ArrowRight, Wifi, Sparkles, Heart } from 'lucide-react';
import editorialImg from '../assets/images/creative_creator_fibre_1791941972055.jpg';

interface ResidentialEditorialSectionProps {
  onExploreResidential: () => void;
}

export const ResidentialEditorialSection: React.FC<ResidentialEditorialSectionProps> = ({
  onExploreResidential,
}) => {
  return (
    <section id="residential-editorial" className="w-full bg-[#F5F5F7] text-[#1D1D1F] py-20 lg:py-32 transition-colors">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Editorial Copy */}
          <div className="lg:col-span-6 flex flex-col items-start gap-6">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-black/10 text-xs font-semibold uppercase tracking-wider text-[#ED101A] shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#ED101A]" />
              <span>Residential Experience</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#1D1D1F] leading-[1.12]">
              {C.residentialEditorial.heading}
            </h2>

            <p className="text-lg sm:text-xl text-[#52525B] font-normal leading-relaxed">
              {C.residentialEditorial.supportingLine}
            </p>

            <div className="space-y-4 text-sm sm:text-base text-[#52525B] leading-relaxed">
              {C.residentialEditorial.paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>

            {/* Restrained Touchpoint Pills */}
            <div className="flex flex-wrap gap-2.5 pt-2">
              <span className="px-3.5 py-1.5 rounded-full bg-white border border-black/10 text-xs font-medium text-[#1D1D1F]">
                4K UHD Streaming
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-white border border-black/10 text-xs font-medium text-[#1D1D1F]">
                Zero-Lag Teleconferencing
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-white border border-black/10 text-xs font-medium text-[#1D1D1F]">
                Multi-Device Wi-Fi 6
              </span>
            </div>

            <div className="pt-4">
              <button
                onClick={onExploreResidential}
                className="btn-pill-dark text-sm font-semibold !px-7 !py-3.5 shadow-md flex items-center gap-2 group"
              >
                <span>{C.residentialEditorial.cta}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </div>

          {/* Right Column: Immersive Photographic Editorial */}
          <div className="lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-black/5 aspect-[4/3] lg:aspect-[5/4] bg-neutral-200">
              <img
                src={editorialImg}
                alt="Nigerian remote professional working seamlessly with Ikonectt fibre"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-6 left-6 right-6 text-white text-xs font-medium bg-black/60 backdrop-blur-md p-3.5 rounded-xl border border-white/15">
                <span>Authentic optical connectivity for creators, households and everyday moments.</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
