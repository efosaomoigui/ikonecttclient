import React, { useState, useEffect, useRef } from 'react';
import { PageId } from '../../types';
import { BrandLogo } from '../ui/BrandLogo';
import {
  ChevronDown,
  Menu,
  X,
  User,
  ArrowRight,
  Wifi,
  Building2,
  MapPin,
  LifeBuoy,
  Info,
  ShieldCheck,
  Server,
  Zap,
  Globe,
  Radio,
  Headphones,
  Search,
  Phone,
} from 'lucide-react';

interface NavbarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  onOpenMyIkonectt: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  onOpenMyIkonectt,
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  // Close mega menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (page: PageId) => {
    onNavigate(page);
    setActiveMenu(null);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header
      ref={navRef}
      className="fixed top-0 left-0 w-full z-50 bg-[#ffffff]/98 backdrop-blur-md border-b border-[#f0f0f0]"
    >
      {/* Top Audience Bar matching Image 1.png */}
      <div className="w-full bg-[#111215] border-b border-[#22242a] hidden sm:block">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-9 flex items-center justify-between text-[11px] font-medium text-gray-400">
          <div className="flex items-center gap-1.5 p-0.5 bg-[#1b1d22] rounded-md border border-[#2a2d35]">
            <button
              onClick={() => handleNavClick('residential')}
              className={`px-3 py-1 rounded text-[11px] font-bold tracking-wider transition-colors uppercase ${
                currentPage === 'residential' || currentPage === 'home'
                  ? 'bg-white text-[#111215] shadow-xs'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Residential
            </button>
            <button
              onClick={() => handleNavClick('business')}
              className={`px-3 py-1 rounded text-[11px] font-bold tracking-wider transition-colors uppercase ${
                currentPage === 'business'
                  ? 'bg-white text-[#111215] shadow-xs'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Business
            </button>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-gray-300">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#00D084]" />
              Network Operational
            </span>
            <span className="text-gray-600">·</span>
            <a
              href="tel:+2347001234567"
              className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors"
            >
              <Phone className="w-3 h-3 text-[#ED101A]" />
              <span>Nigeria • Support: +234 700 123 4567</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="h-16 max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between gap-4 relative">
        {/* Left Zone: Brand Logo */}
        <div className="flex items-center shrink-0 min-w-[170px] xl:min-w-[210px]">
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ED101A] rounded-md transition-opacity hover:opacity-95 overflow-visible"
            aria-label="Ikonectt Home"
          >
            <BrandLogo className="h-10 sm:h-11 md:h-12" />
          </button>
        </div>

        {/* Center Zone: Centralized Navigation Menu across the entire topnav */}
        <nav className="hidden lg:flex items-center justify-center gap-1 xl:gap-4 text-[14px] flex-1">
            {/* Residential Mega Menu */}
            <div
              className="relative"
              onMouseEnter={() => setActiveMenu('residential')}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <button
                type="button"
                onClick={() => handleNavClick('residential')}
                className={`flex items-center gap-1 px-3 py-2 rounded-md transition-colors ${
                  currentPage === 'residential'
                    ? 'text-[#ED101A] font-semibold'
                    : 'text-[#1d1d1f] hover:text-[#ED101A]'
                }`}
              >
                <span>Residential</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    activeMenu === 'residential' ? 'rotate-180 text-[#ED101A]' : 'text-[#7a7a7a]'
                  }`}
                />
              </button>

              {activeMenu === 'residential' && (
                <div className="absolute left-0 top-full pt-1.5 w-[540px] transition-all">
                  <div className="bg-[#ffffff] rounded-2xl border border-[#f0f0f0] shadow-[0_16px_36px_rgba(0,0,0,0.06)] p-6 grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-[#7a7a7a] px-2 mb-2">
                        Home Optical Fiber
                      </div>
                      <button
                        onClick={() => handleNavClick('residential')}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-[#fafafc] group transition-colors flex items-start gap-3"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#fafafc] text-[#ED101A] flex items-center justify-center shrink-0 group-hover:bg-[#ED101A] group-hover:text-white transition-colors">
                          <Wifi className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-[13px] text-[#1d1d1f] group-hover:text-[#ED101A] transition-colors">
                            Residential Internet
                          </div>
                          <div className="text-[12px] text-[#7a7a7a] leading-snug">
                            Pure optical glass fiber straight to your living room.
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => handleNavClick('residential')}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-[#fafafc] group transition-colors flex items-start gap-3"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#fafafc] text-[#1d1d1f] flex items-center justify-center shrink-0 group-hover:bg-[#ED101A] group-hover:text-white transition-colors">
                          <Zap className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-[13px] text-[#1d1d1f] group-hover:text-[#ED101A] transition-colors">
                            Internet Plans
                          </div>
                          <div className="text-[12px] text-[#7a7a7a] leading-snug">
                            50 Mbps Lite to 500 Mbps Ultra. No data caps.
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => handleNavClick('coverage')}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-[#fafafc] group transition-colors flex items-start gap-3"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#fafafc] text-[#1d1d1f] flex items-center justify-center shrink-0 group-hover:bg-[#ED101A] group-hover:text-white transition-colors">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-[13px] text-[#1d1d1f] group-hover:text-[#ED101A] transition-colors">
                            Check Estate Coverage
                          </div>
                          <div className="text-[12px] text-[#7a7a7a] leading-snug">
                            Instant feasibility audit for your address.
                          </div>
                        </div>
                      </button>
                    </div>

                    <div className="bg-[#f5f5f7] rounded-xl p-5 flex flex-col justify-between border border-[#f0f0f0]">
                      <div>
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white text-[#ED101A] border border-[#f0f0f0] mb-2">
                          Hardware Included
                        </span>
                        <h4 className="font-bold text-[14px] text-[#1d1d1f] mb-1">
                          Dual-Band Wi-Fi 6 Gateway
                        </h4>
                        <p className="text-[12px] text-[#7a7a7a] leading-relaxed">
                          Included with every residential plan. Handles 30+ smart home appliances without packet drops.
                        </p>
                      </div>
                      <button
                        onClick={() => handleNavClick('residential')}
                        className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#ED101A] hover:text-[#D50913] pt-3"
                      >
                        <span>Explore Residential Plans</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Business Mega Menu */}
            <div
              className="relative"
              onMouseEnter={() => setActiveMenu('business')}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <button
                type="button"
                onClick={() => handleNavClick('business')}
                className={`flex items-center gap-1 px-3 py-2 rounded-md transition-colors ${
                  currentPage === 'business'
                    ? 'text-[#ED101A] font-semibold'
                    : 'text-[#1d1d1f] hover:text-[#ED101A]'
                }`}
              >
                <span>Business</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    activeMenu === 'business' ? 'rotate-180 text-[#ED101A]' : 'text-[#7a7a7a]'
                  }`}
                />
              </button>

              {activeMenu === 'business' && (
                <div className="absolute left-0 top-full pt-1.5 w-[620px] transition-all">
                  <div className="bg-[#ffffff] rounded-2xl border border-[#f0f0f0] shadow-[0_16px_36px_rgba(0,0,0,0.06)] p-6 grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-[#7a7a7a] px-2 mb-2">
                        Enterprise Solutions
                      </div>
                      <button
                        onClick={() => handleNavClick('business')}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-[#fafafc] group transition-colors flex items-start gap-3"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#272729] text-white flex items-center justify-center shrink-0 group-hover:bg-[#ED101A] transition-colors">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-[13px] text-[#1d1d1f] group-hover:text-[#ED101A] transition-colors">
                            Dedicated Internet (DIA)
                          </div>
                          <div className="text-[12px] text-[#7a7a7a] leading-snug">
                            1:1 uncontended symmetrical spectrum with 99.99% SLA.
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => handleNavClick('business')}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-[#fafafc] group transition-colors flex items-start gap-3"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#fafafc] text-[#1d1d1f] flex items-center justify-center shrink-0 group-hover:bg-[#ED101A] group-hover:text-white transition-colors">
                          <Radio className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-[13px] text-[#1d1d1f] group-hover:text-[#ED101A] transition-colors">
                            Business Fibre Pro (SMEs)
                          </div>
                          <div className="text-[12px] text-[#7a7a7a] leading-snug">
                            100-300 Mbps broadband for fast-growing studios.
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => handleNavClick('business')}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-[#fafafc] group transition-colors flex items-start gap-3"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#fafafc] text-[#1d1d1f] flex items-center justify-center shrink-0 group-hover:bg-[#ED101A] group-hover:text-white transition-colors">
                          <Globe className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-[13px] text-[#1d1d1f] group-hover:text-[#ED101A] transition-colors">
                            Metro Ethernet (P2P)
                          </div>
                          <div className="text-[12px] text-[#7a7a7a] leading-snug">
                            Layer-2 clear channels between Lagos & Abuja branches.
                          </div>
                        </div>
                      </button>
                    </div>

                    <div className="bg-[#272729] text-white rounded-xl p-5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-2 h-2 rounded-full bg-[#008653]" />
                          <span className="text-[11px] font-mono-stat uppercase tracking-wider text-[#cccccc]">
                            Core SLA Guaranteed
                          </span>
                        </div>
                        <h4 className="font-bold text-[15px] text-white mb-2">
                          Self-Healing Optical Rings
                        </h4>
                        <p className="text-[12px] text-[#cccccc] leading-relaxed mb-4">
                          Sub-50ms hitless failover across Victoria Island, Ikoyi, Marina, and Ikeja core nodes.
                        </p>
                      </div>
                      <button
                        onClick={() => handleNavClick('business')}
                        className="inline-flex items-center justify-center gap-2 bg-[#ED101A] text-white py-2.5 px-4 rounded-full text-[12px] font-semibold hover:bg-[#D50913] transition-colors"
                      >
                        <span>Request SLA Proposal</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Coverage Link */}
            <button
              type="button"
              onClick={() => handleNavClick('coverage')}
              className={`px-3 py-2 rounded-md transition-colors ${
                currentPage === 'coverage'
                  ? 'text-[#ED101A] font-semibold'
                  : 'text-[#1d1d1f] hover:text-[#ED101A]'
              }`}
            >
              Coverage
            </button>

            {/* Support Link */}
            <button
              type="button"
              onClick={() => handleNavClick('support')}
              className={`px-3 py-2 rounded-md transition-colors ${
                currentPage === 'support'
                  ? 'text-[#ED101A] font-semibold'
                  : 'text-[#1d1d1f] hover:text-[#ED101A]'
              }`}
            >
              Support
            </button>

            {/* About Us Link (per design.md) */}
            <button
              type="button"
              onClick={() => handleNavClick('about')}
              className={`px-3 py-2 rounded-md transition-colors ${
                currentPage === 'about'
                  ? 'text-[#ED101A] font-semibold'
                  : 'text-[#1d1d1f] hover:text-[#ED101A]'
              }`}
            >
              About Us
            </button>
          </nav>

        {/* Action Controls matching Image 1.png */}
        <div className="flex items-center justify-end gap-2 sm:gap-4 shrink-0 min-w-[170px] xl:min-w-[210px]">
          <button
            type="button"
            onClick={() => handleNavClick('coverage')}
            className="p-2 text-gray-700 hover:text-[#ED101A] transition-colors rounded-full hover:bg-gray-100"
            aria-label="Search services"
          >
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800 hover:text-[#ED101A]" />
          </button>

          {/* Primary CTA per Image 1.png: Red pill "My Ikonectt" */}
          <button
            type="button"
            onClick={onOpenMyIkonectt}
            className="inline-flex items-center justify-center bg-[#ED101A] hover:bg-[#D50913] text-white px-5 py-2 sm:py-2.5 rounded-full text-[13px] font-semibold transition-all hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-[#ED101A] focus:ring-offset-2 cursor-pointer shadow-none"
          >
            My Ikonectt
          </button>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-[#1d1d1f] hover:bg-gray-100 focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#f0f0f0] bg-white px-6 py-6 space-y-4 max-h-[85vh] overflow-y-auto">
          <div className="space-y-1">
            <button
              onClick={() => handleNavClick('home')}
              className="w-full text-left py-2.5 px-3 rounded-lg font-medium text-[15px] hover:bg-gray-50 flex items-center justify-between"
            >
              <span>Home</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </button>
            <button
              onClick={() => handleNavClick('residential')}
              className="w-full text-left py-2.5 px-3 rounded-lg font-medium text-[15px] hover:bg-gray-50 flex items-center justify-between"
            >
              <span>Residential Internet</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </button>
            <button
              onClick={() => handleNavClick('business')}
              className="w-full text-left py-2.5 px-3 rounded-lg font-medium text-[15px] hover:bg-gray-50 flex items-center justify-between"
            >
              <span>Business & Enterprise</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </button>
            <button
              onClick={() => handleNavClick('coverage')}
              className="w-full text-left py-2.5 px-3 rounded-lg font-medium text-[15px] text-[#ED101A] bg-[#f5f5f7] flex items-center justify-between"
            >
              <span className="font-semibold">Check Coverage</span>
              <ArrowRight className="w-4 h-4 text-[#ED101A]" />
            </button>
            <button
              onClick={() => handleNavClick('support')}
              className="w-full text-left py-2.5 px-3 rounded-lg font-medium text-[15px] hover:bg-gray-50 flex items-center justify-between"
            >
              <span>Support</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </button>
            <button
              onClick={() => handleNavClick('about')}
              className="w-full text-left py-2.5 px-3 rounded-lg font-medium text-[15px] hover:bg-gray-50 flex items-center justify-between"
            >
              <span>About Us</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          <div className="pt-4 border-t border-[#f0f0f0] space-y-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenMyIkonectt();
              }}
              className="w-full py-3 rounded-full border border-gray-300 text-[14px] font-semibold text-[#1d1d1f] flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4 text-[#ED101A]" />
              <span>Sign in to My Ikonectt</span>
            </button>

            <button
              onClick={() => handleNavClick('coverage')}
              className="w-full py-3 rounded-full bg-[#ED101A] text-white text-[14px] font-semibold flex items-center justify-center gap-2"
            >
              <span>Check Fiber Coverage</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
