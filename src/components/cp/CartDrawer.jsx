import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { removeFromCart, updateQuantity } from '@/lib/cartStore';
import { useCart } from '@/hooks/useCart';

export default function CartDrawer({ open, onClose }) {
  const { cart } = useCart();
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <AnimatePresence>
      {open &&
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
                {cart.length > 0 &&
              <span className="font-mono-ui text-[10px] text-[#555]">
                    ({cart.reduce((s, i) => s + i.quantity, 0)} items)
                  </span>
              }
              </div>
              <button onClick={onClose} className="text-[#555] hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-tactical">
              {cart.length === 0 ?
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                  <ShoppingBag className="w-10 h-10 text-[#222]" />
                  <p className="font-mono-ui text-sm text-[#333]">Your bag is empty</p>
                  <button onClick={onClose} className="font-mono-ui text-xs text-[#555] hover:text-white uppercase tracking-widest transition-colors">
                    Continue Shopping
                  </button>
                </div> :

            cart.map((item) =>
            <div key={item.id} className="card-tactical p-3 flex gap-3">
                    <div className="w-16 h-16 flex-shrink-0 bg-[#111] overflow-hidden">
                      {item.image ?
                <img src={item.image} className="w-full h-full object-cover opacity-80" alt={item.name} /> :

                <div className="w-full h-full flex items-center justify-center">
                          <span className="font-tactical text-lg text-[#222]">CP</span>
                        </div>
                }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-tactical text-base text-white leading-tight truncate">{item.name}</p>
                      <p className="font-mono-ui text-[10px] text-[#555] mt-0.5">
                        Size: {item.size}{item.is_preorder ? ' · PRE-ORDER' : ''}
                      </p>
                      <p className="font-mono-ui text-sm text-[#ff8c00] mt-1">
                        ₱{(item.price * item.quantity).toLocaleString()}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="w-6 h-6 border border-[#333] flex items-center justify-center text-[#555] hover:text-white hover:border-[#555] transition-colors">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono-ui text-xs text-white w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="w-6 h-6 border border-[#333] flex items-center justify-center text-[#555] hover:text-white hover:border-[#555] transition-colors">
                          <Plus className="w-3 h-3" />
                        </button>
                        <button onClick={() => removeFromCart(item.id)}
                  className="ml-auto text-[#333] hover:text-[#ff0000] transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
            )
            }
            </div>

            {/* Footer */}
            {cart.length > 0 &&
          <div className="p-4 border-t border-[#1a1a1a] space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-mono-ui text-xs text-[#555] uppercase tracking-widest">Total</span>
                  <span className="font-tactical text-2xl text-white">₱{total.toLocaleString()}</span>
                </div>
                <Link to="/Checkout" onClick={onClose}
                  style={{ background: '#ff6b00', border: '1px solid #ff6b00', color: '#fff', fontWeight: 700 }}
                  className="py-3.5 text-xs font-mono-ui uppercase tracking-widest w-full flex items-center justify-center gap-2">
                  Proceed to Checkout
                </Link>
                <button onClick={onClose}
                  style={{ background: '#1c1c1c', border: '1px solid #444', color: '#d0d0d0' }}
                  className="py-2.5 text-xs font-mono-ui uppercase tracking-widest w-full">
                  Continue Shopping
                </button>
              </div>
          }
          </motion.div>
        </>
      }
    </AnimatePresence>);

}