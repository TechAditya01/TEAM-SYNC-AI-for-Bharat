import React from 'react';

const WhatsAppSimulator = () => {
  return (
    <div className="rounded-3xl bg-[#0b141a] p-4 shadow-2xl border border-white/10">
      <div className="rounded-2xl bg-[#111b21] p-4 min-h-[420px] flex flex-col">
        <div className="text-white font-semibold mb-4">नगर Alert Hub Bot</div>
        <div className="space-y-3 flex-1">
          <Bubble from="bot" text="Hi! Send a photo/video/audio of the issue." />
          <Bubble from="user" text="Here is a pothole near my lane." />
          <Bubble from="bot" text="Received ✅ Location captured. Ticket #RPT-12031 created." />
        </div>
        <div className="mt-4 rounded-xl bg-[#202c33] px-3 py-2 text-sm text-slate-300">
          Type a message...
        </div>
      </div>
    </div>
  );
};

const Bubble = ({ from, text }) => {
  const isUser = from === 'user';
  return (
    <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${isUser ? 'ml-auto bg-[#005c4b] text-white' : 'bg-[#202c33] text-slate-100'}`}>
      {text}
    </div>
  );
};

export default WhatsAppSimulator;
