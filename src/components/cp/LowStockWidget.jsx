import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

const LOW_STOCK_THRESHOLD = 3; // sizes with stock <= this are flagged

export default function LowStockWidget({ products }) {
  const [expanded, setExpanded] = useState(true);

  // Build list of low-stock size variants
  const alerts = [];
  products.forEach(p => {
    if (p.stock_per_size && typeof p.stock_per_size === 'object') {
      Object.entries(p.stock_per_size).forEach(([size, qty]) => {
        if (qty <= LOW_STOCK_THRESHOLD) {
          alerts.push({ id: p.id, name: p.name, size, qty: Number(qty) });
        }
      });
    }
  });

  if (alerts.length === 0) return (
    <div className="bg-[#1c1c1c] border border-[#333] p-5 flex items-center gap-3">
      <div className="w-2 h-2 rounded-full bg-green-500" />
      <p className="font-mono-ui text-xs text-[#666]">All size variants are sufficiently stocked</p>
    </div>
  );

  return (
    <div className="bg-[#1c1c1c] border border-[#ff0000]/40">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#222] transition-colors"
      >
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-[#ff4444]" />
          <span className="font-mono-ui text-xs text-white uppercase tracking-widest">
            Low Stock Alert
          </span>
          <span className="font-mono-ui text-[10px] bg-[#ff0000]/20 text-[#ff4444] border border-[#ff0000]/30 px-2 py-0.5">
            {alerts.length} variant{alerts.length !== 1 ? 's' : ''}
          </span>
        </div>
        {expanded ? <ChevronUp className="w-3.5 h-3.5 text-[#555]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#555]" />}
      </button>

      {expanded && (
        <div className="border-t border-[#ff0000]/20 divide-y divide-[#222]">
          {alerts.map((a, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="font-mono-ui text-xs text-white">{a.name}</p>
                <p className="font-mono-ui text-[10px] text-[#555] mt-0.5">Size: {a.size}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`font-mono-ui text-sm font-bold ${a.qty === 0 ? 'text-[#ff0000]' : 'text-[#ff8c00]'}`}>
                  {a.qty === 0 ? 'OUT' : a.qty}
                </span>
                <Link
                  to={createPageUrl('StaffProducts')}
                  className="font-mono-ui text-[9px] text-[#444] hover:text-white uppercase tracking-widest transition-colors border border-[#333] px-2 py-1 hover:border-[#555]"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}