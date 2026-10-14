import React, { useState, useEffect } from 'react';
import { PageId } from '../../types';
import {
  MapPin,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Router,
  Cable,
  Activity,
  Layers,
  Users,
  Lock,
  Sparkles,
  Phone,
  Check,
} from 'lucide-react';

interface CoveragePageProps {
  initialAddress?: string;
  initialPlan?: string;
  onNavigate: (page: PageId) => void;
  onOpenMyIkonectt: () => void;
}

export const CoveragePage: React.FC<CoveragePageProps> = ({
  initialAddress = 'Admiralty Way, Lekki Phase 1',
  initialPlan = 'Home Plus 100 Mbps (₦35,000/mo)',
  onNavigate,
  onOpenMyIkonectt,
}) => {
  const [currentStage, setCurrentStage] = useState<number>(1);
  const [resultState, setResultState] = useState<'available' | 'planned' | 'pending'>('available');
  const [selectedPlan, setSelectedPlan] = useState<string>(initialPlan);
  const [ticketId, setTicketId] = useState<string>('#IK-COV-8291');

  // Location Cascading Form
  const [selectedState, setSelectedState] = useState('lagos');
  const [selectedDistrict, setSelectedDistrict] = useState('eti-osa');
  const [selectedEstate, setSelectedEstate] = useState('lekki-1');
  const [addressQuery, setAddressQuery] = useState(initialAddress);

  // Survey Form
  const [surveyData, setSurveyData] = useState({
    fullName: 'Babatunde Adeyemi',
    phone: '+234 803 123 4567',
    email: 'babatunde@zenithglobal.ng',
    premisesType: 'apartment',
    fullAddress: initialAddress,
    notes: 'Please call security gate before arrival; duct conduit pre-installed in utility riser.',
  });

  useEffect(() => {
    if (initialAddress) {
      setAddressQuery(initialAddress);
      setSurveyData((prev) => ({ ...prev, fullAddress: initialAddress }));
    }
  }, [initialAddress]);

  useEffect(() => {
    if (initialPlan) {
      setSelectedPlan(initialPlan);
    }
  }, [initialPlan]);

  const handleStateChange = (val: string) => {
    setSelectedState(val);
    if (val === 'lagos') {
      setSelectedDistrict('eti-osa');
      setSelectedEstate('lekki-1');
    } else if (val === 'abuja') {
      setSelectedDistrict('maitama');
      setSelectedEstate('maitama-ext');
    } else if (val === 'rivers') {
      setSelectedDistrict('ph-old-gra');
      setSelectedEstate('trans-amadi');
    } else if (val === 'oyo') {
      setSelectedDistrict('bodija');
      setSelectedEstate('bodija-estate');
    }
  };

  const handleQuickFill = (addr: string, stateMode: 'available' | 'planned' | 'pending') => {
    setAddressQuery(addr);
    setSurveyData((prev) => ({ ...prev, fullAddress: addr }));
    setResultState(stateMode);
    setCurrentStage(2);
  };

  const handleVerifyLine = () => {
    setCurrentStage(2);
  };

  const handlePlanSelect = (planTitle: string) => {
    setSelectedPlan(planTitle);
    setCurrentStage(4);
  };

  const handleSurveySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const generated = `#IK-COV-${Math.floor(1000 + Math.random() * 9000)}`;
    setTicketId(generated);
    setCurrentStage(5);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Top Banner & Header */}
      <section className="relative w-full overflow-hidden bg-white border-b border-[#F0F0F0]">
        {/* Subtle Map Ambient Texture */}
        <div
          className="absolute inset-0 z-0 opacity-15 pointer-events-none bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDsr1ThIV62Ni9wxeglVSrJbCF2vNQEyWbSLLzHc58R9foCzSg0zGHOmuzxjC66SRFlSojlIVGJe1iQGWgaFebG40xXa6nJsr9Ipi1AW6O-soKfx2glB_xRooLa190_K2SIt3KfAda_ielH0rFGxSMM679Ax0yvPOAGM3IAg9Du7t1wfzMfumtLxV7AX-iX0H_WCthqlvTHwZWCv8ZGCKeYJpIyeWuft6VYZQXFH2cKZeSBhb-A7-WH1Q')",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-10 pb-16">
          {/* Metadata Strip */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-[#F0F0F0]">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f3f3f5] text-[#1a1c1d] text-xs font-semibold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#00D084] animate-pulse" />
                GIS Geospatial Engine v4.8
              </span>
              <span className="text-xs text-[#7A7A7A] uppercase tracking-wider hidden sm:inline-block font-mono-stat">
                Core Routing Layer: West Africa Subsea (WACS / Equiano)
              </span>
            </div>
            <div className="flex items-center gap-6 text-xs text-[#7A7A7A]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#008653]" /> 99.98% Metro Uptime
              </span>
              <span className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-[#ED101A]" /> Up to 10 Gbps Symmetrical
              </span>
            </div>
          </div>

          {/* Heading */}
          <div className="max-w-3xl mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FFF0F1] text-[#ED101A] text-xs font-semibold uppercase tracking-wider mb-4">
              <MapPin className="w-3.5 h-3.5" />
              FTTH & FTTB Feasibility Verification
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#1a1c1d] mb-4">
              Is Ikonectt Fibre available at your address?
            </h1>
            <p className="text-[17px] text-[#5f5e60] leading-relaxed max-w-2xl">
              Query our live optical distribution frame (ODF) footprint across Nigeria. Instant feasibility assessment down to your precise estate gate and building unit.
            </p>
          </div>

          {/* 5-Stage Step Flow Indicator Bar */}
          <div className="w-full bg-[#f3f3f5] p-2 rounded-2xl mb-10 shadow-sm border border-[#F0F0F0]">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-center">
              {[
                { num: 1, label: 'Location Input' },
                { num: 2, label: 'Coverage Results' },
                { num: 3, label: 'Action Routing' },
                { num: 4, label: 'Site Survey Form' },
                { num: 5, label: 'Confirmation' },
              ].map((step) => {
                const isActive = currentStage === step.num;
                const isPassed = currentStage > step.num;
                return (
                  <button
                    key={step.num}
                    type="button"
                    onClick={() => setCurrentStage(step.num)}
                    className={`py-3 px-3 rounded-xl text-xs uppercase tracking-wider font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isActive
                        ? 'bg-white text-[#ED101A] shadow-sm'
                        : isPassed
                        ? 'text-[#1a1c1d] hover:bg-white/60'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-bold ${
                        isActive
                          ? 'bg-[#ED101A] text-white'
                          : isPassed
                          ? 'bg-[#008653] text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {isPassed ? '✓' : step.num}
                    </span>
                    <span className="truncate">{step.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* STAGE 1: LOCATION INPUT & CASCADING SEARCH */}
          {/* ========================================================================= */}
          {currentStage === 1 && (
            <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-[#F0F0F0] animate-in fade-in duration-200">
              <div className="max-w-4xl mx-auto flex flex-col gap-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-[#ED101A] font-semibold">
                      Stage 1 of 5
                    </span>
                    <h2 className="text-2xl font-bold text-[#1a1c1d] mt-1">
                      Select your geographical sector
                    </h2>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f3f3f5] text-xs text-[#5f5e60]">
                    <span className="w-2 h-2 rounded-full bg-[#00D084]" />
                    Auto-locate enabled via IP
                  </div>
                </div>

                {/* Cascading Matrix */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      1. State Territory
                    </label>
                    <select
                      value={selectedState}
                      onChange={(e) => handleStateChange(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl bg-[#f3f3f5] text-sm text-[#1a1c1d] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#ED101A] cursor-pointer border border-[#F0F0F0]"
                    >
                      <option value="lagos">Lagos State</option>
                      <option value="abuja">Abuja (FCT)</option>
                      <option value="rivers">Rivers State (Port Harcourt)</option>
                      <option value="oyo">Oyo State (Ibadan)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      2. LGA / Metro District
                    </label>
                    <select
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl bg-[#f3f3f5] text-sm text-[#1a1c1d] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#ED101A] cursor-pointer border border-[#F0F0F0]"
                    >
                      {selectedState === 'lagos' && (
                        <>
                          <option value="eti-osa">Eti-Osa (Island)</option>
                          <option value="ikeja">Ikeja (Mainland Capital)</option>
                          <option value="lagos-island">Lagos Island / Marina</option>
                          <option value="surulere">Surulere Central</option>
                        </>
                      )}
                      {selectedState === 'abuja' && (
                        <>
                          <option value="maitama">Maitama District</option>
                          <option value="wuse2">Wuse II Central</option>
                          <option value="asokoro">Asokoro Zone</option>
                        </>
                      )}
                      {selectedState === 'rivers' && (
                        <>
                          <option value="ph-old-gra">Old GRA, Port Harcourt</option>
                          <option value="trans-amadi">Trans-Amadi Industrial</option>
                        </>
                      )}
                      {selectedState === 'oyo' && (
                        <>
                          <option value="bodija">Bodija, Ibadan</option>
                          <option value="oluyole">Oluyole Estate</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      3. Neighborhood / Estate
                    </label>
                    <select
                      value={selectedEstate}
                      onChange={(e) => setSelectedEstate(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl bg-[#f3f3f5] text-sm text-[#1a1c1d] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#ED101A] cursor-pointer border border-[#F0F0F0]"
                    >
                      <option value="lekki-1">Lekki Phase 1 (Core Fiber Ready)</option>
                      <option value="ikoyi">Ikoyi Southwest & Banana Island</option>
                      <option value="chevron">Chevron Drive / Orchid Road</option>
                      <option value="sangotedo">Sangotedo Sub-Cluster (Rollout Active)</option>
                      <option value="epe">Epe Corridor (Survey Pending)</option>
                    </select>
                  </div>
                </div>

                {/* Freeform Search Bar */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Or search by exact street address, gated estate, or landmark
                  </label>
                  <div className="relative flex items-center">
                    <MapPin className="absolute left-4 text-[#ED101A] w-5 h-5" />
                    <input
                      type="text"
                      value={addressQuery}
                      onChange={(e) => setAddressQuery(e.target.value)}
                      placeholder="e.g. Admiralty Way, Lekki Phase 1, or Plot 4B Victoria Island"
                      className="w-full h-14 pl-12 pr-40 rounded-full bg-[#f3f3f5] text-sm text-[#1a1c1d] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#ED101A] border border-[#F0F0F0] shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyLine}
                      className="absolute right-2 px-6 py-2.5 rounded-full bg-[#ED101A] text-white text-xs font-semibold hover:bg-[#bb000e] transition-transform duration-150 hover:scale-[1.02] flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Verify Line</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Popular Metro Quick-Picks */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
                  <span className="text-xs text-[#7A7A7A] shrink-0">Popular metro clusters:</span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuickFill('Admiralty Way, Lekki Phase 1', 'available')}
                      className="px-3 py-1.5 rounded-full bg-[#f3f3f5] hover:bg-[#FFF0F1] hover:text-[#ED101A] text-[#1a1c1d] text-xs transition-colors"
                    >
                      Lekki Phase 1
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickFill('Banana Island, Ikoyi', 'available')}
                      className="px-3 py-1.5 rounded-full bg-[#f3f3f5] hover:bg-[#FFF0F1] hover:text-[#ED101A] text-[#1a1c1d] text-xs transition-colors"
                    >
                      Banana Island, Ikoyi
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickFill('Ikeja GRA, Lagos', 'available')}
                      className="px-3 py-1.5 rounded-full bg-[#f3f3f5] hover:bg-[#FFF0F1] hover:text-[#ED101A] text-[#1a1c1d] text-xs transition-colors"
                    >
                      Ikeja GRA
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickFill('Maitama District, Abuja', 'planned')}
                      className="px-3 py-1.5 rounded-full bg-[#f3f3f5] hover:bg-[#FFF0F1] hover:text-[#ED101A] text-[#1a1c1d] text-xs transition-colors"
                    >
                      Maitama, Abuja
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickFill('Trans-Amadi Industrial, PH', 'pending')}
                      className="px-3 py-1.5 rounded-full bg-[#f3f3f5] hover:bg-[#FFF0F1] hover:text-[#ED101A] text-[#1a1c1d] text-xs transition-colors"
                    >
                      Trans-Amadi, PH
                    </button>
                  </div>
                </div>

                {/* Metro Signal Radar Ticker */}
                <div className="p-6 rounded-2xl bg-[#f9f9fb] border border-[#F0F0F0] grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#008653] shadow-sm">
                      <Router className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-semibold tracking-wider text-gray-500 block">
                        Active OLT Cabinets
                      </span>
                      <span className="text-sm font-bold text-[#1a1c1d]">1,482 Active Nodes</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#ED101A] shadow-sm">
                      <Cable className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-semibold tracking-wider text-gray-500 block">
                        Optical Fiber Laid
                      </span>
                      <span className="text-sm font-bold text-[#1a1c1d]">14,200+ Kilometers</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-600 shadow-sm">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-semibold tracking-wider text-gray-500 block">
                        Mean Turn-on Latency
                      </span>
                      <span className="text-sm font-bold text-[#1a1c1d]">36-48 Hours</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STAGE 2: COVERAGE RESULT STATES (3 MODES) */}
          {/* ========================================================================= */}
          {currentStage === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase tracking-wider text-[#ED101A] font-semibold">
                    Stage 2 of 5
                  </span>
                  <h2 className="text-2xl font-bold text-[#1a1c1d] mt-1">
                    Network Feasibility Findings
                  </h2>
                  <p className="text-sm text-[#5f5e60]">
                    Verified query for: <strong>{addressQuery}</strong>
                  </p>
                </div>

                {/* State Mode Switcher for Testing/Reviewing */}
                <div className="inline-flex p-1 rounded-full bg-[#f3f3f5] border border-[#F0F0F0]">
                  <button
                    type="button"
                    onClick={() => setResultState('available')}
                    className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                      resultState === 'available'
                        ? 'bg-white text-[#008653] shadow-sm'
                        : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    State A: Available
                  </button>
                  <button
                    type="button"
                    onClick={() => setResultState('planned')}
                    className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                      resultState === 'planned'
                        ? 'bg-white text-amber-600 shadow-sm'
                        : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    State B: Rollout Planned
                  </button>
                  <button
                    type="button"
                    onClick={() => setResultState('pending')}
                    className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                      resultState === 'pending'
                        ? 'bg-white text-gray-800 shadow-sm'
                        : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    State C: Pending Survey
                  </button>
                </div>
              </div>

              {/* STATE A: AVAILABLE */}
              {resultState === 'available' && (
                <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-[#F0F0F0] relative overflow-hidden">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-8">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-[#008653]/10 flex items-center justify-center shrink-0 text-[#008653]">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#00D084] animate-pulse" />
                          <span className="text-xs font-bold uppercase tracking-wider text-[#008653]">
                            Full Coverage Live
                          </span>
                        </div>
                        <h3 className="text-2xl font-bold text-[#1a1c1d]">
                          Great news! Ikonectt Ultra-Fiber is ready at your address.
                        </h3>
                        <p className="text-sm text-[#5f5e60] mt-1 leading-relaxed">
                          Your street connects directly to our high-density optical distribution cabinet (FAT-LEK-409) with 99.98% transit SLA.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                      <button
                        type="button"
                        onClick={() => setCurrentStage(3)}
                        className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#ED101A] text-white text-xs font-semibold hover:bg-[#bb000e] transition-all hover:scale-[1.02]"
                      >
                        Select Your Plan
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentStage(4)}
                        className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-[#f3f3f5] text-[#1a1c1d] text-xs font-semibold hover:bg-[#e8e8ea] transition-colors"
                      >
                        Request Technician
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-[#F0F0F0]">
                    <div className="p-4 rounded-xl bg-[#f9f9fb] border border-[#F0F0F0]">
                      <span className="text-xs text-gray-500 block">Physical Technology</span>
                      <span className="text-base font-bold text-[#1a1c1d] mt-1 block">
                        FTTH (Glass Optic)
                      </span>
                      <span className="text-[11px] text-gray-500">Dedicated Core Fiber</span>
                    </div>
                    <div className="p-4 rounded-xl bg-[#f9f9fb] border border-[#F0F0F0]">
                      <span className="text-xs text-gray-500 block">Guaranteed Speeds</span>
                      <span className="text-base font-bold text-[#1a1c1d] mt-1 block">
                        Up to 1,000 Mbps
                      </span>
                      <span className="text-[11px] text-gray-500">Symmetrical Down/Up</span>
                    </div>
                    <div className="p-4 rounded-xl bg-[#f9f9fb] border border-[#F0F0F0]">
                      <span className="text-xs text-gray-500 block">Installation SLA</span>
                      <span className="text-base font-bold text-[#008653] mt-1 block">
                        &lt; 48 Hours
                      </span>
                      <span className="text-[11px] text-gray-500">Fast-track activation</span>
                    </div>
                    <div className="p-4 rounded-xl bg-[#f9f9fb] border border-[#F0F0F0]">
                      <span className="text-xs text-gray-500 block">Hardware Included</span>
                      <span className="text-base font-bold text-[#1a1c1d] mt-1 block">
                        Wi-Fi 6 ONT
                      </span>
                      <span className="text-[11px] text-gray-500">Dual-Band Gigabit Pod</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STATE B: PLANNED */}
              {resultState === 'planned' && (
                <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-[#F0F0F0] relative overflow-hidden">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-8">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-600">
                        <Clock className="w-8 h-8" />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                          <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                            Civil Fiber Trenching Underway
                          </span>
                        </div>
                        <h3 className="text-2xl font-bold text-[#1a1c1d]">
                          Fiber rollout is actively progressing in your neighborhood.
                        </h3>
                        <p className="text-sm text-[#5f5e60] mt-1 leading-relaxed">
                          Target Live Date: <strong>Q3 2025</strong>. Micro-trenching and duct pulling currently passing through your boundary corridor.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentStage(4)}
                      className="px-8 py-3.5 rounded-full bg-[#ED101A] text-white text-xs font-semibold hover:bg-[#bb000e] transition-all hover:scale-[1.02] shrink-0"
                    >
                      Pre-Register for Early Turn-on
                    </button>
                  </div>

                  <div className="p-6 rounded-2xl bg-[#f9f9fb] border border-[#F0F0F0] flex flex-col gap-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-[#1a1c1d]">
                        Current Project Phase: Feeder Duct Laying
                      </span>
                      <span className="font-mono-stat text-xs font-bold text-[#ED101A]">
                        68% Complete
                      </span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-gray-200 overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full w-[68%]" />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs text-gray-500 pt-2">
                      <div>Phase 1: Right of Way (Done)</div>
                      <div className="text-[#1a1c1d] font-semibold">Phase 2: Duct Pull (Active)</div>
                      <div>Phase 3: Splicing & Lighting</div>
                    </div>
                  </div>
                </div>
              )}

              {/* STATE C: PENDING */}
              {resultState === 'pending' && (
                <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-[#F0F0F0] relative overflow-hidden">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-8">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center shrink-0 text-gray-600">
                        <MapPin className="w-8 h-8" />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-gray-400" />
                          <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
                            Address Outside Current Active Ring
                          </span>
                        </div>
                        <h3 className="text-2xl font-bold text-[#1a1c1d]">
                          Your address is not yet mapped on our direct aerial line.
                        </h3>
                        <p className="text-sm text-[#5f5e60] mt-1 leading-relaxed">
                          Our nearest distribution ring is 1.4km away. Request an on-ground site feasibility survey or register community demand to prioritize expansion.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentStage(4)}
                      className="px-8 py-3.5 rounded-full bg-[#ED101A] text-white text-xs font-semibold hover:bg-[#bb000e] transition-all hover:scale-[1.02] shrink-0"
                    >
                      Request Feasibility Survey
                    </button>
                  </div>

                  <div className="p-6 rounded-2xl bg-[#f9f9fb] border border-[#F0F0F0] flex items-center gap-4">
                    <Users className="w-8 h-8 text-gray-500 shrink-0" />
                    <div>
                      <h4 className="text-base font-bold text-[#1a1c1d]">
                        Community Demand Aggregator
                      </h4>
                      <p className="text-sm text-[#5f5e60]">
                        If 15 or more residents or businesses in your estate register interest, Ikonectt deploys a rapid dedicated distribution line within 21 days.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* STAGE 3: ACTION ROUTING / PLAN SELECTION */}
          {/* ========================================================================= */}
          {currentStage === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase tracking-wider text-[#ED101A] font-semibold">
                    Stage 3 of 5
                  </span>
                  <h2 className="text-2xl font-bold text-[#1a1c1d] mt-1">
                    Choose your verified speed profile
                  </h2>
                  <p className="text-sm text-[#5f5e60]">
                    All plans in {addressQuery} qualify for 100% optical uncapped throughput.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    name: 'Home Lite',
                    badge: 'Entry Tier',
                    speed: 50,
                    price: '₦25,000',
                    features: ['Unlimited unthrottled data', '1080p HD streaming', 'Standard Wi-Fi router'],
                  },
                  {
                    name: 'Home Plus',
                    badge: 'Most Popular',
                    speed: 100,
                    price: '₦35,000',
                    popular: true,
                    features: [
                      'Unlimited unthrottled data',
                      'Smooth 4K HDR Multi-stream',
                      'Dual-Band Wi-Fi 6 Included',
                      'Priority weekend dispatch',
                    ],
                  },
                  {
                    name: 'Home Pro',
                    badge: 'Creator & Gaming',
                    speed: 200,
                    price: '₦50,000',
                    features: [
                      'Symmetrical Gigabit Uplink',
                      'Ultra-low gaming latency',
                      'Free Wi-Fi 6 Mesh Pod',
                      '24/7 dedicated support',
                    ],
                  },
                  {
                    name: 'Home Ultra',
                    badge: 'Max Performance',
                    speed: 500,
                    price: '₦80,000',
                    features: [
                      'Static IPv4 Address Option',
                      'Dedicated VIP NOC queue',
                      'Whole-Home Tri-Band Mesh',
                      'Emergency field priority',
                    ],
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`bg-white rounded-2xl p-6 shadow-sm flex flex-col justify-between border ${
                      item.popular
                        ? 'border-[#ED101A] ring-2 ring-[#ED101A] bg-[#FFF0F1]/20'
                        : 'border-[#F0F0F0]'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">
                        {item.badge}
                      </span>
                      <h3 className="text-xl font-bold text-[#1a1c1d] mt-1">{item.name}</h3>

                      <div className="my-4">
                        <span className="text-4xl font-mono-stat font-bold text-[#1a1c1d]">
                          {item.speed}
                        </span>
                        <span className="text-xs text-gray-500 uppercase font-semibold ml-1">
                          Mbps
                        </span>
                        <div className="text-[#ED101A] font-bold text-xl mt-1">
                          {item.price}
                          <span className="text-xs font-normal text-gray-500">/mo</span>
                        </div>
                      </div>

                      <ul className="space-y-2.5 pt-4 text-xs text-[#5f5e60] border-t border-[#F0F0F0]">
                        {item.features.map((f, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-[#ED101A] shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      type="button"
                      onClick={() => handlePlanSelect(`${item.name} ${item.speed} Mbps (${item.price}/mo)`)}
                      className={`w-full mt-6 py-3 rounded-full text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer ${
                        item.popular
                          ? 'bg-[#ED101A] text-white hover:bg-[#bb000e]'
                          : 'bg-[#f3f3f5] text-[#1a1c1d] hover:bg-[#e8e8ea]'
                      }`}
                    >
                      Select {item.name}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STAGE 4: SITE SURVEY & SCHEDULING FORM */}
          {/* ========================================================================= */}
          {currentStage === 4 && (
            <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-[#F0F0F0] animate-in fade-in duration-200">
              <div className="max-w-3xl mx-auto flex flex-col gap-8">
                <div>
                  <span className="text-xs uppercase tracking-wider text-[#ED101A] font-semibold">
                    Stage 4 of 5
                  </span>
                  <h2 className="text-2xl font-bold text-[#1a1c1d] mt-1">
                    Site Survey & Installation Scheduling
                  </h2>
                  <p className="text-sm text-[#5f5e60]">
                    Our optical field technician inspects line-of-sight drop cables and schedules your 48-hour turn-on.
                  </p>
                </div>

                {/* Selected Plan Summary Pill */}
                <div className="p-4 rounded-2xl bg-[#f9f9fb] border border-[#F0F0F0] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FFF0F1] flex items-center justify-center text-[#ED101A]">
                      <Router className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 block">
                        Selected Package
                      </span>
                      <span className="text-sm font-bold text-[#1a1c1d]">{selectedPlan}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStage(3)}
                    className="text-xs font-semibold text-[#ED101A] hover:underline"
                  >
                    Change Plan
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSurveySubmit} className="flex flex-col gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Full Name / Primary Subscriber <span className="text-[#ED101A]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={surveyData.fullName}
                        onChange={(e) => setSurveyData({ ...surveyData, fullName: e.target.value })}
                        placeholder="e.g. Babatunde Adeyemi"
                        className="w-full h-12 px-4 rounded-xl bg-[#f3f3f5] text-sm text-[#1a1c1d] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#ED101A] border border-[#F0F0F0]"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Mobile Telephone (SMS Tracking) <span className="text-[#ED101A]">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={surveyData.phone}
                        onChange={(e) => setSurveyData({ ...surveyData, phone: e.target.value })}
                        placeholder="+234 803 000 0000"
                        className="w-full h-12 px-4 rounded-xl bg-[#f3f3f5] text-sm text-[#1a1c1d] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#ED101A] border border-[#F0F0F0]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Corporate or Personal Email <span className="text-[#ED101A]">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={surveyData.email}
                        onChange={(e) => setSurveyData({ ...surveyData, email: e.target.value })}
                        placeholder="babatunde@domain.com"
                        className="w-full h-12 px-4 rounded-xl bg-[#f3f3f5] text-sm text-[#1a1c1d] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#ED101A] border border-[#F0F0F0]"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Premises Category
                      </label>
                      <select
                        value={surveyData.premisesType}
                        onChange={(e) => setSurveyData({ ...surveyData, premisesType: e.target.value })}
                        className="w-full h-12 px-4 rounded-xl bg-[#f3f3f5] text-sm text-[#1a1c1d] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#ED101A] border border-[#F0F0F0]"
                      >
                        <option value="apartment">Residential Apartment / Flat</option>
                        <option value="villa">Standalone Duplex / Villa</option>
                        <option value="commercial">Commercial SME Office</option>
                        <option value="multi-tenant">Multi-Tenant Corporate Compound</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Exact Street Address / Flat or Unit Number <span className="text-[#ED101A]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={surveyData.fullAddress}
                      onChange={(e) => setSurveyData({ ...surveyData, fullAddress: e.target.value })}
                      placeholder="Plot 14, Block 2B, Admiralty Way, Lekki Phase 1"
                      className="w-full h-12 px-4 rounded-xl bg-[#f3f3f5] text-sm text-[#1a1c1d] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#ED101A] border border-[#F0F0F0]"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Special Engineering or Estate Gate Access Notes (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={surveyData.notes}
                      onChange={(e) => setSurveyData({ ...surveyData, notes: e.target.value })}
                      placeholder="e.g. Please call security gate before arrival; duct conduit pre-installed in utility riser."
                      className="w-full p-4 rounded-xl bg-[#f3f3f5] text-sm text-[#1a1c1d] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#ED101A] border border-[#F0F0F0] resize-none"
                    />
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <span className="text-xs text-gray-500 flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-[#008653]" />
                      Encrypted transmission directly to Ikonectt Field NOC
                    </span>
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-10 py-3.5 rounded-full bg-[#ED101A] text-white text-xs font-semibold hover:bg-[#bb000e] transition-all hover:scale-[1.02] cursor-pointer"
                    >
                      Confirm & Generate Ticket
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STAGE 5: CONFIRMATION & TICKET RECEIPT */}
          {/* ========================================================================= */}
          {currentStage === 5 && (
            <div className="bg-white rounded-3xl p-6 sm:p-12 shadow-sm border border-[#F0F0F0] animate-in fade-in duration-200">
              <div className="max-w-2xl mx-auto flex flex-col items-center text-center">
                {/* Animated Beacon Icon */}
                <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-[#FFF0F1] animate-ping" />
                  <div className="relative w-16 h-16 rounded-full bg-[#ED101A] text-white flex items-center justify-center">
                    <Check className="w-8 h-8" />
                  </div>
                </div>

                <span className="text-xs uppercase tracking-wider text-[#ED101A] font-bold mb-2">
                  Ticket Successfully Dispatched
                </span>
                <h2 className="text-3xl font-bold text-[#1a1c1d] mb-2">
                  Coverage Feasibility Booked!
                </h2>
                <p className="text-sm text-[#5f5e60] max-w-lg mb-8">
                  We have allocated reference ticket{' '}
                  <span className="font-mono-stat font-bold text-[#1a1c1d] bg-[#f3f3f5] px-2 py-0.5 rounded">
                    {ticketId}
                  </span>{' '}
                  to <strong>{surveyData.fullAddress}</strong>. An optical drop surveyor is reviewing your route.
                </p>

                {/* Diagnostic Timeline Flow */}
                <div className="w-full p-6 rounded-2xl bg-[#f9f9fb] border border-[#F0F0F0] text-left mb-8 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                    Deployment Next Steps
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#008653] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        1
                      </div>
                      <div>
                        <h5 className="text-sm font-semibold text-[#1a1c1d]">
                          SMS Dispatch Notification (Immediate)
                        </h5>
                        <p className="text-xs text-[#5f5e60]">
                          A confirmation SMS and surveyor badge ID has been triggered to {surveyData.phone}.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-800 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        2
                      </div>
                      <div>
                        <h5 className="text-sm font-semibold text-[#1a1c1d]">
                          Optical Line Attenuation Audit (within 12 Hours)
                        </h5>
                        <p className="text-xs text-[#5f5e60]">
                          Engineering validates optical power levels (-18dBm to -24dBm target) from your nearest street terminal.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-800 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        3
                      </div>
                      <div>
                        <h5 className="text-sm font-semibold text-[#1a1c1d]">
                          Wi-Fi 6 Hardware Turn-on (within 48 Hours)
                        </h5>
                        <p className="text-xs text-[#5f5e60]">
                          Internal fiber drop termination, router commissioning, and speed sign-off.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStage(1)}
                    className="px-8 py-3 rounded-full bg-[#f3f3f5] text-[#1a1c1d] text-xs font-semibold hover:bg-[#e8e8ea] transition-colors"
                  >
                    Check Another Location
                  </button>
                  <button
                    type="button"
                    onClick={onOpenMyIkonectt}
                    className="px-8 py-3 rounded-full bg-[#ED101A] text-white text-xs font-semibold hover:bg-[#bb000e] transition-all hover:scale-[1.02]"
                  >
                    Open My Ikonectt Portal
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* SECTION: EDITORIAL INFRASTRUCTURE SHOWCASE */}
      <section className="w-full bg-[#f9f9fb] py-20 border-t border-[#F0F0F0]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Editorial Narrative */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <span className="text-xs uppercase tracking-wider text-[#ED101A] font-semibold">
                Tier-1 Optical Backbone
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1a1c1d]">
                How Ikonectt guarantees zero congestion across Nigeria.
              </h2>
              <p className="text-[17px] text-[#5f5e60] leading-relaxed">
                Unlike legacy wireless and bonded copper networks, Ikonectt deploys genuine 100% G.652.D singlemode optical glass fiber straight into your building.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <Cable className="w-5 h-5 text-[#ED101A] shrink-0 mt-1" />
                  <div>
                    <h4 className="text-sm font-bold text-[#1a1c1d]">Dual Subsea Cable Diversity</h4>
                    <p className="text-xs text-[#5f5e60]">
                      Direct cross-connects to Lagos Equiano and WACS landings bypass terrestrial congestion.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Activity className="w-5 h-5 text-[#ED101A] shrink-0 mt-1" />
                  <div>
                    <h4 className="text-sm font-bold text-[#1a1c1d]">Local Edge Caching</h4>
                    <p className="text-xs text-[#5f5e60]">
                      On-net CDN nodes for Netflix, YouTube, Meta, and Cloudflare guarantee ultra-crisp latency under 4ms.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Visual Showcase Mosaic */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-6">
                <div className="rounded-2xl overflow-hidden bg-white shadow-sm h-64 relative group border border-[#F0F0F0]">
                  <img
                    src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=800&q=80"
                    alt="Nigerian engineer in Lagos server room"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <span className="text-[10px] uppercase tracking-wider text-[#00D084] font-bold">
                      24/7 Monitoring
                    </span>
                    <p className="text-sm font-semibold">Lekki Network Operations Center</p>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-[#272729] text-white shadow-sm flex flex-col justify-between border border-[#2A2A2C]">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-[#FF5961] font-semibold">
                      Real-Time Core SLA
                    </span>
                    <h3 className="text-lg font-bold mt-1">Optical Ring Attenuation</h3>
                  </div>
                  <div className="my-4">
                    <span className="text-4xl font-mono-stat text-[#00D084] font-bold">-19.4</span>
                    <span className="text-xs text-gray-400 uppercase ml-2">dBm Optimal</span>
                  </div>
                  <p className="text-xs text-gray-300">
                    Active laser transmission telemetry across Victoria Island - Lekki Express fiber highway.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-6 sm:mt-8">
                <div className="p-6 rounded-2xl bg-white shadow-sm flex flex-col justify-between border border-[#F0F0F0]">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-[#ED101A] font-semibold">
                      Expansion Metric
                    </span>
                    <h3 className="text-lg font-bold text-[#1a1c1d] mt-1">Active Metro Fiber</h3>
                  </div>
                  <div className="my-4">
                    <span className="text-4xl font-mono-stat text-[#ED101A] font-bold">14,200+</span>
                    <span className="text-xs text-gray-500 uppercase ml-2">km</span>
                  </div>
                  <p className="text-xs text-[#5f5e60]">
                    Expanding across Lagos, Abuja FCT, Rivers, and Oyo with active civil engineering deployments.
                  </p>
                </div>

                <div className="rounded-2xl overflow-hidden bg-white shadow-sm h-64 relative group border border-[#F0F0F0]">
                  <img
                    src="https://images.unsplash.com/photo-1609234656388-0ff363383899?auto=format&fit=crop&w=800&q=80"
                    alt="Nigerian family using fiber internet happily"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <span className="text-[10px] uppercase tracking-wider text-[#FF5961] font-bold">
                      Residential Glass Fiber
                    </span>
                    <p className="text-sm font-semibold">Uncapped Symmetrical Gigabit</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
