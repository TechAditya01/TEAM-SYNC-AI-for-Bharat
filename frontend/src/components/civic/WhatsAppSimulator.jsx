import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';

const WhatsAppSimulator = () => {
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi! Send a photo/video/audio of the issue.' },
  ]);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Simulate conversation flow
    const timeouts = [
      setTimeout(() => {
        if (currentStep === 0) {
          setMessages(prev => [...prev, { from: 'user', text: 'Here is a pothole near my lane.' }]);
          setCurrentStep(1);
        }
      }, 2000),
      
      setTimeout(() => {
        if (currentStep === 1) {
          setMessages(prev => [...prev, { from: 'bot', text: 'Received ✅ Location captured. Ticket #RPT-12031 created.' }]);
          setCurrentStep(2);
        }
      }, 4000),
      
      setTimeout(() => {
        if (currentStep === 2) {
          setMessages(prev => [...prev, { from: 'bot', text: '🎉 Congratulations! You earned 10 points for this verified report.' }]);
          setCurrentStep(3);
        }
      }, 6000)
    ];

    return () => timeouts.forEach(clearTimeout);
  }, [currentStep]);

  return (
    <div className="rounded-3xl bg-[#0b141a] p-4 shadow-2xl border border-white/10">
      <div className="rounded-2xl bg-[#111b21] p-4 min-h-[420px] flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-white font-semibold">नगर Alert Hub Bot</div>
            <div className="text-xs text-green-400">● Online</div>
          </div>
        </div>
        
        {/* Messages */}
        <div className="space-y-3 flex-1 overflow-y-auto max-h-[280px]">
          {messages.map((msg, idx) => (
            <Bubble key={idx} from={msg.from} text={msg.text} />
          ))}
        </div>
        
        {/* Input Area */}
        <div className="mt-4 rounded-xl bg-[#202c33] px-3 py-2 text-sm text-slate-300 flex items-center gap-2">
          <span>Type a message...</span>
        </div>
        
        {/* Quick Actions */}
        <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
          <button className="px-3 py-1.5 bg-[#202c33] hover:bg-[#2a3942] text-white text-xs rounded-lg whitespace-nowrap transition-colors">
            📍 Share Location
          </button>
          <button className="px-3 py-1.5 bg-[#202c33] hover:bg-[#2a3942] text-white text-xs rounded-lg whitespace-nowrap transition-colors">
            📷 Send Photo
          </button>
          <button className="px-3 py-1.5 bg-[#202c33] hover:bg-[#2a3942] text-white text-xs rounded-lg whitespace-nowrap transition-colors">
            🎤 Voice Note
          </button>
        </div>
      </div>
    </div>
  );
};

const Bubble = ({ from, text }) => {
  const isUser = from === 'user';
  return (
    <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${isUser ? 'ml-auto bg-[#005c4b] text-white' : 'bg-[#202c33] text-slate-100'} animate-fade-in`}>
      {text}
    </div>
  );
};

export default WhatsAppSimulator;
