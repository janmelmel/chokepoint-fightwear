import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

const MESSENGER_URL = 'https://m.me/61571430141920';

export default function MessengerButton() {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
      {hovered && (
        <div className="bg-[#1c1c1c] border border-[#333] px-4 py-2 shadow-xl">
          <p className="font-mono-ui text-xs text-white whitespace-nowrap">Chat with us on Messenger</p>
        </div>
      )}
      <a
        href={MESSENGER_URL}
        target="_blank"
        rel="noreferrer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-transform hover:scale-110"
        style={{ background: 'linear-gradient(135deg, #0084ff, #0099ff)' }}
        aria-label="Chat on Messenger"
      >
        {/* Messenger icon */}
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
          <path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.905 1.408 5.504 3.623 7.22V22l3.33-1.83c.889.247 1.83.38 2.047.38 5.523 0 10-4.145 10-9.243S17.523 2 12 2zm1.02 12.44l-2.55-2.72-4.98 2.72 5.48-5.82 2.61 2.72 4.92-2.72-5.48 5.82z"/>
        </svg>
      </a>
    </div>
  );
}