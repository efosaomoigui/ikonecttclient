import React from 'react';
import { OPTION_03_CONTENT as C } from '../data/content';
import { ArrowRight } from 'lucide-react';
import homeImg from '../assets/images/residential_fibre_living_room_1791941971218.jpg';
import workImg from '../assets/images/business_enterprise_workspace_1791941971989.jpg';

interface ChooseConnectionSectionProps {
  onExploreResidential: () => void;
  onExploreBusiness: () => void;
}

export const ChooseConnectionSection: React.FC<ChooseConnectionSectionProps> = ({
  onExploreResidential,
  onExploreBusiness,
}) => {
  return (
    <section className="w-full bg-[#090909] text-white py-20 lg:py-28 border-t border-white/5">
      <div className="container-custom">
        
        {/* Section Heading */}
        <div className="max-w-3xl mb-12 lg:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4">
            {C.chooseConnection.heading}
          </h2>
          <div className="w-12 h-1 bg-[#ED101A] rounded-full"></div>
        </div>

        {/* Two Equally Weighted Large Photographic Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          
          {/* Residential Panel (At Home) */}
          <div className="group relative rounded-3xl overflow-hidden bg-[#151517] border border-white/10 hover:border-white/20 transition-all duration-300 flex flex-col justify-end min-h-[520px] lg:min-h-[600px] p-8 lg:p-12">
            
            {/* Background Image with Ambient Grade */}
            <div className="absolute inset-0 z-0">
              <img
                src={homeImg}
                alt="Nigerian home interior connected to Ikonectt high-speed fibre"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090909] via-[#090909]/60 to-transparent" />
            </div>

            {/* Panel Content */}
            <div className="relative z-10 flex flex-col items-start gap-4">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#FF616A] bg-[#ED101A]/10 px-3 py-1 rounded-full border border-[#ED101A]/20">
                Residential Fibre
              </span>

              <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                {C.chooseConnection.residential.title}
              </h3>

              <p className="text-lg text-white/80 font-light max-w-md">
                {C.chooseConnection.residential.line}
              </p>

              <p className="text-sm text-white/60 leading-relaxed max-w-md mb-2">
                {C.chooseConnection.residential.description}
              </p>

              <button
                onClick={onExploreResidential}
                className="btn-pill-primary text-sm font-semibold !px-6 !py-3 shadow-lg shadow-[#ED101A]/20 group/btn"
              >
                <span>{C.chooseConnection.residential.cta}</span>
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>

          </div>

          {/* Business Panel (At Work) */}
          <div className="group relative rounded-3xl overflow-hidden bg-[#151517] border border-white/10 hover:border-white/20 transition-all duration-300 flex flex-col justify-end min-h-[520px] lg:min-h-[600px] p-8 lg:p-12">
            
            {/* Background Image with Ambient Grade */}
            <div className="absolute inset-0 z-0">
              <img
                src={workImg}
                alt="Nigerian corporate team collaborating over enterprise connectivity"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090909] via-[#090909]/60 to-transparent" />
            </div>

            {/* Panel Content */}
            <div className="relative z-10 flex flex-col items-start gap-4">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#FF616A] bg-[#ED101A]/10 px-3 py-1 rounded-full border border-[#ED101A]/20">
                Enterprise & SME
              </span>

              <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                {C.chooseConnection.business.title}
              </h3>

              <p className="text-lg text-white/80 font-light max-w-md">
                {C.chooseConnection.business.line}
              </p>

              <p className="text-sm text-white/60 leading-relaxed max-w-md mb-2">
                {C.chooseConnection.business.description}
              </p>

              <button
                onClick={onExploreBusiness}
                className="btn-pill-secondary text-sm font-semibold !px-6 !py-3 group/btn"
              >
                <span>{C.chooseConnection.business.cta}</span>
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
