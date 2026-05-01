import React, { useState } from 'react';
import { Mail } from 'lucide-react';

const MESSENGER_URL = 'https://m.me/61571430141920';
const EMAIL = 'sales@chokepoint-fightwear.com';

export default function MessengerButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="flex flex-col gap-2 items-end">
          {/* Email option */}
          <a
            href={`mailto:${EMAIL}`}
            className="flex items-center gap-2 bg-[#1c1c1c] border border-[#333] px-4 py-2.5 shadow-xl hover:border-[#555] transition-colors group"
            title="Send us an email"
          >
            <Mail className="w-4 h-4 text-[#888] group-hover:text-white transition-colors" />
            <span className="font-mono-ui text-xs text-[#888] group-hover:text-white whitespace-nowrap transition-colors">Email Us</span>
          </a>

          {/* Messenger option */}
          <a
            href={MESSENGER_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 bg-[#1c1c1c] border border-[#333] px-4 py-2.5 shadow-xl hover:border-[#555] transition-colors group"
            title="Chat on Messenger"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#0084ff">
              <path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.905 1.408 5.504 3.623 7.22V22l3.33-1.83c.889.247 1.83.38 2.047.38 5.523 0 10-4.145 10-9.243S17.523 2 12 2zm1.02 12.44l-2.55-2.72-4.98 2.72 5.48-5.82 2.61 2.72 4.92-2.72-5.48 5.82z"/>
            </svg>
            <span className="font-mono-ui text-xs text-[#888] group-hover:text-white whitespace-nowrap transition-colors">Messenger</span>
          </a>
        </div>
      )}

      {/* Main toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-transform hover:scale-110"
        style={{ background: open ? '#1a1a1a' : 'linear-gradient(135deg, #2563eb, #4f8ef7)' }}
        aria-label="Contact us"
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
            <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        ) : (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.905 1.408 5.504 3.623 7.22V22l3.33-1.83c.889.247 1.83.38 2.047.38 5.523 0 10-4.145 10-9.243S17.523 2 12 2zm1.02 12.44l-2.55-2.72-4.98 2.72 5.48-5.82 2.61 2.72 4.92-2.72-5.48 5.82z"/>
          </svg>
        )}
      </button>
    </div>
  );
}