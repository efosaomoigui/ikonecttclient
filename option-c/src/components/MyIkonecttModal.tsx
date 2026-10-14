import React, { useState } from 'react';
import { X, Lock, ShieldCheck, ArrowRight, User, Key } from 'lucide-react';

interface MyIkonecttModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MyIkonecttModal: React.FC<MyIkonecttModalProps> = ({ isOpen, onClose }) => {
  const [accountNo, setAccountNo] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-[#121214] border border-white/10 p-6 sm:p-8 text-white shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#ED101A]/10 text-[#ED101A]">
              <Lock className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold">My Ikonectt Subscriber Login</h3>
              <p className="text-xs text-[#A1A1AA]">Manage services, invoices & telemetry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center flex flex-col items-center gap-3">
            <ShieldCheck className="w-10 h-10 text-emerald-400" />
            <h4 className="text-base font-bold text-white">Subscriber Authentication</h4>
            <p className="text-xs text-white/70 leading-relaxed">
              In this client showcase preview, authentication connects directly to the authenticated subscriber core. Your credentials for Account #{accountNo || 'IK-2026-X'} have been validated.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-2 text-xs text-[#FF616A] hover:underline"
            >
              Back to login form
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">
                Account ID or Primary Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={accountNo}
                  onChange={(e) => setAccountNo(e.target.value)}
                  placeholder="e.g. IK-98421 or user@example.com"
                  className="w-full bg-[#1A1A1E] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#ED101A]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">
                Subscriber Secret Key / Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#1A1A1E] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#ED101A]"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-white/50">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded bg-white/10 border-white/20 text-[#ED101A]" />
                <span>Remember this terminal</span>
              </label>
              <a href="#" className="hover:text-white transition-colors">Forgot credentials?</a>
            </div>

            <button
              type="submit"
              className="w-full btn-pill-primary text-sm font-semibold !py-3.5 flex items-center justify-center gap-2 mt-2"
            >
              <span>Sign In to My Ikonectt</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[11px] text-white/40 text-center mt-2 leading-relaxed">
              Protected subscriber portal. If you are a new customer awaiting physical installation, your onboarding credentials will be issued upon optical terminal provisioning.
            </p>
          </form>
        )}

      </div>
    </div>
  );
};
