import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  MessageSquare,
  Bot,
  User,
  ArrowRight,
  RefreshCw,
  MapPin,
  Wifi,
  ShieldCheck,
  Minimize2,
} from 'lucide-react';
import { Plan, RESIDENTIAL_PLANS, BUSINESS_PLANS } from '../../data/telecomData';

interface AIAssistantProps {
  onSelectPlan: (plan: Plan) => void;
  onNavigateCoverage: () => void;
  onOpenPortal: () => void;
}

interface Message {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  action?: {
    type: 'plan' | 'coverage' | 'portal';
    label: string;
    targetPlan?: Plan;
  };
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  onSelectPlan,
  onNavigateCoverage,
  onOpenPortal,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: "Hello! I'm the Ikonectt AI Concierge. How can I help you today? I can recommend the right symmetrical fibre speed for your household, explain our 99.9% business SLA, or check if your street in Lagos, Abuja, or Port Harcourt is ready for connection.",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [isOpen, messages]);

  // Intelligent local fallback if server API is unavailable
  const generateFallbackResponse = (query: string): { text: string; action?: Message['action'] } => {
    const q = query.toLowerCase();

    if (q.includes('cover') || q.includes('estate') || q.includes('lekki') || q.includes('ikeja') || q.includes('abuja') || q.includes('vi') || q.includes('victoria island')) {
      return {
        text: 'Ikonectt pure optical fibre is live across key estates in Lagos (Victoria Island, Ikoyi, Lekki Phase 1, Ikeja GRA, Maryland, Surulere), Abuja (Maitama, Wuse II, Asokoro), and Port Harcourt GRA. You can test your exact street address right here.',
        action: {
          type: 'coverage',
          label: 'Launch Street Coverage Checker',
        },
      };
    }

    if (q.includes('business') || q.includes('office') || q.includes('sla') || q.includes('enterprise') || q.includes('workstation')) {
      return {
        text: 'For enterprises and growing offices, Ikonectt provides dedicated 1:1 contention symmetric circuits with a contractual 99.9% uptime SLA and 4-hour MTTR emergency engineering. Our Business Pro (250 Mbps) includes 2 static IPv4 addresses.',
        action: {
          type: 'plan',
          label: 'View Business Pro Plan',
          targetPlan: BUSINESS_PLANS[1],
        },
      };
    }

    if (q.includes('stream') || q.includes('game') || q.includes('home') || q.includes('family') || q.includes('4k')) {
      return {
        text: 'For 4K HDR streaming, competitive gaming, and homes with 5–10 devices, our most popular residential tier is Connect Home (100 Mbps) at ₦32,500/month. It includes zero data caps and a Wi-Fi 6 mesh-ready optical terminal.',
        action: {
          type: 'plan',
          label: 'Order Connect Home (100 Mbps)',
          targetPlan: RESIDENTIAL_PLANS[1],
        },
      };
    }

    if (q.includes('cap') || q.includes('unlimited') || q.includes('throttle') || q.includes('fair use')) {
      return {
        text: 'All Ikonectt plans are 100% truly uncapped and unthrottled. We do not enforce fair usage policies or slowdown thresholds. You enjoy full optical bandwidth 24 hours a day, 7 days a week.',
      };
    }

    if (q.includes('portal') || q.includes('bill') || q.includes('pay') || q.includes('renew')) {
      return {
        text: 'You can manage your optical line, view real-time signal diagnostics, and renew your subscription in seconds via My Ikonectt portal.',
        action: {
          type: 'portal',
          label: 'Open My Ikonectt Portal',
        },
      };
    }

    return {
      text: 'Ikonectt delivers Nigeria’s premier pure optical fibre network with symmetrical speeds from 50 Mbps up to 1 Gbps. Would you like to check coverage at your address or view our residential and enterprise plans?',
      action: {
        type: 'coverage',
        label: 'Check Street Coverage',
      },
    };
  };

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: query.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query.trim(),
          history: messages.map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const replyText = data.reply;
        let action: Message['action'];

        // Determine helpful action button based on response context
        const lower = (query + ' ' + replyText).toLowerCase();
        if (lower.includes('connect home') || lower.includes('100 mbps')) {
          action = { type: 'plan', label: 'Select Connect Home (100 Mbps)', targetPlan: RESIDENTIAL_PLANS[1] };
        } else if (lower.includes('business pro') || lower.includes('250 mbps')) {
          action = { type: 'plan', label: 'Select Business Pro (250 Mbps)', targetPlan: BUSINESS_PLANS[1] };
        } else if (lower.includes('cover') || lower.includes('street') || lower.includes('estate')) {
          action = { type: 'coverage', label: 'Verify Coverage on Your Street' };
        }

        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            text: replyText,
            action,
          },
        ]);
      } else {
        // Fallback gracefully
        const fallback = generateFallbackResponse(query);
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            text: fallback.text,
            action: fallback.action,
          },
        ]);
      }
    } catch {
      const fallback = generateFallbackResponse(query);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: fallback.text,
          action: fallback.action,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (action: Message['action']) => {
    if (!action) return;
    if (action.type === 'plan' && action.targetPlan) {
      onSelectPlan(action.targetPlan);
      setIsOpen(false);
    } else if (action.type === 'coverage') {
      onNavigateCoverage();
      setIsOpen(false);
    } else if (action.type === 'portal') {
      onOpenPortal();
      setIsOpen(false);
    }
  };

  const quickPrompts = [
    'Check Lekki & Ikeja coverage',
    'Best plan for 4K streaming & gaming',
    'What is your Business 99.9% SLA?',
    'Is upload speed equal to download?',
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 select-none">
      {/* FLOATING TRIGGER BUTTON (Contemporary optical pill) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-3 px-5 py-3.5 rounded-full bg-[#18181b] hover:bg-black text-white shadow-2xl hover:shadow-[0_10px_25px_rgba(237,16,26,0.3)] border border-[#2a2a2c] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
          aria-label="Open Ikonectt AI Concierge"
        >
          {/* Glowing pulse halo */}
          <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-[#ED101A] to-[#FF616A] opacity-40 blur-sm group-hover:opacity-75 transition-opacity" />

          {/* Icon node */}
          <div className="relative w-8 h-8 rounded-full bg-[#ED101A] flex items-center justify-center text-white shrink-0 shadow-sm">
            <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
          </div>

          <div className="relative text-left pr-1">
            <div className="text-[13px] font-bold tracking-tight text-white flex items-center gap-1.5">
              <span>Ikonectt AI</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-[10px] text-[#a0a0a5] font-medium leading-none">
              Optical Concierge
            </div>
          </div>
        </button>
      )}

      {/* CONTEMPORARY FLOATING ASSISTANT CARD */}
      {isOpen && (
        <div className="w-[calc(100vw-2rem)] sm:w-[410px] h-[560px] max-h-[82vh] bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-[#e0e0e0] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-250">
          {/* Header */}
          <div className="p-4 px-5 bg-[#18181b] text-white flex items-center justify-between border-b border-[#2a2a2c]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#ED101A] flex items-center justify-center text-white shrink-0 shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Ikonectt AI Concierge</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Live
                  </span>
                </h3>
                <p className="text-[11px] text-[#a0a0a5]">Optical broadband & coverage assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setMessages([
                    {
                      id: 'welcome',
                      role: 'assistant',
                      text: "Conversation cleared. How else can I assist with your optical broadband connection?",
                    },
                  ]);
                }}
                title="Reset conversation"
                className="p-1.5 text-[#a0a0a5] hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-[#a0a0a5] hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Close assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Conversation Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-[#ED101A]/10 text-[#ED101A] flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] p-3.5 rounded-2xl leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#18181b] text-white rounded-br-none shadow-sm'
                      : 'bg-[#fafafc] text-[#1d1d1f] border border-[#e8e8ed] rounded-bl-none shadow-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Contextual Action Button */}
                  {msg.action && (
                    <div className="mt-3 pt-2.5 border-t border-[#e0e0e0]">
                      <button
                        onClick={() => handleActionClick(msg.action)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ED101A] hover:bg-[#D50913] text-white text-[11px] font-bold shadow-xs transition-colors"
                      >
                        <span>{msg.action.label}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-[#18181b] text-white flex items-center justify-center shrink-0 mt-0.5 text-xs">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 items-center">
                <div className="w-7 h-7 rounded-full bg-[#ED101A]/10 text-[#ED101A] flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="p-3 bg-[#fafafc] border border-[#e8e8ed] rounded-2xl text-[#7a7a7a] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ED101A] animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ED101A] animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ED101A] animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] text-[#7a7a7a] ml-1">Analyzing network data...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="px-4 py-2 border-t border-[#f0f0f0] bg-white overflow-x-auto flex gap-1.5 no-scrollbar">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="px-3 py-1 rounded-full bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[11px] font-medium text-[#1d1d1f] whitespace-nowrap transition-colors shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-[#fafafc] border-t border-[#e0e0e0]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2 bg-white rounded-full border border-[#d2d2d7] focus-within:border-[#ED101A] px-3.5 py-1.5 shadow-xs"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about plans, speeds, coverage..."
                className="w-full text-xs text-[#1d1d1f] focus:outline-none bg-transparent placeholder:text-[#a0a0a5] py-1.5"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-1.5 rounded-full bg-[#ED101A] hover:bg-[#D50913] disabled:opacity-40 text-white transition-colors shrink-0"
                aria-label="Send query"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
            <div className="flex items-center justify-between text-[10px] text-[#a0a0a5] mt-1.5 px-2">
              <span>Powered by Ikonectt Optical Intelligence</span>
              <span>Sub-15ms Symmetrical Fibre</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
