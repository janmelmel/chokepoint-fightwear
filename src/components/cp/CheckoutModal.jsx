import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, MessageCircle, CreditCard, ChevronDown } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function CheckoutModal({ product, onClose, onOrderPlaced }) {
  const [size, setSize] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [method, setMethod] = useState('');
  const [saving, setSaving] = useState(false);

  const isSoldOut = product.stock_limit > 0 && product.total_ordered >= product.stock_limit;
  const sizes = product.sizes?.length ? product.sizes : ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const messengerMsg = encodeURIComponent(
    `Hi! I want to ${product.is_preorder ? 'pre-order' : 'order'}:\n\n📦 ${product.name}\n📏 Size: ${size || 'TBD'}\n💰 ₱${Number(product.price).toLocaleString()}\n\nName: ${name}\nPhone: ${phone}`
  );

  const handleProceed = async (payMethod) => {
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
        payment_method: payMethod,
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

    if (payMethod === 'Messenger') {
      window.open(`https://m.me/yourpage?text=${messengerMsg}`, '_blank');
    } else {
      window.open('https://paymongo.page/l/chokepoint-fightwear', '_blank');
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
                <p className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest mb-3">Payment Method</p>
                <button onClick={() => handleProceed('GCash')} disabled={!name || !size || saving} className="bg-[#000000] text-[#ffffff] py-3.5 text-sm font-mono-ui uppercase tracking-widest btn-glow-orange w-full flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">

                  <CreditCard className="w-4 h-4" />
                  Pay via GCash
                </button>
                <button onClick={() => handleProceed('Messenger')} disabled={!name || !size || saving}
              className="btn-glow-white w-full py-3.5 font-mono-ui text-sm tracking-widest uppercase flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                  <MessageCircle className="w-4 h-4" />
                  Confirm via Messenger
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