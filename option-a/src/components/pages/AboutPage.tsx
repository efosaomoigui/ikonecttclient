import React from 'react';
import { PageId } from '../../types';
import {
  ShieldCheck,
  Server,
  Cable,
  Globe,
  Award,
  ArrowRight,
  CheckCircle2,
  Activity,
  Layers,
} from 'lucide-react';

interface AboutPageProps {
  onNavigate: (page: PageId) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col w-full bg-[#f9f9fb]">
      {/* Hero */}
      <section className="w-full bg-[#000000] text-white py-16 sm:py-24 border-b border-[#272729]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7">
              <span className="text-xs uppercase tracking-widest text-[#ED101A] font-semibold mb-3 block">
                About Ikonectt
              </span>
              <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white mb-6">
                Engineering Nigeria’s Optical Highway.
              </h1>
              <p className="text-[18px] sm:text-[20px] text-[#CCCCCC] leading-relaxed font-light">
                We build, own, and operate carrier-grade fiber optic networks across Nigeria’s commercial epicenters, powering modern households and mission-critical enterprises with unthrottled gigabit glass fiber.
              </p>
            </div>
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-[#272729] shadow-2xl h-72 sm:h-80">
                <img
                  src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80"
                  alt="Ikonectt Nigerian executive and engineering leadership team"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-xs text-white">
                  <span className="text-[#00D084] font-semibold block uppercase tracking-wider text-[10px]">
                    100% Indigenous Leadership
                  </span>
                  <p className="text-sm font-semibold">Lagos & Abuja Engineering Headquarters</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Network Backbone Architecture */}
      <section className="w-full py-20 bg-white border-b border-[#F0F0F0]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 flex flex-col gap-6">
              <span className="text-xs uppercase tracking-wider text-[#ED101A] font-semibold">
                Network & Subsea Backbone
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1a1c1d]">
                Direct Subsea Landing Diversity
              </h2>
              <p className="text-[16px] text-[#5f5e60] leading-relaxed">
                Ikonectt operates multi-homed physical interconnects into both the Google Equiano cable system and the West Africa Cable System (WACS) landing stations in Lagos. This dual-subsea route eliminates single points of failure across the Atlantic corridor.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#008653] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-[#1a1c1d]">Subterranean Armored Conduits</h4>
                    <p className="text-xs text-[#5f5e60]">
                      Armored G.652.D glass fiber buried in HDPE micro-ducts below road grade, insulated from weather hazards and aerial cuts.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#008653] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-[#1a1c1d]">Sub-50ms Hitless Protection</h4>
                    <p className="text-xs text-[#5f5e60]">
                      Closed optical loops ensure that third-party civil disruptions automatically reroute in under 50ms without dropped TCP sessions.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-[#f9f9fb] border border-[#F0F0F0]">
                  <span className="text-4xl font-mono-stat font-bold text-[#ED101A]">14,200+</span>
                  <p className="text-sm font-semibold text-[#1a1c1d] mt-2">Kilometers of Fiber</p>
                  <p className="text-xs text-[#5f5e60] mt-1">Spanning Lagos, Abuja, Rivers, and Oyo states.</p>
                </div>

                <div className="p-6 rounded-2xl bg-[#f9f9fb] border border-[#F0F0F0]">
                  <span className="text-4xl font-mono-stat font-bold text-[#008653]">99.98%</span>
                  <p className="text-sm font-semibold text-[#1a1c1d] mt-2">Measured Core SLA</p>
                  <p className="text-xs text-[#5f5e60] mt-1">Backed by 24/7 dedicated Tier-3 NOC telemetry.</p>
                </div>

                <div className="p-6 rounded-2xl bg-[#f9f9fb] border border-[#F0F0F0]">
                  <span className="text-4xl font-mono-stat font-bold text-[#1a1c1d]">100%</span>
                  <p className="text-sm font-semibold text-[#1a1c1d] mt-2">Uncapped Policy</p>
                  <p className="text-xs text-[#5f5e60] mt-1">Zero peak-hour throttling or fair-usage rollbacks.</p>
                </div>

                <div className="p-6 rounded-2xl bg-[#f9f9fb] border border-[#F0F0F0]">
                  <span className="text-4xl font-mono-stat font-bold text-[#1a1c1d]">&lt;4ms</span>
                  <p className="text-sm font-semibold text-[#1a1c1d] mt-2">IXPN Peering Latency</p>
                  <p className="text-xs text-[#5f5e60] mt-1">Direct local internet exchange routing in Lagos Core.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Regulatory & Licensing */}
      <section className="w-full py-16 bg-[#f9f9fb]">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <div className="p-8 rounded-3xl bg-white border border-[#F0F0F0] shadow-sm flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF0F1] text-[#ED101A] flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#1a1c1d]">
              NCC Regulatory Authorization & Licensing
            </h3>
            <p className="text-sm text-[#5f5e60] max-w-xl leading-relaxed">
              Ikonectt Telecommunications Nigeria Limited operates under comprehensive national licenses granted by the <strong>Nigerian Communications Commission (NCC)</strong> as an authorized Internet Service Provider (ISP) and Telecommunications Infrastructure Provider.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <span className="px-3.5 py-1.5 rounded-full bg-[#f3f3f5] text-xs font-mono-stat text-[#1a1c1d]">
                License: ISP/INF-2021-NCC
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-[#f3f3f5] text-xs font-mono-stat text-[#1a1c1d]">
                BGP ASN: AS37284 (Ikonectt Core)
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full py-16 bg-white border-t border-[#F0F0F0] text-center">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 flex flex-col items-center gap-6">
          <h3 className="text-2xl sm:text-3xl font-bold text-[#1a1c1d]">
            Ready to experience the Ikonectt optical network?
          </h3>
          <div className="flex gap-4">
            <button
              onClick={() => onNavigate('coverage')}
              className="px-8 py-3.5 rounded-full bg-[#ED101A] text-white text-xs font-semibold hover:bg-[#bb000e] transition-all cursor-pointer"
            >
              Check Your Estate Coverage
            </button>
            <button
              onClick={() => onNavigate('business')}
              className="px-8 py-3.5 rounded-full bg-[#f3f3f5] text-[#1a1c1d] text-xs font-semibold hover:bg-[#e8e8ea] transition-colors cursor-pointer"
            >
              Enterprise Solutions
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
