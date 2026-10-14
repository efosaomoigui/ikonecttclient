import React from 'react';
import { OPTION_03_CONTENT as C } from '../data/content';
import { ArrowUp, MapPin, Mail, Phone, Globe } from 'lucide-react';

interface FooterProps {
  onOpenCoverage: () => void;
  onOpenSupport: () => void;
  onOpenAbout: () => void;
  onOpenMyIkonectt: () => void;
  onScrollToSection: (id: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenCoverage,
  onOpenSupport,
  onOpenAbout,
  onOpenMyIkonectt,
  onScrollToSection,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-[#080809] text-white pt-20 pb-12 border-t border-white/10">
      <div className="container-custom">
        
        {/* Top Tier: Brand, Line and Navigation Groups */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-16 border-b border-white/10">
          
          {/* Brand info column (4 columns on desktop) */}
          <div className="lg:col-span-4 flex flex-col items-start gap-5">
            <img
              src="./ikonectt-logo-white.png"
              alt="Ikonectt"
              className="h-10 sm:h-11 w-auto object-contain"
            />
            
            <p className="text-sm text-white/80 font-medium">
              {C.footer.brandLine}
            </p>

            <p className="text-xs text-[#A1A1AA] max-w-sm leading-relaxed">
              Optical fibre infrastructure delivering symmetrical gigabit connectivity across Nigeria. Operated by <strong className="text-white font-medium">{C.footer.company}</strong>.
            </p>

            {/* Verified Contact Details */}
            <div className="flex flex-col gap-2 pt-2 text-xs text-[#A1A1AA]">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#ED101A] shrink-0" />
                <span>{C.footer.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#ED101A] shrink-0" />
                <span>{C.footer.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#ED101A] shrink-0" />
                <span>{C.footer.phone}</span>
              </div>
            </div>
          </div>

          {/* Grouped Links Columns (8 columns on desktop) */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {C.footer.groups.map((group, idx) => (
              <div key={idx} className="flex flex-col gap-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-white/50">
                  {group.title}
                </h4>
                <ul className="flex flex-col gap-2.5 text-xs text-[#A1A1AA]">
                  {group.links.map((link) => (
                    <li key={link.id}>
                      <button
                        onClick={() => {
                          if (link.id.includes('coverage') || link.id.includes('cov-')) onOpenCoverage();
                          else if (link.id.includes('support') || link.id.includes('quote') || link.id.includes('contact')) onOpenSupport();
                          else if (link.id.includes('about')) onOpenAbout();
                          else if (link.id.includes('my-ikonectt')) onOpenMyIkonectt();
                          else if (link.id.includes('plans')) onScrollToSection('plans');
                          else if (link.id.includes('res-')) onScrollToSection('residential-editorial');
                          else if (link.id.includes('biz-')) onScrollToSection('business-editorial');
                        }}
                        className="hover:text-white transition-colors text-left"
                      >
                        {link.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

        </div>

        {/* Bottom Tier: Legal links & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <p className="text-center sm:text-left">
            {C.footer.copyright}
          </p>

          <div className="flex items-center gap-4 flex-wrap justify-center">
            {C.footer.legal.map((item) => (
              <button
                key={item.id}
                onClick={onOpenAbout}
                className="hover:text-white/70 transition-colors"
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={scrollToTop}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all ml-2"
              title="Back to top"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
