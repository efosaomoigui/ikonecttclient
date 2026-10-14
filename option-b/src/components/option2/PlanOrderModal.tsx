import React, { useState } from 'react';
import { X, Check, ShieldCheck, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Plan } from '../../data/telecomData';

interface PlanOrderModalProps {
  plan: Plan | null;
  onClose: () => void;
}

export const PlanOrderModal: React.FC<PlanOrderModalProps> = ({ plan, onClose }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    estateAddress: '',
    city: 'Lagos',
    meshExtenderAddon: false,
  });
  const [submitted, setSubmitted] = useState(false);

  if (!plan) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 relative shadow-2xl border border-[#e0e0e0] max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-[#7a7a7a] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-[#1d1d1f]">Booking Confirmed</h3>
            <p className="text-sm text-[#6e6e73] leading-relaxed max-w-sm mx-auto">
              Thank you, <strong className="text-[#1d1d1f]">{formData.fullName}</strong>. Your activation request for{' '}
              <strong className="text-[#ED101A]">{plan.name} ({plan.speed})</strong> has been received. Our installation engineer will call you at{' '}
              <span className="font-semibold text-[#1d1d1f]">{formData.phone}</span> within 2 business hours to schedule optical termination.
            </p>
            <div className="p-4 bg-[#f5f5f7] rounded-xl text-xs text-[#7a7a7a] text-left space-y-1">
              <div>Installation Location: {formData.estateAddress}, {formData.city}</div>
              <div>Estimated Turnaround: 24 to 48 Hours</div>
              <div>Free Standard Optical Terminal & Fibre Drop Cable Included</div>
            </div>
            <button
              onClick={onClose}
              className="mt-4 px-8 py-3 text-sm font-semibold text-white bg-[#ED101A] hover:bg-[#D50913] rounded-full transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <div>
            <div className="pr-8 mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#ED101A]">
                {plan.audience === 'residential' ? 'Residential Broadband Order' : 'Enterprise Connectivity'}
              </span>
              <h3 className="text-2xl font-bold text-[#1d1d1f] mt-1 flex items-baseline gap-2">
                {plan.name}
                <span className="text-lg font-normal text-[#7a7a7a]">({plan.speed})</span>
              </h3>
              <p className="text-xs text-[#6e6e73] mt-1">{plan.tagline}</p>
              {plan.price && (
                <div className="mt-2 text-xl font-bold text-[#1d1d1f]">
                  {plan.price}{' '}
                  <span className="text-xs font-normal text-[#7a7a7a]">{plan.billingPeriod}</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1d1d1f] mb-1">Full Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Babatunde Adeyemi"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e0e0e0] focus:border-[#ED101A] focus:ring-1 focus:ring-[#ED101A] text-sm text-[#1d1d1f] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1d1d1f] mb-1">Phone Number</label>
                  <input
                    required
                    type="tel"
                    placeholder="0803 000 0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#e0e0e0] focus:border-[#ED101A] focus:ring-1 focus:ring-[#ED101A] text-sm text-[#1d1d1f] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1d1d1f] mb-1">Email Address</label>
                  <input
                    required
                    type="email"
                    placeholder="babatunde@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#e0e0e0] focus:border-[#ED101A] focus:ring-1 focus:ring-[#ED101A] text-sm text-[#1d1d1f] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1d1d1f] mb-1">Street Address or Estate Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. 14 Admiralty Way, Lekki Phase 1"
                  value={formData.estateAddress}
                  onChange={(e) => setFormData({ ...formData, estateAddress: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e0e0e0] focus:border-[#ED101A] focus:ring-1 focus:ring-[#ED101A] text-sm text-[#1d1d1f] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="meshAddon"
                  checked={formData.meshExtenderAddon}
                  onChange={(e) => setFormData({ ...formData, meshExtenderAddon: e.target.checked })}
                  className="w-4 h-4 rounded text-[#ED101A] focus:ring-[#ED101A] border-[#d2d2d7]"
                />
                <label htmlFor="meshAddon" className="text-xs text-[#1d1d1f] cursor-pointer">
                  Add Whole-Home Wi-Fi 6 Mesh Booster node (+₦5,000 one-off)
                </label>
              </div>

              <div className="pt-4 border-t border-[#f0f0f0]">
                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-full text-sm font-bold text-white bg-[#ED101A] hover:bg-[#D50913] active:bg-[#D50913] transition-colors flex items-center justify-center gap-2"
                >
                  <span>Confirm Order & Schedule Installation</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-center text-[11px] text-[#7a7a7a] mt-2">
                  No immediate online payment required. Pay upon successful optical signal sign-off.
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
