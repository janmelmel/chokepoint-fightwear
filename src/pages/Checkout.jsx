import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ChevronLeft, CheckCircle, Mail } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { removeFromCart, updateQuantity, clearCart } from '@/lib/cartStore';
import { base44 } from '@/api/base44Client';
import CPLogo from '@/components/cp/CPLogo';
import PromoCodeInput from '@/components/cp/PromoCodeInput';
import FooterLinks from '@/components/cp/FooterLinks';

const FB_URL = 'https://www.facebook.com/profile.php?id=61571430141920';
const IG_URL = 'https://www.instagram.com/chokepoint_fightwear/';
const EMAIL = 'chokepoint-fightwear@gmail.com';

export default function Checkout() {
  const { cart } = useCart();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [promoCode, setPromoCode] = useState(null);

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const discount = promoCode?.type === 'percent' ? Math.round(subtotal * (promoCode.value / 100)) : 0;
  const total = subtotal - discount;
  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);

  const itemsSummary = cart
    .map((i) => `• ${i.name} (${i.size}) x${i.quantity} — ₱${(i.price * i.quantity).toLocaleString()}`)
    .join('\n');

  const orderMsg = encodeURIComponent(
    `Hi! I'd like to place an order:\n\n${itemsSummary}${promoCode ? `\n\n🏷️ Promo: ${promoCode.code} (-₱${discount.toLocaleString()})` : ''}\n\n💰 Total: ₱${total.toLocaleString()}\n\nName: ${name}\nPhone: ${phone}`
  );

  const handleContact = async (method) => {
    if (!name || cart.length === 0) return;
    setSubmitting(true);

    const orderNum = `CP-${Date.now().toString().slice(-6)}`;
    await Promise.all(
      cart.map((item) =>
        base44.entities.Order.create({
          order_number: orderNum,
          product_id: item.productId,
          product_name: item.name,
          customer_name: name,
          customer_email: email,
          customer_phone: phone,
          size: item.size,
          quantity: item.quantity,
          total_amount: item.price * item.quantity - (discount > 0 ? Math.round((item.price * item.quantity / subtotal) * discount) : 0),
          payment_method: method,
          status: 'Processing',
          is_preorder: !!item.is_preorder,
        })
      )
    );

    clearCart();
    setSubmitting(false);
    setDone(true);

    setTimeout(() => {
      if (method === 'Facebook') window.open(FB_URL, '_blank');
      else if (method === 'Instagram') window.open(IG_URL, '_blank');
      else if (method === 'Email') {
        const subject = encodeURIComponent(`Order #${orderNum} — Chokepoint Fightwear`);
        window.open(`mailto:${EMAIL}?subject=${subject}&body=${orderMsg}`, '_blank');
      }
    }, 300);
  };

  if (done) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto" />
          <h1 className="font-tactical text-4xl text-white">Order Received!</h1>
          <p className="font-mono-ui text-sm text-[#666] max-w-xs">
            Thanks {name}! We've logged your order. Please complete payment via your chosen channel.
          </p>
          <Link to="/Home" style={{ background: '#ff6b00', border: '1px solid #ff6b00', color: '#fff', fontWeight: 700 }} className="inline-block px-8 py-3 font-mono-ui text-xs tracking-widest uppercase mt-4">
            Back to Store
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-[#1a1a1a] px-4 sm:px-6 h-16 flex items-center justify-between max-w-5xl mx-auto">
        <Link to="/Home">
          <CPLogo size={32} variant="white" />
        </Link>
        <Link to="/Home" className="flex items-center gap-1 font-mono-ui text-[10px] text-[#555] hover:text-white uppercase tracking-widest transition-colors">
          <ChevronLeft className="w-3 h-3" /> Back to Shop
        </Link>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Order Summary */}
        <div className="lg:col-span-3 space-y-4">
          <div>
            <p className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest">Review</p>
            <h1 className="font-tactical text-4xl text-white">Your Order</h1>
          </div>

          {cart.length === 0 ? (
            <div className="card-tactical p-8 text-center">
              <p className="font-mono-ui text-sm text-[#333]">Your bag is empty.</p>
              <Link to="/Home" style={{ background: '#1c1c1c', border: '1px solid #444', color: '#d0d0d0' }} className="inline-block mt-4 px-6 py-2.5 font-mono-ui text-xs tracking-widest uppercase">
                Shop Now
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="card-tactical p-4 flex gap-4 items-center">
                  <div className="w-16 h-16 flex-shrink-0 bg-[#111] overflow-hidden">
                    {item.image ? (
                      <img src={item.image} className="w-full h-full object-cover opacity-80" alt={item.name} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="font-tactical text-lg text-[#222]">CP</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-tactical text-lg text-white leading-tight">{item.name}</p>
                    <p className="font-mono-ui text-[10px] text-[#555]">
                      Size: {item.size}{item.is_preorder ? ' · PRE-ORDER' : ''}
                    </p>
                    <p className="font-mono-ui text-sm text-[#ff8c00] mt-1">
                      ₱{item.price.toLocaleString()} each
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <p className="font-mono-ui text-sm text-white">₱{(item.price * item.quantity).toLocaleString()}</p>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 border border-[#333] flex items-center justify-center text-[#555] hover:text-white transition-colors">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-mono-ui text-xs text-white w-5 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 border border-[#333] flex items-center justify-center text-[#555] hover:text-white transition-colors">
                        <Plus className="w-3 h-3" />
                      </button>
                      <button onClick={() => removeFromCart(item.id)}
                        className="ml-1 text-[#333] hover:text-[#ff0000] transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Totals */}
          {cart.length > 0 && (
            <div className="card-tactical p-4 space-y-3">
              <PromoCodeInput onApply={setPromoCode} appliedCode={promoCode} />
              <div className="space-y-2 pt-2 border-t border-[#222]">
                <div className="flex justify-between font-mono-ui text-xs text-[#555]">
                  <span>Items ({itemCount})</span>
                  <span>₱{subtotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between font-mono-ui text-xs text-[#22c55e]">
                    <span>Discount ({promoCode.code})</span>
                    <span>-₱{discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-mono-ui text-xs text-[#555]">
                  <span>Shipping</span>
                  <span>Arranged via chat</span>
                </div>
                <div className="border-t border-[#222] pt-2 flex justify-between items-center">
                  <span className="font-mono-ui text-xs text-[#888] uppercase tracking-wider">Order Total</span>
                  <span className="font-tactical text-3xl text-white">₱{total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Contact & Checkout */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <p className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest">Contact</p>
            <h2 className="font-tactical text-3xl text-white">Your Details</h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest block mb-1">Full Name *</label>
              <input value={name} onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#111] border border-[#333] text-white font-mono-ui text-sm px-3 py-2.5 focus:outline-none focus:border-[#ff8c00]/60"
                placeholder="Juan Dela Cruz" />
            </div>
            <div>
              <label className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest block mb-1">Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email"
                className="w-full bg-[#111] border border-[#333] text-white font-mono-ui text-sm px-3 py-2.5 focus:outline-none focus:border-[#ff8c00]/60"
                placeholder="you@email.com" />
            </div>
            <div>
              <label className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest block mb-1">Phone</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#111] border border-[#333] text-white font-mono-ui text-sm px-3 py-2.5 focus:outline-none focus:border-[#ff8c00]/60"
                placeholder="09XX XXX XXXX" />
            </div>
          </div>

          {cart.length > 0 && (
            <div className="space-y-2 pt-2">
              <p className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest mb-3">Contact us to complete order</p>

              <button onClick={() => handleContact('Facebook')} disabled={!name || submitting}
                style={{ background: '#ff6b00', border: '1px solid #ff6b00', color: '#fff', fontWeight: 700 }}
                className="w-full py-3.5 font-mono-ui text-sm uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                Message on Facebook
              </button>

              <button onClick={() => handleContact('Instagram')} disabled={!name || submitting}
                style={{ background: '#1c1c1c', border: '1px solid #444', color: '#d0d0d0' }}
                className="w-full py-3.5 font-mono-ui text-sm uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                Message on Instagram
              </button>

              <button onClick={() => handleContact('Email')} disabled={!name || submitting}
                style={{ background: '#1c1c1c', border: '1px solid #444', color: '#d0d0d0' }}
                className="w-full py-3.5 font-mono-ui text-sm uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                <Mail className="w-4 h-4" />
                Send via Email
              </button>
            </div>
          )}
        </div>
      </main>

      <FooterLinks />
    </div>
  );
}