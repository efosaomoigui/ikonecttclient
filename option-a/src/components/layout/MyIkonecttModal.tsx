import React, { useState } from 'react';
import {
  X,
  User,
  Activity,
  Wifi,
  CreditCard,
  Wrench,
  Download,
  Upload,
  Gauge,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

interface MyIkonecttModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MyIkonecttModal: React.FC<MyIkonecttModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'billing' | 'hardware' | 'support'>('overview');
  const [testingSpeed, setTestingSpeed] = useState(false);
  const [speedResult, setSpeedResult] = useState<{ down: number; up: number; ping: number } | null>(null);

  if (!isOpen) return null;

  const runSpeedTest = () => {
    setTestingSpeed(true);
    setSpeedResult(null);
    setTimeout(() => {
      setTestingSpeed(false);
      setSpeedResult({ down: 98.4, up: 99.1, ping: 3 });
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-gray-200">
        {/* Header */}
        <div className="bg-[#1a1c1d] text-white px-6 sm:px-8 py-5 flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#ED101A] flex items-center justify-center text-white font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">My Ikonectt</h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono-stat bg-[#008653] text-white uppercase tracking-wider">
                  Active Service
                </span>
              </div>
              <p className="text-xs text-gray-400 font-mono-stat">
                Account ID: IK-FTTH-84920 · Lekki Phase 1 Node
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 flex items-center justify-center transition-colors"
            aria-label="Close Portal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-[#f9f9fb] px-6 sm:px-8 border-b border-gray-200 flex gap-6 text-[14px]">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3.5 border-b-2 font-medium transition-colors ${
              activeTab === 'overview'
                ? 'border-[#ED101A] text-[#ED101A] font-semibold'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Connection Overview
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`py-3.5 border-b-2 font-medium transition-colors ${
              activeTab === 'billing'
                ? 'border-[#ED101A] text-[#ED101A] font-semibold'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Billing & Invoices
          </button>
          <button
            onClick={() => setActiveTab('hardware')}
            className={`py-3.5 border-b-2 font-medium transition-colors ${
              activeTab === 'hardware'
                ? 'border-[#ED101A] text-[#ED101A] font-semibold'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            ONT & Wi-Fi Gateway
          </button>
          <button
            onClick={() => setActiveTab('support')}
            className={`py-3.5 border-b-2 font-medium transition-colors ${
              activeTab === 'support'
                ? 'border-[#ED101A] text-[#ED101A] font-semibold'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Support Tickets
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Telemetry Status Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-[#f9f9fb] border border-gray-200 flex flex-col justify-between">
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Subscription Tier
                  </div>
                  <div className="my-2">
                    <div className="text-xl font-bold text-gray-900">Home Plus</div>
                    <div className="text-sm text-[#ED101A] font-semibold">100 Mbps Symmetrical</div>
                  </div>
                  <div className="text-xs text-gray-500">Auto-Renews: 28th of this month</div>
                </div>

                <div className="p-5 rounded-2xl bg-[#f9f9fb] border border-gray-200 flex flex-col justify-between">
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Optical Rx Power Level
                  </div>
                  <div className="my-2">
                    <div className="text-2xl font-mono-stat font-bold text-[#008653]">-19.4 dBm</div>
                    <div className="text-xs text-gray-600 flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#008653]" />
                      <span>Optimal Laser Alignment</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">Target Range: -18 to -25 dBm</div>
                </div>

                <div className="p-5 rounded-2xl bg-[#f9f9fb] border border-gray-200 flex flex-col justify-between">
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Monthly Data Transferred
                  </div>
                  <div className="my-2">
                    <div className="text-2xl font-mono-stat font-bold text-gray-900">842.6 GB</div>
                    <div className="text-xs text-gray-600">Uncapped · Zero Throttling</div>
                  </div>
                  <div className="text-xs text-[#008653] font-medium">100% Full Speed Active</div>
                </div>
              </div>

              {/* Speed Diagnostic Tool */}
              <div className="p-6 rounded-2xl bg-[#272729] text-white flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Gauge className="w-5 h-5 text-[#ED101A]" />
                    <h4 className="font-bold text-[16px]">Optical Line Speed Test</h4>
                  </div>
                  <p className="text-sm text-gray-300 max-w-md">
                    Ping our direct IXPN Lagos peering hub to verify latency and packet delivery.
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  {speedResult && (
                    <div className="flex items-center gap-4 bg-black/40 px-4 py-2 rounded-xl text-center font-mono-stat text-xs">
                      <div>
                        <div className="text-gray-400">PING</div>
                        <div className="text-white font-bold">{speedResult.ping} ms</div>
                      </div>
                      <div className="h-6 w-px bg-gray-700" />
                      <div>
                        <div className="text-gray-400">DOWN</div>
                        <div className="text-[#00D084] font-bold">{speedResult.down} Mbps</div>
                      </div>
                      <div className="h-6 w-px bg-gray-700" />
                      <div>
                        <div className="text-gray-400">UP</div>
                        <div className="text-[#00D084] font-bold">{speedResult.up} Mbps</div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={runSpeedTest}
                    disabled={testingSpeed}
                    className="px-6 py-2.5 rounded-full bg-[#ED101A] text-white font-semibold text-sm hover:bg-[#bb000e] transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${testingSpeed ? 'animate-spin' : ''}`} />
                    <span>{testingSpeed ? 'Testing Route...' : 'Run Test'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200">
                <div>
                  <div className="font-bold text-gray-900">Current Cycle: Oct 2026</div>
                  <div className="text-sm text-gray-500">Home Plus 100 Mbps (₦35,000/mo)</div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-green-100 text-green-800">
                  Paid · Auto-Debit Active
                </span>
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-gray-100 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Past Invoice Statements
                </div>
                <div className="divide-y divide-gray-200 text-sm">
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">September 2026 - Monthly Fiber</div>
                      <div className="text-xs text-gray-500">Invoice #INV-2026-0928 · ₦35,000</div>
                    </div>
                    <button className="text-xs text-[#ED101A] font-semibold hover:underline">
                      Download PDF
                    </button>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">August 2026 - Monthly Fiber</div>
                      <div className="text-xs text-gray-500">Invoice #INV-2026-0828 · ₦35,000</div>
                    </div>
                    <button className="text-xs text-[#ED101A] font-semibold hover:underline">
                      Download PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hardware' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 flex items-start gap-4">
                <Wifi className="w-8 h-8 text-[#ED101A] shrink-0 mt-1" />
                <div className="space-y-1">
                  <h4 className="font-bold text-gray-900">Wi-Fi 6 Gateway (ONT-AX3000)</h4>
                  <p className="text-sm text-gray-600">
                    Dual-Band 2.4GHz + 5GHz active. 14 connected household devices.
                  </p>
                  <div className="pt-2 flex flex-wrap gap-2 text-xs">
                    <span className="bg-white border px-2.5 py-1 rounded-md text-gray-700">
                      SSID: Ikonectt-Fiber-Home
                    </span>
                    <span className="bg-white border px-2.5 py-1 rounded-md text-gray-700">
                      Firmware: v4.2.1-Lagos-Build (Up to date)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'support' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-[#FFF0F1] border border-[#FFD4D7] flex items-center justify-between">
                <div>
                  <div className="font-bold text-gray-900">Priority Tier-2 Account Line</div>
                  <p className="text-xs text-gray-600">
                    24/7 dedicated dispatch direct to Lekki Phase 1 field NOC.
                  </p>
                </div>
                <a
                  href="tel:+2347001234567"
                  className="px-4 py-2 rounded-full bg-[#ED101A] text-white text-xs font-semibold"
                >
                  Call +234 700 123 4567
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 sm:px-8 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
          <span>Connected via Lekki Core Central Ring · ODF-FAT-409</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 font-medium hover:bg-gray-300 transition-colors"
          >
            Close Portal
          </button>
        </div>
      </div>
    </div>
  );
};
