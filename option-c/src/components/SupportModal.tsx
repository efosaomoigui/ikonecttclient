import React, { useState } from 'react';
import { X, Headphones, Phone, Mail, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { OPTION_03_CONTENT as C } from '../data/content';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  const [ticketSent, setTicketSent] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTicketSent(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#121214] border border-white/10 p-6 sm:p-8 text-white shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#ED101A]/10 text-[#ED101A]">
              <Headphones className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold">24/7 Ikonectt Support Desk</h3>
              <p className="text-xs text-[#A1A1AA]">Get rapid assistance from our engineering and care teams</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Contact Options */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <a
            href="tel:+23418884566"
            className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-3 text-left"
          >
            <Phone className="w-4 h-4 text-[#ED101A] shrink-0" />
            <div>
              <p className="text-xs font-bold text-white">Call Support</p>
              <p className="text-[11px] text-[#A1A1AA]">+234 (0) 1 888 4566</p>
            </div>
          </a>

          <a
            href="mailto:support@ikonectt.com"
            className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-3 text-left"
          >
            <Mail className="w-4 h-4 text-[#ED101A] shrink-0" />
            <div>
              <p className="text-xs font-bold text-white">Email Helpdesk</p>
              <p className="text-[11px] text-[#A1A1AA]">support@ikonectt.com</p>
            </div>
          </a>
        </div>

        {ticketSent ? (
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center flex flex-col items-center gap-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            <h4 className="text-base font-bold text-white">Support Ticket Dispatched</h4>
            <p className="text-xs text-white/70 leading-relaxed">
              Thank you, {name || 'Customer'}. Your request has been assigned priority tracking ID #IK-TK-{Math.floor(Math.random() * 89999 + 10000)}. Our technical team will reach out via {email || 'your email'}.
            </p>
            <button
              onClick={() => setTicketSent(false)}
              className="mt-2 text-xs text-[#FF616A] hover:underline"
            >
              Submit another query
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1">
                Your Full Name or Company
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Chinelo Okafor or Nexus Tech Ltd"
                className="w-full bg-[#1A1A1E] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#ED101A]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full bg-[#1A1A1E] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#ED101A]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1">
                Enquiry / Support Details
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can our technical or billing team assist you today?"
                className="w-full bg-[#1A1A1E] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#ED101A] resize-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full btn-pill-primary text-sm font-semibold !py-3.5 flex items-center justify-center gap-2 mt-2"
            >
              <Send className="w-4 h-4" />
              <span>Submit Priority Ticket</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
