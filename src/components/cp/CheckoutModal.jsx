import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, MessageCircle, Mail } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const FB_URL = 'https://www.facebook.com/profile.php?id=61571430141920';
const IG_URL = 'https://www.instagram.com/chokepoint_fightwear/';
const EMAIL = 'chokepoint-fightwear@gmail.com';

export default function CheckoutModal({ product, onClose, onOrderPlaced }) {
  const [size, setSize] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [method, setMethod] = useState('');
  const [saving, setSaving] = useState(false);

  const isSoldOut = product.stock_limit > 0 && product.total_ordered >= product.stock_limit;
  const sizes = product.sizes?.length ? product.sizes : ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const orderMsg = encodeURIComponent(
    `Hi! I want to ${product.is_preorder ? 'pre-order' : 'order'}:\n\n📦 ${product.name}\n📏 Size: ${size || 'TBD'}\n💰 ₱${Number(product.price).toLocaleString()}\n\nName: ${name}\nPhone: ${phone}`
  );

  const handleContact = async (method) => {
    if (!name || !size) return;
    setSaving(true);
    try {
      const orderNum = `CP-${Date.now().toString().slice(-6)}`;
      await base44.entities.Order.create({
        order_number: orderNum,
        product_id: product.id,
        product_name: product.name,
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
        size,
        quantity: 1,
        total_amount: product.price,
        payment_method: method,
        status: 'Processing',
        is_preorder: !!product.is_preorder
      });
      await base44.entities.Product.update(product.id, {
        total_ordered: (product.total_ordered || 0) + 1
      });
      if (onOrderPlaced) onOrderPlaced();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }

    if (method === 'Facebook') {
      window.open(`${FB_URL}`, '_blank');
    } else if (method === 'Instagram') {
      window.open(`${IG_URL}`, '_blank');
    } else if (method === 'Email') {
      const subject = encodeURIComponent(`Order: ${product.name} - Size ${size}`);
      const body = orderMsg;
      window.open(`mailto:${EMAIL}?subject=${subject}&body=${body}`, '_blank');
    } else {
      window.open(`${FB_URL}`, '_blank');
    }
    onClose();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    onClick={onClose}
    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <motion.div
        initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }} transition={{ type: 'spring', damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#111] border border-[#333]">

        <div className="flex items-center justify-between px-5 py-4 border-b border-[#222]">
          <div>
            <p className="font-mono-ui text-[10px] text-[#ff8c00] tracking-widest uppercase">
              {product.is_preorder ? 'Pre-Order' : 'Order'}
            </p>
            <h3 className="font-tactical text-2xl text-white leading-tight">{product.name}</h3>
          </div>
          <button onClick={onClose} className="text-[#555] hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-4">
          {isSoldOut ?
          <div className="text-center py-6">
              <p className="font-mono-ui text-[#ff0000] text-sm">SOLD OUT</p>
              <p className="text-[#666] text-xs mt-1">Stock limit reached</p>
            </div> :

          <>
              <div>
                <label className="font-mono-ui text-[10px] text-[#666] uppercase tracking-widest block mb-1">Full Name *</label>
                <input value={name} onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#333] text-white font-mono-ui text-sm px-3 py-2.5 focus:outline-none focus:border-[#ff8c00]/60"
              placeholder="Juan Dela Cruz" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono-ui text-[10px] text-[#666] uppercase tracking-widest block mb-1">Email</label>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} type="email"
                className="w-full bg-[#0a0a0a] border border-[#333] text-white font-mono-ui text-sm px-3 py-2.5 focus:outline-none focus:border-[#ff8c00]/60"
                placeholder="you@email.com" />
                </div>
                <div>
                  <label className="font-mono-ui text-[10px] text-[#666] uppercase tracking-widest block mb-1">Phone</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#333] text-white font-mono-ui text-sm px-3 py-2.5 focus:outline-none focus:border-[#ff8c00]/60"
                placeholder="09XX XXX XXXX" />
                </div>
              </div>
              <div>
                <label className="font-mono-ui text-[10px] text-[#666] uppercase tracking-widest block mb-1">Size *</label>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((s) =>
                <button key={s} onClick={() => setSize(s)}
                className={`px-3 py-2 font-mono-ui text-xs border transition-all ${size === s ? 'border-[#ff8c00] bg-[#ff8c00]/10 text-[#ff8c00]' : 'border-[#333] text-[#888] hover:border-[#555]'}`}>
                      {s}
                    </button>
                )}
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <p className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest mb-1">Contact us to order</p>
                <p className="font-mono-ui text-[9px] text-[#444] mb-3">Message us on any platform below with your order details</p>

                <button onClick={() => handleContact('Facebook')} disabled={!name || !size || saving} className="bg-[#026af2] text-slate-50 py-3.5 text-sm font-mono-ui uppercase tracking-widest btn-glow-orange w-full flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">

                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                  Message on Facebook
                </button>

                <button onClick={() => handleContact('Instagram')} disabled={!name || !size || saving} className="bg-[#eab41f] py-3.5 text-sm font-mono-ui uppercase tracking-widest btn-glow-white w-full flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">

                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                  Message on Instagram
                </button>

                <button onClick={() => handleContact('Email')} disabled={!name || !size || saving} className="bg-green-400 py-3.5 text-sm font-mono-ui uppercase tracking-widest btn-glow-white w-full flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">

                  <Mail className="w-4 h-4" />
                  Send via Email
                </button>
              </div>
              <p className="font-mono-ui text-[10px] text-[#444] text-center pt-1">
                ₱{Number(product.price).toLocaleString()} · {product.is_preorder ? 'Pre-order' : 'In Stock'}
                {product.stock_limit > 0 && ` · ${product.stock_limit - (product.total_ordered || 0)} left`}
              </p>
            </>
          }
        </div>
      </motion.div>
    </motion.div>);

}