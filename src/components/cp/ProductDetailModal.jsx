import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Package, Ruler, ShoppingBag, Check } from 'lucide-react';
import SizeChartModal from './SizeChartModal';
import { addToCart } from '@/lib/cartStore';

export default function ProductDetailModal({ product, onClose, onOrder }) {
  const images = product.images?.length ? product.images : [];
  const [activeIdx, setActiveIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [added, setAdded] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const isSoldOut = product.stock_limit > 0 && product.total_ordered >= product.stock_limit;
  const stockLeft = product.stock_limit > 0 ? product.stock_limit - (product.total_ordered || 0) : null;
  const sizes = product.sizes?.length ? product.sizes : [];

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
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest">
                  {product.category_name || 'Fightwear'}
                </p>
                {product.is_preorder && !isSoldOut && (
                  <span className="font-mono-ui text-[10px] uppercase tracking-widest px-2 py-0.5 bg-[#ff6b00] text-white font-bold">Pre-Order</span>
                )}
                {isSoldOut && (
                  <span className="font-mono-ui text-[10px] uppercase tracking-widest px-2 py-0.5 bg-[#ff0000]/80 text-white">Sold Out</span>
                )}
              </div>
              <h2 className="font-tactical text-3xl text-white mt-1 leading-tight">{product.name}</h2>
              {product.edition && (
                <p className="font-mono-ui text-xs text-[#ff8c00] mt-1">{product.edition}</p>
              )}
            </div>

            <p className="font-mono-ui text-2xl text-[#ff6b00] font-bold">₱{Number(product.price).toLocaleString()}</p>

            {product.description && (
              <p className="text-[#888] text-sm leading-relaxed">{product.description}</p>
            )}

            {sizes.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest">
                    Select Size {sizeError && <span className="text-[#ff0000] ml-2">← Please select a size</span>}
                  </p>
                  <button
                    onClick={() => setShowSizeChart(true)}
                    className="flex items-center gap-1 font-mono-ui text-[10px] text-[#ff8c00] hover:text-white uppercase tracking-widest transition-colors"
                  >
                    <Ruler className="w-3 h-3" /> Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {sizes.map(s => (
                    <button
                      key={s}
                      onClick={() => { setSelectedSize(s); setSizeError(false); }}
                      className={`px-3 py-1.5 border font-mono-ui text-xs transition-all ${
                        selectedSize === s
                          ? 'border-[#ff8c00] bg-[#ff8c00] text-white font-bold'
                          : 'border-[#333] text-[#888] hover:border-[#555] hover:text-white'
                      }`}
                    >
                      {s}
                    </button>
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
                onClick={() => {
                  if (isSoldOut) return;
                  const sizeToUse = selectedSize || (sizes.length === 0 ? 'One Size' : null);
                  if (!sizeToUse) {
                    setSizeError(true);
                    return;
                  }
                  addToCart(product, sizeToUse);
                  setAdded(true);
                  setTimeout(() => {
                    setAdded(false);
                    onClose();
                    onOrder(product);
                  }, 800);
                }}
                disabled={isSoldOut}
                style={
                  isSoldOut
                    ? { background: '#1a1a1a', border: '1px solid #222', color: '#444', cursor: 'not-allowed' }
                    : (sizes.length > 0 && !selectedSize)
                    ? { background: '#333', border: '1px solid #444', color: '#666', cursor: 'not-allowed' }
                    : { background: '#ff6b00', border: '1px solid #ff6b00', color: '#ffffff', fontWeight: 700, cursor: 'pointer' }
                }
                className="w-full py-3.5 font-mono-ui text-sm tracking-widest uppercase transition-all flex items-center justify-center gap-2"
              >
                {isSoldOut ? (
                  'Sold Out'
                ) : added ? (
                  <><Check className="w-4 h-4" /> Added!</>
                ) : (sizes.length > 0 && !selectedSize) ? (
                  'Select a Size'
                ) : (
                  <><ShoppingBag className="w-4 h-4" /> {product.is_preorder ? 'Pre-order Now' : 'Add to Bag'}</>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Size Chart Modal */}
      <AnimatePresence>
        {showSizeChart && (
          <SizeChartModal onClose={() => setShowSizeChart(false)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}