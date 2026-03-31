import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const REASONS = [
  'Outside order (Facebook/Messenger)',
  'Outside order (Instagram)',
  'Outside order (Walk-in)',
  'Outside order (Event/Tournament)',
  'Damaged / Defective item',
  'Lost item',
  'New stock arrived',
  'Stock count correction',
  'Other',
];

const INPUT = "w-full bg-[#0a0a0a] border border-[#333] text-white font-mono-ui text-sm px-3 py-2 focus:outline-none focus:border-[#E87722]/60";

function SizeRow({ size, currentStock, mode, adjustment, setAdjustment, reason, setReason, customReason, setCustomReason }) {
  const adjNum = adjustment === '' ? 0 : Number(adjustment);
  const newStock = mode === 'adjust' ? currentStock + adjNum : (adjustment === '' ? currentStock : Number(adjustment));
  const isBelowZero = newStock < 0;
  const isSoldOut = newStock === 0;
  const isLowStock = newStock > 0 && newStock <= 3;
  const isNull = currentStock === null || currentStock === undefined;

  return (
    <div className={`border-b border-[#1a1a1a] last:border-0 ${isNull ? 'opacity-40' : ''}`}>
      <div className="grid grid-cols-[60px_1fr_1fr_1fr] gap-3 items-center px-4 py-3">
        {/* SIZE */}
        <span className={`font-mono-ui text-sm font-bold ${currentStock === 0 ? 'text-[#444]' : 'text-white'}`}>{size}</span>

        {/* CURRENT */}
        <div className="text-center">
          <span className={`font-mono-ui text-sm ${currentStock === 0 ? 'text-[#ff0000]/60' : 'text-[#888]'}`}>
            {isNull ? '∞' : currentStock}
          </span>
          {currentStock === 0 && <p className="font-mono-ui text-[8px] text-[#ff0000]/60 uppercase">sold out</p>}
        </div>

        {/* ADJUST / SET */}
        <div>
          {isNull ? (
            <span className="font-mono-ui text-[10px] text-[#333]">—</span>
          ) : (
            <input
              type="number"
              value={adjustment}
              onChange={e => setAdjustment(e.target.value)}
              placeholder={mode === 'adjust' ? '+/−' : 'Set to'}
              className={`w-full bg-[#0a0a0a] border font-mono-ui text-sm px-2 py-1.5 text-center focus:outline-none transition-colors ${
                isBelowZero ? 'border-[#ff0000] text-[#ff0000]' : 'border-[#333] text-white focus:border-[#E87722]/60'
              }`}
            />
          )}
        </div>

        {/* NEW STOCK */}
        <div className="text-center">
          {isNull ? (
            <span className="font-mono-ui text-[10px] text-[#333]">—</span>
          ) : (
            <div>
              <span className={`font-mono-ui text-sm font-bold ${
                isBelowZero ? 'text-[#ff0000]' : isSoldOut ? 'text-[#ff6b00]' : isLowStock ? 'text-yellow-400' : 'text-green-400'
              }`}>
                {isBelowZero ? '—' : newStock}
              </span>
              {isBelowZero && <p className="font-mono-ui text-[8px] text-[#ff0000] uppercase">invalid</p>}
              {!isBelowZero && isSoldOut && <p className="font-mono-ui text-[8px] text-[#ff6b00] uppercase">sold out</p>}
              {!isBelowZero && isLowStock && <p className="font-mono-ui text-[8px] text-yellow-400 uppercase">low stock</p>}
            </div>
          )}
        </div>
      </div>

      {/* REASON — only if adjustment is made */}
      {!isNull && adjustment !== '' && adjustment !== '0' && (
        <div className="px-4 pb-3 flex gap-2 items-start">
          <div className="flex-1">
            <select value={reason} onChange={e => setReason(e.target.value)}
              className="w-full bg-[#0d0d0d] border border-[#333] text-white font-mono-ui text-[10px] px-2 py-1.5 focus:outline-none focus:border-[#E87722]/60">
              <option value="">— Select reason (required) —</option>
              {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          {reason === 'Other' && (
            <input value={customReason} onChange={e => setCustomReason(e.target.value)}
              placeholder="Describe reason..."
              className="flex-1 bg-[#0d0d0d] border border-[#333] text-white font-mono-ui text-[10px] px-2 py-1.5 focus:outline-none focus:border-[#E87722]/60" />
          )}
        </div>
      )}

      {/* WARNINGS */}
      {!isNull && adjustment !== '' && isBelowZero && (
        <div className="mx-4 mb-3 flex items-center gap-2 border border-[#ff0000]/40 bg-[#ff0000]/5 px-3 py-1.5">
          <AlertCircle className="w-3 h-3 text-[#ff0000] flex-shrink-0" />
          <p className="font-mono-ui text-[10px] text-[#ff0000]">Stock cannot go below 0</p>
        </div>
      )}
      {!isNull && adjustment !== '' && !isBelowZero && isSoldOut && (
        <div className="mx-4 mb-3 flex items-center gap-2 border border-[#ff6b00]/40 bg-[#ff6b00]/5 px-3 py-1.5">
          <AlertTriangle className="w-3 h-3 text-[#ff6b00] flex-shrink-0" />
          <p className="font-mono-ui text-[10px] text-[#ff6b00]">This size will show as SOLD OUT on the storefront</p>
        </div>
      )}
      {!isNull && adjustment !== '' && !isBelowZero && isLowStock && (
        <div className="mx-4 mb-3 flex items-center gap-2 border border-yellow-400/30 bg-yellow-400/5 px-3 py-1.5">
          <AlertTriangle className="w-3 h-3 text-yellow-400 flex-shrink-0" />
          <p className="font-mono-ui text-[10px] text-yellow-400">Low stock warning will appear on storefront</p>
        </div>
      )}
    </div>
  );
}

export default function StockManageModal({ product, user, onClose, onSaved }) {
  const [mode, setMode] = useState('adjust'); // 'adjust' | 'set'
  const [activeVariant, setActiveVariant] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // sizeState: { [variantKey]: { [size]: { adjustment, reason, customReason } } }
  const [sizeState, setSizeState] = useState({});

  const hasVariants = product.variants && product.variants.length > 0;

  const getVariantKey = (v) => v ? v.id : '__base__';

  const initState = () => {
    const state = {};
    if (hasVariants) {
      product.variants.forEach(v => {
        state[v.id] = {};
        (v.sizes || []).forEach(vs => {
          state[v.id][vs.size] = { adjustment: '', reason: '', customReason: '' };
        });
      });
    } else {
      state['__base__'] = {};
      (product.sizes || []).forEach(s => {
        state['__base__'][s] = { adjustment: '', reason: '', customReason: '' };
      });
    }
    return state;
  };

  useEffect(() => {
    setSizeState(initState());
    if (hasVariants) setActiveVariant(product.variants[0]);
  }, [product.id]);

  const setSizeField = (variantKey, size, field, value) => {
    setSizeState(prev => ({
      ...prev,
      [variantKey]: {
        ...prev[variantKey],
        [size]: { ...prev[variantKey]?.[size], [field]: value },
      }
    }));
  };

  const getCurrentStock = (variantKey, size) => {
    if (variantKey === '__base__') {
      return product.stock_per_size?.[size] ?? null;
    }
    const v = product.variants.find(v => v.id === variantKey);
    const vs = (v?.sizes || []).find(s => s.size === size);
    return vs?.stock ?? null;
  };

  const getNewStock = (variantKey, size) => {
    const current = getCurrentStock(variantKey, size);
    if (current === null) return null;
    const adj = sizeState[variantKey]?.[size]?.adjustment;
    if (adj === '' || adj === undefined) return current;
    return mode === 'adjust' ? current + Number(adj) : Number(adj);
  };

  // Validate: no below-zero, all adjusted rows have a reason
  const canSave = () => {
    for (const [vKey, sizes] of Object.entries(sizeState)) {
      for (const [size, row] of Object.entries(sizes)) {
        if (row.adjustment === '' || row.adjustment === '0') continue;
        const newStock = getNewStock(vKey, size);
        if (newStock < 0) return false;
        if (!row.reason) return false;
        if (row.reason === 'Other' && !row.customReason.trim()) return false;
      }
    }
    return true;
  };

  const hasAnyChange = () => {
    for (const sizes of Object.values(sizeState)) {
      for (const row of Object.values(sizes)) {
        if (row.adjustment !== '' && row.adjustment !== '0') return true;
      }
    }
    return false;
  };

  const handleSave = async () => {
    if (!canSave() || !hasAnyChange()) return;
    setSaving(true);

    // Build updated product data
    let updatedProduct = { ...product };
    const logEntries = [];

    for (const [vKey, sizes] of Object.entries(sizeState)) {
      for (const [size, row] of Object.entries(sizes)) {
        if (row.adjustment === '' || row.adjustment === '0') continue;
        const prevStock = getCurrentStock(vKey, size);
        if (prevStock === null) continue;
        const newStock = getNewStock(vKey, size);
        if (newStock < 0) continue;

        const changeAmount = newStock - prevStock;
        const reasonText = row.reason === 'Other' ? row.customReason : row.reason;

        logEntries.push({
          product_id: product.id,
          product_name: product.name,
          variant_name: vKey === '__base__' ? '' : product.variants.find(v => v.id === vKey)?.name || '',
          size,
          prev_stock: prevStock,
          new_stock: newStock,
          change_amount: changeAmount,
          reason: reasonText,
          staff_name: user?.full_name || user?.email || 'Staff',
          staff_email: user?.email || '',
        });

        // Apply to product
        if (vKey === '__base__') {
          updatedProduct.stock_per_size = { ...updatedProduct.stock_per_size, [size]: newStock };
        } else {
          updatedProduct.variants = updatedProduct.variants.map(v => {
            if (v.id !== vKey) return v;
            return {
              ...v,
              sizes: v.sizes.map(vs => vs.size === size ? { ...vs, stock: newStock } : vs),
            };
          });
        }
      }
    }

    // Save product + log entries in parallel
    await Promise.all([
      base44.entities.Product.update(product.id, {
        stock_per_size: updatedProduct.stock_per_size,
        variants: updatedProduct.variants,
      }),
      ...logEntries.map(entry => base44.entities.StockAdjustLog.create(entry)),
    ]);

    setSaving(false);
    setSaved(true);
    setTimeout(() => {
      onSaved?.();
      onClose();
    }, 900);
  };

  const renderSizeTable = (variantKey, sizes) => (
    <div>
      {/* Table header */}
      <div className="grid grid-cols-[60px_1fr_1fr_1fr] gap-3 px-4 py-2 bg-[#0d0d0d] border-b border-[#222]">
        {['Size', 'Current', mode === 'adjust' ? 'Adjust (+/−)' : 'Set To', 'New Stock'].map(h => (
          <p key={h} className="font-mono-ui text-[9px] text-[#444] uppercase tracking-widest text-center first:text-left">{h}</p>
        ))}
      </div>
      {sizes.map(size => {
        const row = sizeState[variantKey]?.[size] || { adjustment: '', reason: '', customReason: '' };
        return (
          <SizeRow
            key={size}
            size={size}
            currentStock={getCurrentStock(variantKey, size)}
            mode={mode}
            adjustment={row.adjustment}
            setAdjustment={v => setSizeField(variantKey, size, 'adjustment', v)}
            reason={row.reason}
            setReason={v => setSizeField(variantKey, size, 'reason', v)}
            customReason={row.customReason}
            setCustomReason={v => setSizeField(variantKey, size, 'customReason', v)}
          />
        );
      })}
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-xl bg-[#111] border border-[#333] max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-[#222] flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-[#E87722]" />
              <h2 className="font-tactical text-2xl text-white">Manage Stock</h2>
            </div>
            <p className="font-mono-ui text-[10px] text-[#555] mt-0.5 truncate max-w-xs">{product.name}</p>
          </div>
          <button onClick={onClose} className="text-[#555] hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        {/* Mode toggle */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-[#1a1a1a] flex-shrink-0">
          <p className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest">Mode:</p>
          <div className="flex">
            {[{ value: 'adjust', label: 'Adjust (+/−)' }, { value: 'set', label: 'Set Exact' }].map(m => (
              <button key={m.value} onClick={() => setMode(m.value)}
                className={`px-4 py-1.5 font-mono-ui text-[10px] uppercase tracking-widest border transition-all ${
                  mode === m.value
                    ? 'bg-[#E87722]/10 border-[#E87722] text-[#E87722]'
                    : 'bg-transparent border-[#333] text-[#555] hover:border-[#555] hover:text-[#888]'
                }`}>
                {m.label}
              </button>
            ))}
          </div>
          <p className="font-mono-ui text-[9px] text-[#333] ml-auto">
            {mode === 'adjust' ? 'Enter +/− to add or remove units' : 'Enter the exact new stock count'}
          </p>
        </div>

        {/* Variant tabs */}
        {hasVariants && (
          <div className="flex gap-0 border-b border-[#222] flex-shrink-0 overflow-x-auto">
            {product.variants.map(v => (
              <button key={v.id} onClick={() => setActiveVariant(v)}
                className={`px-4 py-2.5 font-mono-ui text-[10px] uppercase tracking-widest whitespace-nowrap border-r border-[#222] transition-all ${
                  activeVariant?.id === v.id
                    ? 'bg-[#E87722]/10 text-[#E87722]'
                    : 'text-[#555] hover:text-white hover:bg-[#1a1a1a]'
                }`}>
                {v.name}
              </button>
            ))}
          </div>
        )}

        {/* Table */}
        <div className="flex-1 overflow-y-auto scrollbar-tactical">
          {hasVariants ? (
            activeVariant && renderSizeTable(
              activeVariant.id,
              (activeVariant.sizes || []).map(vs => vs.size)
            )
          ) : (
            renderSizeTable('__base__', product.sizes || [])
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4 border-t border-[#222] flex-shrink-0">
          <button onClick={onClose}
            className="flex-1 py-3 border border-[#333] text-[#555] font-mono-ui text-xs uppercase tracking-widest hover:border-[#555] hover:text-white transition-all">
            Cancel
          </button>
          <button onClick={handleSave}
            disabled={saving || !hasAnyChange() || !canSave()}
            style={{ background: saved ? '#27ae60' : '#E87722', border: `1px solid ${saved ? '#27ae60' : '#E87722'}`, color: '#fff', fontWeight: 700 }}
            className="flex-1 py-3 font-mono-ui text-xs uppercase tracking-widest disabled:opacity-40 flex items-center justify-center gap-2 transition-all">
            {saved ? (
              <><CheckCircle className="w-4 h-4" /> Stock Updated!</>
            ) : saving ? (
              'Saving...'
            ) : (
              <><Package className="w-4 h-4" /> Save Stock Changes</>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}