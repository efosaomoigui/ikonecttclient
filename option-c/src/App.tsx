import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ChooseConnectionSection } from './components/ChooseConnectionSection';
import { PlansSection } from './components/PlansSection';
import { ResidentialEditorialSection } from './components/ResidentialEditorialSection';
import { BusinessEditorialSection } from './components/BusinessEditorialSection';
import { CoverageActionSection } from './components/CoverageActionSection';
import { MyIkonecttSection } from './components/MyIkonecttSection';
import { SupportSection } from './components/SupportSection';
import { Footer } from './components/Footer';

import { CoverageModal } from './components/CoverageModal';
import { MyIkonecttModal } from './components/MyIkonecttModal';
import { SupportModal } from './components/SupportModal';
import { AboutModal } from './components/AboutModal';

export const App: React.FC = () => {
  const [isCoverageOpen, setIsCoverageOpen] = useState(false);
  const [isMyIkonecttOpen, setIsMyIkonecttOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#090909] text-white flex flex-col selection:bg-[#ED101A] selection:text-white">
      
      {/* 00 — Global Navigation */}
      <Navbar
        onOpenCoverage={() => setIsCoverageOpen(true)}
        onOpenMyIkonectt={() => setIsMyIkonecttOpen(true)}
        onOpenSupport={() => setIsSupportOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        onScrollToSection={scrollToSection}
      />

      <main className="flex-1 w-full flex flex-col">
        {/* 01 — Cinematic Full-Width Hero */}
        <HeroSection
          onExploreResidential={() => scrollToSection('residential-editorial')}
          onExploreBusiness={() => scrollToSection('business-editorial')}
        />

        {/* 02 — Choose Your Connection */}
        <ChooseConnectionSection
          onExploreResidential={() => scrollToSection('residential-editorial')}
          onExploreBusiness={() => scrollToSection('business-editorial')}
        />

        {/* 03 — Plans */}
        <PlansSection
          onSelectAudience={(audience) => {
            if (audience === 'residential') scrollToSection('residential-editorial');
            else scrollToSection('business-editorial');
          }}
          onOpenCoverage={() => setIsCoverageOpen(true)}
        />

        {/* 04 — Residential Lifestyle Editorial */}
        <ResidentialEditorialSection
          onExploreResidential={() => setIsCoverageOpen(true)}
        />

        {/* 05 — Business Connectivity Editorial */}
        <BusinessEditorialSection
          onExploreBusiness={() => setIsSupportOpen(true)}
        />

        {/* 06 — Coverage Action */}
        <CoverageActionSection
          onCheckCoverage={() => setIsCoverageOpen(true)}
        />

        {/* 07 — My Ikonectt Self-Service */}
        <MyIkonecttSection
          onOpenMyIkonectt={() => setIsMyIkonecttOpen(true)}
        />

        {/* 08 — Support */}
        <SupportSection
          onOpenSupport={() => setIsSupportOpen(true)}
        />
      </main>

      {/* 09 — Comprehensive Footer */}
      <Footer
        onOpenCoverage={() => setIsCoverageOpen(true)}
        onOpenSupport={() => setIsSupportOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenMyIkonectt={() => setIsMyIkonecttOpen(true)}
        onScrollToSection={scrollToSection}
      />

      {/* Accessible Interactive Modals */}
      <CoverageModal
        isOpen={isCoverageOpen}
        onClose={() => setIsCoverageOpen(false)}
      />

      <MyIkonecttModal
        isOpen={isMyIkonecttOpen}
        onClose={() => setIsMyIkonecttOpen(false)}
      />

      <SupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

    </div>
  );
};
