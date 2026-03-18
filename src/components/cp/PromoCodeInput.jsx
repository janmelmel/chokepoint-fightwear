import React, { useState } from 'react';
import { Tag, Check, X, Loader2 } from 'lucide-react';

// For now, promo codes are client-side only
// In production, this should validate against a database
const PROMO_CODES = {
  'CHOKEPOINT10': { type: 'percent', value: 10, description: '10% off' },
  'WELCOME15': { type: 'percent', value: 15, description: '15% off first order' },
  'FREESHIP': { type: 'fixed', value: 0, description: 'Free shipping (arranged via chat)' },
};

export default function PromoCodeInput({ onApply, appliedCode }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleApply = async () => {
    if (!code.trim()) return;
    
    setLoading(true);
    setError('');
    
    // Simulate API call
    await new Promise(r => setTimeout(r, 500));
    
    const promo = PROMO_CODES[code.toUpperCase()];
    if (promo) {
      onApply({ code: code.toUpperCase(), ...promo });
      setCode('');
    } else {
      setError('Invalid promo code');
    }
    
    setLoading(false);
  };

  const handleRemove = () => {
    onApply(null);
  };

  if (appliedCode) {
    return (
      <div className="flex items-center justify-between p-3 bg-[#ff8c00]/10 border border-[#ff8c00]/30">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-[#ff8c00]" />
          <span className="font-mono-ui text-xs text-[#ff8c00] uppercase">{appliedCode.code}</span>
          <span className="font-mono-ui text-[10px] text-[#888]">({appliedCode.description})</span>
        </div>
        <button onClick={handleRemove} className="text-[#555] hover:text-[#ff0000] transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
          <input
            value={code}
            onChange={(e) => { setCode(e.target.value); setError(''); }}
            placeholder="Promo code"
            className="w-full bg-[#111] border border-[#333] text-white font-mono-ui text-sm pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#ff8c00]/60 uppercase"
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
          />
        </div>
        <button
          onClick={handleApply}
          disabled={loading || !code.trim()}
          style={{ background: '#1c1c1c', border: '1px solid #444', color: '#d0d0d0' }}
          className="px-4 py-2.5 font-mono-ui text-xs uppercase tracking-widest disabled:opacity-40"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
        </button>
      </div>
      {error && (
        <p className="font-mono-ui text-[10px] text-[#ff0000] flex items-center gap-1">
          <X className="w-3 h-3" /> {error}
        </p>
      )}
    </div>
  );
}