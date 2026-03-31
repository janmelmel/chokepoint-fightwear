import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ShoppingBag, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { removeFromCart, updateQuantity, purgeExpiredItems } from '@/lib/cartStore';
import { useCart } from '@/hooks/useCart';
import { base44 } from '@/api/base44Client';

export default function CartDrawer({ open, onClose }) {
  const { cart } = useCart();
  const [expiredNotice, setExpiredNotice] = useState(false);
  const [stockWarnings, setStockWarnings] = useState({}); // itemId -> { soldOut, newMax }
  const [validating, setValidating] = useState(false);

  // Purge expired items when drawer opens
  useEffect(() => {
    if (open) {
      const removed = purgeExpiredItems();
      if (removed > 0) setExpiredNotice(true);
      validateStock();
    } else {
      setExpiredNotice(false);
    }
  }, [open]);

  const validateStock = async () => {
    if (cart.length === 0) return;
    setValidating(true);

    // Get unique product IDs
    const productIds = [...new Set(cart.map(i => i.productId))];
    const products = await Promise.all(
      productIds.map(id => base44.entities.Product.filter({ id }).then(r => r[0]).catch(() => null))
    );
    const productMap = Object.fromEntries(products.filter(Boolean).map(p => [p.id, p]));

    const warnings = {};
    // Aggregate quantities per productId+size+variant to handle duplicates
    const aggregated = {};
    for (const item of cart) {
      const key = `${item.productId}|${item.size}|${item.variant_name || ''}`;
      aggregated[key] = (aggregated[key] || 0) + item.quantity;
    }

    for (const item of cart) {
      const p = productMap[item.productId];
      if (!p || item.is_preorder) continue;

      let available = null;
      if (p.variants?.length && item.variant_name) {
        const v = p.variants.find(v => v.name === item.variant_name);
        if (v) {
          const vs = (v.sizes || []).find(s => s.size === item.size);
          available = vs?.stock ?? null;
        }
      } else {
        available = p.stock_per_size?.[item.size] ?? null;
      }

      if (available === null) continue;

      const key = `${item.productId}|${item.size}|${item.variant_name || ''}`;
      const totalInCart = aggregated[key] || item.quantity;

      if (available <= 0) {
        warnings[item.id] = { soldOut: true, newMax: 0 };
      } else if (totalInCart > available) {
        warnings[item.id] = { soldOut: false, newMax: available };
        updateQuantity(item.id, available);
      }
    }

    setStockWarnings(warnings);
    setValidating(false);
  };

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const hasSoldOut = Object.values(stockWarnings).some(w => w.soldOut);
  const hasWarnings = Object.keys(stockWarnings).length > 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40" />

          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-[#0d0d0d] border-l border-[#222] z-50 flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a1a]">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#ff8c00]" />
                <h2 className="font-tactical text-2xl text-white">Your Bag</h2>
                {cart.length > 0 && (
                  <span className="font-mono-ui text-[10px] text-[#555]">
                    ({cart.reduce((s, i) => s + i.quantity, 0)} items)
                  </span>
                )}
              </div>
              <button onClick={onClose} className="text-[#555] hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-tactical">

              {/* Expired notice */}
              {expiredNotice && (
                <div className="border-l-4 border-[#ff8c00] bg-[#ff8c00]/5 px-3 py-2.5">
                  <p className="font-mono-ui text-[10px] text-[#ff8c00] leading-relaxed">
                    Some items were removed from your cart because they were held too long. Please add them again.
                  </p>
                  <button onClick={() => setExpiredNotice(false)} className="font-mono-ui text-[9px] text-[#555] hover:text-white mt-1 uppercase tracking-widest">Dismiss</button>
                </div>
              )}

              {/* Stock warning banner */}
              {!expiredNotice && hasWarnings && !hasSoldOut && (
                <div className="border-l-4 border-[#ff8c00] bg-[#ff8c00]/5 px-3 py-2.5 flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#ff8c00] flex-shrink-0 mt-0.5" />
                  <p className="font-mono-ui text-[10px] text-[#ff8c00] leading-relaxed">
                    Some items in your cart have limited stock. Quantities have been adjusted to what's available.
                  </p>
                </div>
              )}

              {/* Sold-out banner */}
              {hasSoldOut && (
                <div className="border-l-4 border-[#ff0000] bg-[#ff0000]/5 px-3 py-2.5 flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#ff0000] flex-shrink-0 mt-0.5" />
                  <p className="font-mono-ui text-[10px] text-[#ff0000] leading-relaxed">
                    Some items in your cart are now sold out. Please remove them before checking out.
                  </p>
                </div>
              )}

              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                  <ShoppingBag className="w-10 h-10 text-[#222]" />
                  <p className="font-mono-ui text-sm text-[#333]">Your bag is empty</p>
                  <button onClick={onClose} style={{ background: '#2a2a2a', border: '1px solid #555', color: '#e0e0e0' }}
                    className="font-mono-ui text-xs uppercase tracking-widest px-5 py-2.5 hover:border-white hover:text-white transition-colors">
                    Continue Shopping
                  </button>
                </div>
              ) : (
                cart.map((item) => {
                  const warn = stockWarnings[item.id];
                  const isSoldOut = warn?.soldOut;
                  const isLimited = warn && !warn.soldOut;

                  return (
                    <div key={item.id}
                      className={`p-3 flex gap-3 border ${
                        isSoldOut ? 'border-[#ff0000]/40 bg-[#ff0000]/5' :
                        isLimited ? 'border-[#ff8c00]/40 bg-[#ff8c00]/5' :
                        'card-tactical'
                      }`}>
                      <div className="w-16 h-16 flex-shrink-0 bg-[#111] overflow-hidden">
                        {item.image
                          ? <img src={item.image} className="w-full h-full object-cover opacity-80" alt={item.name} />
                          : <div className="w-full h-full flex items-center justify-center"><span className="font-tactical text-lg text-[#222]">CP</span></div>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-tactical text-base text-white leading-tight truncate">{item.name}</p>
                        <p className="font-mono-ui text-[10px] text-[#555] mt-0.5">
                          {item.variant_name ? `${item.variant_name} · ` : ''}Size: {item.size}{item.is_preorder ? ' · PRE-ORDER' : ''}
                        </p>

                        {isSoldOut ? (
                          <p className="font-mono-ui text-[10px] text-[#ff0000] mt-1">
                            ❌ Sorry, this item in size {item.size} is now sold out.
                          </p>
                        ) : isLimited ? (
                          <p className="font-mono-ui text-[10px] mt-1" style={{ color: '#E87722' }}>
                            Only {warn.newMax} available — quantity adjusted.
                          </p>
                        ) : (
                          <p className="font-mono-ui text-sm text-[#ff8c00] mt-1">
                            ₱{(item.price * item.quantity).toLocaleString()}
                          </p>
                        )}

                        <div className="flex items-center gap-2 mt-2">
                          {!isSoldOut && (
                            <>
                              <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                style={{ background: '#1c1c1c', border: '1px solid #555', color: '#ccc' }}
                                className="w-7 h-7 flex items-center justify-center hover:border-white hover:text-white transition-colors">
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="font-mono-ui text-xs text-white w-4 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                disabled={item.stock_limit != null && item.quantity >= item.stock_limit}
                                style={{ background: '#1c1c1c', border: '1px solid #555', color: '#ccc' }}
                                className="w-7 h-7 flex items-center justify-center hover:border-white hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                                <Plus className="w-3 h-3" />
                              </button>
                            </>
                          )}
                          <button onClick={() => removeFromCart(item.id)}
                            style={{
                              background: isSoldOut ? '#2a0000' : '#2a0000',
                              border: `1px solid ${isSoldOut ? '#ff0000' : '#ff0000'}`,
                              color: '#ff0000',
                            }}
                            className={`${isSoldOut ? 'flex-1' : 'ml-auto'} w-auto px-3 h-7 flex items-center justify-center gap-1.5 hover:bg-[#ff0000] hover:text-white transition-colors`}>
                            <Trash2 className="w-3 h-3" />
                            {isSoldOut && <span className="font-mono-ui text-[9px] uppercase tracking-widest">Remove</span>}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="p-4 border-t border-[#1a1a1a] space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-mono-ui text-xs text-[#555] uppercase tracking-widest">Total</span>
                  <span className="font-tactical text-2xl text-white">₱{total.toLocaleString()}</span>
                </div>
                {hasSoldOut ? (
                  <div className="py-3.5 text-xs font-mono-ui uppercase tracking-widest w-full flex items-center justify-center gap-2 border border-[#ff0000]/30 text-[#ff0000]/50 cursor-not-allowed">
                    Remove sold-out items to continue
                  </div>
                ) : (
                  <Link to="/Checkout" onClick={onClose}
                    style={{ background: '#ff6b00', border: '1px solid #ff6b00', color: '#fff', fontWeight: 700 }}
                    className="py-3.5 text-xs font-mono-ui uppercase tracking-widest w-full flex items-center justify-center gap-2">
                    Proceed to Checkout
                  </Link>
                )}
                <button onClick={onClose}
                  style={{ background: '#1c1c1c', border: '1px solid #444', color: '#d0d0d0' }}
                  className="py-2.5 text-xs font-mono-ui uppercase tracking-widest w-full">
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}