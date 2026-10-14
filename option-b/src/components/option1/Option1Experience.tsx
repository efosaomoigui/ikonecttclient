import React, { useState } from 'react';
import { IkonecttLogo } from '../common/IkonecttLogo';
import { RESIDENTIAL_PLANS, BUSINESS_PLANS, Plan } from '../../data/telecomData';
import { Wifi, ArrowRight, ShieldCheck, MapPin, Check } from 'lucide-react';
import { AIAssistant } from '../common/AIAssistant';

interface Option1Props {
  onSwitchToOption2: () => void;
}

export const Option1Experience: React.FC<Option1Props> = ({ onSwitchToOption2 }) => {
  const [tab, setTab] = useState<'residential' | 'business'>('residential');

  return (
    <div className="min-h-screen bg-white text-[#1d1d1f] font-sans">
      {/* Option 1 Header: Standard classic header */}
      <header className="border-b border-[#e5e7eb] px-6 py-4 flex items-center justify-between">
        <IkonecttLogo size="md" />

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-700">
          <button
            onClick={() => setTab('residential')}
            className={tab === 'residential' ? 'text-[#ED101A] font-bold' : 'hover:text-black'}
          >
            Residential
          </button>
          <button
            onClick={() => setTab('business')}
            className={tab === 'business' ? 'text-[#ED101A] font-bold' : 'hover:text-black'}
          >
            Business
          </button>
          <span className="cursor-pointer hover:text-black">Coverage</span>
          <span className="cursor-pointer hover:text-black">Support</span>
          <span className="cursor-pointer hover:text-black">About</span>
        </nav>

        <div className="flex items-center gap-3">
          <button className="px-5 py-2 text-xs font-bold text-white bg-[#ED101A] rounded-full">
            My Ikonectt
          </button>
        </div>
      </header>

      {/* Option 1 Hero: Classic Split Card Container (Non-panoramic) */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-block px-3 py-1 bg-red-50 text-[#ED101A] text-xs font-bold rounded-full">
            OPTION 01 BASELINE DIRECTION
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 leading-tight">
            Connect Your Home to Nigeria's Fibre Grid
          </h1>
          <p className="text-gray-600 text-sm leading-relaxed">
            Fast, uncapped residential fibre with standard optical router equipment and dedicated 24/7 technical assistance.
          </p>
          <div className="flex gap-3">
            <button className="px-6 py-3 bg-[#ED101A] text-white text-xs font-bold rounded-lg">
              Get Started
            </button>
            <button
              onClick={onSwitchToOption2}
              className="px-6 py-3 bg-gray-100 text-gray-800 text-xs font-bold rounded-lg border border-gray-300"
            >
              Compare with Option 02 &rarr;
            </button>
          </div>
        </div>

        {/* Option 1 Hero visual: Standard boxed card */}
        <div className="p-8 bg-gray-100 rounded-2xl border border-gray-200 text-center space-y-4">
          <div className="w-16 h-16 bg-[#ED101A]/10 text-[#ED101A] rounded-full flex items-center justify-center mx-auto">
            <Wifi className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold">Standard Split-Card Layout</h3>
          <p className="text-xs text-gray-500">
            This represents Option 01's original baseline composition with boxed content cards and standard component geometry.
          </p>
        </div>
      </section>

      {/* Plans Section */}
      <section className="bg-gray-50 py-16 px-6 border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">
            {tab === 'residential' ? 'Residential Plans' : 'Business Plans'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(tab === 'residential' ? RESIDENTIAL_PLANS.slice(0, 3) : BUSINESS_PLANS).map((p) => (
              <div key={p.id} className="p-6 bg-white rounded-xl border border-gray-200 space-y-4">
                <h3 className="font-bold text-gray-900">{p.name}</h3>
                <div className="text-2xl font-bold text-[#ED101A]">{p.speed}</div>
                <p className="text-xs text-gray-500">{p.tagline}</p>
                <div className="text-lg font-bold">{p.price}</div>
                <button className="w-full py-2 bg-gray-900 text-white text-xs font-bold rounded-lg">
                  Order Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Option 1 Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6 text-center text-xs text-gray-400">
        <p>© 2026 Ikonectt Communications Ltd. Option 01 Baseline Reference.</p>
      </footer>

      {/* Floating Contemporary AI Assistant */}
      <AIAssistant
        onSelectPlan={() => {}}
        onNavigateCoverage={() => {}}
        onOpenPortal={() => {}}
      />
    </div>
  );
};
