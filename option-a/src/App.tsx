import React, { useState } from 'react';
import { PageId } from './types';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ConciergeWidget } from './components/layout/ConciergeWidget';
import { MyIkonecttModal } from './components/layout/MyIkonecttModal';
import { HomePage } from './components/pages/HomePage';
import { ResidentialPage } from './components/pages/ResidentialPage';
import { BusinessPage } from './components/pages/BusinessPage';
import { CoveragePage } from './components/pages/CoveragePage';
import { SupportPage } from './components/pages/SupportPage';
import { AboutPage } from './components/pages/AboutPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('home');
  const [myIkonecttOpen, setMyIkonecttOpen] = useState(false);
  const [prefilledAddress, setPrefilledAddress] = useState<string>('');
  const [prefilledPlan, setPrefilledPlan] = useState<string>('');

  const handleNavigate = (page: PageId, options?: { plan?: string; address?: string }) => {
    if (options?.plan) {
      setPrefilledPlan(options.plan);
    }
    if (options?.address) {
      setPrefilledAddress(options.address);
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f9f9fb] text-[#1a1c1d] selection:bg-[#FFF0F1] selection:text-[#ED101A]">
      {/* Top Navigation with Mega Menus */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onOpenMyIkonectt={() => setMyIkonecttOpen(true)}
      />

      {/* Main Content Viewport Container */}
      <main className="flex-1 pt-16">
        {currentPage === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            onOpenMyIkonectt={() => setMyIkonecttOpen(true)}
          />
        )}

        {currentPage === 'residential' && (
          <ResidentialPage onNavigate={handleNavigate} />
        )}

        {currentPage === 'business' && (
          <BusinessPage onNavigate={handleNavigate} />
        )}

        {currentPage === 'coverage' && (
          <CoveragePage
            initialAddress={prefilledAddress}
            initialPlan={prefilledPlan}
            onNavigate={handleNavigate}
            onOpenMyIkonectt={() => setMyIkonecttOpen(true)}
          />
        )}

        {currentPage === 'support' && (
          <SupportPage onNavigate={handleNavigate} />
        )}

        {currentPage === 'about' && (
          <AboutPage onNavigate={handleNavigate} />
        )}
      </main>

      {/* Global Telecommunications Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenMyIkonectt={() => setMyIkonecttOpen(true)}
      />

      {/* Interactive Floating Concierge Drawer */}
      <ConciergeWidget onNavigate={handleNavigate} />

      {/* "My Ikonectt" Authenticated Customer Portal Modal */}
      <MyIkonecttModal
        isOpen={myIkonecttOpen}
        onClose={() => setMyIkonecttOpen(false)}
      />
    </div>
  );
}
