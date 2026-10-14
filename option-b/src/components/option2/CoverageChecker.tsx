import React, { useState } from 'react';
import { Search, MapPin, CheckCircle2, Clock, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { COVERAGE_AREAS } from '../../data/telecomData';

interface CoverageCheckerProps {
  onSelectPlan?: () => void;
  variant?: 'compact' | 'full';
}

export const CoverageChecker: React.FC<CoverageCheckerProps> = ({
  onSelectPlan,
  variant = 'compact',
}) => {
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedResult, setSelectedResult] = useState<{
    estate: string;
    area: string;
    state: string;
    status: 'Ready Now' | 'Live' | 'Expanding';
  } | null>(null);

  // Search logic
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    const lower = query.toLowerCase().trim();
    let found: {
      estate: string;
      area: string;
      state: string;
      status: 'Ready Now' | 'Live' | 'Expanding';
    } | null = null;

    for (const stateObj of COVERAGE_AREAS) {
      for (const area of stateObj.areas) {
        for (const estate of area.estates) {
          if (estate.toLowerCase().includes(lower) || area.name.toLowerCase().includes(lower)) {
            found = {
              estate,
              area: area.name,
              state: stateObj.state,
              status: area.status,
            };
            break;
          }
        }
        if (found) break;
      }
      if (found) break;
    }

    setSelectedResult(found);
    setHasSearched(true);
  };

  const handleQuickPick = (estateName: string) => {
    setQuery(estateName);
    const lower = estateName.toLowerCase();
    for (const stateObj of COVERAGE_AREAS) {
      for (const area of stateObj.areas) {
        for (const est of area.estates) {
          if (est.toLowerCase().includes(lower)) {
            setSelectedResult({
              estate: est,
              area: area.name,
              state: stateObj.state,
              status: area.status,
            });
            setHasSearched(true);
            return;
          }
        }
      }
    }
  };

  return (
    <div className={`w-full ${variant === 'full' ? 'max-w-4xl mx-auto' : 'max-w-3xl mx-auto'}`}>
      {/* Search Input Bar */}
      <form onSubmit={handleSearch} className="relative">
        <div className="flex flex-col sm:flex-row items-center gap-2 p-2 bg-white rounded-2xl md:rounded-full border border-[#e0e0e0] shadow-sm focus-within:border-[#ED101A] focus-within:ring-2 focus-within:ring-[#ED101A]/20 transition-all">
          <div className="flex items-center gap-3 pl-4 flex-1 w-full">
            <MapPin className="w-5 h-5 text-[#ED101A] shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (hasSearched) setHasSearched(false);
              }}
              placeholder="Enter your street, estate, or area (e.g. Lekki Phase 1, Ikoyi, Ikeja GRA...)"
              className="w-full text-[15px] text-[#1d1d1f] placeholder:text-[#7a7a7a] focus:outline-none bg-transparent py-2.5"
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-7 py-3 text-sm font-semibold text-white bg-[#ED101A] hover:bg-[#D50913] active:bg-[#D50913] rounded-xl sm:rounded-full transition-all duration-150 shrink-0 flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>Check Coverage</span>
          </button>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap items-center gap-2 mt-3 px-2 text-xs text-[#7a7a7a]">
          <span className="font-medium text-[#1d1d1f]">Popular zones:</span>
          {['Lekki Phase 1', 'Banana Island', 'Victoria Island', 'Ikeja GRA', 'Maitama Abuja'].map(
            (popular) => (
              <button
                key={popular}
                type="button"
                onClick={() => handleQuickPick(popular)}
                className="hover:text-[#ED101A] transition-colors underline decoration-dotted underline-offset-4"
              >
                {popular}
              </button>
            )
          )}
        </div>
      </form>

      {/* Result Display Box */}
      {hasSearched && (
        <div className="mt-6 p-6 rounded-2xl border border-[#e0e0e0] bg-[#fafafc] animate-in fade-in slide-in-from-top-2 duration-200">
          {selectedResult ? (
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="text-xs uppercase tracking-wider font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {selectedResult.status === 'Ready Now' ? 'Pure Optical Fibre Active' : 'Gigabit Network Live'}
                  </span>
                </div>
                <h4 className="text-lg font-bold text-[#1d1d1f] pt-1">
                  {selectedResult.estate} is Covered!
                </h4>
                <p className="text-xs text-[#6e6e73]">
                  {selectedResult.area} · {selectedResult.state} — Underground optical duct infrastructure ready for same-week home/office connection.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
                <button
                  type="button"
                  onClick={onSelectPlan}
                  className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#ED101A] hover:bg-[#D50913] rounded-full transition-colors"
                >
                  <span>Select Broadband Plan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                  <span className="text-xs uppercase tracking-wider font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    Expansion in Progress
                  </span>
                </div>
                <h4 className="text-lg font-bold text-[#1d1d1f] pt-1">
                  We are expanding towards "{query}"
                </h4>
                <p className="text-xs text-[#6e6e73]">
                  Our engineering team is actively rolling out civil fiber ducts in this district. Register your interest for priority installation alert.
                </p>
              </div>

              <button
                type="button"
                onClick={() => alert(`Thank you! Priority interest registered for "${query}". Our engineering liaison will notify you upon optical light-up.`)}
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-[#1d1d1f] bg-white border border-[#d2d2d7] hover:border-[#1d1d1f] rounded-full transition-colors shrink-0"
              >
                <span>Register for Priority Light-Up</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
