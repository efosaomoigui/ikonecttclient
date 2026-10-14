import React, { useState } from 'react';
import { PageId } from '../../types';
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Cloud,
  Network,
  Lock,
  Wifi,
  CheckCircle2,
  Check,
  Building,
  Radio,
  Send,
  Activity,
  Layers,
  Clock,
  Server,
  Share2,
} from 'lucide-react';

interface BusinessPageProps {
  onNavigate: (page: PageId) => void;
}

export const BusinessPage: React.FC<BusinessPageProps> = ({ onNavigate }) => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    company: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    bandwidth: '250mbps',
    timeline: 'urgent',
    requirements: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  return (
    <div className="flex flex-col w-full">
      {/* HERO SECTION: High-impact Enterprise Editorial */}
      <section className="relative w-full bg-[#000000] text-white overflow-hidden border-b border-[#272729]">
        {/* Ambient Optical Beam Glow */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute -top-40 right-1/4 w-[620px] h-[620px] rounded-full bg-[#ED101A]/20 blur-[140px]" />
          <div className="absolute top-1/2 -left-32 w-[520px] h-[520px] rounded-full bg-[#2A2A2C] blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-16 pb-20 lg:pt-24 lg:pb-28 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Copy & Value Proposition */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#272729] border border-[#2A2A2C] w-fit">
                <span className="w-2 h-2 rounded-full bg-[#ED101A] animate-pulse" />
                <span className="text-[11px] font-mono-stat uppercase tracking-widest text-[#FF5961] font-semibold">
                  Enterprise-Grade Optical Connectivity
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[64px] lg:leading-[68px] tracking-tight font-bold text-white">
                Connectivity Built <br className="hidden sm:inline" />
                for <span className="text-[#ED101A]">Business.</span>
              </h1>

              <p className="text-[17px] sm:text-[18px] text-[#CCCCCC] max-w-xl leading-relaxed">
                Empower your enterprise with dedicated symmetrical fibre broadband, 99.99% guaranteed SLA uptime, low-latency cloud interconnects, and 24/7 dedicated engineering support.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href="#enterprise-solutions"
                  className="inline-flex items-center gap-2.5 bg-[#ED101A] text-white px-7 py-3.5 rounded-full text-sm font-semibold hover:bg-[#bb000e] transition-all duration-150 hover:scale-[1.02]"
                >
                  <span>Explore Business Solutions</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="#proposal-form"
                  className="inline-flex items-center gap-2 bg-[#272729] text-white px-7 py-3.5 rounded-full text-sm font-semibold hover:bg-[#2A2A2C] border border-[#2A2A2C] transition-colors"
                >
                  <span>Speak to an Enterprise Consultant</span>
                </a>
              </div>

              {/* Micro Metric Proof Ticker */}
              <div className="grid grid-cols-3 gap-6 pt-6 mt-4 border-t border-[#272729]">
                <div>
                  <p className="text-3xl sm:text-4xl font-mono-stat font-bold text-white tracking-tight">
                    99.99<span className="text-[#ED101A] text-2xl">%</span>
                  </p>
                  <p className="text-xs text-[#CCCCCC] mt-1">Contractual SLA Uptime</p>
                </div>
                <div>
                  <p className="text-3xl sm:text-4xl font-mono-stat font-bold text-white tracking-tight">
                    &lt;4<span className="text-[#ED101A] text-2xl">ms</span>
                  </p>
                  <p className="text-xs text-[#CCCCCC] mt-1">Intra-Lagos Metro Latency</p>
                </div>
                <div>
                  <p className="text-3xl sm:text-4xl font-mono-stat font-bold text-white tracking-tight">
                    1:1
                  </p>
                  <p className="text-xs text-[#CCCCCC] mt-1">Uncontended Symmetrical</p>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Telemetry Card & NOC Center Photo */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-[#272729] bg-[#272729] shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80"
                  alt="Modern telecommunications Network Operations Center in Lagos with Nigerian engineers"
                  className="w-full h-[400px] object-cover brightness-95"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                {/* Diagnostic Badge */}
                <div className="absolute bottom-5 left-5 right-5 p-4 rounded-xl bg-[#252527]/90 backdrop-blur-md border border-[#272729] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[#00D084] animate-ping" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-bold text-white">
                          LAG-METRO-CORE-01
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono-stat bg-[#008653] text-white uppercase tracking-wider">
                          Active 100Gbps
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-300">
                        Direct Subsea Transit: WACS / Equiano / 2Africa
                      </p>
                    </div>
                  </div>
                  <ShieldCheck className="w-6 h-6 text-[#00D084]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Telemetry Ticker Ribbon */}
        <div className="w-full border-t border-[#272729] bg-[#252527]/80 backdrop-blur-sm py-3.5">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-wrap items-center justify-between gap-4 text-xs text-[#CCCCCC]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ED101A]" />
              <span className="text-white font-medium">Direct Peering:</span> Internet Exchange Point of Nigeria (IXPN Lagos Core)
            </div>
            <div className="hidden md:flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ED101A]" />
              <span className="text-white font-medium">Redundant Subsea Paths:</span> MainOne, Glo-1, Equiano, WACS
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00D084]" />
              <span className="text-white font-medium">Tier-3 Support:</span> 24/7 Dedicated Network Operations Center
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Commercial Use Cases & Impact */}
      <section className="w-full py-24 bg-white border-b border-[#F0F0F0]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="max-w-2xl mb-16">
            <div className="inline-flex items-center gap-2 text-[#ED101A] text-[12px] uppercase tracking-widest font-semibold mb-3">
              <span className="w-4 h-0.5 bg-[#ED101A]" />
              Enterprise Agility
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1a1c1d]">
              Engineered for mission-critical digital throughput.
            </h2>
            <p className="text-[17px] text-[#5f5e60] mt-3">
              Zero congestion. Deterministic latency. Purpose-built infrastructure ensuring your business never misses a packet.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="p-8 rounded-2xl bg-[#f3f3f5] border border-[#F0F0F0] flex flex-col justify-between hover:bg-white hover:shadow-md transition-all group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#FFF0F1] flex items-center justify-center text-[#ED101A] mb-6 group-hover:bg-[#ED101A] group-hover:text-white transition-colors">
                  <Cloud className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#1a1c1d] mb-2">Cloud Acceleration</h3>
                <p className="text-xs text-[#5f5e60] leading-relaxed">
                  Direct private peering with AWS, Microsoft Azure, Google Cloud, and Microsoft 365, cutting international latency by up to 45%.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-[#F0F0F0] flex items-center justify-between text-xs text-[#7A7A7A]">
                <span>Direct ExpressRoute</span>
                <CheckCircle2 className="w-4 h-4 text-[#ED101A]" />
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-8 rounded-2xl bg-[#f3f3f5] border border-[#F0F0F0] flex flex-col justify-between hover:bg-white hover:shadow-md transition-all group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#FFF0F1] flex items-center justify-center text-[#ED101A] mb-6 group-hover:bg-[#ED101A] group-hover:text-white transition-colors">
                  <Network className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#1a1c1d] mb-2">SD-WAN & Multi-Branch</h3>
                <p className="text-xs text-[#5f5e60] leading-relaxed">
                  Seamless interconnectivity stitching together headquarters, regional branches, and retail outlets under unified cryptographic tunnels.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-[#F0F0F0] flex items-center justify-between text-xs text-[#7A7A7A]">
                <span>Zero-Touch Provisioning</span>
                <CheckCircle2 className="w-4 h-4 text-[#ED101A]" />
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-8 rounded-2xl bg-[#f3f3f5] border border-[#F0F0F0] flex flex-col justify-between hover:bg-white hover:shadow-md transition-all group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#FFF0F1] flex items-center justify-center text-[#ED101A] mb-6 group-hover:bg-[#ED101A] group-hover:text-white transition-colors">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#1a1c1d] mb-2">Secure Offsite Backups</h3>
                <p className="text-xs text-[#5f5e60] leading-relaxed">
                  High-bandwidth pipes for nocturnal disaster recovery replication, real-time database clustering, and ISO-compliant archiving.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-[#F0F0F0] flex items-center justify-between text-xs text-[#7A7A7A]">
                <span>Unmetered Data Caps</span>
                <CheckCircle2 className="w-4 h-4 text-[#ED101A]" />
              </div>
            </div>

            {/* Card 4 */}
            <div className="p-8 rounded-2xl bg-[#f3f3f5] border border-[#F0F0F0] flex flex-col justify-between hover:bg-white hover:shadow-md transition-all group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#FFF0F1] flex items-center justify-center text-[#ED101A] mb-6 group-hover:bg-[#ED101A] group-hover:text-white transition-colors">
                  <Wifi className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#1a1c1d] mb-2">High-Density Office Wi-Fi</h3>
                <p className="text-xs text-[#5f5e60] leading-relaxed">
                  Carrier-grade indoor Wi-Fi 6 architecture engineered to sustain 500+ simultaneous laptops, smartphones, and IoT appliances.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-[#F0F0F0] flex items-center justify-between text-xs text-[#7A7A7A]">
                <span>Wi-Fi 6 Enterprise APs</span>
                <CheckCircle2 className="w-4 h-4 text-[#ED101A]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Business Solutions Spectrum */}
      <section className="w-full py-24 bg-[#f9f9fb] border-b border-[#F0F0F0]" id="enterprise-solutions">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <div className="inline-flex items-center gap-2 text-[#ED101A] text-[12px] uppercase tracking-widest font-semibold mb-3">
                <span className="w-4 h-0.5 bg-[#ED101A]" />
                Scalable Solutions Spectrum
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1a1c1d]">
                Tailored architectures for every organizational scale.
              </h2>
            </div>
            <p className="text-[15px] text-[#5f5e60] max-w-md">
              Whether you run a rapidly growing boutique studio or a multinational financial institution, select bandwidth with definitive SLA guarantees.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Solution 1: Business Fibre Pro */}
            <div className="rounded-2xl bg-white p-8 border border-[#F0F0F0] flex flex-col justify-between hover:shadow-lg transition-all relative">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full bg-[#FFF0F1] text-[#ED101A] text-[10px] font-semibold uppercase tracking-wider">
                    Fast-Growing SMEs
                  </span>
                  <span className="text-xl font-mono-stat font-bold text-[#1a1c1d]">
                    100-300<span className="text-xs font-normal text-gray-500"> Mbps</span>
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#1a1c1d] mb-3">Business Fibre Pro</h3>
                <p className="text-xs text-[#5f5e60] leading-relaxed mb-6">
                  Asymmetrical high-capacity optical broadband designed for creative agencies, co-working studios, and tech startups requiring reliable speed.
                </p>
                <ul className="space-y-3 text-xs text-[#1a1c1d] mb-8">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#008653]" />
                    <span>Dynamic Static IP included</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#008653]" />
                    <span>99.7% Target Network Availability</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#008653]" />
                    <span>Standard Business-Hour SLA</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#008653]" />
                    <span>Enterprise Mesh ONT Hardware</span>
                  </li>
                </ul>
              </div>
              <a
                href="#proposal-form"
                className="w-full py-3 rounded-full text-center text-sm font-semibold bg-[#f3f3f5] text-[#1a1c1d] hover:bg-[#e8e8ea] transition-colors"
              >
                Configure SME Plan
              </a>
            </div>

            {/* Solution 2: Dedicated Internet (DIA) - FLAGSHIP */}
            <div className="rounded-2xl bg-[#272729] text-white p-8 border border-[#2A2A2C] flex flex-col justify-between shadow-xl relative overflow-hidden lg:-translate-y-2">
              <div className="absolute top-0 right-0 bg-[#ED101A] text-white text-[10px] font-bold px-4 py-1 rounded-bl-xl uppercase tracking-wider">
                Flagship Tier
              </div>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full bg-[#252527] text-[#FF5961] text-[10px] font-semibold uppercase tracking-wider">
                    Tier-1 Corporates
                  </span>
                  <span className="text-xl font-mono-stat font-bold text-white">
                    1:1<span className="text-xs font-normal text-gray-400"> Symmetrical</span>
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Dedicated Internet (DIA)</h3>
                <p className="text-xs text-gray-300 leading-relaxed mb-6">
                  Guaranteed uncontended optical spectrum reserved exclusively for your corporate address. Unthrottled upload and download parity.
                </p>
                <ul className="space-y-3 text-xs text-gray-200 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00D084]" />
                    <span>99.99% Financial Contractual SLA</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00D084]" />
                    <span>/29 Static Public IPv4 Subnet</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00D084]" />
                    <span>Dual-Homed Fibre Path Redundancy</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00D084]" />
                    <span>Direct Access to Tier-3 NOC</span>
                  </li>
                </ul>
              </div>
              <a
                href="#proposal-form"
                className="w-full py-3 rounded-full text-center text-sm font-semibold bg-[#ED101A] text-white hover:bg-[#bb000e] transition-all duration-150 hover:scale-[1.02]"
              >
                Request DIA Proposal
              </a>
            </div>

            {/* Solution 3: Metro Ethernet P2P */}
            <div className="rounded-2xl bg-white p-8 border border-[#F0F0F0] flex flex-col justify-between hover:shadow-lg transition-all relative">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full bg-[#FFF0F1] text-[#ED101A] text-[10px] font-semibold uppercase tracking-wider">
                    Multi-Campus
                  </span>
                  <span className="text-xl font-mono-stat font-bold text-[#1a1c1d]">
                    10G<span className="text-xs font-normal text-gray-500"> Metro Line</span>
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#1a1c1d] mb-3">Metro Ethernet (P2P)</h3>
                <p className="text-xs text-[#5f5e60] leading-relaxed mb-6">
                  Private Layer-2 clear channels linking distinct premises (e.g., Victoria Island HQ to Ikeja Branch) outside the public internet.
                </p>
                <ul className="space-y-3 text-xs text-[#1a1c1d] mb-8">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#008653]" />
                    <span>Deterministic Zero-Jitter Transit</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#008653]" />
                    <span>Private VLAN / QinQ Tagging</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#008653]" />
                    <span>Air-Gapped Bank-Grade Security</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#008653]" />
                    <span>End-to-End MTU 9000 Jumbo Frames</span>
                  </li>
                </ul>
              </div>
              <a
                href="#proposal-form"
                className="w-full py-3 rounded-full text-center text-sm font-semibold bg-[#f3f3f5] text-[#1a1c1d] hover:bg-[#e8e8ea] transition-colors"
              >
                Inquire P2P Circuits
              </a>
            </div>

            {/* Solution 4: Cloud On-Ramp & DC */}
            <div className="rounded-2xl bg-white p-8 border border-[#F0F0F0] flex flex-col justify-between hover:shadow-lg transition-all relative">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full bg-[#FFF0F1] text-[#ED101A] text-[10px] font-semibold uppercase tracking-wider">
                    Hybrid Infrastructure
                  </span>
                  <span className="text-xl font-mono-stat font-bold text-[#1a1c1d]">
                    &lt;2<span className="text-xs font-normal text-gray-500">ms DC Ping</span>
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#1a1c1d] mb-3">Cloud On-Ramp & DC</h3>
                <p className="text-xs text-[#5f5e60] leading-relaxed mb-6">
                  Cross-connect direct fiber runs into leading Lagos carrier hotels (MDXi, Rack Centre, ADC) with unmetered cloud exchange interconnects.
                </p>
                <ul className="space-y-3 text-xs text-[#1a1c1d] mb-8">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#008653]" />
                    <span>Direct Equinix & MDXi cross connects</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#008653]" />
                    <span>Automated BGP Peering Sessions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#008653]" />
                    <span>Full & Half Rack Colocation Options</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#008653]" />
                    <span>Dual N+1 Generator & UPS Backing</span>
                  </li>
                </ul>
              </div>
              <a
                href="#proposal-form"
                className="w-full py-3 rounded-full text-center text-sm font-semibold bg-[#f3f3f5] text-[#1a1c1d] hover:bg-[#e8e8ea] transition-colors"
              >
                Connect Data Center
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: Business Connection Journey */}
      <section className="w-full py-24 bg-white border-b border-[#F0F0F0]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <div className="inline-flex items-center gap-2 text-[#ED101A] text-[12px] uppercase tracking-widest font-semibold mb-3">
              <span className="w-4 h-0.5 bg-[#ED101A]" />
              Deployment Protocol
              <span className="w-4 h-0.5 bg-[#ED101A]" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1a1c1d]">
              From site audit to light on glass in 72 hours.
            </h2>
            <p className="text-[17px] text-[#5f5e60] mt-3">
              Our carrier engineering workflow eliminates enterprise red tape, moving your facility from initial discovery to SLA-backed activation effortlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <span className="w-12 h-12 rounded-full bg-[#ED101A] text-white font-mono-stat text-lg font-bold flex items-center justify-center shrink-0">
                  01
                </span>
                <div className="h-0.5 flex-1 bg-gray-200 hidden lg:block" />
              </div>
              <h3 className="text-lg font-bold text-[#1a1c1d] mt-2">Discovery & Coverage Audit</h3>
              <p className="text-xs text-[#5f5e60] leading-relaxed">
                Our optical field engineers perform an OTDR site analysis, verifying nearest manhole points of presence (PoPs) and riser capacity in your building.
              </p>
              <span className="text-xs text-[#7A7A7A]">Day 1 • Feasibility Report</span>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <span className="w-12 h-12 rounded-full bg-[#272729] text-white font-mono-stat text-lg font-bold flex items-center justify-center shrink-0">
                  02
                </span>
                <div className="h-0.5 flex-1 bg-gray-200 hidden lg:block" />
              </div>
              <h3 className="text-lg font-bold text-[#1a1c1d] mt-2">Custom Optical Route Design</h3>
              <p className="text-xs text-[#5f5e60] leading-relaxed">
                We map redundant fiber trajectories, provision dedicated wavelength slots (DWDM), and formulate guaranteed latency benchmarks.
              </p>
              <span className="text-xs text-[#7A7A7A]">Day 2 • Route Topology Signoff</span>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <span className="w-12 h-12 rounded-full bg-[#272729] text-white font-mono-stat text-lg font-bold flex items-center justify-center shrink-0">
                  03
                </span>
                <div className="h-0.5 flex-1 bg-gray-200 hidden lg:block" />
              </div>
              <h3 className="text-lg font-bold text-[#1a1c1d] mt-2">SLA Contract & Civil Pull</h3>
              <p className="text-xs text-[#5f5e60] leading-relaxed">
                Armed with NCC road permits, our technicians blow micro-duct fiber into your server room, terminating into Cisco or Juniper edge routers.
              </p>
              <span className="text-xs text-[#7A7A7A]">Day 3 • Hardware Commissioning</span>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <span className="w-12 h-12 rounded-full bg-[#00D084] text-white font-mono-stat text-lg font-bold flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#1a1c1d] mt-2">24/7 Priority NOC Handoff</h3>
              <p className="text-xs text-[#5f5e60] leading-relaxed">
                Your line is actively provisioned on our live telemetry matrix, assigning a dedicated Tier-3 account engineer and real-time portal access.
              </p>
              <span className="text-xs text-[#008653] font-semibold">Active • 99.99% SLA Live</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: Enterprise Confidence & Network Architecture */}
      <section className="w-full py-24 bg-[#000000] text-white relative overflow-hidden border-b border-[#272729]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left description */}
            <div className="lg:col-span-6 flex flex-col gap-6">
              <div className="inline-flex items-center gap-2 text-[#ED101A] text-[12px] uppercase tracking-widest font-semibold">
                <span className="w-4 h-0.5 bg-[#ED101A]" />
                Resilient Core Architecture
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Self-healing optical rings across Nigeria’s primary commercial epicenters.
              </h2>
              <p className="text-[17px] text-[#CCCCCC] leading-relaxed">
                Our Lagos and Abuja metro networks are deployed in closed self-healing optical loops. If a third-party civil work incident severs a fiber bundle along the Lekki Expressway, upstream DWDM nodes automatically reroute full throughput through our subterranean Victoria Island loop in under 50 milliseconds.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="p-4 rounded-xl bg-[#272729] border border-[#2A2A2C]">
                  <div className="flex items-center gap-2 text-[#00D084] mb-1 font-bold text-sm">
                    <Activity className="w-4 h-4" />
                    <span>Sub-50ms Failover</span>
                  </div>
                  <p className="text-xs text-[#CCCCCC]">Hitless optical layer protection switching.</p>
                </div>
                <div className="p-4 rounded-xl bg-[#272729] border border-[#2A2A2C]">
                  <div className="flex items-center gap-2 text-[#00D084] mb-1 font-bold text-sm">
                    <Server className="w-4 h-4" />
                    <span>Diverse Risers</span>
                  </div>
                  <p className="text-xs text-[#CCCCCC]">Dual street entries to corporate buildings.</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-3 py-1 rounded-full bg-[#252527] text-xs font-mono-stat text-[#CCCCCC] border border-[#2A2A2C]">
                  Victoria Island Ring: OK
                </span>
                <span className="px-3 py-1 rounded-full bg-[#252527] text-xs font-mono-stat text-[#CCCCCC] border border-[#2A2A2C]">
                  Ikoyi Ring: OK
                </span>
                <span className="px-3 py-1 rounded-full bg-[#252527] text-xs font-mono-stat text-[#CCCCCC] border border-[#2A2A2C]">
                  Marina Ring: OK
                </span>
                <span className="px-3 py-1 rounded-full bg-[#252527] text-xs font-mono-stat text-[#CCCCCC] border border-[#2A2A2C]">
                  Ikeja Central Ring: OK
                </span>
              </div>
            </div>

            {/* Right: SVG Network Ring Topology Diagram & Photo Mosaic */}
            <div className="lg:col-span-6 flex flex-col gap-6">
              {/* Topology SVG Diagram */}
              <div className="w-full bg-[#272729] rounded-2xl p-6 border border-[#2A2A2C] relative">
                <div className="flex items-center justify-between pb-4 border-b border-[#2A2A2C]">
                  <span className="text-xs font-bold text-white tracking-wider">
                    LAGOS METROPOLITAN FIBRE RING MAP
                  </span>
                  <span className="text-xs text-[#00D084] flex items-center gap-1.5 font-mono-stat">
                    <span className="w-2 h-2 rounded-full bg-[#00D084] animate-pulse" />
                    ALL CORES NORMAL
                  </span>
                </div>

                <div className="py-6 flex justify-center">
                  <svg
                    className="w-full max-w-md h-auto"
                    fill="none"
                    viewBox="0 0 460 220"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <ellipse
                      cx="230"
                      cy="110"
                      rx="170"
                      ry="75"
                      stroke="#444444"
                      strokeDasharray="4 4"
                      strokeWidth="4"
                    />
                    <ellipse
                      cx="230"
                      cy="110"
                      rx="170"
                      ry="75"
                      stroke="#ED101A"
                      strokeWidth="2"
                      opacity="0.85"
                    />

                    {/* Node 1: VI Core */}
                    <circle cx="90" cy="110" r="14" fill="#1D1D1F" stroke="#ED101A" strokeWidth="2" />
                    <circle cx="90" cy="110" r="5" fill="#ED101A" />
                    <text x="90" y="142" fill="#CCCCCC" fontSize="10" fontWeight="600" textAnchor="middle">
                      VICTORIA ISLAND
                    </text>
                    <text x="90" y="154" fill="#7A7A7A" fontSize="8" textAnchor="middle">
                      MDXi / Core 1
                    </text>

                    {/* Node 2: Marina */}
                    <circle cx="180" cy="45" r="12" fill="#1D1D1F" stroke="#00D084" strokeWidth="2" />
                    <circle cx="180" cy="45" r="4" fill="#00D084" />
                    <text x="180" y="32" fill="#CCCCCC" fontSize="10" fontWeight="600" textAnchor="middle">
                      MARINA / CBD
                    </text>

                    {/* Node 3: Ikeja */}
                    <circle cx="370" cy="110" r="14" fill="#1D1D1F" stroke="#ED101A" strokeWidth="2" />
                    <circle cx="370" cy="110" r="5" fill="#ED101A" />
                    <text x="370" y="142" fill="#CCCCCC" fontSize="10" fontWeight="600" textAnchor="middle">
                      IKEJA INDUSTRIAL
                    </text>
                    <text x="370" y="154" fill="#7A7A7A" fontSize="8" textAnchor="middle">
                      Rack Centre / Core 2
                    </text>

                    {/* Node 4: Lekki */}
                    <circle cx="280" cy="175" r="12" fill="#1D1D1F" stroke="#00D084" strokeWidth="2" />
                    <circle cx="280" cy="175" r="4" fill="#00D084" />
                    <text x="280" y="200" fill="#CCCCCC" fontSize="10" fontWeight="600" textAnchor="middle">
                      LEKKI CORRIDOR
                    </text>

                    {/* Subsea feeder line */}
                    <path d="M90 110L20 40" stroke="#00D084" strokeDasharray="3 3" strokeWidth="1.5" />
                    <text x="25" y="30" fill="#00D084" fontSize="9" fontWeight="bold">
                      SUBSEA TRANSIT (WACS/Equiano)
                    </text>
                  </svg>
                </div>

                <div className="pt-3 border-t border-[#2A2A2C] flex items-center justify-between text-xs text-[#CCCCCC]">
                  <span>Active Encryption: Layer-2 MACsec</span>
                  <span className="font-mono-stat text-white">BGP AS37284 (Ikonectt Core)</span>
                </div>
              </div>

              {/* Splicing photo */}
              <div className="w-full rounded-2xl overflow-hidden border border-[#2A2A2C] relative h-48">
                <img
                  src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=1200&q=80"
                  alt="Fiber optical engineer managing telecommunications infrastructure in Lagos"
                  className="w-full h-full object-cover brightness-90"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent flex items-center p-6">
                  <div>
                    <p className="text-[15px] font-bold text-white">Dedicated Route Field Support</p>
                    <p className="text-xs text-gray-300 max-w-xs mt-1">
                      Guaranteed 2-hour on-site dispatch time anywhere across Lagos & Abuja metropolitan regions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: Enterprise Proposal Request Form Card */}
      <section className="w-full py-24 bg-[#f9f9fb]" id="proposal-form">
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <div className="bg-white rounded-3xl p-8 lg:p-14 border border-[#F0F0F0] shadow-xl relative overflow-hidden">
            {/* Top signature accent line */}
            <div className="absolute top-0 left-0 w-full h-2 bg-[#ED101A]" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-8 border-b border-[#F0F0F0]">
              <div>
                <span className="text-xs uppercase tracking-wider text-[#ED101A] font-semibold">
                  Priority Corporate Onboarding
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#1a1c1d] tracking-tight mt-1">
                  Request an Enterprise SLA Proposal
                </h2>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF0F1] text-[#ED101A] text-xs font-semibold">
                <Clock className="w-4 h-4" />
                <span>24-Hour Quotation Turnaround</span>
              </div>
            </div>

            {formSubmitted ? (
              <div className="p-8 rounded-2xl bg-[#FFF0F1] border border-[#FFD4D7] text-[#1a1c1d] animate-in fade-in duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#008653] text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-[#1a1c1d]">
                      Proposal Request Received Successfully
                    </h4>
                    <p className="text-sm text-[#5f5e60] mt-1 leading-relaxed">
                      Thank you, <strong>{formData.contactName || 'Corporate Representative'}</strong>. Our Senior Enterprise Account Engineer for your commercial district has logged ticket <strong>#IK-SLA-{Math.floor(1000 + Math.random() * 9000)}</strong> and will deliver an optical route audit and formal SLA quotation to <strong>{formData.email}</strong> within 24 hours.
                    </p>
                    <button
                      onClick={() => setFormSubmitted(false)}
                      className="mt-6 px-6 py-2 rounded-full bg-[#ED101A] text-white text-xs font-semibold hover:bg-[#bb000e] transition-colors"
                    >
                      Submit Another Inquiry
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-[#1a1c1d]">
                    Company / Corporate Entity <span className="text-[#ED101A]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g. Zenith Global Ventures Ltd"
                    className="w-full px-4 py-3 rounded-xl bg-[#f9f9fb] border border-[#F0F0F0] text-[#1a1c1d] text-sm focus:outline-none focus:border-[#ED101A]"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-[#1a1c1d]">
                    Head of IT / Contact Person <span className="text-[#ED101A]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    placeholder="e.g. Babatunde Adeleke"
                    className="w-full px-4 py-3 rounded-xl bg-[#f9f9fb] border border-[#F0F0F0] text-[#1a1c1d] text-sm focus:outline-none focus:border-[#ED101A]"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-[#1a1c1d]">
                    Work Email <span className="text-[#ED101A]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="babatunde@zenithglobal.ng"
                    className="w-full px-4 py-3 rounded-xl bg-[#f9f9fb] border border-[#F0F0F0] text-[#1a1c1d] text-sm focus:outline-none focus:border-[#ED101A]"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-[#1a1c1d]">
                    Direct Phone / Mobile <span className="text-[#ED101A]">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+234 802 000 0000"
                    className="w-full px-4 py-3 rounded-xl bg-[#f9f9fb] border border-[#F0F0F0] text-[#1a1c1d] text-sm focus:outline-none focus:border-[#ED101A]"
                  />
                </div>

                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-xs font-semibold text-[#1a1c1d]">
                    Office Street Address & Premises <span className="text-[#ED101A]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. Plot 1412, Adeola Hopewell Street, Victoria Island, Lagos"
                    className="w-full px-4 py-3 rounded-xl bg-[#f9f9fb] border border-[#F0F0F0] text-[#1a1c1d] text-sm focus:outline-none focus:border-[#ED101A]"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-[#1a1c1d]">
                    Estimated Bandwidth Requirement
                  </label>
                  <select
                    value={formData.bandwidth}
                    onChange={(e) => setFormData({ ...formData, bandwidth: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#f9f9fb] border border-[#F0F0F0] text-[#1a1c1d] text-sm focus:outline-none focus:border-[#ED101A]"
                  >
                    <option value="100mbps">100 Mbps (SME Core)</option>
                    <option value="250mbps">250 Mbps (Dedicated DIA)</option>
                    <option value="500mbps">500 Mbps (Dedicated DIA)</option>
                    <option value="1gbps">1 Gbps+ (Enterprise Optical Link)</option>
                    <option value="p2p">Metro Ethernet Point-to-Point Circuit</option>
                    <option value="custom">Multi-Location Custom Campus Network</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-[#1a1c1d]">
                    Desired Implementation Timeline
                  </label>
                  <select
                    value={formData.timeline}
                    onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#f9f9fb] border border-[#F0F0F0] text-[#1a1c1d] text-sm focus:outline-none focus:border-[#ED101A]"
                  >
                    <option value="urgent">Immediate (Under 7 Days)</option>
                    <option value="month">Within 30 Days</option>
                    <option value="quarter">Next Quarter Planning</option>
                    <option value="rfp">Corporate Tender / Formal RFP</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-xs font-semibold text-[#1a1c1d]">
                    Specific SLA Requirements or Branch Details (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    placeholder="State any specific needs: multiple public IP subnets, BGP peering ASN, multi-floor Wi-Fi mesh, or existing ISP changeover dates..."
                    className="w-full px-4 py-3 rounded-xl bg-[#f9f9fb] border border-[#F0F0F0] text-[#1a1c1d] text-sm focus:outline-none focus:border-[#ED101A] resize-none"
                  />
                </div>

                <div className="md:col-span-2 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-xs text-[#7A7A7A] max-w-sm">
                    Your details will be reviewed under strict NDA by our Enterprise Solutions Architect.
                  </p>
                  <button
                    type="submit"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#ED101A] text-white px-8 py-4 rounded-full text-sm font-semibold hover:bg-[#bb000e] transition-all duration-150 hover:scale-[1.02] cursor-pointer"
                  >
                    <span>Request Enterprise Proposal</span>
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
