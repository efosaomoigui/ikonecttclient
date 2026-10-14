import React from 'react';
import { OPTION_03_CONTENT as C } from '../data/content';
import { ArrowRight, Lock, Key, CreditCard, Activity, Sliders } from 'lucide-react';

interface MyIkonecttSectionProps {
  onOpenMyIkonectt: () => void;
}

export const MyIkonecttSection: React.FC<MyIkonecttSectionProps> = ({
  onOpenMyIkonectt,
}) => {
  return (
    <section className="w-full bg-[#090909] text-white py-20 lg:py-28 border-t border-white/5">
      <div className="container-custom">
        <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-b from-[#18181B] to-[#101012] border border-white/10 p-8 sm:p-12 lg:p-16 relative overflow-hidden">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column: Editorial Information */}
            <div className="lg:col-span-7 flex flex-col items-start gap-6">
              
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold uppercase tracking-wider text-[#FF616A]">
                <Lock className="w-3.5 h-3.5 text-[#ED101A]" />
                <span>Subscriber Portal</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                {C.myIkonectt.heading}
              </h2>

              <p className="text-lg text-[#A1A1AA] font-light leading-relaxed">
                {C.myIkonectt.supportingLine}
              </p>

              <p className="text-sm text-white/70 leading-relaxed font-light">
                {C.myIkonectt.description}
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <button
                  onClick={onOpenMyIkonectt}
                  className="btn-pill-primary text-sm font-semibold !px-7 !py-3.5 shadow-xl shadow-[#ED101A]/20 flex items-center gap-2 group"
                >
                  <span>{C.myIkonectt.cta}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <span className="text-xs text-white/40 font-mono">
                  Subscriber Single Sign-On
                </span>
              </div>

              <p className="text-[11px] text-white/35 mt-1">
                {C.myIkonectt.note}
              </p>

            </div>

            {/* Right Column: Restrained Abstract Surface (No Fake Mockup/Dashboard) */}
            <div className="lg:col-span-5 flex flex-col gap-3">
              <div className="p-5 rounded-2xl bg-[#090909]/80 border border-white/10 backdrop-blur-md">
                <div className="flex items-center justify-between text-xs text-white/60 mb-3 pb-2 border-b border-white/10">
                  <span className="font-mono text-[#FF616A]">PORTAL CAPABILITY</span>
                  <span>Direct Customer Access</span>
                </div>
                <div className="space-y-3 text-xs text-white/80">
                  <div className="flex items-center gap-3">
                    <Activity className="w-4 h-4 text-[#ED101A] shrink-0" />
                    <span>Real-time line status & ONT health metrics</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-4 h-4 text-[#ED101A] shrink-0" />
                    <span>Automated billing, statements & instant subscription renewal</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Sliders className="w-4 h-4 text-[#ED101A] shrink-0" />
                    <span>Self-service bandwidth upgrades & plan adjustment</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Key className="w-4 h-4 text-[#ED101A] shrink-0" />
                    <span>Encrypted end-to-end subscriber credentials</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
