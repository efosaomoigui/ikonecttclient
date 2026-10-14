import React, { useState } from 'react';
import { X, MapPin, CheckCircle, Search, ArrowRight, AlertCircle } from 'lucide-react';

interface CoverageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CoverageModal: React.FC<CoverageModalProps> = ({ isOpen, onClose }) => {
  const [city, setCity] = useState('Lagos');
  const [address, setAddress] = useState('');
  const [result, setResult] = useState<'idle' | 'available' | 'survey'>('idle');

  if (!isOpen) return null;

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;
    // Simulate lookup based on verified areas
    const q = address.toLowerCase();
    if (q.includes('ikoyi') || q.includes('vi') || q.includes('victoria') || q.includes('lekki') || q.includes('ikeja') || q.includes('maitama') || q.includes('wuse') || q.includes('gra')) {
      setResult('available');
    } else {
      setResult('survey');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#121214] border border-white/10 p-6 sm:p-8 text-white shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#ED101A]/10 text-[#ED101A]">
              <MapPin className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold">Check Address Feasibility</h3>
              <p className="text-xs text-[#A1A1AA]">Authoritative optical fibre availability checker</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Checker Form */}
        <form onSubmit={handleCheck} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">
              Select City / Region
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {['Lagos', 'Abuja (FCT)', 'Port Harcourt', 'Edo State'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => { setCity(c); setResult('idle'); }}
                  className={`py-2 px-2.5 text-xs rounded-xl border text-center transition-all ${
                    city === c
                      ? 'bg-[#ED101A] border-[#ED101A] text-white font-semibold'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">
              Street, Estate or Building Address
            </label>
            <div className="relative">
              <input
                type="text"
                value={address}
                onChange={(e) => { setAddress(e.target.value); setResult('idle'); }}
                placeholder="e.g. Adeola Odeku St, Victoria Island or Lekki Phase 1"
                className="w-full bg-[#1A1A1E] border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#ED101A]"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full btn-pill-primary text-sm font-semibold !py-3.5 flex items-center justify-center gap-2 mt-2"
          >
            <Search className="w-4 h-4" />
            <span>Verify Feasibility</span>
          </button>
        </form>

        {/* Dynamic Results */}
        {result === 'available' && (
          <div className="mt-6 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-white">Live Fibre Active in Your Area</p>
              <p className="text-xs text-white/70 mt-1">
                Your location in {city} is ready for optical drop installation. An installation engineer can be dispatched within 48–72 hours of request confirmation.
              </p>
            </div>
          </div>
        )}

        {result === 'survey' && (
          <div className="mt-6 p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-white">Engineering Survey Scheduled</p>
              <p className="text-xs text-white/70 mt-1">
                Your area in {city} is currently in our secondary expansion zone. We have logged your enquiry for custom routing feasibility.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
