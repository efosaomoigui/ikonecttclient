import React from 'react';
import { X, Building2, CheckCircle2, ShieldCheck, Globe } from 'lucide-react';
import { OPTION_03_CONTENT as C } from '../data/content';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#121214] border border-white/10 p-6 sm:p-8 text-white shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#ED101A]/10 text-[#ED101A]">
              <Building2 className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold">About Intelivision Technologies</h3>
              <p className="text-xs text-[#A1A1AA]">Corporate entity & Ikonectt brand governance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-4 text-xs sm:text-sm text-white/80 leading-relaxed font-light">
          <p>
            <strong className="text-white font-semibold">Ikonectt®</strong> is a licensed telecommunications brand of <strong className="text-white font-semibold">Intelivision Technologies Limited</strong>, focused on deploying high-density optical fibre access networks across key commercial and metropolitan hubs in Nigeria.
          </p>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-white font-semibold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-[#ED101A]" />
              <span>Core Brand Commitments</span>
            </div>
            <ul className="space-y-1.5 text-xs text-[#A1A1AA]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>True symmetrical optical transmission (1:1 upload/download)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Zero bandwidth capping or unannounced artificial throttling</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Verified Nigerian infrastructure with 24/7 localized care</span>
              </li>
            </ul>
          </div>

          <p className="text-xs text-white/60">
            For corporate governance, institutional partnership enquiries, or legal verification, please contact <a href="mailto:info@ikonectt.com" className="text-[#FF616A] underline">info@ikonectt.com</a>.
          </p>
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="btn-pill-secondary text-xs !py-2 !px-5"
          >
            Close Overview
          </button>
        </div>

      </div>
    </div>
  );
};
