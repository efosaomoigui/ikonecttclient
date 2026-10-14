import React, { useState } from 'react';
import { COVERAGE_AREAS } from '../../data/telecomData';
import { CoverageChecker } from './CoverageChecker';
import { MapPin, CheckCircle2, Clock, ShieldCheck, ArrowRight, Building, Search } from 'lucide-react';

interface CoverageCheckerPageProps {
  onSelectPlan: () => void;
}

export const CoverageCheckerPage: React.FC<CoverageCheckerPageProps> = ({ onSelectPlan }) => {
  const [selectedState, setSelectedState] = useState<string>('Lagos State');
  const [estateFilter, setEstateFilter] = useState<string>('');

  const currentStateData = COVERAGE_AREAS.find((c) => c.state === selectedState);

  return (
    <div className="w-full">
      {/* Coverage Banner */}
      <section className="bg-[#fafafc] border-b border-[#e0e0e0] py-16 lg:py-20 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[#ED101A]">
            National Optical Backbone
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#1d1d1f] tracking-tight leading-tight">
            Ikonectt Fibre Coverage Map
          </h1>
          <p className="text-base text-[#6e6e73] max-w-2xl mx-auto leading-relaxed">
            Check optical readiness on your street or browse our live coverage footprint across Lagos, Abuja, and Port Harcourt.
          </p>

          <div className="pt-6">
            <CoverageChecker onSelectPlan={onSelectPlan} variant="full" />
          </div>
        </div>
      </section>

      {/* Coverage Directory by State & District */}
      <section className="py-16 bg-white border-b border-[#e0e0e0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-8 border-b border-[#e0e0e0] gap-4">
            <div>
              <h2 className="text-2xl font-bold text-[#1d1d1f]">Live Estate & Street Directory</h2>
              <p className="text-xs text-[#6e6e73]">Select a region to view specific optical termination zones:</p>
            </div>

            {/* Region Selectors */}
            <div className="flex items-center gap-2 p-1 bg-[#f5f5f7] rounded-full text-xs font-semibold">
              {COVERAGE_AREAS.map((item) => (
                <button
                  key={item.state}
                  onClick={() => {
                    setSelectedState(item.state);
                    setEstateFilter('');
                  }}
                  className={`px-4 py-2 rounded-full transition-all ${
                    selectedState === item.state
                      ? 'bg-white text-[#ED101A] shadow-sm font-bold'
                      : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                  }`}
                >
                  {item.state}
                </button>
              ))}
            </div>
          </div>

          {/* District list */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentStateData?.areas.map((area, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-[#fafafc] border border-[#e0e0e0] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-[#ED101A] uppercase tracking-wider">
                      {area.status}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      100% Optical
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#1d1d1f] mb-2">{area.name}</h3>

                  <div className="space-y-1.5 mt-4">
                    <span className="text-[11px] font-bold text-[#7a7a7a] uppercase tracking-wider block">
                      Active Estates & Corridors:
                    </span>
                    <ul className="space-y-1 text-xs text-[#1d1d1f]">
                      {area.estates.map((est, i) => (
                        <li key={i} className="flex items-center gap-2 py-0.5">
                          <MapPin className="w-3 h-3 text-[#ED101A] shrink-0" />
                          <span>{est}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-[#e8e8ed]">
                  <button
                    onClick={onSelectPlan}
                    className="w-full py-2.5 px-4 rounded-full bg-white hover:bg-[#1d1d1f] hover:text-white border border-[#d2d2d7] text-xs font-bold text-[#1d1d1f] transition-colors"
                  >
                    Connect in {area.name} &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Expansion Request Callout */}
      <section className="py-20 bg-[#fafafc]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-white border border-[#e0e0e0] flex items-center justify-center text-[#ED101A] mx-auto shadow-sm">
            <Building className="w-7 h-7" />
          </div>
          <h2 className="text-3xl font-extrabold text-[#1d1d1f] tracking-tight">
            Don't see your estate or commercial park?
          </h2>
          <p className="text-sm text-[#6e6e73] max-w-xl mx-auto leading-relaxed">
            We partner with Resident Associations, Estate Facility Managers, and Commercial Landlords to lay dedicated optical infrastructure.
          </p>

          <div className="pt-4 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => alert('Estate partnership inquiry: Please contact us at estates@ikonectt.ng or call our fiber planning desk at +234 700 IKONECTT')}
              className="px-7 py-3 text-sm font-semibold text-white bg-[#ED101A] hover:bg-[#D50913] rounded-full transition-colors"
            >
              Request Estate Light-Up
            </button>
            <button
              onClick={onSelectPlan}
              className="px-7 py-3 text-sm font-medium text-[#1d1d1f] bg-white border border-[#d2d2d7] hover:border-[#1d1d1f] rounded-full transition-colors"
            >
              Browse Available Plans
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
