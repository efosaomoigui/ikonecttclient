import React, { useState } from 'react';
import { PageId } from '../../types';
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Laptop,
  Tv,
  Gamepad2,
  Home,
  Check,
  Router,
} from 'lucide-react';

interface ResidentialPageProps {
  onNavigate: (page: PageId, options?: { plan?: string; address?: string }) => void;
}

export const ResidentialPage: React.FC<ResidentialPageProps> = ({ onNavigate }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [addressInput, setAddressInput] = useState('');
  const [coverageChecked, setCoverageChecked] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const plans = [
    {
      id: 'lite',
      name: 'Home Lite',
      tagline: 'Reliable baseline for smaller homes and daily browsing.',
      speed: 50,
      monthly: '₦25,000',
      annual: '₦250,000',
      popular: false,
      features: [
        'Unlimited & Uncapped Data',
        'Ideal for 1 - 3 Connected Devices',
        'Standard Optical ONT Included',
        '24/7 Chat & Phone Support',
      ],
    },
    {
      id: 'plus',
      name: 'Home Plus',
      tagline: 'The household sweet-spot for simultaneous 4K streams.',
      speed: 100,
      monthly: '₦35,000',
      annual: '₦350,000',
      popular: true,
      features: [
        'Unlimited & Uncapped Data',
        'Handles 4 - 8 Active Family Devices',
        'Wi-Fi 6 Gigabit Router Gateway',
        'Priority Care Line Routing',
      ],
    },
    {
      id: 'pro',
      name: 'Home Pro',
      tagline: 'For content creators, avid gamers, and tech-heavy villas.',
      speed: 200,
      monthly: '₦50,000',
      annual: '₦500,000',
      popular: false,
      features: [
        'Unlimited & Uncapped Data',
        'Supports 10 - 15 Smart Devices',
        'Free Secondary Wi-Fi Mesh Node',
        'Symmetrical Content Upload Speeds',
      ],
    },
    {
      id: 'ultra',
      name: 'Home Ultra',
      tagline: 'Extreme gigabit throughput for large estates and server nodes.',
      speed: 500,
      monthly: '₦80,000',
      annual: '₦800,000',
      popular: false,
      features: [
        'Unlimited Gigabit Fiber Bandwidth',
        'Supports 25+ Smart Appliances',
        'Tri-band Whole-Home Mesh Bundle',
        'Dedicated Enterprise Field Dispatch',
      ],
    },
  ];

  const handleQuickCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (addressInput.trim()) {
      setCoverageChecked(true);
      setTimeout(() => {
        onNavigate('coverage', { address: addressInput });
      }, 900);
    }
  };

  const handleSelectPlan = (planName: string) => {
    onNavigate('coverage', { plan: planName });
  };

  return (
    <div className="flex flex-col w-full">
      {/* HERO SECTION: Ultra-Editorial Split Layout */}
      <section className="relative w-full overflow-hidden bg-white py-16 lg:py-20 border-b border-[#f0f0f0]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Column: Typographic Hierarchy & Actions */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="inline-flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#ED101A] animate-pulse" />
                <span className="text-[12px] uppercase tracking-widest text-[#ED101A] font-semibold">
                  Residential Optical Gigabit
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[56px] lg:leading-[1.07] font-semibold tracking-tight text-[#1d1d1f]">
                Internet That Keeps Your Home{' '}
                <span className="text-[#ED101A]">Connected.</span>
              </h1>

              <p className="text-[17px] text-[#7a7a7a] leading-relaxed max-w-xl">
                Pure optical glass fibre right to your living room. Stream in 4K, work remotely without dropouts, and connect every device in your household with unthrottled bandwidth.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onNavigate('coverage')}
                  className="inline-flex items-center justify-center gap-2 bg-[#ED101A] hover:bg-[#D50913] text-white text-[14px] font-semibold px-[22px] py-[11px] rounded-full transition-all hover:scale-[1.02] cursor-pointer shadow-none"
                >
                  <span>Check Coverage</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  href="#plans-matrix"
                  className="inline-flex items-center justify-center gap-2 bg-[#f5f5f7] hover:bg-[#e0e0e0] text-[#1d1d1f] text-[14px] font-semibold px-[22px] py-[11px] rounded-full transition-colors"
                >
                  <span>Compare Home Plans</span>
                </a>
              </div>

              {/* Proof Metrics Bar */}
              <div className="grid grid-cols-3 gap-4 pt-8 mt-2 border-t border-[#f0f0f0]">
                <div className="flex flex-col">
                  <span className="text-3xl sm:text-4xl font-mono-stat font-bold text-[#1d1d1f]">
                    100%
                  </span>
                  <span className="text-xs sm:text-sm text-[#7a7a7a] mt-1">
                    Uncapped & Pure Fiber
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-3xl sm:text-4xl font-mono-stat font-bold text-[#ED101A]">
                    &lt;10ms
                  </span>
                  <span className="text-xs sm:text-sm text-[#7a7a7a] mt-1">
                    Local Low-Latency Ping
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-3xl sm:text-4xl font-mono-stat font-bold text-[#1d1d1f]">
                    99.9%
                  </span>
                  <span className="text-xs sm:text-sm text-[#7a7a7a] mt-1">
                    Network SLA Uptime
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Editorial Visual Architecture */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden bg-[#f5f5f7] aspect-[4/3] lg:aspect-[5/4] border border-[#f0f0f0]">
                <img
                  src="https://images.unsplash.com/photo-1609234656388-0ff363383899?auto=format&fit=crop&w=1200&q=80"
                  alt="Modern Lagos home with Black Nigerian family connected via ultra-fast fiber"
                  className="w-full h-full object-cover"
                />

                {/* Hardware Floating Pill Overlay */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-xl flex items-center justify-between gap-3 border border-[#f0f0f0]">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#fafafc] border border-[#f0f0f0] flex items-center justify-center shrink-0">
                      <Router className="w-5 h-5 text-[#ED101A]" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[13px] font-semibold text-[#1d1d1f] truncate">
                        Dual-Band Wi-Fi 6 Gateway
                      </div>
                      <div className="text-[11px] text-[#7a7a7a] truncate">
                        Included with every residential plan
                      </div>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#008653]/10 text-[#008653] text-[11px] font-bold uppercase tracking-wider shrink-0">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Connected Living Scenarios */}
      <section className="w-full bg-[#f5f5f7] py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 mb-2">
                <span className="w-6 h-0.5 bg-[#ED101A]" />
                <span className="text-[12px] uppercase tracking-wider text-[#ED101A] font-semibold">
                  Engineered For Living
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1d1d1f]">
                Designed for every room, screen, and family demand.
              </h2>
            </div>
            <p className="text-[15px] text-[#7a7a7a] max-w-sm">
              Unlike legacy copper or wireless LTE networks, Ikonectt pure fiber guarantees symmetrical upload and download without rush-hour slowdowns.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Remote Work */}
            <div className="flex flex-col bg-white rounded-2xl overflow-hidden hover:translate-y-[-4px] transition-transform duration-200 border border-[#f0f0f0]">
              <div className="h-48 overflow-hidden bg-gray-100">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80"
                  alt="Young Black Nigerian professional working remotely on laptop"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 text-[#ED101A] mb-2">
                  <Laptop className="w-4 h-4" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider">Remote Work</span>
                </div>
                <h3 className="text-lg font-bold text-[#1d1d1f] mb-2">Flawless Home Office</h3>
                <p className="text-xs text-[#7a7a7a] leading-relaxed mb-4 flex-1">
                  Zero dropped Zoom meetings, instant Figma canvas syncs, and gigabit file uploads to cloud servers.
                </p>
                <div className="text-xs text-[#7a7a7a] flex items-center gap-2 pt-3 border-t border-[#f0f0f0]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#008653]" />
                  <span>1:1 Symmetrical Upload Speed</span>
                </div>
              </div>
            </div>

            {/* Card 2: 4K Entertainment */}
            <div className="flex flex-col bg-white rounded-2xl overflow-hidden hover:translate-y-[-4px] transition-transform duration-200 border border-[#f0f0f0]">
              <div className="h-48 overflow-hidden bg-gray-100">
                <img
                  src="https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&w=800&q=80"
                  alt="Black woman enjoying streaming entertainment at home"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 text-[#ED101A] mb-2">
                  <Tv className="w-4 h-4" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider">Entertainment</span>
                </div>
                <h3 className="text-lg font-bold text-[#1d1d1f] mb-2">Lag-Free 4K Streaming</h3>
                <p className="text-xs text-[#7a7a7a] leading-relaxed mb-4 flex-1">
                  Stream Netflix, YouTube, Showmax, and live international sports simultaneously without wheel spins or bitrate drops.
                </p>
                <div className="text-xs text-[#7a7a7a] flex items-center gap-2 pt-3 border-t border-[#f0f0f0]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#008653]" />
                  <span>Zero Peering Congestion</span>
                </div>
              </div>
            </div>

            {/* Card 3: Pro Gaming */}
            <div className="flex flex-col bg-white rounded-2xl overflow-hidden hover:translate-y-[-4px] transition-transform duration-200 border border-[#f0f0f0]">
              <div className="h-48 overflow-hidden bg-gray-100">
                <img
                  src="https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80"
                  alt="Young Black gamer playing multiplayer online"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 text-[#ED101A] mb-2">
                  <Gamepad2 className="w-4 h-4" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider">Competitive Gaming</span>
                </div>
                <h3 className="text-lg font-bold text-[#1d1d1f] mb-2">Ultra-Low Latency</h3>
                <p className="text-xs text-[#7a7a7a] leading-relaxed mb-4 flex-1">
                  Direct subsea optic fiber peering to European and South African gaming servers for rock-solid sub-20ms packet delivery.
                </p>
                <div className="text-xs text-[#7a7a7a] flex items-center gap-2 pt-3 border-t border-[#f0f0f0]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#008653]" />
                  <span>Near-Zero Jitter Route</span>
                </div>
              </div>
            </div>

            {/* Card 4: Smart Home */}
            <div className="flex flex-col bg-white rounded-2xl overflow-hidden hover:translate-y-[-4px] transition-transform duration-200 border border-[#f0f0f0]">
              <div className="h-48 overflow-hidden bg-gray-100">
                <img
                  src="https://images.unsplash.com/photo-1516575334481-f85287c2c82d?auto=format&fit=crop&w=800&q=80"
                  alt="Black couple living in modern smart connected home"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 text-[#ED101A] mb-2">
                  <Home className="w-4 h-4" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider">Connected Estate</span>
                </div>
                <h3 className="text-lg font-bold text-[#1d1d1f] mb-2">30+ Devices Seamlessly</h3>
                <p className="text-xs text-[#7a7a7a] leading-relaxed mb-4 flex-1">
                  Supports full smart home automation: CCTV security feeds, smart locks, audio speakers, and 8+ family mobile devices.
                </p>
                <div className="text-xs text-[#7a7a7a] flex items-center gap-2 pt-3 border-t border-[#f0f0f0]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#008653]" />
                  <span>OFDMA Multi-User Wi-Fi 6</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Residential Packages (Pricing Matrix) */}
      <section className="w-full bg-white py-20 border-b border-[#f0f0f0]" id="plans-matrix">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#ED101A]" />
              <span className="text-[12px] uppercase tracking-widest text-[#ED101A] font-semibold">
                Transparent Pricing
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1d1d1f] mb-4">
              Simple, honest fiber plans. No throttling ever.
            </h2>
            <p className="text-[15px] text-[#7a7a7a]">
              All residential internet packages include uncapped data allowances, an optical terminal installation kit, and round-the-clock proactive network monitoring.
            </p>

            {/* Billing Toggle (Pill geometry per design.md) */}
            <div className="flex items-center gap-2 mt-6 p-1.5 bg-[#f5f5f7] rounded-full border border-[#f0f0f0]">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-5 py-2 rounded-full text-[13px] uppercase tracking-wider font-semibold transition-all cursor-pointer ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-[#1d1d1f] shadow-sm'
                    : 'text-[#7a7a7a] hover:text-[#1d1d1f]'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={`px-5 py-2 rounded-full text-[13px] uppercase tracking-wider font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  billingCycle === 'annual'
                    ? 'bg-white text-[#1d1d1f] shadow-sm'
                    : 'text-[#7a7a7a] hover:text-[#1d1d1f]'
                }`}
              >
                <span>Annual</span>
                <span className="text-[#ED101A] font-bold text-[10px] bg-white border border-[#f0f0f0] px-2 py-0.5 rounded-full">
                  2 Months Free
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-[#f5f5f7] rounded-2xl p-8 flex flex-col justify-between transition-all duration-200 relative border ${
                  plan.popular
                    ? 'border-[#ED101A] ring-2 ring-[#ED101A] bg-white shadow-lg lg:-translate-y-2'
                    : 'border-[#f0f0f0] hover:bg-white hover:shadow-sm'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#ED101A] text-white text-[11px] uppercase tracking-widest font-bold px-4 py-1 rounded-full shadow-sm">
                    Most Popular
                  </div>
                )}

                <div>
                  <div className="text-xl font-bold text-[#1d1d1f] mb-1">{plan.name}</div>
                  <p className="text-xs text-[#7a7a7a] mb-6 min-h-[32px]">{plan.tagline}</p>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className={`text-4xl font-mono-stat font-bold ${plan.popular ? 'text-[#ED101A]' : 'text-[#1d1d1f]'}`}>
                        {plan.speed}
                      </span>
                      <span className="text-sm font-medium text-[#7a7a7a]">Mbps</span>
                    </div>

                    <div className="text-2xl font-bold text-[#1d1d1f] mt-2">
                      {billingCycle === 'monthly' ? plan.monthly : plan.annual}
                    </div>
                    <span className="text-xs text-[#7a7a7a]">
                      {billingCycle === 'monthly' ? 'per month' : 'per year (2 months free)'}
                    </span>
                  </div>

                  <ul className="space-y-3 text-xs text-[#1d1d1f] pt-4 border-t border-[#e0e0e0]">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#008653] shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-8">
                  <button
                    onClick={() => handleSelectPlan(`${plan.name} (${plan.speed} Mbps)`)}
                    className={`w-full py-[11px] rounded-full text-center text-[13px] font-semibold transition-all cursor-pointer shadow-none ${
                      plan.popular
                        ? 'bg-[#ED101A] hover:bg-[#D50913] text-white hover:scale-[1.02]'
                        : 'bg-white hover:bg-gray-100 text-[#1d1d1f] border border-[#f0f0f0]'
                    }`}
                  >
                    Get {plan.name}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: 4-Step Installation & Onboarding Flow */}
      <section className="w-full bg-[#f5f5f7] py-20 border-b border-[#f0f0f0]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="max-w-xl mb-12">
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="w-6 h-0.5 bg-[#ED101A]" />
              <span className="text-[12px] uppercase tracking-wider text-[#ED101A] font-semibold">
                Effortless Onboarding
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1d1d1f]">
              From inquiry to gigabit in under 48 hours.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col relative">
              <div className="text-4xl font-mono-stat font-bold text-gray-300 mb-3">01</div>
              <h3 className="text-lg font-bold text-[#1d1d1f] mb-2">Check Coverage</h3>
              <p className="text-xs text-[#7a7a7a] leading-relaxed">
                Enter your street name, estate, or building name in our address validator to verify optical drop availability.
              </p>
            </div>

            <div className="flex flex-col relative">
              <div className="text-4xl font-mono-stat font-bold text-gray-300 mb-3">02</div>
              <h3 className="text-lg font-bold text-[#1d1d1f] mb-2">Select Your Plan</h3>
              <p className="text-xs text-[#7a7a7a] leading-relaxed">
                Choose the speed bracket that matches your family's streaming, smart device count, and remote work setup.
              </p>
            </div>

            <div className="flex flex-col relative">
              <div className="text-4xl font-mono-stat font-bold text-gray-300 mb-3">03</div>
              <h3 className="text-lg font-bold text-[#1d1d1f] mb-2">Fiber Technician Visit</h3>
              <p className="text-xs text-[#7a7a7a] leading-relaxed">
                Our certified field engineers splice the outdoor drop cable and install your internal optical terminal cleanly.
              </p>
            </div>

            <div className="flex flex-col relative">
              <div className="text-4xl font-mono-stat font-bold text-[#008653] mb-3">04</div>
              <h3 className="text-lg font-bold text-[#1d1d1f] mb-2">Instant Gigabit Live</h3>
              <p className="text-xs text-[#7a7a7a] leading-relaxed">
                Connect all household devices to your new Wi-Fi 6 SSID and experience unthrottled, pristine speed immediately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: Residential FAQ Accordion */}
      <section className="w-full bg-white py-20 border-b border-[#f0f0f0]">
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-12">
            <span className="text-[12px] uppercase tracking-widest text-[#ED101A] font-semibold">
              Residential Inquiries
            </span>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1d1d1f] mt-2">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'Is Ikonectt Residential Internet truly unlimited with no data caps?',
                a: 'Yes, absolutely. All Ikonectt residential packages operate on a true unmetered policy. There are zero fair-usage throttle caps, no peak-hour speed rollbacks, and no rollover expirations. You receive full advertised speeds 24/7.',
              },
              {
                q: 'How fast is the installation process once I order?',
                a: 'If your estate or residential street already has active Ikonectt optical distribution boxes, our field team completes line splicing and Wi-Fi configuration within 24 to 48 hours of subscription confirmation.',
              },
              {
                q: 'What hardware is provided during initial installation?',
                a: 'Every setup includes a carrier-grade Optical Network Terminal (ONT) and a dual-band Wi-Fi 6 wireless router capable of handling multi-gigabit wireless transmission with low attenuation.',
              },
              {
                q: 'How does weather or heavy rain affect fiber connectivity?',
                a: 'Unlike microwave or wireless 4G/5G links, optical fiber cables transmit data via pulses of pure light through armored underground glass conduits. Heavy downpours, wind, and thunderstorms have zero impact on your speed and latency.',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-[#f5f5f7] rounded-2xl p-6 border border-[#f0f0f0] transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between text-left cursor-pointer"
                >
                  <span className="text-[16px] font-semibold text-[#1d1d1f]">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-500 transition-transform duration-200 shrink-0 ml-4 ${
                      openFaq === idx ? 'rotate-180 text-[#ED101A]' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="pt-4 text-sm text-[#7a7a7a] leading-relaxed border-t border-[#e0e0e0] mt-4">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: Closing Heroic CTA */}
      <section className="w-full bg-[#f5f5f7] py-20" id="coverage-form">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="relative bg-[#272729] rounded-3xl overflow-hidden p-8 lg:p-16 text-white shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
              <div className="lg:col-span-6 flex flex-col gap-4">
                <div className="inline-flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#008653]" />
                  <span className="text-[12px] uppercase tracking-widest text-[#008653] font-semibold">
                    Immediate Dispatch Ready
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
                  Ready to transform your home internet?
                </h2>
                <p className="text-[16px] text-[#cccccc]">
                  Check if Ikonectt high-speed fiber is ready in your neighborhood today. Enter your residential address or estate name to get started.
                </p>
              </div>

              <div className="lg:col-span-6">
                <form
                  onSubmit={handleQuickCheck}
                  className="bg-[#252527] p-6 sm:p-8 rounded-2xl flex flex-col gap-4 border border-[#2a2a2c]"
                >
                  <label
                    htmlFor="estate-address"
                    className="text-sm font-semibold text-white"
                  >
                    Enter Residence or Estate
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      id="estate-address"
                      type="text"
                      value={addressInput}
                      onChange={(e) => setAddressInput(e.target.value)}
                      placeholder="e.g. Lekki Phase 1, Ikoyi, Victoria Island..."
                      required
                      className="flex-1 px-4 py-3.5 rounded-full text-sm bg-[#2a2a2c] text-white placeholder:text-[#7a7a7a] focus:outline-none focus:ring-2 focus:ring-[#ED101A]"
                    />
                    <button
                      type="submit"
                      className="bg-[#ED101A] hover:bg-[#D50913] text-white text-sm font-semibold px-8 py-3.5 rounded-full transition-all hover:scale-[1.02] shrink-0 cursor-pointer shadow-none"
                    >
                      Check Availability
                    </button>
                  </div>

                  {coverageChecked && (
                    <div className="text-[#008653] text-xs flex items-center gap-2 mt-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        Active high-density fiber drop detected in this sector! Loading feasibility engine...
                      </span>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
