import React, { useState } from 'react';
import { ASSETS } from '../../data/assets';
import { RESIDENTIAL_PLANS, Plan } from '../../data/telecomData';
import {
  Check,
  ArrowRight,
  Wifi,
  Gamepad2,
  Tv,
  Users,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  Zap,
} from 'lucide-react';

interface ResidentialLandingProps {
  onSelectPlan: (plan: Plan) => void;
  onNavigateCoverage: () => void;
}

export const ResidentialLanding: React.FC<ResidentialLandingProps> = ({
  onSelectPlan,
  onNavigateCoverage,
}) => {
  const [deviceCount, setDeviceCount] = useState<number>(6);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Dynamic recommendation based on devices
  const getRecommendedPlan = () => {
    if (deviceCount <= 4) return RESIDENTIAL_PLANS[0]; // 50 Mbps
    if (deviceCount <= 8) return RESIDENTIAL_PLANS[1]; // 100 Mbps
    if (deviceCount <= 14) return RESIDENTIAL_PLANS[2]; // 200 Mbps
    return RESIDENTIAL_PLANS[3]; // 500 Mbps
  };

  const recommended = getRecommendedPlan();

  const faqs = [
    {
      q: 'Is Ikonectt residential broadband really uncapped?',
      a: 'Yes, 100%. We do not implement hidden data caps, daily quotas, or speed throttling. Your connection operates at maximum optical speed 24/7, regardless of how many gigabytes or terabytes your household consumes.',
    },
    {
      q: 'Are upload speeds equal to download speeds?',
      a: 'Yes. Unlike legacy cable or 4G/5G mobile broadband, Ikonectt optical fibre is purely symmetrical. A 100 Mbps plan gives you 100 Mbps download and 100 Mbps upload, ensuring crystal-clear Zoom calls and rapid cloud backups.',
    },
    {
      q: 'What equipment is provided during home installation?',
      a: 'We provide an Optical Network Terminal (ONT) optical gateway with built-in dual-band Wi-Fi 6. Our technician runs the armoured drop fibre into your home and configures whole-home coverage before sign-off.',
    },
    {
      q: 'How long does home installation take after ordering?',
      a: 'Once your address is verified in our coverage checker, installation is completed within 24 to 48 business hours. We confirm optical light-up on-site with a speed certification test.',
    },
  ];

  return (
    <div className="w-full">
      {/* Header Banner */}
      <section className="bg-[#fafafc] border-b border-[#e0e0e0] py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#ED101A]">
              Residential Fibre Broadband
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[#1d1d1f] tracking-tight leading-tight">
              Unmetered fibre broadband for contemporary living.
            </h1>
            <p className="text-base sm:text-lg text-[#6e6e73] leading-relaxed">
              Experience the clarity and power of dedicated optical fibre. Pure symmetrical speeds, zero buffer lag, and whole-home Wi-Fi 6 coverage designed for modern Nigerian households.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Speed Recommendation Tool */}
      <section className="py-12 bg-white border-b border-[#e0e0e0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-10 rounded-3xl bg-[#fafafc] border border-[#e0e0e0] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#ED101A] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                Plan Recommender
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#1d1d1f]">
                Find the ideal speed for your household
              </h2>
              <p className="text-xs text-[#6e6e73]">
                Adjust the number of connected phones, TVs, laptops, and smart gadgets in your home:
              </p>

              {/* Slider */}
              <div className="pt-4 space-y-2">
                <div className="flex justify-between items-center text-sm font-bold text-[#1d1d1f]">
                  <span>Connected Devices:</span>
                  <span className="text-lg text-[#ED101A]">{deviceCount} Devices</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="20"
                  value={deviceCount}
                  onChange={(e) => setDeviceCount(Number(e.target.value))}
                  className="w-full accent-[#ED101A] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-[#7a7a7a]">
                  <span>2 (Apartment / Casual)</span>
                  <span>10 (Family Home)</span>
                  <span>20+ (Smart Villa)</span>
                </div>
              </div>
            </div>

            {/* Recommendation Result Card */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-white border-2 border-[#ED101A] shadow-md space-y-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#ED101A]">
                Recommended for your household:
              </div>
              <div className="flex items-baseline justify-between">
                <h3 className="text-xl font-bold text-[#1d1d1f]">{recommended.name}</h3>
                <span className="text-2xl font-extrabold text-[#ED101A]">{recommended.speed}</span>
              </div>
              <p className="text-xs text-[#6e6e73]">{recommended.tagline}</p>
              <div className="text-lg font-bold text-[#1d1d1f] pt-1">
                {recommended.price}{' '}
                <span className="text-xs font-normal text-[#7a7a7a]">{recommended.billingPeriod}</span>
              </div>
              <button
                onClick={() => onSelectPlan(recommended)}
                className="w-full py-2.5 px-4 rounded-full bg-[#ED101A] hover:bg-[#D50913] text-white text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                <span>Select Recommended Plan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Complete Plan Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-2">
            <h2 className="text-3xl font-extrabold text-[#1d1d1f] tracking-tight">
              All Residential Fibre Plans
            </h2>
            <p className="text-sm text-[#6e6e73]">
              Every plan includes 100% uncapped usage, symmetric speeds, and dual-band Wi-Fi 6 hardware.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {RESIDENTIAL_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`p-6 rounded-3xl bg-[#fafafc] border transition-all duration-200 flex flex-col justify-between ${
                  plan.popular
                    ? 'border-[#ED101A] ring-2 ring-[#ED101A] bg-white shadow-xl relative'
                    : 'border-[#e0e0e0] hover:border-[#1d1d1f]'
                }`}
              >
                <div>
                  {plan.popular && (
                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-white bg-[#ED101A] px-2.5 py-0.5 rounded-full mb-3">
                      Most Popular
                    </span>
                  )}
                  <h3 className="text-lg font-bold text-[#1d1d1f]">{plan.name}</h3>
                  <div className="text-3xl font-extrabold text-[#ED101A] my-2">{plan.speed}</div>
                  <p className="text-xs text-[#6e6e73] leading-relaxed min-h-[36px]">{plan.tagline}</p>

                  <div className="my-5 pt-4 border-t border-[#e8e8ed] space-y-2.5">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-[#1d1d1f]">
                        <Check className="w-3.5 h-3.5 text-[#ED101A] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#e8e8ed]">
                  <div className="text-2xl font-bold text-[#1d1d1f] mb-3">
                    {plan.price}{' '}
                    <span className="text-xs font-normal text-[#7a7a7a]">{plan.billingPeriod}</span>
                  </div>
                  <button
                    onClick={() => onSelectPlan(plan)}
                    className={`w-full py-3 px-4 text-xs font-bold rounded-full transition-colors ${
                      plan.popular
                        ? 'bg-[#ED101A] text-white hover:bg-[#D50913]'
                        : 'bg-[#1d1d1f] text-white hover:bg-black'
                    }`}
                  >
                    Select Plan &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Matrix */}
      <section className="py-16 bg-[#fafafc] border-y border-[#e0e0e0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[#1d1d1f] mb-8 text-center">
            Residential Features Comparison
          </h2>

          <div className="overflow-x-auto bg-white rounded-2xl border border-[#e0e0e0]">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#e0e0e0] bg-[#fafafc] text-[#1d1d1f] font-bold">
                  <th className="p-4">Feature / Specification</th>
                  <th className="p-4">Connect Start</th>
                  <th className="p-4 text-[#ED101A]">Connect Home</th>
                  <th className="p-4">Connect Plus</th>
                  <th className="p-4">Connect Gigabit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f0f0] text-[#1d1d1f]">
                <tr>
                  <td className="p-4 font-semibold">Download Bandwidth</td>
                  <td className="p-4 tabular-nums">50 Mbps</td>
                  <td className="p-4 tabular-nums font-bold text-[#ED101A]">100 Mbps</td>
                  <td className="p-4 tabular-nums">200 Mbps</td>
                  <td className="p-4 tabular-nums font-bold">500 Mbps</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold">Upload Bandwidth</td>
                  <td className="p-4 tabular-nums">50 Mbps (Symmetric)</td>
                  <td className="p-4 tabular-nums font-bold text-[#ED101A]">100 Mbps (Symmetric)</td>
                  <td className="p-4 tabular-nums">200 Mbps (Symmetric)</td>
                  <td className="p-4 tabular-nums font-bold">500 Mbps (Symmetric)</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold">Data Allowance / Cap</td>
                  <td className="p-4 font-semibold text-emerald-600">100% Uncapped</td>
                  <td className="p-4 font-semibold text-emerald-600">100% Uncapped</td>
                  <td className="p-4 font-semibold text-emerald-600">100% Uncapped</td>
                  <td className="p-4 font-semibold text-emerald-600">100% Uncapped</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold">Optical Router Hardware</td>
                  <td className="p-4">Wi-Fi 5 Gigabit Gateway</td>
                  <td className="p-4 font-medium text-[#ED101A]">Wi-Fi 6 Mesh Ready</td>
                  <td className="p-4 font-medium">Wi-Fi 6 Mesh Ready</td>
                  <td className="p-4 font-medium">Tri-Band Wi-Fi 6E Gateway</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold">Installation Standard</td>
                  <td className="p-4">Free Standard Drop</td>
                  <td className="p-4 font-medium text-[#ED101A]">Free Priority Drop</td>
                  <td className="p-4 font-medium">Free Priority Drop</td>
                  <td className="p-4 font-medium">White-Glove VIP Drop</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Residential FAQs */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#ED101A]">
              Frequently Asked Questions
            </span>
            <h2 className="text-3xl font-extrabold text-[#1d1d1f] tracking-tight mt-1">
              Everything you need to know about Ikonectt Fibre
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-[#e0e0e0] overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between font-bold text-sm text-[#1d1d1f] hover:bg-[#fafafc]"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#7a7a7a] transition-transform ${
                      activeFaq === idx ? 'rotate-180 text-[#ED101A]' : ''
                    }`}
                  />
                </button>
                {activeFaq === idx && (
                  <div className="p-5 pt-0 text-xs text-[#6e6e73] leading-relaxed border-t border-[#f0f0f0] bg-[#fafafc]">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 text-center p-8 rounded-3xl bg-[#fafafc] border border-[#e0e0e0] space-y-3">
            <h3 className="text-lg font-bold text-[#1d1d1f]">Ready to connect your residence?</h3>
            <p className="text-xs text-[#6e6e73]">Check street availability or talk directly to our installation engineers.</p>
            <button
              onClick={onNavigateCoverage}
              className="px-6 py-3 bg-[#ED101A] hover:bg-[#D50913] text-white text-xs font-bold rounded-full transition-colors"
            >
              Verify Address Coverage Now
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
