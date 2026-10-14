import React, { useState, useRef, useEffect } from 'react';
import { IkonecttLogo } from '../common/IkonecttLogo';
import {
  ChevronDown,
  Wifi,
  Gamepad2,
  Tv,
  Home,
  Briefcase,
  Building2,
  ShieldCheck,
  Server,
  PhoneCall,
  MapPin,
  ArrowRight,
  Menu,
  X,
  UserCheck,
  Zap,
} from 'lucide-react';
import { ASSETS } from '../../data/assets';

interface NavigationProps {
  currentTab: 'home' | 'residential' | 'business' | 'coverage';
  onNavigate: (tab: 'home' | 'residential' | 'business' | 'coverage') => void;
  onOpenMyIkonectt: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onNavigate,
  onOpenMyIkonectt,
}) => {
  const [activeMegaMenu, setActiveMegaMenu] = useState<'residential' | 'business' | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = (menu: 'residential' | 'business') => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveMegaMenu(menu);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveMegaMenu(null);
    }, 180);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#e0e0e0] shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      {/* Top Utility & Audience Bar */}
      <div className="border-b border-[#f0f0f0] bg-[#fafafc] text-xs text-[#6e6e73]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-semibold text-[#1d1d1f]">Audience:</span>
            <button
              onClick={() => onNavigate('residential')}
              className={`transition-colors font-medium ${
                currentTab === 'residential' || currentTab === 'home'
                  ? 'text-[#ED101A] font-semibold'
                  : 'hover:text-[#1d1d1f]'
              }`}
            >
              Residential & Homes
            </button>
            <span className="text-[#d2d2d7]">|</span>
            <button
              onClick={() => onNavigate('business')}
              className={`transition-colors font-medium ${
                currentTab === 'business'
                  ? 'text-[#ED101A] font-semibold'
                  : 'hover:text-[#1d1d1f]'
              }`}
            >
              Business & Enterprise
            </button>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-[#1d1d1f] font-medium">
              <PhoneCall className="w-3.5 h-3.5 text-[#ED101A]" />
              <span>Support Desk: +234 (0) 700 IKONECTT</span>
            </span>
            <span className="text-[#d2d2d7]">·</span>
            <button
              onClick={() => onNavigate('coverage')}
              className="text-[#6e6e73] hover:text-[#ED101A] transition-colors flex items-center gap-1 font-medium"
            >
              <MapPin className="w-3.5 h-3.5 text-[#ED101A]" />
              <span>Coverage Areas</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Navigation Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-18 flex items-center justify-between gap-8">
          {/* Zone 1: Ikonectt Wordmark */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center text-left focus:outline-none group"
            aria-label="Ikonectt Homepage"
          >
            <IkonecttLogo size="md" />
          </button>

          {/* Zone 2: Navigation Links with Mega Menu Triggers */}
          <nav className="hidden lg:flex items-center gap-8 h-full">
            {/* Residential Item */}
            <div
              className="relative h-full flex items-center"
              onMouseEnter={() => handleMouseEnter('residential')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => onNavigate('residential')}
                className={`flex items-center gap-1 text-[15px] font-medium tracking-tight transition-colors py-2 ${
                  currentTab === 'residential'
                    ? 'text-[#ED101A] font-semibold'
                    : 'text-[#1d1d1f] hover:text-[#ED101A]'
                }`}
              >
                Residential
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    activeMegaMenu === 'residential' ? 'rotate-180 text-[#ED101A]' : 'text-[#7a7a7a]'
                  }`}
                />
              </button>
            </div>

            {/* Business Item */}
            <div
              className="relative h-full flex items-center"
              onMouseEnter={() => handleMouseEnter('business')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => onNavigate('business')}
                className={`flex items-center gap-1 text-[15px] font-medium tracking-tight transition-colors py-2 ${
                  currentTab === 'business'
                    ? 'text-[#ED101A] font-semibold'
                    : 'text-[#1d1d1f] hover:text-[#ED101A]'
                }`}
              >
                Business
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    activeMegaMenu === 'business' ? 'rotate-180 text-[#ED101A]' : 'text-[#7a7a7a]'
                  }`}
                />
              </button>
            </div>

            {/* Coverage */}
            <button
              onClick={() => onNavigate('coverage')}
              className={`text-[15px] font-medium tracking-tight transition-colors py-2 ${
                currentTab === 'coverage'
                  ? 'text-[#ED101A] font-semibold'
                  : 'text-[#1d1d1f] hover:text-[#ED101A]'
              }`}
            >
              Coverage
            </button>

            {/* Support */}
            <button
              onClick={() => onNavigate('coverage')}
              className="text-[15px] font-medium tracking-tight text-[#1d1d1f] hover:text-[#ED101A] transition-colors py-2"
            >
              Support & Help
            </button>

            {/* About Us */}
            <button
              onClick={() => onNavigate('home')}
              className="text-[15px] font-medium tracking-tight text-[#1d1d1f] hover:text-[#ED101A] transition-colors py-2"
            >
              About Us
            </button>
          </nav>

          {/* Zone 3: Primary Action & Portal */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('coverage')}
              className="hidden sm:inline-flex items-center justify-center px-4 py-2.5 text-[14px] font-medium text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e8e8ed] rounded-full transition-colors"
            >
              Check Availability
            </button>

            <button
              onClick={onOpenMyIkonectt}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-[14px] font-semibold text-white bg-[#ED101A] hover:bg-[#D50913] active:bg-[#D50913] rounded-full shadow-sm hover:shadow transition-all duration-150 whitespace-nowrap"
            >
              <UserCheck className="w-4 h-4" />
              <span>My Ikonectt</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-[#1d1d1f] hover:text-[#ED101A] rounded-lg"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* RESIDENTIAL MEGA MENU */}
      {activeMegaMenu === 'residential' && (
        <div
          className="hidden lg:block absolute left-0 right-0 top-full bg-white border-b border-[#e0e0e0] shadow-xl animate-in fade-in slide-in-from-top-2 duration-150 z-40"
          onMouseEnter={() => handleMouseEnter('residential')}
          onMouseLeave={handleMouseLeave}
        >
          <div className="max-w-7xl mx-auto px-8 py-8 grid grid-cols-12 gap-8">
            {/* Col 1: Plans */}
            <div className="col-span-4 space-y-4 border-r border-[#f0f0f0] pr-6">
              <span className="text-xs uppercase tracking-wider font-bold text-[#ED101A]">
                Fibre Broadband Plans
              </span>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    onNavigate('residential');
                    setActiveMegaMenu(null);
                  }}
                  className="w-full text-left p-3 rounded-xl hover:bg-[#fafafc] transition-colors group block"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#1d1d1f] group-hover:text-[#ED101A] text-sm">
                      Connect Start (50 Mbps)
                    </span>
                    <span className="text-xs text-[#7a7a7a]">₦21,500/mo</span>
                  </div>
                  <p className="text-xs text-[#7a7a7a] mt-1">
                    Uncapped fibre for casual streaming and smart home essentials.
                  </p>
                </button>

                <button
                  onClick={() => {
                    onNavigate('residential');
                    setActiveMegaMenu(null);
                  }}
                  className="w-full text-left p-3 rounded-xl bg-[#fafafc] hover:bg-[#f2f2f5] transition-colors group block border border-[#e8e8ed]"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#1d1d1f] group-hover:text-[#ED101A] text-sm flex items-center gap-1.5">
                      Connect Home (100 Mbps)
                      <span className="text-[10px] font-bold text-white bg-[#ED101A] px-1.5 py-0.5 rounded-full">
                        POPULAR
                      </span>
                    </span>
                    <span className="text-xs font-semibold text-[#1d1d1f]">₦32,500/mo</span>
                  </div>
                  <p className="text-xs text-[#7a7a7a] mt-1">
                    Ultra-smooth 4K multi-screen entertainment and sub-15ms gaming.
                  </p>
                </button>

                <button
                  onClick={() => {
                    onNavigate('residential');
                    setActiveMegaMenu(null);
                  }}
                  className="w-full text-left p-3 rounded-xl hover:bg-[#fafafc] transition-colors group block"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#1d1d1f] group-hover:text-[#ED101A] text-sm">
                      Connect Plus (200 Mbps)
                    </span>
                    <span className="text-xs text-[#7a7a7a]">₦54,000/mo</span>
                  </div>
                  <p className="text-xs text-[#7a7a7a] mt-1">
                    Heavy multi-user downloading, remote work & cloud storage sync.
                  </p>
                </button>

                <button
                  onClick={() => {
                    onNavigate('residential');
                    setActiveMegaMenu(null);
                  }}
                  className="w-full text-left p-3 rounded-xl hover:bg-[#fafafc] transition-colors group block"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#1d1d1f] group-hover:text-[#ED101A] text-sm">
                      Connect Gigabit (500 Mbps)
                    </span>
                    <span className="text-xs text-[#7a7a7a]">₦98,000/mo</span>
                  </div>
                  <p className="text-xs text-[#7a7a7a] mt-1">
                    Nigeria’s premier pure residential optical gigabit pipeline.
                  </p>
                </button>
              </div>
            </div>

            {/* Col 2: Solutions */}
            <div className="col-span-4 space-y-4 border-r border-[#f0f0f0] pr-6">
              <span className="text-xs uppercase tracking-wider font-bold text-[#6e6e73]">
                Home Digital Lifestyle
              </span>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 p-2 rounded-lg hover:bg-[#fafafc] transition-colors">
                  <div className="p-2 bg-[#f5f5f7] rounded-lg text-[#ED101A] shrink-0 mt-0.5">
                    <Tv className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#1d1d1f]">4K & 8K Ultra HD Streaming</h4>
                    <p className="text-xs text-[#7a7a7a] mt-0.5">Zero buffering across Netflix, Prime, YouTube & live sports.</p>
                  </div>
                </li>

                <li className="flex items-start gap-3 p-2 rounded-lg hover:bg-[#fafafc] transition-colors">
                  <div className="p-2 bg-[#f5f5f7] rounded-lg text-[#ED101A] shrink-0 mt-0.5">
                    <Gamepad2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#1d1d1f]">Competitive Low-Latency Gaming</h4>
                    <p className="text-xs text-[#7a7a7a] mt-0.5">Sub-15ms local ping and direct peering with major gaming servers.</p>
                  </div>
                </li>

                <li className="flex items-start gap-3 p-2 rounded-lg hover:bg-[#fafafc] transition-colors">
                  <div className="p-2 bg-[#f5f5f7] rounded-lg text-[#ED101A] shrink-0 mt-0.5">
                    <Wifi className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#1d1d1f]">Whole-Home Wi-Fi 6 Mesh</h4>
                    <p className="text-xs text-[#7a7a7a] mt-0.5">Complete dead-zone elimination from the garden to master suite.</p>
                  </div>
                </li>

                <li className="flex items-start gap-3 p-2 rounded-lg hover:bg-[#fafafc] transition-colors">
                  <div className="p-2 bg-[#f5f5f7] rounded-lg text-[#ED101A] shrink-0 mt-0.5">
                    <Home className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#1d1d1f]">Connected Smart Homes & IoT</h4>
                    <p className="text-xs text-[#7a7a7a] mt-0.5">Dedicated bandwidth priority for smart cameras and security.</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Col 3: Visual Feature & Immediate Action */}
            <div className="col-span-4 flex flex-col justify-between bg-[#fafafc] p-5 rounded-2xl border border-[#e8e8ed]">
              <div>
                <div className="relative rounded-xl overflow-hidden aspect-[16/9] mb-4 bg-black/5">
                  <img
                    src={ASSETS.residentialLivingRoom}
                    alt="Nigerian family gaming with Ikonectt fibre"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                    <span className="text-xs font-semibold text-white">Experience Lagos's Pure Optical Grid</span>
                  </div>
                </div>
                <h4 className="text-sm font-bold text-[#1d1d1f]">Ready to connect your residence?</h4>
                <p className="text-xs text-[#6e6e73] mt-1 leading-relaxed">
                  Verify coverage on your street or estate in seconds. Free standard optical installation included.
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-[#e0e0e0] flex items-center justify-between">
                <button
                  onClick={() => {
                    onNavigate('coverage');
                    setActiveMegaMenu(null);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#ED101A] hover:text-[#D50913]"
                >
                  <span>Check Home Coverage</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    onNavigate('residential');
                    setActiveMegaMenu(null);
                  }}
                  className="text-xs text-[#7a7a7a] hover:text-[#1d1d1f]"
                >
                  View All Plans &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BUSINESS MEGA MENU */}
      {activeMegaMenu === 'business' && (
        <div
          className="hidden lg:block absolute left-0 right-0 top-full bg-white border-b border-[#e0e0e0] shadow-xl animate-in fade-in slide-in-from-top-2 duration-150 z-40"
          onMouseEnter={() => handleMouseEnter('business')}
          onMouseLeave={handleMouseLeave}
        >
          <div className="max-w-7xl mx-auto px-8 py-8 grid grid-cols-12 gap-8">
            {/* Col 1: B2B Tiers */}
            <div className="col-span-4 space-y-4 border-r border-[#f0f0f0] pr-6">
              <span className="text-xs uppercase tracking-wider font-bold text-[#ED101A]">
                Enterprise & SME Solutions
              </span>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    onNavigate('business');
                    setActiveMegaMenu(null);
                  }}
                  className="w-full text-left p-3 rounded-xl hover:bg-[#fafafc] transition-colors group block"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#1d1d1f] group-hover:text-[#ED101A] text-sm">
                      Business Essential (100 Mbps)
                    </span>
                    <span className="text-xs text-[#7a7a7a]">₦58,000/mo</span>
                  </div>
                  <p className="text-xs text-[#7a7a7a] mt-1">
                    Dedicated symmetric optical pipe for growing teams & cloud workflows.
                  </p>
                </button>

                <button
                  onClick={() => {
                    onNavigate('business');
                    setActiveMegaMenu(null);
                  }}
                  className="w-full text-left p-3 rounded-xl bg-[#fafafc] hover:bg-[#f2f2f5] transition-colors group block border border-[#e8e8ed]"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#1d1d1f] group-hover:text-[#ED101A] text-sm flex items-center gap-1.5">
                      Business Pro (250 Mbps)
                      <span className="text-[10px] font-bold text-white bg-[#ED101A] px-1.5 py-0.5 rounded-full">
                        RECOMMENDED
                      </span>
                    </span>
                    <span className="text-xs font-semibold text-[#1d1d1f]">₦125,000/mo</span>
                  </div>
                  <p className="text-xs text-[#7a7a7a] mt-1">
                    99.9% SLA uptime, 2 Static IPs & 4-hour priority resolution.
                  </p>
                </button>

                <button
                  onClick={() => {
                    onNavigate('business');
                    setActiveMegaMenu(null);
                  }}
                  className="w-full text-left p-3 rounded-xl hover:bg-[#fafafc] transition-colors group block"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#1d1d1f] group-hover:text-[#ED101A] text-sm">
                      Dedicated Leased Line (1 Gbps)
                    </span>
                    <span className="text-xs text-[#7a7a7a]">Tailored SLA</span>
                  </div>
                  <p className="text-xs text-[#7a7a7a] mt-1">
                    Private point-to-point dark fiber with direct carrier peering.
                  </p>
                </button>
              </div>
            </div>

            {/* Col 2: Enterprise Capabilities */}
            <div className="col-span-4 space-y-4 border-r border-[#f0f0f0] pr-6">
              <span className="text-xs uppercase tracking-wider font-bold text-[#6e6e73]">
                Infrastructure & Guarantees
              </span>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 p-2 rounded-lg hover:bg-[#fafafc] transition-colors">
                  <div className="p-2 bg-[#f5f5f7] rounded-lg text-[#ED101A] shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#1d1d1f]">99.9% SLA & Uptime Guarantee</h4>
                    <p className="text-xs text-[#7a7a7a] mt-0.5">Legally backed uptime service agreement with automated credits.</p>
                  </div>
                </li>

                <li className="flex items-start gap-3 p-2 rounded-lg hover:bg-[#fafafc] transition-colors">
                  <div className="p-2 bg-[#f5f5f7] rounded-lg text-[#ED101A] shrink-0 mt-0.5">
                    <Server className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#1d1d1f]">Static IPv4 & Cloud Direct Peering</h4>
                    <p className="text-xs text-[#7a7a7a] mt-0.5">Optimized routing to AWS, Azure, Microsoft 365, and local IXPs.</p>
                  </div>
                </li>

                <li className="flex items-start gap-3 p-2 rounded-lg hover:bg-[#fafafc] transition-colors">
                  <div className="p-2 bg-[#f5f5f7] rounded-lg text-[#ED101A] shrink-0 mt-0.5">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#1d1d1f]">Multi-Branch & SD-WAN Interconnect</h4>
                    <p className="text-xs text-[#7a7a7a] mt-0.5">Unified secure corporate networking across Lagos, Abuja & Port Harcourt.</p>
                  </div>
                </li>

                <li className="flex items-start gap-3 p-2 rounded-lg hover:bg-[#fafafc] transition-colors">
                  <div className="p-2 bg-[#f5f5f7] rounded-lg text-[#ED101A] shrink-0 mt-0.5">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#1d1d1f]">24/7 Dedicated Network Operations Desk</h4>
                    <p className="text-xs text-[#7a7a7a] mt-0.5">Direct phone line to senior NOC engineers with no queue delays.</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Col 3: Visual Showcase */}
            <div className="col-span-4 flex flex-col justify-between bg-[#fafafc] p-5 rounded-2xl border border-[#e8e8ed]">
              <div>
                <div className="relative rounded-xl overflow-hidden aspect-[16/9] mb-4 bg-black/5">
                  <img
                    src={ASSETS.businessWorkspace}
                    alt="Nigerian tech workspace powered by Ikonectt"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                    <span className="text-xs font-semibold text-white">Powering Nigeria’s Leading Enterprises</span>
                  </div>
                </div>
                <h4 className="text-sm font-bold text-[#1d1d1f]">Equip your workforce with zero downtime</h4>
                <p className="text-xs text-[#6e6e73] mt-1 leading-relaxed">
                  Custom quotes, dedicated dark fiber feasibility, and tailored multi-branch interconnectivity.
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-[#e0e0e0] flex items-center justify-between">
                <button
                  onClick={() => {
                    onNavigate('business');
                    setActiveMegaMenu(null);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#ED101A] hover:text-[#D50913]"
                >
                  <span>Explore Business Solutions</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    onNavigate('business');
                    setActiveMegaMenu(null);
                  }}
                  className="text-xs text-[#7a7a7a] hover:text-[#1d1d1f]"
                >
                  Request B2B Quote &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE DRAWER */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#e0e0e0] px-4 py-6 space-y-4 shadow-lg animate-in fade-in duration-200">
          <div className="grid grid-cols-2 gap-2 pb-4 border-b border-[#f0f0f0]">
            <button
              onClick={() => {
                onNavigate('residential');
                setIsMobileMenuOpen(false);
              }}
              className={`py-2 text-center text-sm font-semibold rounded-lg ${
                currentTab === 'residential' || currentTab === 'home'
                  ? 'bg-[#ED101A] text-white'
                  : 'bg-[#f5f5f7] text-[#1d1d1f]'
              }`}
            >
              Residential
            </button>
            <button
              onClick={() => {
                onNavigate('business');
                setIsMobileMenuOpen(false);
              }}
              className={`py-2 text-center text-sm font-semibold rounded-lg ${
                currentTab === 'business'
                  ? 'bg-[#ED101A] text-white'
                  : 'bg-[#f5f5f7] text-[#1d1d1f]'
              }`}
            >
              Business
            </button>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => {
                onNavigate('home');
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 px-3 text-[15px] font-medium text-[#1d1d1f] hover:bg-[#fafafc] rounded-lg"
            >
              Home
            </button>
            <button
              onClick={() => {
                onNavigate('residential');
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 px-3 text-[15px] font-medium text-[#1d1d1f] hover:bg-[#fafafc] rounded-lg"
            >
              Residential Fibre Plans
            </button>
            <button
              onClick={() => {
                onNavigate('business');
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 px-3 text-[15px] font-medium text-[#1d1d1f] hover:bg-[#fafafc] rounded-lg"
            >
              Business Solutions & SLA
            </button>
            <button
              onClick={() => {
                onNavigate('coverage');
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 px-3 text-[15px] font-medium text-[#1d1d1f] hover:bg-[#fafafc] rounded-lg"
            >
              Coverage Checker
            </button>
          </div>

          <div className="pt-4 border-t border-[#f0f0f0] space-y-2">
            <button
              onClick={() => {
                onOpenMyIkonectt();
                setIsMobileMenuOpen(false);
              }}
              className="w-full py-3 text-center text-sm font-bold text-white bg-[#ED101A] rounded-full"
            >
              My Ikonectt Portal
            </button>
            <p className="text-center text-xs text-[#7a7a7a] pt-2">
              Customer Support: +234 (0) 700 IKONECTT
            </p>
          </div>
        </div>
      )}
    </header>
  );
};
