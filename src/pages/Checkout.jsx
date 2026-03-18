import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { getCart, clearCart } from '@/lib/cartStore';
import {
  PHILIPPINES_PROVINCES, getCitiesForProvince, getBarangaysForCity,
  getShippingZone, getShippingRate, SHIPPING_ZONES, WORLD_COUNTRIES
} from '@/lib/philippineAddress';
import CPLogo from '@/components/cp/CPLogo';
import { ArrowLeft, Loader2, MessageCircle, Mail } from 'lucide-react';

const INPUT = "w-full bg-[#111] border border-[#333] text-white font-mono-ui text-sm px-3 py-2.5 focus:outline-none focus:border-[#ff8c00]/60";
const LABEL = "font-mono-ui text-[10px] text-[#555] uppercase tracking-widest block mb-1";

export default function Checkout() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [contact, setContact] = useState({ name: '', email: '', phone: '' });
  const [address, setAddress] = useState({
    country: 'Philippines', province: '', city: '', barangay: '', street: '', postal_code: '', notes: ''
  });
  const [confirmed, setConfirmed] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [done, setDone] = useState(false);
  const [orderNumbers, setOrderNumbers] = useState([]);

  // Cascade resets
  const prevProvince = React.useRef('');
  const prevCity = React.useRef('');

  useEffect(() => {
    if (prevProvince.current !== address.province) {
      prevProvince.current = address.province;
      if (address.province) setAddress(a => ({ ...a, city: '', barangay: '' }));
    }
  }, [address.province]);

  useEffect(() => {
    if (prevCity.current !== address.city) {
      prevCity.current = address.city;
      if (address.city) setAddress(a => ({ ...a, barangay: '' }));
    }
  }, [address.city]);

  useEffect(() => {
    const items = getCart();
    if (items.length === 0 && !done) navigate('/Home');
    setCart(items);
  }, []);

  const isPhilippines = address.country === 'Philippines';
  const zone = isPhilippines && address.province ? getShippingZone(address.province) : null;

  // Compute shipping fee: use per-item override if ALL items have same override, else zone rate
  const computeShipping = () => {
    if (!isPhilippines || !address.province) return null;
    // If any item has a specific override, use the max override; otherwise zone rate
    const overrides = cart.map(i => i.shipping_fee_override).filter(v => v != null && v >= 0);
    if (overrides.length === cart.length && overrides.length > 0) {
      return Math.max(...overrides);
    }
    return getShippingRate(address.province);
  };

  const shippingFee = computeShipping();
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const total = subtotal + (shippingFee || 0);

  const cities = isPhilippines && address.province ? getCitiesForProvince(address.province) : [];
  const barangays = isPhilippines && address.city ? getBarangaysForCity(address.city) : [];

  const canPlace = contact.name && contact.email && contact.phone &&
    (isPhilippines ? (address.province && address.city && address.street) : false) &&
    confirmed;

  const handlePlace = async () => {
    if (!canPlace) return;
    setPlacing(true);
    const nums = [];
    for (const item of cart) {
      const orderNum = `CP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,5).toUpperCase()}`;
      await base44.entities.Order.create({
        order_number: orderNum,
        product_id: item.productId,
        product_name: item.name,
        customer_name: contact.name,
        customer_email: contact.email,
        customer_phone: contact.phone,
        size: item.size,
        quantity: item.quantity,
        total_amount: item.price * item.quantity,
        payment_method: 'Messenger',
        status: 'Processing',
        is_preorder: !!item.is_preorder,
        custom_print_text: item.custom_text || '',
        shipping_province: address.province,
        shipping_city: address.city,
        shipping_barangay: address.barangay,
        shipping_street: address.street,
        shipping_postal_code: address.postal_code,
        shipping_delivery_notes: address.notes,
        shipping_zone: zone || '',
        shipping_fee: shippingFee || 0,
      });
      nums.push(orderNum);
    }
    clearCart();
    setOrderNumbers(nums);
    setDone(true);
    setPlacing(false);
  };

  if (done) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4 text-center gap-6">
        <CPLogo size={40} />
        <div className="w-14 h-14 border border-green-500/30 bg-green-500/5 flex items-center justify-center">
          <span className="text-green-400 text-2xl">✓</span>
        </div>
        <div>
          <p className="font-mono-ui text-[10px] text-[#ff6b00] uppercase tracking-widest mb-2">Order Received</p>
          <h1 className="font-tactical text-4xl text-white mb-2">Thank You!</h1>
          <p className="font-mono-ui text-xs text-[#666] max-w-xs mx-auto">
            Your order(s) have been placed. Our team will contact you via Messenger to confirm payment and delivery.
          </p>
        </div>
        <div className="bg-[#1c1c1c] border border-[#333] px-6 py-4 text-left space-y-1 w-full max-w-xs">
          <p className="font-mono-ui text-[9px] text-[#555] uppercase tracking-widest mb-2">Order Numbers</p>
          {orderNumbers.map(n => (
            <p key={n} className="font-mono-ui text-xs text-[#ff8c00]">{n}</p>
          ))}
        </div>
        <Link to="/Home" className="btn-glow-orange font-mono-ui text-xs uppercase tracking-widest px-8 py-3">
          Back to Store
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="border-b border-[#1a1a1a] px-4 py-4 flex items-center gap-4">
        <Link to="/Home" className="text-[#555] hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <CPLogo size={28} />
        <span className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest ml-1">Checkout</span>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left — Form */}
        <div className="space-y-6">
          {/* Contact */}
          <div>
            <p className="font-mono-ui text-[10px] text-[#ff6b00] uppercase tracking-widest mb-3">Contact Info</p>
            <div className="space-y-3">
              <div>
                <label className={LABEL}>Full Name *</label>
                <input value={contact.name} onChange={e => setContact(c => ({ ...c, name: e.target.value }))} className={INPUT} placeholder="Juan dela Cruz" />
              </div>
              <div>
                <label className={LABEL}>Email *</label>
                <input type="email" value={contact.email} onChange={e => setContact(c => ({ ...c, email: e.target.value }))} className={INPUT} placeholder="juan@email.com" />
              </div>
              <div>
                <label className={LABEL}>Phone *</label>
                <input value={contact.phone} onChange={e => setContact(c => ({ ...c, phone: e.target.value }))} className={INPUT} placeholder="09XX-XXX-XXXX" />
              </div>
            </div>
          </div>

          {/* Shipping */}
          <div>
            <p className="font-mono-ui text-[10px] text-[#ff6b00] uppercase tracking-widest mb-3">Shipping Address</p>
            <div className="space-y-3">
              <div>
                <label className={LABEL}>Country *</label>
                <select value={address.country} onChange={e => setAddress(a => ({ ...a, country: e.target.value, province: '', city: '', barangay: '' }))} className={INPUT}>
                  {WORLD_COUNTRIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              {!isPhilippines ? (
                <div className="border border-[#ff6b00]/20 bg-[#ff6b00]/5 p-4 space-y-2">
                  <p className="font-mono-ui text-xs text-[#ff6b00] uppercase tracking-wider">International Orders</p>
                  <p className="font-mono-ui text-[10px] text-[#888] leading-relaxed">
                    We currently ship within the Philippines only. For international orders, please contact us directly.
                  </p>
                  <div className="flex gap-3 mt-3">
                    <a href="https://m.me/chokepointfightwear" target="_blank" rel="noreferrer"
                      className="btn-glow-orange font-mono-ui text-[10px] uppercase tracking-widest px-4 py-2 flex items-center gap-2">
                      <MessageCircle className="w-3.5 h-3.5" /> Messenger
                    </a>
                    <a href="mailto:chokepointfightwear@gmail.com"
                      className="btn-glow-white font-mono-ui text-[10px] uppercase tracking-widest px-4 py-2 flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5" /> Email
                    </a>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label className={LABEL}>Province *</label>
                    <select value={address.province} onChange={e => setAddress(a => ({ ...a, province: e.target.value }))} className={INPUT}>
                      <option value="">Select province...</option>
                      {PHILIPPINES_PROVINCES.map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  {address.province && (
                    <div>
                      <label className={LABEL}>City / Municipality *</label>
                      <select value={address.city} onChange={e => setAddress(a => ({ ...a, city: e.target.value }))} className={INPUT}>
                        <option value="">Select city...</option>
                        {cities.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                  )}
                  {address.city && (
                    <div>
                      <label className={LABEL}>Barangay</label>
                      <select value={address.barangay} onChange={e => setAddress(a => ({ ...a, barangay: e.target.value }))} className={INPUT}>
                        <option value="">Select barangay...</option>
                        {barangays.map(b => <option key={b}>{b}</option>)}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className={LABEL}>Street / House No. *</label>
                    <input value={address.street} onChange={e => setAddress(a => ({ ...a, street: e.target.value }))} className={INPUT} placeholder="123 Sample St." />
                  </div>
                  <div>
                    <label className={LABEL}>Postal Code</label>
                    <input value={address.postal_code} onChange={e => setAddress(a => ({ ...a, postal_code: e.target.value }))} className={INPUT} placeholder="1234" />
                  </div>
                  <div>
                    <label className={LABEL}>Delivery Notes</label>
                    <textarea value={address.notes} onChange={e => setAddress(a => ({ ...a, notes: e.target.value }))} rows={2}
                      className={`${INPUT} resize-none`} placeholder="Landmark, gate code, etc." />
                  </div>

                  {/* Shipping fee preview */}
                  {address.province && (
                    <div className="border border-[#222] bg-[#111] px-4 py-3">
                      <p className="font-mono-ui text-[9px] text-[#555] uppercase tracking-widest mb-1">Shipping Zone</p>
                      <p className="font-mono-ui text-xs text-white">{zone}</p>
                      {shippingFee != null ? (
                        <p className="font-mono-ui text-sm text-[#ff8c00] font-bold mt-1">₱{shippingFee.toLocaleString()}</p>
                      ) : (
                        <p className="font-mono-ui text-xs text-[#555] mt-1">TBD — staff will quote shipping</p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Confirm */}
          {isPhilippines && (
            <div className="flex items-start gap-3">
              <input type="checkbox" id="confirm" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} className="accent-[#ff8c00] mt-0.5 flex-shrink-0" />
              <label htmlFor="confirm" className="font-mono-ui text-[10px] text-[#888] leading-relaxed cursor-pointer">
                I confirm that my shipping address and order details are correct. I understand payment will be arranged via Messenger after order placement.
              </label>
            </div>
          )}
        </div>

        {/* Right — Order Summary */}
        <div className="space-y-4">
          <p className="font-mono-ui text-[10px] text-[#ff6b00] uppercase tracking-widest">Order Summary</p>
          <div className="border border-[#222] divide-y divide-[#1a1a1a]">
            {cart.map(item => (
              <div key={item.id} className="flex gap-3 p-3">
                {item.image && <img src={item.image} className="w-14 h-14 object-cover flex-shrink-0 opacity-80" />}
                <div className="flex-1 min-w-0">
                  <p className="font-mono-ui text-xs text-white truncate">{item.name}</p>
                  <p className="font-mono-ui text-[10px] text-[#555]">Size: {item.size} · Qty: {item.quantity}</p>
                  {item.custom_text && <p className="font-mono-ui text-[10px] text-[#ff8c00]">Print: {item.custom_text}</p>}
                  {item.is_preorder && <span className="font-mono-ui text-[9px] text-[#555] border border-[#333] px-1.5 py-0.5">PRE-ORDER</span>}
                </div>
                <p className="font-mono-ui text-xs text-[#ff8c00] flex-shrink-0">₱{(item.price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>

          <div className="border border-[#222] p-4 space-y-2">
            <div className="flex justify-between font-mono-ui text-xs text-[#888]">
              <span>Subtotal</span>
              <span>₱{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-mono-ui text-xs text-[#888]">
              <span>Shipping</span>
              <span>{shippingFee != null ? `₱${shippingFee.toLocaleString()}` : 'TBD'}</span>
            </div>
            <div className="flex justify-between font-mono-ui text-sm text-white font-bold border-t border-[#222] pt-2 mt-2">
              <span>Total</span>
              <span className="text-[#ff8c00]">₱{total.toLocaleString()}{shippingFee == null ? ' + shipping' : ''}</span>
            </div>
          </div>

          <button onClick={handlePlace} disabled={!canPlace || placing || !isPhilippines}
            className="w-full btn-glow-orange font-mono-ui text-xs uppercase tracking-widest py-4 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
            {placing ? <><Loader2 className="w-4 h-4 animate-spin" /> Placing Order...</> : 'Place Order'}
          </button>
          {!canPlace && isPhilippines && (
            <p className="font-mono-ui text-[10px] text-[#555] text-center">Fill in all required fields and confirm to continue</p>
          )}
        </div>
      </div>
    </div>
  );
}