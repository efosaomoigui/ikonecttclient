import React, { useState } from 'react';
import { PageId } from '../../types';
import { MessageSquare, X, Send, Bot, CheckCircle } from 'lucide-react';

interface ConciergeWidgetProps {
  onNavigate: (page: PageId) => void;
}

interface Message {
  id: string;
  sender: 'concierge' | 'user';
  text: string;
  time: string;
}

export const ConciergeWidget: React.FC<ConciergeWidgetProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'concierge',
      text: 'Welcome to Ikonectt. How can our network engineers assist your line today?',
      time: 'Just now',
    },
  ]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      time: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');

    // Generate response based on query
    setTimeout(() => {
      let reply = 'Thank you for reaching out. An optical support engineer is standing by.';
      const lower = text.toLowerCase();
      if (lower.includes('coverage') || lower.includes('area') || lower.includes('lekki') || lower.includes('ikoyi')) {
        reply = 'You can verify live optical drop availability in under 30 seconds using our 5-Stage GIS Coverage Engine. Would you like to check now?';
      } else if (lower.includes('plan') || lower.includes('price') || lower.includes('cost') || lower.includes('speed')) {
        reply = 'Our residential plans range from 50 Mbps (₦25,000/mo) up to 500 Mbps Ultra (₦80,000/mo) with 100% unthrottled data and Wi-Fi 6 hardware included.';
      } else if (lower.includes('business') || lower.includes('sla') || lower.includes('dia') || lower.includes('office')) {
        reply = 'For enterprise lines, we provide 1:1 pure symmetrical Dedicated Internet Access (DIA) with a 99.99% financial contractual SLA and direct access to our Tier-3 NOC.';
      } else if (lower.includes('support') || lower.includes('slow') || lower.includes('issue') || lower.includes('down')) {
        reply = 'All metro rings are operating normally at 99.98% SLA. If you have an active account line, please provide your Line ID or call our 24/7 priority line at +234 700 123 4567.';
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'concierge',
          text: reply,
          time: 'Just now',
        },
      ]);
    }, 700);
  };

  return (
    <aside className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <div className="w-[340px] sm:w-[380px] bg-white rounded-2xl border border-[#F0F0F0] shadow-[0_20px_48px_rgba(0,0,0,0.14)] p-5 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-3 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#F0F0F0]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00D084]" />
              <h4 className="text-[14px] font-bold text-[#1a1c1d]">
                Ikonectt Concierge
              </h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono-stat text-[#7A7A7A] uppercase tracking-wider">
                Online
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1"
                aria-label="Close Concierge"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages scroll area */}
          <div className="max-h-[260px] overflow-y-auto space-y-3 pr-1">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${
                  m.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`p-3 rounded-xl text-[13px] leading-relaxed max-w-[85%] ${
                    m.sender === 'user'
                      ? 'bg-[#ED101A] text-white rounded-br-none'
                      : 'bg-[#f3f3f5] text-[#1a1c1d] rounded-bl-none'
                  }`}
                >
                  {m.text}
                </div>
                <span className="text-[10px] text-gray-400 mt-1 px-1">{m.time}</span>
              </div>
            ))}
          </div>

          {/* Quick Action Chips */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            <button
              onClick={() => {
                onNavigate('coverage');
                setIsOpen(false);
              }}
              className="px-2.5 py-1 rounded-full bg-[#FFF0F1] text-[#ED101A] text-[11px] font-semibold hover:bg-[#ED101A] hover:text-white transition-colors"
            >
              Check Coverage
            </button>
            <button
              onClick={() => {
                onNavigate('residential');
                setIsOpen(false);
              }}
              className="px-2.5 py-1 rounded-full bg-[#f3f3f5] text-[#1a1c1d] text-[11px] font-medium hover:bg-gray-200 transition-colors"
            >
              Explore Plans
            </button>
            <button
              onClick={() => handleSend('Tell me about Business Dedicated Internet')}
              className="px-2.5 py-1 rounded-full bg-[#f3f3f5] text-[#1a1c1d] text-[11px] font-medium hover:bg-gray-200 transition-colors"
            >
              Business DIA
            </button>
            <button
              onClick={() => handleSend('How do I contact technical support?')}
              className="px-2.5 py-1 rounded-full bg-[#f3f3f5] text-[#1a1c1d] text-[11px] font-medium hover:bg-gray-200 transition-colors"
            >
              NOC Support
            </button>
          </div>

          {/* Composer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="pt-2 border-t border-[#F0F0F0] flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a query or address..."
              className="w-full px-3.5 py-2.5 rounded-lg text-[13px] bg-[#f3f3f5] border border-[#F0F0F0] text-[#1a1c1d] focus:outline-none focus:border-[#ED101A]"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="w-9 h-9 rounded-lg bg-[#ED101A] text-white flex items-center justify-center shrink-0 hover:bg-[#bb000e] transition-colors disabled:opacity-40"
              aria-label="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-14 h-14 rounded-full bg-[#ED101A] text-white cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-[0_12px_24px_rgba(237,16,26,0.30)] relative focus:outline-none focus:ring-2 focus:ring-[#ED101A] focus:ring-offset-2"
        aria-label="Toggle Ikonectt Concierge"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        <span className="absolute top-1 right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D084] opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#00D084] border-2 border-white" />
        </span>
      </button>
    </aside>
  );
};
