import React, { useState } from 'react';
import { PageId } from '../../types';
import { BRAND_CONTENT } from '../../content';
import { BrandLogo } from '../ui/BrandLogo';
import { CheckCircle2, ShieldCheck } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: PageId) => void;
  onOpenMyIkonectt: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenMyIkonectt }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setEmail('');
      }, 4000);
    }
  };

  const nav = (p: PageId) => {
    onNavigate(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-[#0a0a0c] text-white pt-16 pb-12 border-t border-[#1c1d24]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Main Grid matching Image 1.png */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-[#1c1d24]">
          {/* Column 1: Brand & Newsletter */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <button
              onClick={() => nav('home')}
              className="text-left focus:outline-none flex items-center shrink-0 cursor-pointer"
              aria-label="Ikonectt Home"
            >
              <BrandLogo variant="dark" className="h-10 sm:h-11 md:h-12" />
            </button>

            <p className="text-[13px] sm:text-[14px] text-gray-400 leading-relaxed max-w-sm">
              Connecting Nigerian homes and enterprises with ultra-fast, dependable fibre broadband infrastructure for a brighter future.
            </p>

            {/* Stay Connected form matching Image 1.png */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                STAY CONNECTED WITH IKONECTT
              </span>
              {subscribed ? (
                <div className="flex items-center gap-2 text-[#00D084] text-xs font-semibold py-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Subscribed successfully to updates.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex items-center gap-2 max-w-sm">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className="flex-1 px-3.5 py-2.5 rounded-lg bg-[#16171d] border border-[#2a2d37] text-white text-xs placeholder:text-gray-500 focus:outline-none focus:border-[#ED101A]"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-lg bg-[#ED101A] hover:bg-[#D50913] text-white text-xs font-semibold uppercase tracking-wider transition-colors shrink-0 cursor-pointer"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>

            {/* Social Icons matching Image 1.png */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="#facebook"
                className="w-8 h-8 rounded-full bg-[#16171d] border border-[#2a2d37] flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-500 transition-colors text-xs font-bold"
                aria-label="Facebook"
              >
                f
              </a>
              <a
                href="#twitter"
                className="w-8 h-8 rounded-full bg-[#16171d] border border-[#2a2d37] flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-500 transition-colors text-xs font-bold"
                aria-label="Twitter X"
              >
                𝕏
              </a>
              <a
                href="#instagram"
                className="w-8 h-8 rounded-full bg-[#16171d] border border-[#2a2d37] flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-500 transition-colors text-xs font-bold"
                aria-label="Instagram"
              >
                in
              </a>
              <a
                href="#linkedin"
                className="w-8 h-8 rounded-full bg-[#16171d] border border-[#2a2d37] flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-500 transition-colors text-xs font-bold"
                aria-label="LinkedIn"
              >
                ln
              </a>
            </div>
          </div>

          {/* Navigation Links Columns matching Image 1.png */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {/* Column 2: For You */}
            <div>
              <h5 className="text-[12px] uppercase tracking-wider text-white font-bold mb-4">
                For You
              </h5>
              <ul className="space-y-2.5 text-[13px] text-gray-400">
                <li>
                  <button
                    onClick={() => nav('residential')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Residential Plans
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => nav('business')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Business Plans
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => nav('coverage')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Coverage Checker
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => nav('support')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Support & FAQ
                  </button>
                </li>
                <li>
                  <button
                    onClick={onOpenMyIkonectt}
                    className="hover:text-[#ED101A] transition-colors cursor-pointer font-medium"
                  >
                    My Ikonectt
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Company */}
            <div>
              <h5 className="text-[12px] uppercase tracking-wider text-white font-bold mb-4">
                Company
              </h5>
              <ul className="space-y-2.5 text-[13px] text-gray-400">
                <li>
                  <button
                    onClick={() => nav('about')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    About Ikonectt
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => nav('about')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Our Network & Fibre
                  </button>
                </li>
                <li>
                  <span className="hover:text-white transition-colors cursor-pointer">
                    Careers
                  </span>
                </li>
                <li>
                  <span className="hover:text-white transition-colors cursor-pointer">
                    News & Media
                  </span>
                </li>
                <li>
                  <button
                    onClick={() => nav('support')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Contact Us
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Legal & Regulatory + NCC Card matching Image 1.png */}
            <div className="flex flex-col gap-4">
              <h5 className="text-[12px] uppercase tracking-wider text-white font-bold">
                Legal & Regulatory
              </h5>
              <ul className="space-y-2 text-[13px] text-gray-400">
                <li>
                  <span className="hover:text-white transition-colors cursor-pointer">
                    Privacy Policy
                  </span>
                </li>
                <li>
                  <span className="hover:text-white transition-colors cursor-pointer">
                    Terms of Service
                  </span>
                </li>
                <li>
                  <span className="hover:text-white transition-colors cursor-pointer">
                    Acceptable Use Policy
                  </span>
                </li>
                <li>
                  <span className="hover:text-white transition-colors cursor-pointer">
                    Regulatory Information
                  </span>
                </li>
              </ul>

              {/* NCC Licensed Badge Box matching Image 1.png */}
              <div className="p-3.5 rounded-xl bg-[#14161d] border border-[#232733] flex flex-col gap-1 mt-2">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#00D084] uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>NCC Licensed</span>
                </div>
                <p className="text-[11px] text-gray-400 leading-snug">
                  Operated under full compliance with Nigerian Communications Commission standards.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[12px] text-gray-500">
          <p>© {new Date().getFullYear()} Intelivision Technologies Limited. All rights reserved. Ikonectt is the broadband brand of Intelivision Technologies Limited.</p>
          <div className="flex flex-wrap items-center gap-3 text-center sm:text-right">
            <span className="hover:text-gray-400 cursor-pointer">Fibre Broadband</span>
            <span>|</span>
            <span className="hover:text-gray-400 cursor-pointer">Enterprise Leased Line</span>
            <span>|</span>
            <span className="hover:text-gray-400 cursor-pointer">Cloud Connect</span>
            <span>|</span>
            <span className="hover:text-gray-400 cursor-pointer">Business Solutions</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
