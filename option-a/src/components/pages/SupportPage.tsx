import React, { useState } from 'react';
import { PageId } from '../../types';
import {
  Phone,
  Mail,
  MapPin,
  LifeBuoy,
  ChevronDown,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Send,
  Headphones,
  FileText,
  AlertTriangle,
} from 'lucide-react';

interface SupportPageProps {
  onNavigate: (page: PageId) => void;
}

export const SupportPage: React.FC<SupportPageProps> = ({ onNavigate }) => {
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const [ticketForm, setTicketForm] = useState({
    name: '',
    phone: '',
    email: '',
    lineId: '',
    issueType: 'technical',
    description: '',
  });

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTicketId(`IK-TKT-${Math.floor(10000 + Math.random() * 90000)}`);
    setTicketSubmitted(true);
  };

  return (
    <div className="flex flex-col w-full bg-[#f9f9fb]">
      {/* Hero */}
      <section className="w-full bg-[#000000] text-white py-16 sm:py-20 border-b border-[#272729]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <span className="text-xs uppercase tracking-widest text-[#ED101A] font-semibold mb-3 block">
                24/7 Network Operations Center & Customer Care
              </span>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-4">
                Here to keep your connection uninterrupted.
              </h1>
              <p className="text-[17px] text-[#CCCCCC] leading-relaxed max-w-xl">
                Direct access to our certified optical network engineers in Lagos & Abuja, live SLA diagnostics, troubleshooting resources, and rapid field dispatch.
              </p>
            </div>
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-[#272729] shadow-xl h-64 sm:h-72">
                <img
                  src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80"
                  alt="Ikonectt Nigerian customer support engineer on headset"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00D084] animate-pulse" />
                    <span className="font-semibold">Live Support Desk: Online</span>
                  </div>
                  <span className="text-gray-300">Average response &lt; 2 mins</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support Contact Channels */}
      <section className="w-full py-12 -mt-6">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 rounded-3xl bg-white border border-[#F0F0F0] shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#FFF0F1] text-[#ED101A] flex items-center justify-center mb-6">
                  <Phone className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#1a1c1d] mb-1">Direct Priority Care Line</h3>
                <p className="text-xs text-[#5f5e60] mb-4">
                  24/7 engineering line for urgent outages, optical line alarms, and priority business SLA tickets.
                </p>
              </div>
              <div>
                <a
                  href="tel:+2347001234567"
                  className="text-lg font-bold text-[#ED101A] hover:underline block"
                >
                  +234 700 123 4567
                </a>
                <span className="text-xs text-gray-500">Toll-free across all Nigerian networks</span>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-[#F0F0F0] shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#FFF0F1] text-[#ED101A] flex items-center justify-center mb-6">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#1a1c1d] mb-1">Email NOC Operations</h3>
                <p className="text-xs text-[#5f5e60] mb-4">
                  Submit technical queries, billing changes, or IP allocation requests with 1-hour ticket response.
                </p>
              </div>
              <div>
                <a
                  href="mailto:support@ikonectt.com"
                  className="text-lg font-bold text-[#1a1c1d] hover:text-[#ED101A] transition-colors block"
                >
                  support@ikonectt.com
                </a>
                <span className="text-xs text-gray-500">Monitored 24/7 by Tier-2 support</span>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-[#272729] text-white border border-[#2A2A2C] shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00D084] animate-pulse" />
                  <span className="text-xs uppercase font-mono-stat tracking-wider text-[#00D084]">
                    Operational Core
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Live Metro Telemetry</h3>
                <p className="text-xs text-[#CCCCCC] mb-4">
                  Lagos & Abuja rings operating at 99.98% availability. Zero active subsea cable fiber cuts detected.
                </p>
              </div>
              <div className="pt-4 border-t border-[#2A2A2C] flex items-center justify-between text-xs text-gray-300">
                <span>Mean MTTR: &lt;45 mins</span>
                <span className="font-mono-stat text-[#00D084]">BGP AS37284</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ticket Submission Form */}
      <section className="w-full py-16 bg-white border-y border-[#F0F0F0]">
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <div className="mb-10 text-center">
            <span className="text-xs uppercase tracking-wider text-[#ED101A] font-semibold">
              Fast-Track Resolution
            </span>
            <h2 className="text-3xl font-bold text-[#1a1c1d] mt-1">Open an Engineering Ticket</h2>
            <p className="text-sm text-[#5f5e60] mt-2">
              Every ticket is assigned directly to the field operations team in your sector.
            </p>
          </div>

          {ticketSubmitted ? (
            <div className="p-8 rounded-3xl bg-[#FFF0F1] border border-[#FFD4D7] text-center max-w-xl mx-auto">
              <div className="w-12 h-12 rounded-full bg-[#008653] text-white flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#1a1c1d]">Ticket Dispatched</h3>
              <p className="text-sm text-[#5f5e60] mt-2">
                Your ticket ID is <strong className="font-mono-stat text-[#1a1c1d]">{ticketId}</strong>. An SMS confirmation has been sent to {ticketForm.phone}. A field support engineer will review optical telemetry within 30 minutes.
              </p>
              <button
                onClick={() => setTicketSubmitted(false)}
                className="mt-6 px-6 py-2.5 rounded-full bg-[#ED101A] text-white text-xs font-semibold hover:bg-[#bb000e] transition-colors"
              >
                Submit Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleTicketSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-[#1a1c1d]">
                  Full Name <span className="text-[#ED101A]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={ticketForm.name}
                  onChange={(e) => setTicketForm({ ...ticketForm, name: e.target.value })}
                  placeholder="e.g. Babatunde Adeyemi"
                  className="w-full px-4 py-3 rounded-xl bg-[#f9f9fb] border border-[#F0F0F0] text-sm text-[#1a1c1d] focus:outline-none focus:border-[#ED101A]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-[#1a1c1d]">
                  Mobile Telephone <span className="text-[#ED101A]">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={ticketForm.phone}
                  onChange={(e) => setTicketForm({ ...ticketForm, phone: e.target.value })}
                  placeholder="+234 803 000 0000"
                  className="w-full px-4 py-3 rounded-xl bg-[#f9f9fb] border border-[#F0F0F0] text-sm text-[#1a1c1d] focus:outline-none focus:border-[#ED101A]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-[#1a1c1d]">
                  Account Line ID or Serial (If existing subscriber)
                </label>
                <input
                  type="text"
                  value={ticketForm.lineId}
                  onChange={(e) => setTicketForm({ ...ticketForm, lineId: e.target.value })}
                  placeholder="e.g. IK-FTTH-84920"
                  className="w-full px-4 py-3 rounded-xl bg-[#f9f9fb] border border-[#F0F0F0] text-sm text-[#1a1c1d] focus:outline-none focus:border-[#ED101A]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-[#1a1c1d]">Category</label>
                <select
                  value={ticketForm.issueType}
                  onChange={(e) => setTicketForm({ ...ticketForm, issueType: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#f9f9fb] border border-[#F0F0F0] text-sm text-[#1a1c1d] focus:outline-none focus:border-[#ED101A]"
                >
                  <option value="technical">Optical Signal / Internet Speed Issue</option>
                  <option value="hardware">ONT / Wi-Fi Gateway Configuration</option>
                  <option value="billing">Subscription Renewal & Invoicing</option>
                  <option value="relocation">Line Relocation / Building Move</option>
                </select>
              </div>

              <div className="flex flex-col gap-2 sm:col-span-2">
                <label className="text-xs font-semibold text-[#1a1c1d]">
                  Describe Your Issue <span className="text-[#ED101A]">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                  placeholder="Provide context: optical indicator light color on your router, sudden speed change, or address relocation details..."
                  className="w-full p-4 rounded-xl bg-[#f9f9fb] border border-[#F0F0F0] text-sm text-[#1a1c1d] focus:outline-none focus:border-[#ED101A] resize-none"
                />
              </div>

              <div className="sm:col-span-2 flex justify-end">
                <button
                  type="submit"
                  className="px-8 py-3.5 rounded-full bg-[#ED101A] text-white text-xs font-semibold hover:bg-[#bb000e] transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Submit Ticket</span>
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* Support FAQ */}
      <section className="w-full py-20 bg-[#f9f9fb]">
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-12">
            <span className="text-xs uppercase tracking-widest text-[#ED101A] font-semibold">
              Knowledge Base
            </span>
            <h2 className="text-3xl font-bold text-[#1a1c1d] mt-2">
              Common Technical Questions
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'What should I do if the Optical (LOS) light on my router turns red?',
                a: 'A blinking red LOS light indicates loss of optical signal from the street drop cable. Please do not bend the yellow fiber patch cord. Check if the green optical connector is seated firmly, then power cycle the device. If the light stays red after 3 minutes, open a priority ticket or call our 24/7 care line for a field technician dispatch.',
              },
              {
                q: 'How do I optimize Wi-Fi speeds across multi-story buildings?',
                a: 'For duplexes and large villas, we recommend adding an Ikonectt Wi-Fi 6 Mesh node to eliminate thick concrete wall attenuation. Placing the secondary pod near the central stairway or hallway provides seamless 5GHz roaming across every floor.',
              },
              {
                q: 'Can I relocate my fiber line to a new address?',
                a: 'Yes! As long as your new address is within an active Ikonectt fiber cluster, our team handles line transfer and re-splicing within 48 hours. Submit a relocation request under the support tickets section.',
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-[#F0F0F0] shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between text-left cursor-pointer"
                >
                  <span className="text-base font-semibold text-[#1a1c1d]">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-500 transition-transform duration-200 shrink-0 ml-4 ${
                      openFaq === idx ? 'rotate-180 text-[#ED101A]' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="pt-4 text-sm text-[#5f5e60] leading-relaxed border-t border-[#F0F0F0] mt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
