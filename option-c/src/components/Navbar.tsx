import React, { useState, useEffect, useRef } from 'react';
import { OPTION_03_CONTENT as C } from '../data/content';
import { ChevronDown, ArrowRight, Menu, X, ShieldCheck, MapPin, Phone, HelpCircle } from 'lucide-react';

interface NavbarProps {
  onOpenCoverage: () => void;
  onOpenMyIkonectt: () => void;
  onOpenSupport: () => void;
  onOpenAbout: () => void;
  onScrollToSection: (id: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCoverage,
  onOpenMyIkonectt,
  onOpenSupport,
  onOpenAbout,
  onScrollToSection,
}) => {
  const [activeAudience, setActiveAudience] = useState<'residential' | 'business'>('residential');
  const [activeMegaMenu, setActiveMegaMenu] = useState<'residential' | 'business' | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileExpandedSection, setMobileExpandedSection] = useState<'residential' | 'business' | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const navRef = useRef<HTMLElement>(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mega menu on outside click or ESC key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveMegaMenu(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveMegaMenu(null);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const toggleMegaMenu = (type: 'residential' | 'business') => {
    setActiveMegaMenu(activeMegaMenu === type ? null : type);
  };

  const handleAudienceSwitch = (type: 'residential' | 'business') => {
    setActiveAudience(type);
    if (type === 'residential') {
      onScrollToSection('residential-editorial');
    } else {
      onScrollToSection('business-editorial');
    }
  };

  return (
    <header
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-[#090909]/95 backdrop-blur-md shadow-2xl border-b border-white/10' : 'bg-[#090909]/80 backdrop-blur-sm border-b border-white/5'
      }`}
    >
      {/* 1. DARK UTILITY BAR FOR AUDIENCE SWITCHING */}
      <div className="bg-[#050505] border-b border-white/5 text-xs text-[#A1A1AA] py-1.5">
        <div className="container-custom flex items-center justify-between">
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-[11px] uppercase tracking-wider text-white/40 mr-1 sm:mr-2">Ikonectt Portal:</span>
            <button
              onClick={() => handleAudienceSwitch('residential')}
              className={`px-2.5 py-0.5 rounded-full font-medium transition-colors ${
                activeAudience === 'residential' ? 'bg-white/15 text-white font-semibold' : 'hover:text-white'
              }`}
            >
              Residential
            </button>
            <span className="text-white/20">|</span>
            <button
              onClick={() => handleAudienceSwitch('business')}
              className={`px-2.5 py-0.5 rounded-full font-medium transition-colors ${
                activeAudience === 'business' ? 'bg-white/15 text-white font-semibold' : 'hover:text-white'
              }`}
            >
              Business & Enterprise
            </button>
          </div>

          <div className="hidden md:flex items-center gap-4 text-[12px]">
            <button onClick={onOpenCoverage} className="flex items-center gap-1 hover:text-white transition-colors">
              <MapPin className="w-3.5 h-3.5 text-[#ED101A]" />
              <span>Coverage Availability</span>
            </button>
            <button onClick={onOpenSupport} className="flex items-center gap-1 hover:text-white transition-colors">
              <Phone className="w-3.5 h-3.5 text-[#A1A1AA]" />
              <span>24/7 Support Hotline</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER */}
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo */}
          <div className="flex items-center gap-8">
            <a href="#" className="flex items-center focus:outline-none focus:ring-2 focus:ring-[#ED101A] rounded-lg">
              <img
                src="./ikonectt-logo-white.png"
                alt="Ikonectt"
                className="h-10 sm:h-11 md:h-12 w-auto object-contain transition-transform hover:opacity-95"
              />
            </a>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {/* Residential Mega Menu Trigger */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggleMegaMenu('residential')}
                  onMouseEnter={() => setActiveMegaMenu('residential')}
                  aria-expanded={activeMegaMenu === 'residential'}
                  className={`px-3.5 py-2 rounded-lg text-[15px] font-medium transition-colors flex items-center gap-1.5 ${
                    activeMegaMenu === 'residential' ? 'text-white bg-white/10' : 'text-[#D4D4D8] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>Residential</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeMegaMenu === 'residential' ? 'rotate-180 text-[#ED101A]' : 'opacity-60'}`} />
                </button>
              </div>

              {/* Business Mega Menu Trigger */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggleMegaMenu('business')}
                  onMouseEnter={() => setActiveMegaMenu('business')}
                  aria-expanded={activeMegaMenu === 'business'}
                  className={`px-3.5 py-2 rounded-lg text-[15px] font-medium transition-colors flex items-center gap-1.5 ${
                    activeMegaMenu === 'business' ? 'text-white bg-white/10' : 'text-[#D4D4D8] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>Business</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeMegaMenu === 'business' ? 'rotate-180 text-[#ED101A]' : 'opacity-60'}`} />
                </button>
              </div>

              {/* Standard Links */}
              <button
                onClick={onOpenCoverage}
                className="px-3.5 py-2 rounded-lg text-[15px] font-medium text-[#D4D4D8] hover:text-white hover:bg-white/5 transition-colors"
              >
                Coverage
              </button>
              <button
                onClick={onOpenSupport}
                className="px-3.5 py-2 rounded-lg text-[15px] font-medium text-[#D4D4D8] hover:text-white hover:bg-white/5 transition-colors"
              >
                Support
              </button>
              <button
                onClick={onOpenAbout}
                className="px-3.5 py-2 rounded-lg text-[15px] font-medium text-[#D4D4D8] hover:text-white hover:bg-white/5 transition-colors"
              >
                About Us
              </button>
            </nav>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* My Ikonectt Portal Action */}
            <button
              onClick={onOpenMyIkonectt}
              className="btn-pill-primary text-xs sm:text-sm font-semibold !px-4 sm:!px-5 !py-2 sm:!py-2.5 shadow-lg shadow-[#ED101A]/20"
            >
              <span>My Ikonectt</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-white/5 text-white hover:bg-white/10 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* 3. DESKTOP ACCESSIBLE MEGA MENUS */}
      {activeMegaMenu && (
        <div
          onMouseLeave={() => setActiveMegaMenu(null)}
          className="hidden lg:block absolute top-full left-0 right-0 bg-[#0E0E10] border-b border-white/10 shadow-2xl transition-all duration-200 animate-in fade-in slide-in-from-top-2"
        >
          <div className="container-custom py-8">
            <div className="grid grid-cols-12 gap-8 items-start">
              
              {/* Left 8 columns: Multi-column Navigation links */}
              <div className="col-span-8 grid grid-cols-2 gap-8 border-r border-white/10 pr-8">
                {C.navigation.megaMenus[activeMegaMenu].columns.map((col, idx) => (
                  <div key={idx} className="flex flex-col gap-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-1">
                      {col.heading}
                    </h3>
                    <div className="flex flex-col gap-2">
                      {col.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveMegaMenu(null);
                            if (item.id.includes('coverage')) onOpenCoverage();
                            else if (item.id.includes('plans')) onScrollToSection('plans');
                            else if (item.id.includes('quote')) onOpenSupport();
                            else if (item.id.includes('installation')) onOpenCoverage();
                            else onScrollToSection(activeMegaMenu === 'residential' ? 'residential-editorial' : 'business-editorial');
                          }}
                          className="group text-left p-2.5 rounded-xl hover:bg-white/5 transition-all"
                        >
                          <div className="text-sm font-semibold text-white group-hover:text-[#ED101A] transition-colors flex items-center justify-between">
                            <span>{item.title}</span>
                            <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#ED101A]" />
                          </div>
                          <p className="text-xs text-[#A1A1AA] mt-0.5 line-clamp-1">
                            {item.description}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Right 4 columns: Editorial CTA Card Panel */}
              <div className="col-span-4 bg-gradient-to-br from-[#18181B] to-[#121214] border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#ED101A]/20 text-[#FF616A] text-[11px] font-semibold uppercase tracking-wider mb-3">
                    {C.navigation.megaMenus[activeMegaMenu].ctaPanel.badge}
                  </span>
                  <h4 className="text-base font-bold text-white mb-2 leading-snug">
                    {C.navigation.megaMenus[activeMegaMenu].ctaPanel.title}
                  </h4>
                  <p className="text-xs text-[#A1A1AA] leading-relaxed mb-6">
                    {C.navigation.megaMenus[activeMegaMenu].ctaPanel.description}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setActiveMegaMenu(null);
                    if (C.navigation.megaMenus[activeMegaMenu].ctaPanel.actionId === 'coverage') {
                      onOpenCoverage();
                    } else {
                      onOpenSupport();
                    }
                  }}
                  className="w-full btn-pill-secondary text-xs !py-2.5 flex items-center justify-center gap-2 group hover:!border-[#ED101A]/50"
                >
                  <span>{C.navigation.megaMenus[activeMegaMenu].ctaPanel.buttonText}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#ED101A] group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 4. MOBILE SLIDE-DOWN DRAWER */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#090909] border-b border-white/10 max-h-[85vh] overflow-y-auto px-6 py-6 animate-in slide-in-from-top-4">
          <div className="flex flex-col gap-6">
            
            {/* Audience Switcher */}
            <div className="flex rounded-lg bg-white/5 p-1">
              <button
                onClick={() => {
                  setActiveAudience('residential');
                  setMobileExpandedSection('residential');
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
                  activeAudience === 'residential' ? 'bg-[#ED101A] text-white' : 'text-white/60'
                }`}
              >
                Residential
              </button>
              <button
                onClick={() => {
                  setActiveAudience('business');
                  setMobileExpandedSection('business');
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
                  activeAudience === 'business' ? 'bg-[#ED101A] text-white' : 'text-white/60'
                }`}
              >
                Business
              </button>
            </div>

            {/* Navigation Accordions */}
            <div className="flex flex-col gap-2">
              {/* Residential */}
              <div className="border border-white/5 rounded-xl overflow-hidden">
                <button
                  onClick={() => setMobileExpandedSection(mobileExpandedSection === 'residential' ? null : 'residential')}
                  className="w-full flex items-center justify-between p-3.5 text-sm font-semibold text-white bg-white/5 text-left"
                >
                  <span>Residential Services</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${mobileExpandedSection === 'residential' ? 'rotate-180 text-[#ED101A]' : ''}`} />
                </button>
                {mobileExpandedSection === 'residential' && (
                  <div className="p-3 bg-black/40 flex flex-col gap-2 text-xs">
                    <button onClick={() => { setIsMobileMenuOpen(false); onScrollToSection('residential-editorial'); }} className="p-2 text-left text-white/80 hover:text-white">Overview</button>
                    <button onClick={() => { setIsMobileMenuOpen(false); onScrollToSection('plans'); }} className="p-2 text-left text-white/80 hover:text-white">Residential Plans</button>
                    <button onClick={() => { setIsMobileMenuOpen(false); onOpenCoverage(); }} className="p-2 text-left text-[#ED101A] font-semibold">Check Coverage</button>
                  </div>
                )}
              </div>

              {/* Business */}
              <div className="border border-white/5 rounded-xl overflow-hidden">
                <button
                  onClick={() => setMobileExpandedSection(mobileExpandedSection === 'business' ? null : 'business')}
                  className="w-full flex items-center justify-between p-3.5 text-sm font-semibold text-white bg-white/5 text-left"
                >
                  <span>Business Solutions</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${mobileExpandedSection === 'business' ? 'rotate-180 text-[#ED101A]' : ''}`} />
                </button>
                {mobileExpandedSection === 'business' && (
                  <div className="p-3 bg-black/40 flex flex-col gap-2 text-xs">
                    <button onClick={() => { setIsMobileMenuOpen(false); onScrollToSection('business-editorial'); }} className="p-2 text-left text-white/80 hover:text-white">Enterprise Overview</button>
                    <button onClick={() => { setIsMobileMenuOpen(false); onScrollToSection('plans'); }} className="p-2 text-left text-white/80 hover:text-white">Business Plans</button>
                    <button onClick={() => { setIsMobileMenuOpen(false); onOpenSupport(); }} className="p-2 text-left text-[#ED101A] font-semibold">Request a Quote</button>
                  </div>
                )}
              </div>

              {/* Simple links */}
              <button
                onClick={() => { setIsMobileMenuOpen(false); onOpenCoverage(); }}
                className="p-3.5 text-left text-sm font-medium text-white/90 hover:text-white rounded-xl hover:bg-white/5"
              >
                Coverage Checker
              </button>
              <button
                onClick={() => { setIsMobileMenuOpen(false); onOpenSupport(); }}
                className="p-3.5 text-left text-sm font-medium text-white/90 hover:text-white rounded-xl hover:bg-white/5"
              >
                Support Center
              </button>
              <button
                onClick={() => { setIsMobileMenuOpen(false); onOpenAbout(); }}
                className="p-3.5 text-left text-sm font-medium text-white/90 hover:text-white rounded-xl hover:bg-white/5"
              >
                About Intelivision & Ikonectt
              </button>
            </div>

            {/* Mobile Actions */}
            <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
              <button
                onClick={() => { setIsMobileMenuOpen(false); onOpenMyIkonectt(); }}
                className="w-full btn-pill-primary text-sm font-semibold !py-3"
              >
                My Ikonectt Login
              </button>
            </div>

          </div>
        </div>
      )}
    </header>
  );
};
