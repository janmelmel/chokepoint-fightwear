import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Package } from 'lucide-react';

export default function ProductDetailModal({ product, onClose, onOrder }) {
  const images = product.images?.length ? product.images : [];
  const [activeIdx, setActiveIdx] = useState(0);
  const isSoldOut = product.stock_limit > 0 && product.total_ordered >= product.stock_limit;
  const stockLeft = product.stock_limit > 0 ? product.stock_limit - (product.total_ordered || 0) : null;

  const prev = () => setActiveIdx(i => (i - 1 + images.length) % images.length);
  const next = () => setActiveIdx(i => (i + 1) % images.length);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-3xl bg-[#111] border border-[#333] max-h-[92vh] overflow-y-auto scrollbar-tactical">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#222]">
          <p className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest">Product Detail</p>
          <button onClick={onClose} className="text-[#555] hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2">
          {/* Gallery */}
          <div className="bg-[#0d0d0d]">
            <div className="relative aspect-square">
              {images.length > 0 ? (
                <>
                  <img src={images[activeIdx]} alt={product.name}
                    className="w-full h-full object-cover" />
                  {images.length > 1 && (
                    <>
                      <button onClick={prev}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/60 border border-[#333] text-white hover:border-[#ff8c00] transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button onClick={next}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/60 border border-[#333] text-white hover:border-[#ff8c00] transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {images.map((_, i) => (
                          <button key={i} onClick={() => setActiveIdx(i)}
                            className={`w-1.5 h-1.5 rounded-full transition-colors ${i === activeIdx ? 'bg-[#ff8c00]' : 'bg-[#555]'}`} />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="font-tactical text-8xl text-[#1a1a1a]">CP</span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto scrollbar-tactical">
                {images.map((url, i) => (
                  <button key={i} onClick={() => setActiveIdx(i)}
                    className={`flex-shrink-0 w-14 h-14 border overflow-hidden transition-colors ${i === activeIdx ? 'border-[#ff8c00]' : 'border-[#333] opacity-50 hover:opacity-80'}`}>
                    <img src={url} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-6 space-y-4 flex flex-col">
            <div>
              <p className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest">
                {product.category_name || 'Fightwear'}
                {product.is_preorder && !isSoldOut && (
                  <span className="ml-2 text-[#ff8c00]">· Pre-Order</span>
                )}
              </p>
              <h2 className="font-tactical text-3xl text-white mt-1 leading-tight">{product.name}</h2>
              {product.edition && (
                <p className="font-mono-ui text-xs text-[#ff8c00] mt-1">{product.edition}</p>
              )}
            </div>

            <p className="font-mono-ui text-2xl text-[#ff6b00] font-bold">₱{Number(product.price).toLocaleString()}</p>

            {product.description && (
              <p className="text-[#888] text-sm leading-relaxed">{product.description}</p>
            )}

            {product.sizes?.length > 0 && (
              <div>
                <p className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest mb-2">Available Sizes</p>
                <div className="flex flex-wrap gap-1.5">
                  {product.sizes.map(s => (
                    <span key={s} className="px-2.5 py-1 border border-[#333] font-mono-ui text-xs text-[#888]">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {stockLeft !== null && (
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#555]" />
                <span className="font-mono-ui text-xs text-[#666]">
                  {product.total_ordered || 0} / {product.stock_limit} ordered · {stockLeft} left
                </span>
              </div>
            )}

            <div className="mt-auto pt-4">
              <button
                onClick={() => { onClose(); onOrder(product); }}
                disabled={isSoldOut}
                className={`w-full py-3.5 font-mono-ui text-sm tracking-widest uppercase transition-all ${
                  isSoldOut
                    ? 'bg-[#1a1a1a] text-[#444] border border-[#222] cursor-not-allowed'
                    : 'btn-glow-orange'
                }`}>
                {isSoldOut ? 'Sold Out' : product.is_preorder ? 'Pre-order Now' : 'Add to Bag'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}