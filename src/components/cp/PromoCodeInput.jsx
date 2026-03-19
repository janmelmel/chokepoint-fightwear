import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Check, X, Loader2 } from 'lucide-react';

const INPUT = "flex-1 bg-[#111] border border-[#333] text-white font-mono-ui text-sm px-3 py-2.5 focus:outline-none focus:border-[#ff8c00]/60";

export async function validatePromoCode(code, subtotal, customerEmail) {
  const results = await base44.entities.PromoCode.filter({ code: code.toUpperCase().trim(), is_active: true });
  if (!results.length) return { valid: false, error: 'Invalid promo code.' };
  const promo = results[0];

  if (promo.expiry_date && new Date(promo.expiry_date) < new Date()) return { valid: false, error: 'This code has expired.' };
  if (promo.usage_limit && promo.usage_count >= promo.usage_limit) return { valid: false, error: 'Code usage limit reached.' };
  if (promo.min_order_amount > 0 && subtotal < promo.min_order_amount) {
    return { valid: false, error: `Minimum order of ₱${promo.min_order_amount.toLocaleString()} required.` };
  }

  const discount = promo.discount_type === 'percentage'
    ? Math.round(subtotal * promo.discount_value / 100)
    : promo.discount_value;

  return { valid: true, promo, discount, label: promo.discount_type === 'percentage' ? `${promo.discount_value}% off` : `₱${discount} off` };
}

export default function PromoCodeInput({ subtotal, onApply, onRemove, appliedPromo }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleApply = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError('');
    const result = await validatePromoCode(code, subtotal);
    setLoading(false);
    if (!result.valid) { setError(result.error); return; }
    onApply(result.promo, result.discount);
    setCode('');
  };

  if (appliedPromo) {
    return (
      <div className="flex items-center justify-between border border-green-500/30 bg-green-500/5 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <Check className="w-3.5 h-3.5 text-green-400" />
          <span className="font-mono-ui text-xs text-green-400 uppercase tracking-wider">{appliedPromo.code}</span>
          <span className="font-mono-ui text-[10px] text-[#555]">
            {appliedPromo.discount_type === 'percentage' ? `${appliedPromo.discount_value}% off` : `₱${appliedPromo.discount_value} off`}
          </span>
        </div>
        <button onClick={onRemove} className="text-[#555] hover:text-[#ff0000] transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex gap-2">
        <input
          value={code}
          onChange={e => { setCode(e.target.value.toUpperCase()); setError(''); }}
          onKeyDown={e => e.key === 'Enter' && handleApply()}
          className={INPUT}
          placeholder="PROMO CODE"
        />
        <button
          onClick={handleApply}
          disabled={loading || !code.trim()}
          className="btn-glow-white px-4 font-mono-ui text-[10px] uppercase tracking-widest disabled:opacity-40 flex items-center gap-1"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Apply'}
        </button>
      </div>
      {error && <p className="font-mono-ui text-[10px] text-[#ff0000]">{error}</p>}
    </div>
  );
}