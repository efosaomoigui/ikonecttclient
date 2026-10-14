import React, { useState } from 'react';
import { ASSETS } from '../../data/assets';
import { BUSINESS_PLANS, Plan } from '../../data/telecomData';
import {
  ShieldCheck,
  Server,
  Building2,
  PhoneCall,
  Check,
  ArrowRight,
  Zap,
  Activity,
  Sliders,
  CheckCircle2,
} from 'lucide-react';

interface BusinessLandingProps {
  onSelectPlan: (plan: Plan) => void;
  onNavigateCoverage: () => void;
}

export const BusinessLanding: React.FC<BusinessLandingProps> = ({
  onSelectPlan,
  onNavigateCoverage,
}) => {
  const [employees, setEmployees] = useState(25);
  const [hasVoip, setHasVoip] = useState(true);
  const [hasCloudBackups, setHasCloudBackups] = useState(true);
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);

  // Bandwidth calculation formula
  const recommendedMbps = Math.max(
    50,
    Math.round(employees * 4 + (hasVoip ? 30 : 0) + (hasCloudBackups ? 60 : 0))
  );

  return (
    <div className="w-full">
      {/* Enterprise Hero Banner */}
      <section className="bg-[#18181b] text-white py-16 lg:py-24 border-b border-[#272729]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF616A]">
                Enterprise Optical Infrastructure
              </span>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Dedicated business fibre with a contractual 99.9% uptime SLA.
              </h1>
              <p className="text-base sm:text-lg text-[#cccccc] leading-relaxed max-w-xl">
                Built from the ground up for Nigerian enterprises where connectivity is revenue-critical. Uncontended optical pipes, redundant ring failover, and 4-hour MTTR emergency engineering.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href="#estimator"
                  className="px-7 py-3 text-sm font-semibold text-white bg-[#ED101A] hover:bg-[#D50913] rounded-full transition-colors flex items-center gap-2"
                >
                  <span>Estimate Enterprise Bandwidth</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <button
                  onClick={onNavigateCoverage}
                  className="px-6 py-3 text-sm font-medium text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-colors"
                >
                  Check Commercial Zone Coverage
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/10 aspect-[4/3]">
                <img
                  src={ASSETS.businessWorkspace}
                  alt="Modern Lagos enterprise workplace using Ikonectt"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Enterprise Bandwidth Estimator */}
      <section id="estimator" className="py-16 bg-[#fafafc] border-b border-[#e0e0e0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-white border border-[#e0e0e0] grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#ED101A]">
                  Enterprise Capacity Sizing
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#1d1d1f] mt-1">
                  Bandwidth Estimator for Teams & Offices
                </h2>
                <p className="text-xs text-[#6e6e73] mt-1">
                  Calculate recommended symmetrical optical throughput based on your headcount and infrastructure requirements:
                </p>
              </div>

              {/* Slider for employees */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-semibold text-[#1d1d1f]">
                  <span>Office Team Size (Workstations / Users):</span>
                  <span className="text-lg font-bold text-[#ED101A]">{employees} Workstations</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="150"
                  step="5"
                  value={employees}
                  onChange={(e) => setEmployees(Number(e.target.value))}
                  className="w-full accent-[#ED101A] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-[#7a7a7a]">
                  <span>5 Users (Boutique)</span>
                  <span>50 Users (Mid-Market)</span>
                  <span>150+ Users (Enterprise Hub)</span>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-[#e8e8ed] bg-[#fafafc] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasVoip}
                    onChange={(e) => setHasVoip(e.target.checked)}
                    className="w-4 h-4 text-[#ED101A] rounded"
                  />
                  <span className="text-xs font-medium text-[#1d1d1f]">
                    SIP Trunking & High-Density VoIP
                  </span>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl border border-[#e8e8ed] bg-[#fafafc] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasCloudBackups}
                    onChange={(e) => setHasCloudBackups(e.target.checked)}
                    className="w-4 h-4 text-[#ED101A] rounded"
                  />
                  <span className="text-xs font-medium text-[#1d1d1f]">
                    Heavy Continuous Cloud Sync & Backups
                  </span>
                </label>
              </div>
            </div>

            {/* Result Box */}
            <div className="lg:col-span-5 p-8 rounded-3xl bg-[#18181b] text-white space-y-4 shadow-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF616A]">
                Recommended Enterprise Pipe
              </span>
              <div className="text-4xl font-extrabold text-white">
                ~{recommendedMbps}{' '}
                <span className="text-lg font-normal text-[#a0a0a5]">Mbps Symmetrical</span>
              </div>
              <p className="text-xs text-[#cccccc] leading-relaxed">
                Dedicated 1:1 contention optical circuit with static IP subnet and guaranteed 99.9% uptime SLA.
              </p>
              <div className="pt-2 border-t border-white/10 space-y-2 text-xs text-[#a0a0a5]">
                <div className="flex justify-between">
                  <span>Target SLA MTTR:</span>
                  <span className="font-semibold text-white">Sub-4 Hours</span>
                </div>
                <div className="flex justify-between">
                  <span>Failover Routing:</span>
                  <span className="font-semibold text-emerald-400">Dual Optical Ring</span>
                </div>
              </div>
              <button
                onClick={() => {
                  const targetPlan =
                    recommendedMbps <= 120
                      ? BUSINESS_PLANS[0]
                      : recommendedMbps <= 300
                      ? BUSINESS_PLANS[1]
                      : BUSINESS_PLANS[2];
                  onSelectPlan(targetPlan);
                }}
                className="w-full py-3 px-4 rounded-full bg-[#ED101A] hover:bg-[#D50913] text-white text-xs font-bold transition-colors mt-2"
              >
                Request Consultation for this Capacity &rarr;
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Business Plan Cards */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#ED101A]">
              Corporate Plans
            </span>
            <h2 className="text-3xl font-extrabold text-[#1d1d1f] tracking-tight">
              Enterprise & SME Connectivity Tiers
            </h2>
            <p className="text-sm text-[#6e6e73]">
              Transparent pricing with contractual SLA uptime guarantees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {BUSINESS_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`p-8 rounded-3xl bg-[#fafafc] border transition-all duration-200 flex flex-col justify-between ${
                  plan.popular
                    ? 'border-[#ED101A] ring-2 ring-[#ED101A] bg-white shadow-xl relative'
                    : 'border-[#e0e0e0] hover:border-[#1d1d1f]'
                }`}
              >
                <div>
                  {plan.popular && (
                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-white bg-[#ED101A] px-2.5 py-0.5 rounded-full mb-3">
                      Recommended for Mid-Market
                    </span>
                  )}
                  <h3 className="text-xl font-bold text-[#1d1d1f]">{plan.name}</h3>
                  <div className="text-3xl font-extrabold text-[#ED101A] my-2">{plan.speed}</div>
                  <p className="text-xs text-[#6e6e73] leading-relaxed min-h-[36px]">{plan.tagline}</p>

                  <div className="my-6 pt-4 border-t border-[#e8e8ed] space-y-3">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-[#1d1d1f]">
                        <Check className="w-4 h-4 text-[#ED101A] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#e8e8ed]">
                  <div className="text-2xl font-bold text-[#1d1d1f] mb-4">
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
                    Select Business Solution &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise SLA & Infrastructure Pillars */}
      <section className="py-20 bg-[#fafafc] border-t border-[#e0e0e0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#ED101A]">
              Infrastructure Standards
            </span>
            <h2 className="text-3xl font-extrabold text-[#1d1d1f] tracking-tight mt-1">
              Engineered for zero downtime
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-white border border-[#e0e0e0] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#fafafc] flex items-center justify-center text-[#ED101A] border border-[#e8e8ed]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#1d1d1f]">Contractual 99.9% Uptime</h3>
              <p className="text-xs text-[#6e6e73] leading-relaxed">
                If our core optical grid fails to deliver promised monthly availability, automated billing credits are applied to your enterprise invoice.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-[#e0e0e0] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#fafafc] flex items-center justify-center text-[#ED101A] border border-[#e8e8ed]">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#1d1d1f]">4-Hour MTTR Priority</h3>
              <p className="text-xs text-[#6e6e73] leading-relaxed">
                Dedicated field technicians stationed throughout Victoria Island, Lekki, and Ikeja with maximum 4-hour mean time to repair.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-[#e0e0e0] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#fafafc] flex items-center justify-center text-[#ED101A] border border-[#e8e8ed]">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#1d1d1f]">Multi-Site Interconnect</h3>
              <p className="text-xs text-[#6e6e73] leading-relaxed">
                Connect your headquarters in Lagos with regional offices in Abuja and Port Harcourt through private, encrypted point-to-point circuits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bespoke Quote Contact Form */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-[#fafafc] border border-[#e0e0e0]">
            {quoteSubmitted ? (
              <div className="text-center py-8 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="text-2xl font-bold text-[#1d1d1f]">Inquiry Received</h3>
                <p className="text-xs text-[#6e6e73] max-w-md mx-auto">
                  Our Senior Enterprise Account Manager will reach out within 2 business hours to schedule an engineering feasibility review.
                </p>
                <button
                  onClick={() => setQuoteSubmitted(false)}
                  className="mt-4 px-6 py-2 rounded-full text-xs font-semibold bg-[#1d1d1f] text-white"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <div>
                <div className="mb-8">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#ED101A]">
                    Bespoke Consultation
                  </span>
                  <h3 className="text-2xl font-bold text-[#1d1d1f] mt-1">
                    Request an Enterprise Feasibility Consultation
                  </h3>
                  <p className="text-xs text-[#6e6e73] mt-1">
                    Speak directly with an Ikonectt enterprise optical solutions architect:
                  </p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setQuoteSubmitted(true);
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#1d1d1f] mb-1">Company Name</label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. Paystack, Kuda, Studio Lagos"
                        className="w-full px-4 py-2.5 rounded-xl border border-[#e0e0e0] text-xs text-[#1d1d1f] focus:outline-none focus:border-[#ED101A]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#1d1d1f] mb-1">Contact Person & Role</label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. Funke Adeleke, Head of IT"
                        className="w-full px-4 py-2.5 rounded-xl border border-[#e0e0e0] text-xs text-[#1d1d1f] focus:outline-none focus:border-[#ED101A]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#1d1d1f] mb-1">Work Email</label>
                      <input
                        required
                        type="email"
                        placeholder="it@company.ng"
                        className="w-full px-4 py-2.5 rounded-xl border border-[#e0e0e0] text-xs text-[#1d1d1f] focus:outline-none focus:border-[#ED101A]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#1d1d1f] mb-1">Phone Number</label>
                      <input
                        required
                        type="tel"
                        placeholder="0802 000 0000"
                        className="w-full px-4 py-2.5 rounded-xl border border-[#e0e0e0] text-xs text-[#1d1d1f] focus:outline-none focus:border-[#ED101A]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1d1d1f] mb-1">Office Location / Street Address</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. 25 Bishop Oluwole Street, Victoria Island, Lagos"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#e0e0e0] text-xs text-[#1d1d1f] focus:outline-none focus:border-[#ED101A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1d1d1f] mb-1">Special Requirements (Optional)</label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Multi-branch interconnection with Abuja branch, dark fiber lease, /28 IPv4 allocation"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#e0e0e0] text-xs text-[#1d1d1f] focus:outline-none focus:border-[#ED101A]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-6 rounded-full text-xs font-bold text-white bg-[#ED101A] hover:bg-[#D50913] transition-colors mt-2"
                  >
                    Submit Enterprise Feasibility Request &rarr;
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
