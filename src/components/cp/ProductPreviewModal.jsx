import React from 'react';
import { motion } from 'framer-motion';
import { X, Tag, Package, AlertCircle } from 'lucide-react';

export default function ProductPreviewModal({ product, onClose }) {
  if (!product) return null;
  const sizes = product.sizes?.length ? product.sizes : ['XS','S','M','L','XL','XXL'];
  const isSoldOut = product.stock_limit > 0 && product.total_ordered >= product.stock_limit;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-2xl bg-[#111] border border-[#333] overflow-hidden max-h-[90vh] overflow-y-auto">

        <div className="flex items-center justify-between px-5 py-3 border-b border-[#222] bg-[#ff8c00]/10">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#ff8c00]" />
            <span className="font-mono-ui text-[11px] text-[#ff8c00] uppercase tracking-widest">Preview Mode — Not Live</span>
          </div>
          <button onClick={onClose} className="text-[#555] hover:text-white"><X className="w-4 h-4" /></button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2">
          <div className="aspect-square bg-[#0d0d0d] relative">
            {product.images?.[0] ? (
              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover opacity-80" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="font-tactical text-8xl text-[#1a1a1a]">CP</span>
              </div>
            )}
          </div>

          <div className="p-6 space-y-4">
            <div>
              <p className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest">
                {product.category_name || 'Fightwear'} · {product.status}
              </p>
              <h2 className="font-tactical text-3xl text-white mt-1">{product.name}</h2>
              {product.edition && <p className="font-mono-ui text-xs text-[#ff8c00] mt-1">{product.edition}</p>}
            </div>

            <p className="font-mono-ui text-2xl text-white">₱{Number(product.price).toLocaleString()}</p>

            {product.description && (
              <p className="text-[#888] text-sm leading-relaxed font-inter">{product.description}</p>
            )}

            <div>
              <p className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest mb-2">Sizes</p>
              <div className="flex flex-wrap gap-2">
                {sizes.map(s => (
                  <span key={s} className="px-3 py-1.5 border border-[#333] font-mono-ui text-xs text-[#888]">{s}</span>
                ))}
              </div>
            </div>

            {product.stock_limit > 0 && (
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#555]" />
                <span className="font-mono-ui text-xs text-[#666]">
                  {product.total_ordered || 0} / {product.stock_limit} ordered
                </span>
              </div>
            )}

            <button disabled
              className="w-full py-3.5 font-mono-ui text-sm tracking-widest uppercase bg-[#ff8c00]/30 text-[#ff8c00]/60 border border-[#ff8c00]/20 cursor-not-allowed">
              {isSoldOut ? 'Sold Out' : product.is_preorder ? 'Pre-order Now' : 'Add to Bag'}
            </button>
            <p className="font-mono-ui text-[10px] text-[#444] text-center">Preview only — buttons disabled</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

import { Eye } from 'lucide-react';