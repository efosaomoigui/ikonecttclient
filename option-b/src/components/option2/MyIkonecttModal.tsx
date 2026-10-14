import React, { useState } from 'react';
import { X, User, Lock, Wifi, CreditCard, HelpCircle, ArrowRight, Activity, CheckCircle } from 'lucide-react';
import { IkonecttLogo } from '../common/IkonecttLogo';

interface MyIkonecttModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MyIkonecttModal: React.FC<MyIkonecttModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'quickpay'>('signin');
  const [accountNumber, setAccountNumber] = useState('');
  const [password, setPassword] = useState('');
  const [quickPayAmount, setQuickPayAmount] = useState('32500');
  const [paySuccess, setPaySuccess] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 relative shadow-2xl border border-[#e0e0e0]">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-[#7a7a7a] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] transition-colors"
          aria-label="Close portal modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <IkonecttLogo size="md" className="justify-center mb-3" />
          <h3 className="text-xl font-bold text-[#1d1d1f]">My Ikonectt Portal</h3>
          <p className="text-xs text-[#6e6e73] mt-1">
            Manage your optical subscription, speed profile & renewals
          </p>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 p-1 bg-[#f5f5f7] rounded-xl mb-6 text-xs font-semibold">
          <button
            onClick={() => {
              setActiveTab('signin');
              setPaySuccess(false);
            }}
            className={`py-2 rounded-lg transition-all ${
              activeTab === 'signin' ? 'bg-white text-[#1d1d1f] shadow-sm' : 'text-[#7a7a7a]'
            }`}
          >
            Account Sign In
          </button>
          <button
            onClick={() => {
              setActiveTab('quickpay');
              setPaySuccess(false);
            }}
            className={`py-2 rounded-lg transition-all ${
              activeTab === 'quickpay' ? 'bg-white text-[#1d1d1f] shadow-sm' : 'text-[#7a7a7a]'
            }`}
          >
            Quick Bill Pay
          </button>
        </div>

        {activeTab === 'signin' ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert(`Logged in to My Ikonectt account: ${accountNumber || 'IKON-89241'}. Optical connection: Active (100 Mbps).`);
              onClose();
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-semibold text-[#1d1d1f] mb-1">
                Account ID / Phone / Email
              </label>
              <div className="relative">
                <input
                  required
                  type="text"
                  placeholder="e.g. IKON-78421 or 0803 123 4567"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#e0e0e0] focus:border-[#ED101A] text-sm text-[#1d1d1f] focus:outline-none"
                />
                <User className="w-4 h-4 text-[#7a7a7a] absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1d1d1f] mb-1">Password</label>
              <div className="relative">
                <input
                  required
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#e0e0e0] focus:border-[#ED101A] text-sm text-[#1d1d1f] focus:outline-none"
                />
                <Lock className="w-4 h-4 text-[#7a7a7a] absolute left-3.5 top-3" />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-1.5 text-[#6e6e73] cursor-pointer">
                <input type="checkbox" className="rounded text-[#ED101A]" defaultChecked />
                <span>Remember this device</span>
              </label>
              <a href="#reset" onClick={(e) => { e.preventDefault(); alert('Password reset link sent to your registered email or phone.'); }} className="text-[#ED101A] font-medium hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-6 rounded-full text-sm font-bold text-white bg-[#ED101A] hover:bg-[#D50913] transition-colors flex items-center justify-center gap-2 mt-4"
            >
              <span>Access My Ikonectt</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <div>
            {paySuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-[#1d1d1f]">Payment Successful!</h4>
                <p className="text-xs text-[#6e6e73]">
                  Your fibre subscription of ₦{parseInt(quickPayAmount).toLocaleString()} has been renewed for 30 days. Optical gateway synchronized.
                </p>
                <button
                  onClick={onClose}
                  className="mt-3 px-6 py-2 bg-[#1d1d1f] text-white text-xs font-semibold rounded-full"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setPaySuccess(true);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-[#1d1d1f] mb-1">
                    Subscriber Account ID
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. IKON-28491"
                    defaultValue="IKON-94812"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#e0e0e0] focus:border-[#ED101A] text-sm text-[#1d1d1f] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1d1d1f] mb-1">
                    Renewal Plan Amount (₦)
                  </label>
                  <select
                    value={quickPayAmount}
                    onChange={(e) => setQuickPayAmount(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#e0e0e0] focus:border-[#ED101A] text-sm text-[#1d1d1f] focus:outline-none"
                  >
                    <option value="21500">Connect Start (50 Mbps) — ₦21,500</option>
                    <option value="32500">Connect Home (100 Mbps) — ₦32,500</option>
                    <option value="54000">Connect Plus (200 Mbps) — ₦54,000</option>
                    <option value="98000">Connect Gigabit (500 Mbps) — ₦98,000</option>
                    <option value="58000">Business Essential (100 Mbps) — ₦58,000</option>
                    <option value="125000">Business Pro (250 Mbps) — ₦125,000</option>
                  </select>
                </div>

                <div className="p-3 bg-[#fafafc] rounded-xl border border-[#e8e8ed] text-xs text-[#6e6e73] space-y-1">
                  <div className="flex justify-between">
                    <span>Payment Gateway:</span>
                    <span className="font-semibold text-[#1d1d1f]">Instant Card / USSD / Bank Transfer</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Signal Reactivation:</span>
                    <span className="font-semibold text-emerald-600">Instant Automated Provisioning</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-6 rounded-full text-sm font-bold text-white bg-[#ED101A] hover:bg-[#D50913] transition-colors flex items-center justify-center gap-2 mt-4"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Renew Subscription &rarr;</span>
                </button>
              </form>
            )}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-[#f0f0f0] flex items-center justify-between text-xs text-[#7a7a7a]">
          <span className="flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
            <span>Core Optical Grid: 100% Operational</span>
          </span>
          <button
            onClick={() => alert('Support helpline: +234 (0) 700 IKONECTT or email support@ikonectt.com')}
            className="text-[#6e6e73] hover:text-[#ED101A] transition-colors"
          >
            Need Help?
          </button>
        </div>
      </div>
    </div>
  );
};
