import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, ShoppingBag, MessageCircle, Star, ChevronLeft, ChevronRight, Plus, Minus, AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { addToCart } from '@/lib/cartStore';
import PreOrderTimelineBox from '@/components/cp/PreOrderTimelineBox';

const OUTSIDE_ORDER_REASONS = [
  'Outside order (Facebook/Messenger)',
  'Outside order (Instagram)',
  'Outside order (Walk-in)',
  'Outside order (Event/Tournament)',
];

export default function ProductDetailModal({ product, onClose, onOrder }) {
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [customText, setCustomText] = useState('');
  const [imageIdx, setImageIdx] = useState(0);
  const [added, setAdded] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [soldCount, setSoldCount] = useState(product.total_ordered || 0);
  const [liveStock, setLiveStock] = useState(null); // fetched from DB on size select
  const [stockLoading, setStockLoading] = useState(false);
  const [addError, setAddError] = useState('');

  const hasVariants = product.variants && product.variants.length > 0;
  const isPreorder = product.order_type === 'preorder' || !!product.is_preorder;

  const activeVariant = selectedVariant || null;
  const displayPrice = activeVariant?.price ?? product.price;
  const displayImages = (activeVariant?.images?.length ? activeVariant.images : product.images) || [];

  const getAvailableSizes = () => {
    if (hasVariants && activeVariant) {
      return (activeVariant.sizes || []).map((vs) => vs.size);
    }
    return product.sizes || [];
  };

  const availableSizes = getAvailableSizes();

  // Get stock from local product data (for OOS display on size buttons)
  const getSizeStockLocal = (size) => {
    if (!size) return null;
    if (hasVariants && activeVariant) {
      const vs = (activeVariant.sizes || []).find((s) => s.size === size);
      return vs?.stock ?? null;
    }
    return product.stock_per_size?.[size] ?? null;
  };

  const isSizeOutOfStock = (size) => {
    const stock = getSizeStockLocal(size);
    return stock !== null && stock <= 0;
  };

  // Use live stock when available, otherwise fall back to local product data
  const currentStock = isPreorder ? null : (liveStock !== null ? liveStock : getSizeStockLocal(selectedSize));
  const maxQty = isPreorder ? 10 : currentStock !== null ? Math.max(0, currentStock) : 10;

  useEffect(() => {
    Promise.all([
      base44.entities.Review.filter({ product_id: product.id }),
      base44.entities.StockAdjustLog.filter({ product_id: product.id }),
    ]).then(([revs, logs]) => {
      setReviews(revs);
      const outsideSold = logs
        .filter(l => OUTSIDE_ORDER_REASONS.includes(l.reason))
        .reduce((sum, l) => sum + Math.abs(l.change_amount || 0), 0);
      setSoldCount((product.total_ordered || 0) + outsideSold);
    });

    setSelectedSize('');
    setSelectedVariant(null);
    setImageIdx(0);
    setAdded(false);
    setQuantity(1);
    setLiveStock(null);
    setAddError('');
  }, [product.id]);

  // Reset size + quantity when variant changes
  useEffect(() => {
    setSelectedSize('');
    setImageIdx(0);
    setQuantity(1);
    setLiveStock(null);
    setAddError('');
  }, [selectedVariant]);

  // When size is selected: fetch LIVE stock from DB and cap quantity
  const handleSizeSelect = async (size) => {
    setSelectedSize(size);
    setAddError('');
    setQuantity(1);
    setLiveStock(null);

    if (isPreorder) return;

    setStockLoading(true);
    try {
      // Fetch fresh product from DB
      const fresh = await base44.entities.Product.filter({ id: product.id }).then(r => r[0]);
      let stock = null;
      if (fresh) {
        if (hasVariants && activeVariant) {
          const v = (fresh.variants || []).find(v => v.name === activeVariant.name);
          if (v) {
            const vs = (v.sizes || []).find(s => s.size === size);
            stock = vs?.stock ?? null;
          }
        } else {
          stock = fresh.stock_per_size?.[size] ?? null;
        }
      }
      setLiveStock(stock);
      // Clamp quantity immediately
      if (stock !== null && stock <= 0) {
        setQuantity(0);
      } else if (stock !== null) {
        setQuantity(1);
      }
    } catch {
      // If fetch fails, fall back to local data
    } finally {
      setStockLoading(false);
    }
  };

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const handleAddToBag = async () => {
    if (availableSizes.length > 0 && !selectedSize) return;
    if (hasVariants && !selectedVariant) return;
    setAddError('');

    if (!isPreorder) {
      // Re-validate stock one more time before adding
      setStockLoading(true);
      try {
        const fresh = await base44.entities.Product.filter({ id: product.id }).then(r => r[0]);
        let stock = null;
        if (fresh) {
          if (hasVariants && activeVariant) {
            const v = (fresh.variants || []).find(v => v.name === activeVariant.name);
            if (v) {
              const vs = (v.sizes || []).find(s => s.size === selectedSize || s.size === 'One Size');
              stock = vs?.stock ?? null;
            }
          } else {
            const size = availableSizes.length > 0 ? selectedSize : 'One Size';
            stock = fresh.stock_per_size?.[size] ?? null;
          }
        }
        setLiveStock(stock);

        if (stock !== null && quantity > stock) {
          if (stock <= 0) {
            setAddError(`Sorry, this item in Size ${selectedSize} is now sold out.`);
          } else {
            setAddError(`Sorry, only ${stock} unit(s) of this item are available in Size ${selectedSize}. Please reduce your quantity.`);
            setQuantity(stock);
          }
          setStockLoading(false);
          return;
        }
      } catch {
        // allow through if check fails
      } finally {
        setStockLoading(false);
      }
    }

    const cartProduct = {
      ...product,
      price: displayPrice,
      images: displayImages.length ? displayImages : product.images,
      variant_name: activeVariant?.name || '',
    };

    const size = availableSizes.length > 0 ? selectedSize : 'One Size';
    addToCart(cartProduct, size, quantity, customText);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onOrder?.(product);
    }, 900);
  };

  const prevImage = () => setImageIdx((i) => (i - 1 + displayImages.length) % displayImages.length);
  const nextImage = () => setImageIdx((i) => (i + 1) % displayImages.length);

  const isSizeCurrentlyOOS = selectedSize && !isPreorder && currentStock !== null && currentStock <= 0;

  const canAdd = !added && !stockLoading && !isSizeCurrentlyOOS
    && !(availableSizes.length > 0 && !selectedSize)
    && !(hasVariants && !selectedVariant);

  const btnLabel = added ? 'Added!'
    : stockLoading ? 'Checking stock...'
    : isSizeCurrentlyOOS ? 'Out of Stock'
    : hasVariants && !selectedVariant ? 'Select a Variant'
    : availableSizes.length > 0 && !selectedSize ? 'Select a Size'
    : isPreorder ? 'Pre-Order Now'
    : 'Add to Bag';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-sm"
      onClick={onClose}>

      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-2xl bg-[#111] border border-[#333] sm:rounded-none max-h-[92vh] overflow-y-auto scrollbar-tactical">

        {/* Image */}
        <div className="relative aspect-video bg-[#0d0d0d] overflow-hidden">
          {displayImages.length > 0 ? (
            <>
              <img src={displayImages[imageIdx]} className="w-full h-full object-cover" alt={product.name} />
              {displayImages.length > 1 && (
                <>
                  <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 p-1.5 text-white hover:bg-black/80">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 p-1.5 text-white hover:bg-black/80">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                    {displayImages.map((_, i) => (
                      <button key={i} onClick={() => setImageIdx(i)}
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${i === imageIdx ? 'bg-[#4f8ef7]' : 'bg-white/30'}`} />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="font-tactical text-5xl text-[#1a1a1a]">CP</span>
            </div>
          )}
          <button onClick={onClose} className="absolute top-3 right-3 bg-black/70 text-white p-1.5 hover:bg-black transition-colors">
            <X className="w-4 h-4" />
          </button>
          {isPreorder && (
            <span className="absolute top-3 left-3 font-mono-ui text-[9px] bg-[#4f8ef7] text-white px-2 py-1 uppercase tracking-widest">Pre-Order</span>
          )}
          {product.edition && (
            <span className="absolute bottom-3 left-3 font-mono-ui text-[9px] border border-white/30 text-white/70 px-2 py-1 uppercase tracking-widest bg-black/50">
              {product.edition}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              {product.category_name && (
                <p className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest mb-0.5">{product.category_name}</p>
              )}
              <h2 className="font-tactical text-3xl text-white">{product.name}</h2>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                {avgRating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-[#4f8ef7]" style={{ fill: '#4f8ef7' }} />
                    <span className="font-mono-ui text-[10px] text-[#888]">{avgRating} ({reviews.length})</span>
                  </div>
                )}
                {soldCount > 0 && (
                  <span className="font-mono-ui text-[10px] text-[#555]">{soldCount} sold</span>
                )}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-tactical text-2xl text-[#6ea8ff]">₱{Number(displayPrice).toLocaleString()}</p>
            </div>
          </div>

          {product.description && (
            <p className="font-mono-ui text-xs text-[#888] leading-relaxed">{product.description}</p>
          )}

          {/* Variants */}
          {hasVariants && (
            <div>
              <p className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest mb-2">Select Variant</p>
              <div className="grid grid-cols-2 gap-2">
                {product.variants.map((v) => (
                  <button key={v.id} type="button"
                    onClick={() => setSelectedVariant(selectedVariant?.id === v.id ? null : v)}
                    className={`text-left border px-3 py-2 transition-all ${
                      selectedVariant?.id === v.id ? 'border-[#4f8ef7] bg-[#4f8ef7]/10' : 'border-[#333] hover:border-[#555]'
                    }`}>
                    {v.images?.[0] && (
                      <img src={v.images[0]} className="w-full h-16 object-cover mb-1.5 opacity-80" alt={v.name} />
                    )}
                    <p className={`font-mono-ui text-[10px] uppercase tracking-wide ${selectedVariant?.id === v.id ? 'text-[#4f8ef7]' : 'text-white'}`}>
                      {v.name}
                    </p>
                    {v.price && v.price !== product.price && (
                      <p className="font-mono-ui text-[10px] text-[#6ea8ff]">₱{Number(v.price).toLocaleString()}</p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {availableSizes.length > 0 && (
            <div>
              <p className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest mb-2">Select Size</p>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((s) => {
                  const oos = isSizeOutOfStock(s);
                  return (
                    <button key={s} type="button"
                      disabled={oos}
                      onClick={() => handleSizeSelect(s)}
                      className={`px-3 py-2 font-mono-ui text-xs border transition-all ${
                        oos
                          ? 'border-[#222] text-[#333] cursor-not-allowed line-through'
                          : selectedSize === s
                            ? 'border-[#4f8ef7] bg-[#4f8ef7]/10 text-[#4f8ef7]'
                            : 'border-[#333] text-[#888] hover:border-[#555] hover:text-white'
                      }`}>
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Selector — only for add_to_bag/preorder products */}
          {product.order_type !== 'contact_to_order' && (
            <div>
              <p className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest mb-2">Quantity</p>
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || isSizeCurrentlyOOS}
                  style={{ background: '#1c1c1c', border: '1px solid #555' }}
                  className="w-8 h-8 flex items-center justify-center text-[#ccc] hover:border-[#4f8ef7] hover:text-[#4f8ef7] transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono-ui text-sm text-white w-6 text-center">
                  {isSizeCurrentlyOOS ? '0' : quantity}
                </span>
                <button
                  onClick={() => setQuantity(q => Math.min(q + 1, maxQty))}
                  disabled={isSizeCurrentlyOOS || (!isPreorder && currentStock !== null && quantity >= maxQty)}
                  style={{ background: '#1c1c1c', border: '1px solid #555' }}
                  className="w-8 h-8 flex items-center justify-center text-[#ccc] hover:border-[#4f8ef7] hover:text-[#4f8ef7] transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                  <Plus className="w-3.5 h-3.5" />
                </button>
                {stockLoading && (
                  <span className="font-mono-ui text-[10px] text-[#555]">Checking stock...</span>
                )}
                {!stockLoading && isPreorder && (
                  <span className="font-mono-ui text-[10px] text-[#555]">Pre-order — unlimited</span>
                )}
                {!stockLoading && !isPreorder && selectedSize && currentStock !== null && currentStock > 0 && currentStock <= 10 && (
                  <span className="font-mono-ui text-[11px] font-bold" style={{ color: '#E87722' }}>
                    ⚠️ Only {currentStock} left in stock
                  </span>
                )}
                {!stockLoading && isSizeCurrentlyOOS && (
                  <span className="font-mono-ui text-[11px] font-bold text-[#ff0000]">
                    ❌ Out of stock
                  </span>
                )}
              </div>

              {/* Add error message */}
              {addError && (
                <div className="mt-3 flex items-start gap-2 border border-[#c0392b]/40 bg-[#c0392b]/10 px-3 py-2.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#ff4444] flex-shrink-0 mt-0.5" />
                  <p className="font-mono-ui text-[11px] text-[#ff4444] leading-relaxed">❌ {addError}</p>
                </div>
              )}
            </div>
          )}

          {/* Custom Print */}
          {product.allow_custom_print && (
            <div>
              <label className="font-mono-ui text-[10px] text-[#4f8ef7] uppercase tracking-widest block mb-1">
                {product.custom_print_label || 'Custom Print Text'}
              </label>
              <input
                value={customText}
                onChange={(e) => setCustomText(e.target.value.toUpperCase())}
                placeholder="e.g. DELA CRUZ"
                className="w-full bg-[#0a0a0a] border border-[#333] text-white font-mono-ui text-sm px-3 py-2.5 focus:outline-none focus:border-[#4f8ef7]/60 uppercase" />
            </div>
          )}

          {/* Pre-Order Timeline — shown below size selector, above CTA */}
          {isPreorder && (
            <PreOrderTimelineBox orderDate={new Date()} />
          )}

          {/* Inquiry Note */}
          {product.order_type === 'contact_to_order' && product.inquiry_note && (
            <div className="border border-[#4f8ef7]/20 bg-[#4f8ef7]/5 px-4 py-3">
              <p className="font-mono-ui text-xs text-[#4f8ef7]">{product.inquiry_note}</p>
            </div>
          )}

          {/* CTA */}
          {product.order_type === 'contact_to_order' ? (
            <a
              href="https://m.me/chokepointfightwear"
              target="_blank"
              rel="noopener noreferrer"
              className="py-4 text-xs font-mono-ui uppercase tracking-widest w-full btn-glow-orange flex items-center justify-center gap-2">
              <MessageCircle className="w-4 h-4" /> Contact to Order
            </a>
          ) : (
            <button
              onClick={handleAddToBag}
              disabled={!canAdd}
              className="bg-[#00b806] text-[#ffffff] py-4 text-xs font-mono-ui uppercase tracking-widest w-full btn-glow-orange flex items-center justify-center gap-2 disabled:opacity-40 transition-all">
              <ShoppingBag className="w-4 h-4" />
              {btnLabel}
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}