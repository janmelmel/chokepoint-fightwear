import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { X, Loader2, Copy, Check } from 'lucide-react';
import {
  PHILIPPINES_PROVINCES, getCitiesForProvince, getBarangaysForCity,
  getShippingZone, getShippingRate } from
'@/lib/philippineAddress';
import { validatePromoCode } from './PromoCodeInput';

const INPUT = "w-full bg-[#0a0a0a] border border-[#333] text-white font-mono-ui text-sm px-3 py-2.5 focus:outline-none focus:border-[#ff8c00]/60";
const LABEL = "font-mono-ui text-[10px] text-[#555] uppercase tracking-widest block mb-1";
const APP_URL = window.location.origin;

export default function CreateOrderModal({ onClose, onCreated }) {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    customer_name: '', customer_email: '', customer_phone: '',
    province: '', city: '', barangay: '', street: '', postal_code: '',
    product_id: '', size: '', custom_print_text: '', quantity: 1,
    unit_price: '', shipping_fee: '', promo_code: '', notes: ''
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [promoResult, setPromoResult] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    base44.entities.Product.filter({ status: 'Live', is_archived: false }).then(setProducts);
  }, []);

  const filteredProducts = products.filter((p) =>
  p.name.toLowerCase().includes(search.toLowerCase())
  );

  const zone = form.province ? getShippingZone(form.province) : null;
  const autoShipping = form.province ?
  selectedProduct?.shipping_fee_override ?? getShippingRate(form.province) :
  0;

  useEffect(() => {
    if (form.province) {
      setForm((f) => ({ ...f, shipping_fee: autoShipping }));
    }
  }, [form.province, selectedProduct]);

  const setProduct = (prod) => {
    setSelectedProduct(prod);
    setForm((f) => ({ ...f, product_id: prod.id, size: '', unit_price: prod.price }));
  };

  const subtotal = Number(form.unit_price || 0) * Number(form.quantity || 1);
  const shippingFee = Number(form.shipping_fee || 0);
  const discount = promoResult?.discount || 0;
  const total = subtotal + shippingFee - discount;

  const applyPromo = async () => {
    if (!form.promo_code) return;
    setPromoLoading(true);
    setPromoError('');
    const r = await validatePromoCode(form.promo_code, subtotal);
    setPromoLoading(false);
    if (!r.valid) {setPromoError(r.error);return;}
    setPromoResult(r);
  };

  const handleSubmit = async () => {
    if (!form.customer_name || !form.product_id || !form.unit_price) return;
    setSaving(true);

    const orderNum = `CP-${Date.now().toString(36).toUpperCase().slice(-4)}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
    const order = await base44.entities.Order.create({
      order_number: orderNum,
      product_id: form.product_id,
      product_name: selectedProduct?.name || '',
      customer_name: form.customer_name,
      customer_email: form.customer_email,
      customer_phone: form.customer_phone,
      size: form.size,
      quantity: Number(form.quantity),
      total_amount: total,
      payment_method: 'Other',
      payment_status: 'Pending',
      status: 'Pending',
      custom_print_text: form.custom_print_text,
      shipping_province: form.province,
      shipping_city: form.city,
      shipping_barangay: form.barangay,
      shipping_street: form.street,
      shipping_postal_code: form.postal_code,
      shipping_zone: zone || '',
      shipping_fee: shippingFee,
      notes: form.notes
    });

    // Increment promo usage
    if (promoResult?.promo) {
      await base44.entities.PromoCode.update(promoResult.promo.id, {
        usage_count: (promoResult.promo.usage_count || 0) + 1
      });
    }

    // Send email if email provided
    if (form.customer_email) {
      const paymentLink = `${APP_URL}/Pay?order=${orderNum}`;
      await base44.integrations.Core.SendEmail({
        to: form.customer_email,
        subject: `Your Chokepoint Order: ${orderNum}`,
        body: `Hi ${form.customer_name},\n\nThank you for your order! Here are your order details:\n\nOrder Number: ${orderNum}\nProduct: ${selectedProduct?.name}\nSize: ${form.size}\nQuantity: ${form.quantity}\nSubtotal: ₱${subtotal.toLocaleString()}\nShipping Fee: ₱${shippingFee.toLocaleString()}${discount > 0 ? `\nDiscount: -₱${discount.toLocaleString()}` : ''}\nTotal: ₱${total.toLocaleString()}\n\nTo complete your order, please click the payment link below and pay via GCash, Credit Card, or GrabPay through our secure PayMongo checkout:\n\n${paymentLink}\n\nIf you have any questions, message us on Facebook: https://m.me/chokepointfightwear\n\nThank you,\nChokepoint Fightwear Team`
      });
    }

    setCreatedOrder({ ...order, order_number: orderNum, paymentLink: `${APP_URL}/Pay?order=${orderNum}` });
    setSaving(false);
    onCreated?.();
  };

  const copyLink = () => {
    navigator.clipboard.writeText(createdOrder.paymentLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const cities = form.province ? getCitiesForProvince(form.province) : [];
  const barangays = form.city ? getBarangaysForCity(form.city) : [];

  if (createdOrder) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }}
        className="w-full max-w-md bg-[#111] border border-[#333] p-6 space-y-5">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 text-green-400" />
            </div>
            <h2 className="font-tactical text-2xl text-white">Order Created</h2>
            <p className="font-mono-ui text-[10px] text-[#555]">{createdOrder.order_number}</p>
            {form.customer_email && <p className="font-mono-ui text-[10px] text-green-400">Email sent to {form.customer_email}</p>}
          </div>
          <div className="border border-[#222] p-3 space-y-2">
            <p className="font-mono-ui text-[9px] text-[#555] uppercase tracking-widest">Payment Link</p>
            <p className="font-mono-ui text-[10px] text-[#ff8c00] break-all">{createdOrder.paymentLink}</p>
            <button onClick={copyLink}
            className="w-full btn-glow-orange py-2.5 font-mono-ui text-xs uppercase tracking-widest flex items-center justify-center gap-2">
              {copied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy Payment Link</>}
            </button>
          </div>
          <button onClick={onClose} className="w-full btn-glow-white py-3 font-mono-ui text-xs uppercase tracking-widest">
            Done
          </button>
        </motion.div>
      </motion.div>);

  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    onClick={onClose}
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
      onClick={(e) => e.stopPropagation()}
      className="w-full max-w-xl bg-[#111] border border-[#333] max-h-[90vh] overflow-y-auto scrollbar-tactical">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#222]">
          <h2 className="font-tactical text-2xl text-white">Create Manual Order</h2>
          <button onClick={onClose} className="text-[#555] hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-5">
          {/* Customer Info */}
          <div>
            <p className="font-mono-ui text-[10px] text-[#ff6b00] uppercase tracking-widest mb-3">Customer Info</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className={LABEL}>Customer Name *</label>
                <input value={form.customer_name} onChange={(e) => setForm((f) => ({ ...f, customer_name: e.target.value }))} className={INPUT} placeholder="Juan dela Cruz" />
              </div>
              <div>
                <label className={LABEL}>Email</label>
                <input type="email" value={form.customer_email} onChange={(e) => setForm((f) => ({ ...f, customer_email: e.target.value }))} className={INPUT} placeholder="juan@email.com" />
              </div>
              <div>
                <label className={LABEL}>Phone</label>
                <input value={form.customer_phone} onChange={(e) => setForm((f) => ({ ...f, customer_phone: e.target.value }))} className={INPUT} placeholder="09XX-XXX-XXXX" />
              </div>
            </div>
          </div>

          {/* Shipping */}
          <div>
            <p className="font-mono-ui text-[10px] text-[#ff6b00] uppercase tracking-widest mb-3">Shipping Address</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL}>Province</label>
                <select value={form.province} onChange={(e) => setForm((f) => ({ ...f, province: e.target.value, city: '', barangay: '' }))} className={INPUT}>
                  <option value="">Select...</option>
                  {PHILIPPINES_PROVINCES.map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className={LABEL}>City</label>
                <select value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value, barangay: '' }))} className={INPUT} disabled={!form.province}>
                  <option value="">Select...</option>
                  {cities.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={LABEL}>Barangay</label>
                <select value={form.barangay} onChange={(e) => setForm((f) => ({ ...f, barangay: e.target.value }))} className={INPUT} disabled={!form.city}>
                  <option value="">Select...</option>
                  {barangays.map((b) => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className={LABEL}>Postal Code</label>
                <input value={form.postal_code} onChange={(e) => setForm((f) => ({ ...f, postal_code: e.target.value }))} className={INPUT} placeholder="1234" />
              </div>
              <div className="col-span-2">
                <label className={LABEL}>Street / House No.</label>
                <input value={form.street} onChange={(e) => setForm((f) => ({ ...f, street: e.target.value }))} className={INPUT} placeholder="123 Sample St." />
              </div>
            </div>
          </div>

          {/* Product */}
          <div>
            <p className="font-mono-ui text-[10px] text-[#ff6b00] uppercase tracking-widest mb-3">Order Details</p>
            <div className="space-y-3">
              <div>
                <label className={LABEL}>Search Product</label>
                <input value={search} onChange={(e) => setSearch(e.target.value)} className={INPUT} placeholder="Type product name..." />
                {search && filteredProducts.length > 0 &&
                <div className="border border-[#333] border-t-0 bg-[#0a0a0a] max-h-40 overflow-y-auto">
                    {filteredProducts.map((p) =>
                  <button key={p.id} onClick={() => {setProduct(p);setSearch('');}}
                  className="w-full text-left px-3 py-2 font-mono-ui text-xs text-[#888] hover:text-white hover:bg-[#1a1a1a] transition-colors">
                        {p.name} — ₱{Number(p.price).toLocaleString()}
                      </button>
                  )}
                  </div>
                }
                {selectedProduct &&
                <div className="mt-2 border border-[#ff8c00]/30 bg-[#ff8c00]/5 px-3 py-2">
                    <p className="font-mono-ui text-xs text-[#ff8c00]">{selectedProduct.name}</p>
                  </div>
                }
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={LABEL}>Size</label>
                  <select value={form.size} onChange={(e) => setForm((f) => ({ ...f, size: e.target.value }))} className={INPUT} disabled={!selectedProduct}>
                    <option value="">Select size...</option>
                    {(selectedProduct?.sizes || []).map((s) => <option key={s}>{s}</option>)}
                    {!selectedProduct?.sizes?.length && <option value="One Size">One Size</option>}
                  </select>
                </div>
                <div>
                  <label className={LABEL}>Quantity *</label>
                  <input type="number" min="1" value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))} className={INPUT} />
                </div>
                {selectedProduct?.allow_custom_print &&
                <div className="col-span-2">
                    <label className={LABEL}>{selectedProduct.custom_print_label || 'Custom Print Text'}</label>
                    <input value={form.custom_print_text} onChange={(e) => setForm((f) => ({ ...f, custom_print_text: e.target.value }))} className={INPUT} placeholder="e.g. DELA CRUZ" />
                  </div>
                }
                <div>
                  <label className={LABEL}>Unit Price (₱) *</label>
                  <input type="number" value={form.unit_price} onChange={(e) => setForm((f) => ({ ...f, unit_price: e.target.value }))} className={INPUT} />
                </div>
                <div>
                  <label className={LABEL}>Shipping Fee (₱)</label>
                  <input type="number" value={form.shipping_fee} onChange={(e) => setForm((f) => ({ ...f, shipping_fee: e.target.value }))} className={INPUT} placeholder="Auto-calculated" />
                  {zone && <p className="font-mono-ui text-[9px] text-[#444] mt-0.5">Zone: {zone}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Promo Code */}
          <div>
            <label className={LABEL}>Promo Code</label>
            <div className="flex gap-2">
              <input value={form.promo_code}
              onChange={(e) => {setForm((f) => ({ ...f, promo_code: e.target.value.toUpperCase() }));setPromoResult(null);setPromoError('');}}
              className={INPUT} placeholder="OPTIONAL" disabled={!!promoResult} />
              {!promoResult ?
              <button onClick={applyPromo} disabled={promoLoading || !form.promo_code}
              className="btn-glow-white px-4 font-mono-ui text-[10px] uppercase tracking-widest disabled:opacity-40 flex items-center gap-1">
                  {promoLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Apply'}
                </button> :

              <button onClick={() => {setPromoResult(null);setForm((f) => ({ ...f, promo_code: '' }));}}
              className="btn-glow-white px-4 font-mono-ui text-[10px] uppercase tracking-widest">
                  Remove
                </button>
              }
            </div>
            {promoError && <p className="font-mono-ui text-[10px] text-[#ff0000] mt-1">{promoError}</p>}
            {promoResult && <p className="font-mono-ui text-[10px] text-green-400 mt-1">✓ {promoResult.label} applied</p>}
          </div>

          {/* Notes */}
          <div>
            <label className={LABEL}>Order Notes (internal)</label>
            <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            rows={2} className={`${INPUT} resize-none`} placeholder="Internal staff notes..." />
          </div>

          {/* Total Summary */}
          <div className="border border-[#222] p-4 space-y-2">
            <div className="flex justify-between font-mono-ui text-xs text-[#888]">
              <span>Subtotal</span><span>₱{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-mono-ui text-xs text-[#888]">
              <span>Shipping</span><span>₱{shippingFee.toLocaleString()}</span>
            </div>
            {discount > 0 &&
            <div className="flex justify-between font-mono-ui text-xs text-green-400">
                <span>Promo Discount</span><span>-₱{discount.toLocaleString()}</span>
              </div>
            }
            <div className="flex justify-between font-mono-ui text-sm font-bold border-t border-[#222] pt-2">
              <span className="text-white">Total</span>
              <span className="text-[#ff8c00]">₱{total.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="bg-red-600 text-zinc-300 py-3 text-xs font-mono-ui uppercase tracking-widest btn-glow-white flex-1">Cancel</button>
            <button onClick={handleSubmit}
            disabled={saving || !form.customer_name || !form.product_id || !form.unit_price} className="bg-lime-500 text-gray-50 py-3 text-xs font-mono-ui uppercase tracking-widest btn-glow-orange flex-1 flex items-center justify-center gap-2 disabled:opacity-40">
              
              {saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Creating...</> : 'Create Order & Send Link'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>);

}