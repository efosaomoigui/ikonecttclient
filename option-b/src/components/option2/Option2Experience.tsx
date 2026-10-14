import React, { useState } from 'react';
import { Navigation } from './Navigation';
import { HomePage } from './HomePage';
import { ResidentialLanding } from './ResidentialLanding';
import { BusinessLanding } from './BusinessLanding';
import { CoverageCheckerPage } from './CoverageCheckerPage';
import { Footer } from './Footer';
import { PlanOrderModal } from './PlanOrderModal';
import { MyIkonecttModal } from './MyIkonecttModal';
import { Plan, RESIDENTIAL_PLANS } from '../../data/telecomData';
import { Layers, Sparkles, Info, X, Check, ArrowRight } from 'lucide-react';
import { AIAssistant } from '../common/AIAssistant';

interface Option2ExperienceProps {
  onSwitchToOption1: () => void;
}

export const Option2Experience: React.FC<Option2ExperienceProps> = ({ onSwitchToOption1 }) => {
  const [currentTab, setCurrentTab] = useState<'home' | 'residential' | 'business' | 'coverage'>('home');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isMyIkonecttOpen, setIsMyIkonecttOpen] = useState(false);
  const [showDesignNotes, setShowDesignNotes] = useState(false);

  const handleNavigate = (tab: 'home' | 'residential' | 'business' | 'coverage') => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white text-[#1d1d1f] flex flex-col font-sans">
      {/* Main Navigation with Multi-Column Mega Menus */}
      <Navigation
        currentTab={currentTab}
        onNavigate={handleNavigate}
        onOpenMyIkonectt={() => setIsMyIkonecttOpen(true)}
      />

      {/* Main Dynamic Viewport */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            onSelectPlan={(plan) => setSelectedPlan(plan)}
            onOpenMyIkonectt={() => setIsMyIkonecttOpen(true)}
          />
        )}

        {currentTab === 'residential' && (
          <ResidentialLanding
            onSelectPlan={(plan) => setSelectedPlan(plan)}
            onNavigateCoverage={() => handleNavigate('coverage')}
          />
        )}

        {currentTab === 'business' && (
          <BusinessLanding
            onSelectPlan={(plan) => setSelectedPlan(plan)}
            onNavigateCoverage={() => handleNavigate('coverage')}
          />
        )}

        {currentTab === 'coverage' && (
          <CoverageCheckerPage
            onSelectPlan={() => handleNavigate('residential')}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenMyIkonectt={() => setIsMyIkonecttOpen(true)}
      />

      {/* Plan Order / Booking Modal */}
      <PlanOrderModal
        plan={selectedPlan}
        onClose={() => setSelectedPlan(null)}
      />

      {/* My Ikonectt Customer Portal Modal */}
      <MyIkonecttModal
        isOpen={isMyIkonecttOpen}
        onClose={() => setIsMyIkonecttOpen(false)}
      />

      {/* Contemporary AI Assistant Floating at Bottom-Right */}
      <AIAssistant
        onSelectPlan={(plan) => setSelectedPlan(plan)}
        onNavigateCoverage={() => handleNavigate('coverage')}
        onOpenPortal={() => setIsMyIkonecttOpen(true)}
      />

      {/* Creative Rationale Modal for Client Presentation */}
      {showDesignNotes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 relative shadow-2xl border border-[#e0e0e0] max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setShowDesignNotes(false)}
              className="absolute top-6 right-6 p-2 rounded-full text-[#7a7a7a] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] transition-colors"
              aria-label="Close notes modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#ED101A]">
                Design Option 02 · Presentation Rationale
              </span>
              <h3 className="text-2xl font-bold text-[#1d1d1f]">
                Reimagining Ikonectt: Modern, Confident & Photography-Led
              </h3>
              <p className="text-xs text-[#6e6e73] leading-relaxed">
                Design Option 02 synthesizes the clarity of MTN's product communication with the editorial sophistication and generous negative space of ipNX, crafted within Ikonectt's brand identity.
              </p>

              <div className="space-y-3 pt-2 text-xs text-[#1d1d1f]">
                <div className="p-3 bg-[#fafafc] rounded-xl border border-[#e8e8ed]">
                  <strong className="text-[#ED101A] block mb-1">1. Full-Bleed Panoramic Hero Composition</strong>
                  Replaces the boxed split-card structure of Option 01 with an immersive edge-to-edge cinematic Nigerian family lifestyle visual with measured gradient contrast scrims and bold, balanced typography.
                </div>

                <div className="p-3 bg-[#fafafc] rounded-xl border border-[#e8e8ed]">
                  <strong className="text-[#ED101A] block mb-1">2. Multi-Column Mega Menus</strong>
                  Rather than single standard dropdowns, both Residential and Business feature 3-column architectural mega menus organizing speed plans, lifestyle solutions, enterprise SLAs, and instant visual callouts.
                </div>

                <div className="p-3 bg-[#fafafc] rounded-xl border border-[#e8e8ed]">
                  <strong className="text-[#ED101A] block mb-1">3. Editorial Split Photography</strong>
                  Alternates light and deep charcoal sections with human-centric lifestyle imagery of Nigerian gamers, digital entrepreneurs, and tech sprint meetings.
                </div>

                <div className="p-3 bg-[#fafafc] rounded-xl border border-[#e8e8ed]">
                  <strong className="text-[#ED101A] block mb-1">4. Interactive Tools Without Clutter</strong>
                  Includes an interactive Residential Device Sizing calculator, Enterprise Bandwidth Estimator, instant street/estate coverage checker, and simulated My Ikonectt portal access.
                </div>

                <div className="p-3 bg-[#fafafc] rounded-xl border border-[#e8e8ed]">
                  <strong className="text-[#ED101A] block mb-1">5. Anti-Slop & Zero-Pill Discipline</strong>
                  Eliminates generic pill tags on metadata, decorative pulsing dots, and mechanical code tags. All copy is crisp, factual, and authentic to Nigerian connectivity.
                </div>
              </div>

              <div className="pt-4 border-t border-[#f0f0f0] flex justify-end">
                <button
                  onClick={() => setShowDesignNotes(false)}
                  className="px-6 py-2.5 rounded-full bg-[#1d1d1f] hover:bg-black text-white text-xs font-semibold"
                >
                  Close & Explore
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
