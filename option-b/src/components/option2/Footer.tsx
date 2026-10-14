import React from 'react';
import { IkonecttLogo } from '../common/IkonecttLogo';
import { Phone, Mail, MapPin, Globe, Shield, ArrowUpRight } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: 'home' | 'residential' | 'business' | 'coverage') => void;
  onOpenMyIkonectt: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenMyIkonectt }) => {
  return (
    <footer className="bg-[#18181b] text-[#cccccc] pt-16 pb-12 border-t border-[#272729]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Footer Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12 border-b border-[#2a2a2c] items-center">
          <div className="lg:col-span-7">
            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Ready for gigabit-speed uninterrupted connectivity?
            </h3>
            <p className="text-sm text-[#9e9e9e] mt-2 max-w-xl">
              Experience Nigeria’s premier 100% pure optical fibre network for high-demand homes and mission-critical businesses.
            </p>
          </div>
          <div className="lg:col-span-5 flex flex-wrap gap-3 lg:justify-end">
            <button
              onClick={() => onNavigate('coverage')}
              className="px-6 py-3 text-sm font-semibold text-[#18181b] bg-white hover:bg-[#f0f0f0] rounded-full transition-colors flex items-center gap-1.5"
            >
              <span>Check Street Coverage</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenMyIkonectt}
              className="px-6 py-3 text-sm font-semibold text-white bg-[#ED101A] hover:bg-[#D50913] rounded-full transition-colors"
            >
              My Ikonectt Portal
            </button>
          </div>
        </div>

        {/* Main Column Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 py-12 text-xs">
          {/* Col 1: Brand & Contact Info */}
          <div className="col-span-2 space-y-4">
            <IkonecttLogo variant="light" size="md" />
            <p className="text-[#a0a0a5] leading-relaxed max-w-sm pt-1">
              Ikonectt is a next-generation telecommunications operator delivering carrier-grade, unthrottled optical fibre broadband to residential estates and enterprises across Nigeria.
            </p>
            <div className="space-y-2 text-[#cccccc] pt-2">
              <div className="flex items-center gap-2.5">
                <Phone className="w-3.5 h-3.5 text-[#ED101A] shrink-0" />
                <span>+234 (0) 700 IKONECTT / +234 (0) 201 888 4500</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-3.5 h-3.5 text-[#ED101A] shrink-0" />
                <span>support@ikonectt.ng · sales@ikonectt.ng</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="w-3.5 h-3.5 text-[#ED101A] shrink-0" />
                <span>Plot 12, Waterfront Boulevard, Victoria Island, Lagos, Nigeria</span>
              </div>
            </div>
          </div>

          {/* Col 2: Residential */}
          <div className="space-y-3">
            <span className="font-bold uppercase tracking-wider text-white text-[11px]">
              Residential Fibre
            </span>
            <ul className="space-y-2.5 text-[#a0a0a5]">
              <li>
                <button onClick={() => onNavigate('residential')} className="hover:text-white transition-colors">
                  Connect Start (50 Mbps)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('residential')} className="hover:text-white transition-colors">
                  Connect Home (100 Mbps)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('residential')} className="hover:text-white transition-colors">
                  Connect Plus (200 Mbps)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('residential')} className="hover:text-white transition-colors">
                  Connect Gigabit (500 Mbps)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('residential')} className="hover:text-white transition-colors">
                  Wi-Fi 6 Mesh Hardware
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Business */}
          <div className="space-y-3">
            <span className="font-bold uppercase tracking-wider text-white text-[11px]">
              Business & Enterprise
            </span>
            <ul className="space-y-2.5 text-[#a0a0a5]">
              <li>
                <button onClick={() => onNavigate('business')} className="hover:text-white transition-colors">
                  Business Essential (100 Mbps)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('business')} className="hover:text-white transition-colors">
                  Business Pro (250 Mbps)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('business')} className="hover:text-white transition-colors">
                  Enterprise Dedicated Leased Line
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('business')} className="hover:text-white transition-colors">
                  Cloud Direct Peering
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('business')} className="hover:text-white transition-colors">
                  Service Level Agreement (SLA)
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Network & Quick Links */}
          <div className="space-y-3">
            <span className="font-bold uppercase tracking-wider text-white text-[11px]">
              Coverage & Portal
            </span>
            <ul className="space-y-2.5 text-[#a0a0a5]">
              <li>
                <button onClick={() => onNavigate('coverage')} className="hover:text-white transition-colors">
                  Lagos Metro Fibre Map
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('coverage')} className="hover:text-white transition-colors">
                  Abuja FCT Network
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('coverage')} className="hover:text-white transition-colors">
                  Port Harcourt Network
                </button>
              </li>
              <li>
                <button onClick={onOpenMyIkonectt} className="hover:text-white transition-colors">
                  My Ikonectt Account Sign In
                </button>
              </li>
              <li>
                <button onClick={onOpenMyIkonectt} className="hover:text-white transition-colors">
                  Instant Subscription Renewal
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal & Regulatory Strip */}
        <div className="pt-8 border-t border-[#2a2a2c] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#7a7a7a]">
          <div className="flex items-center gap-4">
            <span>© {new Date().getFullYear()} Intelivision Technologies Limited. All rights reserved. Ikonectt is the broadband brand of Intelivision Technologies Limited.</span>
            <span>·</span>
            <span className="text-[#a0a0a5]">Licensed by the Nigerian Communications Commission (NCC)</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#terms" onClick={(e) => { e.preventDefault(); alert('Terms of Service: Fiber service provided with uncapped fair consumption policies.'); }} className="hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#privacy" onClick={(e) => { e.preventDefault(); alert('Privacy Policy: Customer data is handled strictly per NDPR data compliance.'); }} className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#sla" onClick={(e) => { e.preventDefault(); alert('SLA Policy: 99.9% uptime for business accounts.'); }} className="hover:text-white transition-colors">
              SLA Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
