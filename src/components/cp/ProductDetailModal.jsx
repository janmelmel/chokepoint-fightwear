import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, ShoppingBag, Check, ChevronLeft, ChevronRight, MessageCircle, Mail, Star } from 'lucide-react';
import { addToCart } from '@/lib/cartStore';
import { base44 } from '@/api/base44Client';
import StarRating from './StarRating';

export default function ProductDetailModal({ product, onClose }) {
  const [selectedSize, setSelectedSize] = useState('');
  const [customText, setCustomText] = useState('');
  const [added, setAdded] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);

  if (!product) return null;

  const sizes = product.sizes || [];
  const images = product.images || [];
  const orderType = product.order_type || (product.is_preorder ? 'preorder' : 'add_to_bag');
  const isContactToOrder = orderType === 'contact_to_order';
  const isSoldOut = !isContactToOrder && product.stock_limit > 0 && (product.total_ordered || 0) >= product.stock_limit;

  const isSizeSoldOut = (s) => {
    const sizeStock = product.stock_per_size?.[s];
    return sizeStock != null && sizeStock <= 0;
  };

  const handleAdd = () => {
    const sizeToUse = selectedSize || (sizes.length === 0 ? 'One Size' : null);
    if (!sizeToUse) return;
    if (product.allow_custom_print && !customText) return;
    addToCart(product, sizeToUse, 1, customText);
    setAdded(true);
    setTimeout(() => { setAdded(false); onClose(); }, 1200);
  };

  const canAdd = !isSoldOut &&
    (sizes.length === 0 || (selectedSize && !isSizeSoldOut(selectedSize))) &&
    (!product.allow_custom_print || customText.trim());

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-2xl bg-[#111] border border-[#333] max-h-[90vh] overflow-y-auto scrollbar-tactical"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#222]">
          <p className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest">{product.category_name || 'Fightwear'}</p>
          <button onClick={onClose} className="text-[#555] hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
          {/* Image */}
          <div className="relative aspect-square bg-[#0d0d0d] overflow-hidden">
            {images.length > 0 ? (
              <>
                <img src={images[imgIdx]} alt={product.name} className="w-full h-full object-cover" />
                {images.length > 1 && (
                  <>
                    <button onClick={() => setImgIdx(i => (i - 1 + images.length) % images.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/60 text-white hover:bg-black/80">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button onClick={() => setImgIdx(i => (i + 1) % images.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/60 text-white hover:bg-black/80">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                      {images.map((_, i) => (
                        <button key={i} onClick={() => setImgIdx(i)}
                          className={`w-1.5 h-1.5 rounded-full transition-all ${i === imgIdx ? 'bg-[#ff6b00]' : 'bg-[#555]'}`} />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="font-tactical text-6xl text-[#222]">CP</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="p-5 flex flex-col gap-4">
            <div>
              <h2 className="font-tactical text-3xl text-white leading-tight">{product.name}</h2>
              {product.edition && <p className="font-mono-ui text-[10px] text-[#ff6b00] uppercase tracking-widest mt-1">{product.edition}</p>}
              <p className="font-mono-ui text-2xl text-[#ff6b00] font-bold mt-2">₱{Number(product.price).toLocaleString()}</p>
            </div>

            {product.description && (
              <p className="font-mono-ui text-xs text-[#888] leading-relaxed">{product.description}</p>
            )}

            {/* Contact to Order UI */}
            {isContactToOrder ? (
              <>
                <div className="border-l-2 border-[#ff6b00] bg-[#0d0d0d] px-4 py-3 space-y-1.5">
                  <p className="font-mono-ui text-[10px] text-[#ff6b00] uppercase tracking-widest">Custom Quote Required</p>
                  <p className="font-mono-ui text-[10px] text-[#888] leading-relaxed">
                    {product.inquiry_note || 'This item requires a custom quote. Please contact us via Messenger or email to place your order.'}
                  </p>
                </div>
                <div className="flex flex-col gap-2 mt-auto">
                  <a href="https://m.me/chokepointfightwear" target="_blank" rel="noreferrer"
                    className="btn-glow-orange font-mono-ui text-xs uppercase tracking-widest py-3 flex items-center justify-center gap-2">
                    <MessageCircle className="w-4 h-4" /> Message Us on Facebook
                  </a>
                  <a href="mailto:sales@chokepoint-fightwear.com"
                    className="btn-glow-white font-mono-ui text-xs uppercase tracking-widest py-3 flex items-center justify-center gap-2">
                    <Mail className="w-4 h-4" /> Email Us
                  </a>
                </div>
              </>
            ) : (
              <>
                {/* Sizes */}
                {sizes.length > 0 && !isSoldOut && (
                  <div>
                    <p className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest mb-2">Size</p>
                    <div className="flex flex-wrap gap-1.5">
                      {sizes.map(s => {
                        const soldOut = isSizeSoldOut(s);
                        const sizeStock = product.stock_per_size?.[s];
                        return (
                          <button key={s} disabled={soldOut} onClick={() => setSelectedSize(s)}
                            className={`px-3 py-1.5 font-mono-ui text-[10px] border transition-all relative ${
                              soldOut ? 'border-[#222] text-[#333] line-through cursor-not-allowed' :
                              selectedSize === s ? 'border-[#ff6b00] bg-[#ff6b00] text-white font-bold' :
                              'border-[#444] text-[#aaa] hover:border-[#888] hover:text-white'
                            }`}>
                            {s}
                            {!soldOut && sizeStock != null && sizeStock <= 3 && (
                              <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#ff0000] rounded-full" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Custom print */}
                {product.allow_custom_print && !isSoldOut && (
                  <div>
                    <p className="font-mono-ui text-[10px] text-[#ff8c00] uppercase tracking-widest mb-1">
                      {product.custom_print_label || 'Custom Name/Print'}
                    </p>
                    <input value={customText} onChange={e => setCustomText(e.target.value)}
                      placeholder="Enter your text here"
                      className="w-full bg-[#0a0a0a] border border-[#333] text-white font-mono-ui text-sm px-3 py-2 focus:outline-none focus:border-[#ff8c00]/60" />
                  </div>
                )}

                {orderType === 'preorder' && !isSoldOut && (
                  <span className="font-mono-ui text-[10px] text-[#ff6b00] border border-[#ff6b00]/30 px-2 py-1 self-start uppercase tracking-widest">Pre-Order</span>
                )}
                {isSoldOut && (
                  <span className="font-mono-ui text-[10px] text-[#ff0000] border border-[#ff0000]/30 px-2 py-1 self-start uppercase tracking-widest">Sold Out</span>
                )}

                <button onClick={handleAdd} disabled={!canAdd}
                  style={canAdd
                    ? { background: '#ff6b00', border: '1px solid #ff6b00', color: '#fff', fontWeight: 700 }
                    : { background: '#1a1a1a', border: '1px solid #222', color: '#444', cursor: 'not-allowed' }}
                  className="mt-auto py-3 font-mono-ui text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                  {added ? <><Check className="w-4 h-4" /> Added!</> :
                   isSoldOut ? 'Sold Out' :
                   sizes.length > 0 && !selectedSize ? 'Select a Size' :
                   product.allow_custom_print && !customText ? 'Enter Print Text' :
                   <><ShoppingBag className="w-4 h-4" /> {orderType === 'preorder' ? 'Pre-Order Now' : 'Add to Bag'}</>}
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}