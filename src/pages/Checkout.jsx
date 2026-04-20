import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { getCart, clearCart } from '@/lib/cartStore';
import { getDHLShippingFee, getProductWeight } from '@/lib/dhlRates';
import {
  PHILIPPINES_PROVINCES, getCitiesForProvince, getBarangaysForCity,
  getShippingZone, getShippingRate, WORLD_COUNTRIES
} from '@/lib/philippineAddress';
import CPLogo from '@/components/cp/CPLogo';
import PromoCodeInput from '@/components/cp/PromoCodeInput';
import PreOrderTimelineBox from '@/components/cp/PreOrderTimelineBox';
import { ArrowLeft, Loader2, MessageCircle, Mail, AlertCircle } from 'lucide-react';

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
  const [error, setError] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [stockViolations, setStockViolations] = useState([]); // [{productName, size, requested, available}]
  const [dhlRate, setDhlRate] = useState(null); // { fee, zone, chargeableKg, roundedKg }
  const [stockChecking, setStockChecking] = useState(false);

  const prevProvince = useRef('');
  const prevCity = useRef('');

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

  const validateStock = async (items) => {
    if (!items || items.length === 0) return [];
    setStockChecking(true);
    try {
      const res = await base44.functions.invoke('validateCartStock', {
        items: items.map(i => ({
          productId: i.productId,
          size: i.size,
          variant_name: i.variant_name || '',
          quantity: i.quantity,
          is_preorder: !!i.is_preorder,
        })),
      });
      const violations = res.data?.violations || [];
      setStockViolations(violations);
      return violations;
    } catch {
      // fail silently — don't block checkout if validation itself errors
      return [];
    } finally {
      setStockChecking(false);
    }
  };

  useEffect(() => {
    // Check for cancelled payment on return
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'cancelled') {
      setError('Payment was cancelled. Please try again.');
      window.history.replaceState({}, '', '/Checkout');
    }
    const items = getCart();
    if (items.length === 0) navigate('/Home');
    setCart(items);
    validateStock(items);
  }, []);

  const isPhilippines = address.country === 'Philippines';

  // Compute DHL rate when international country changes
  useEffect(() => {
    if (!isPhilippines && address.country && cart.length > 0) {
      const result = getDHLShippingFee(cart, address.country);
      setDhlRate(result);
    } else {
      setDhlRate(null);
    }
  }, [address.country, cart.length, isPhilippines]);
  const zone = isPhilippines && address.province ? getShippingZone(address.province) : null;

  const computeShipping = () => {
    if (!isPhilippines || !address.province) return null;
    const baseRate = getShippingRate(address.province);
    // Per-item shipping: use product override if set, else zone rate
    const itemFees = cart.map(i => (i.shipping_fee_override != null && i.shipping_fee_override >= 0) ? i.shipping_fee_override : baseRate);
    const rawTotal = itemFees.reduce((s, f) => s + f, 0);
    const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
    const multiDiscount = totalItems >= 2 ? Math.round(rawTotal * 0.10) : 0;
    return { raw: rawTotal, discount: multiDiscount, final: rawTotal - multiDiscount, count: totalItems };
  };

  const shipping = computeShipping();
  const shippingFee = shipping?.final ?? null;
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const total = subtotal + (shippingFee || 0) - promoDiscount;

  const cities = isPhilippines && address.province ? getCitiesForProvince(address.province) : [];
  const barangays = isPhilippines && address.city ? getBarangaysForCity(address.city) : [];

  const hasStockViolations = stockViolations.length > 0;
  const canPlace = contact.name && contact.email && contact.phone &&
    isPhilippines && address.province && address.city && address.street && confirmed && !hasStockViolations && !stockChecking;

  const handlePlace = async () => {
    if (!canPlace) return;
    setPlacing(true);
    setError('');

    const finalTotal = subtotal + (shippingFee || 0) - promoDiscount;

    // Single backend call: stock check + order creation + PayMongo session — all server-side
    const response = await base44.functions.invoke('createPaymongoPayment', {
      amount: finalTotal,
      customerName: contact.name,
      customerEmail: contact.email,
      customerPhone: contact.phone,
      lineItems: cart.map(i => ({
        name: i.name,
        price: i.price,
        size: i.size,
        quantity: i.quantity,
        custom_text: i.custom_text,
        shipping_fee: shippingFee || 0,
      })),
      cartItems: cart.map(i => ({
        productId: i.productId,
        name: i.name,
        price: i.price,
        size: i.size,
        quantity: i.quantity,
        custom_text: i.custom_text || '',
        variant_name: i.variant_name || '',
        is_preorder: !!i.is_preorder,
      })),
      contact,
      address,
      zone: zone || '',
      shippingFee: shippingFee || 0,
      appliedPromoCode: appliedPromo?.code || null,
      promoDiscount: promoDiscount || 0,
    });

    const { checkout_url, error: pmError, orderIds, orderNumbers } = response.data;

    if (pmError || !checkout_url) {
      setError(pmError || 'Payment setup failed. Please try again.');
      setPlacing(false);
      return;
    }

    // Fire-and-forget Trello cards
    const shippingAddress = `${address.street}, ${address.barangay ? address.barangay + ', ' : ''}${address.city}, ${address.province} ${address.postal_code}`.trim();
    if (orderIds && orderNumbers) {
      orderIds.forEach((orderId, idx) => {
        const item = cart[idx];
        if (!item) return;
        base44.functions.invoke('createTrelloCard', {
          orderId,
          orderNumber: orderNumbers[idx],
          customerName: contact.name,
          items: [{ name: item.name, variant_name: item.variant_name || '', size: item.size, quantity: item.quantity }],
          shippingAddress,
        }).catch(() => {});
      });
    }

    clearCart();
    window.location.href = checkout_url;
  };

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

      {error && (
        <div className="max-w-4xl mx-auto px-4 pt-4">
          <div className="flex items-center gap-3 border border-[#ff0000]/30 bg-[#ff0000]/5 px-4 py-3">
            <AlertCircle className="w-4 h-4 text-[#ff0000] flex-shrink-0" />
            <p className="font-mono-ui text-xs text-[#ff0000]">{error}</p>
          </div>
        </div>
      )}

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
                  <option value="Philippines">Philippines</option>
                  {WORLD_COUNTRIES.filter(c => c !== 'Philippines').map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              {!isPhilippines ? (
                <div className="border-l-4 border-[#E87722] bg-[#111] p-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🌏</span>
                    <div>
                      <p className="font-tactical text-xl text-white">International Orders</p>
                      <p className="font-mono-ui text-xs text-[#888] mt-1 leading-relaxed">
                        We're not yet processing international orders through our website. Contact us directly and we'll assist you with product availability, shipping rates, and payment options.
                      </p>
                    </div>
                  </div>

                  {/* DHL Rate Preview */}
                  {dhlRate && (
                    <div className="bg-[#0a0a0a] border border-[#ff8c00]/20 px-4 py-3 space-y-2">
                      <p className="font-mono-ui text-[9px] text-[#ff8c00] uppercase tracking-widest">Estimated DHL Express Shipping to {address.country}</p>
                      <p className="font-tactical text-2xl text-white">₱{dhlRate.fee.toLocaleString()}</p>
                      <p className="font-mono-ui text-[10px] text-[#555]">Zone {dhlRate.zone} · {dhlRate.chargeableKg} kg chargeable weight</p>
                      <div className="border-t border-[#1a1a1a] pt-2 space-y-1">
                        {cart.map((item, i) => (
                          <div key={i} className="flex justify-between font-mono-ui text-[10px] text-[#666]">
                            <span>{item.name} × {item.quantity}</span>
                            <span>{(getProductWeight(item) * item.quantity).toFixed(2)} kg</span>
                          </div>
                        ))}
                        <div className="flex justify-between font-mono-ui text-xs text-[#888] border-t border-[#1a1a1a] pt-2 mt-1">
                          <span>Items subtotal</span><span>₱{subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-mono-ui text-xs text-[#888]">
                          <span>DHL Express Shipping (Zone {dhlRate.zone} · {dhlRate.roundedKg} kg)</span>
                          <span>₱{dhlRate.fee.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-mono-ui text-sm text-[#ff8c00] font-bold border-t border-[#1a1a1a] pt-2">
                          <span>Estimated Total</span><span>₱{(subtotal + dhlRate.fee).toLocaleString()}</span>
                        </div>
                      </div>
                      <p className="font-mono-ui text-[9px] text-[#444] italic">*Final shipping may vary based on actual package weight upon dispatch.</p>
                    </div>
                  )}

                  <p className="font-mono-ui text-[10px] text-[#888] uppercase tracking-widest">Contact us to place your order:</p>
                  <div className="flex flex-col gap-2">
                    <a href="https://www.facebook.com/profile.php?id=61571430141920" target="_blank" rel="noreferrer"
                      style={{ background: '#1877F2', border: '1px solid #1877F2', color: '#fff', fontWeight: 700 }}
                      className="font-mono-ui text-[10px] uppercase tracking-widest px-4 py-3 flex items-center gap-2">
                      <MessageCircle className="w-3.5 h-3.5" /> Message us on Facebook
                    </a>
                    <a href="https://www.instagram.com/chokepoint_fightwear/" target="_blank" rel="noreferrer"
                      style={{ background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)', border: 'none', color: '#fff', fontWeight: 700 }}
                      className="font-mono-ui text-[10px] uppercase tracking-widest px-4 py-3 flex items-center gap-2">
                      <span className="text-base">📷</span> DM us on Instagram
                    </a>
                    <a href="mailto:sales@chokepoint-fightwear.com"
                      style={{ background: '#E87722', border: '1px solid #E87722', color: '#fff', fontWeight: 700 }}
                      className="font-mono-ui text-[10px] uppercase tracking-widest px-4 py-3 flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5" /> Email us — sales@chokepoint-fightwear.com
                    </a>
                  </div>
                  <p className="font-mono-ui text-[10px] text-[#555] leading-relaxed">We ship via <span className="text-white">DHL Express</span> worldwide.</p>
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
                  {address.province && (
                    <div className="border-l-2 border-[#333] bg-[#111] px-4 py-3">
                      <p className="font-mono-ui text-[9px] text-[#555] uppercase tracking-widest mb-1">Shipping Zone: {zone}</p>
                      {shippingFee != null
                        ? <p className="font-mono-ui text-sm text-[#ff8c00] font-bold">₱{shippingFee.toLocaleString()}</p>
                        : <p className="font-mono-ui text-xs text-[#555]">TBD — staff will quote shipping</p>}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {isPhilippines && (
            <div className="flex items-start gap-3">
              <input type="checkbox" id="confirm" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} className="accent-[#ff8c00] mt-0.5 flex-shrink-0" />
              <label htmlFor="confirm" className="font-mono-ui text-[10px] text-[#888] leading-relaxed cursor-pointer">
                I confirm that my shipping address and order details are correct. I will be redirected to a secure payment page to complete my purchase.
              </label>
            </div>
          )}
        </div>

        {/* Right — Order Summary */}
        <div className="space-y-4">
        <p className="font-mono-ui text-[10px] text-[#ff6b00] uppercase tracking-widest">Order Summary</p>

        {/* Stock violation banner */}
        {hasStockViolations && (
          <div className="border border-[#c0392b]/50 bg-[#c0392b]/10 px-4 py-3 space-y-1">
            <p className="font-mono-ui text-[11px] text-[#ff4444] font-bold">❌ One or more items in your order exceed available stock. Please update your cart before proceeding.</p>
            {stockViolations.map((v, i) => (
              <p key={i} className="font-mono-ui text-[10px] text-[#ff6666]">
                • {v.productName}{v.variant_name ? ` (${v.variant_name})` : ''} — Size {v.size}: you have {v.requested}, only {v.available} available
              </p>
            ))}
          </div>
        )}

        {stockChecking && (
          <div className="border border-[#333] bg-[#1a1a1a] px-4 py-3">
            <p className="font-mono-ui text-[10px] text-[#555] animate-pulse">Validating stock availability...</p>
          </div>
        )}

        <div className="border border-[#222] divide-y divide-[#1a1a1a]">
          {cart.map(item => {
            const violation = stockViolations.find(v =>
              v.productId === item.productId && v.size === item.size && (v.variant_name || '') === (item.variant_name || '')
            );
            return (
            <div key={item.id} className={`flex gap-3 p-3 ${violation ? 'bg-[#c0392b]/10 border-l-2 border-[#c0392b]' : ''}`}>
              {item.image && <img src={item.image} className="w-14 h-14 object-cover flex-shrink-0 opacity-80" alt={item.name} />}
              <div className="flex-1 min-w-0">
                <p className="font-mono-ui text-xs text-white truncate">{item.name}</p>
                <p className="font-mono-ui text-[10px] text-[#555]">
                  {item.variant_name && <span className="text-[#ff8c00]">{item.variant_name} · </span>}
                  Size: {item.size} · Qty: {item.quantity}
                </p>
                {item.custom_text && <p className="font-mono-ui text-[10px] text-[#ff8c00]">Print: {item.custom_text}</p>}
                {item.is_preorder && <span className="font-mono-ui text-[9px] text-[#ff8c00] border border-[#ff8c00]/40 px-1.5 py-0.5 bg-[#ff8c00]/5">PRE-ORDER</span>}
                {item.is_preorder && !violation && (
                  <div className="mt-2">
                    <PreOrderTimelineBox orderDate={new Date()} />
                  </div>
                )}
                {violation && (
                  <p className="font-mono-ui text-[10px] text-[#ff4444] mt-1">
                    ❌ Only {violation.available} available — go back to cart to fix
                  </p>
                )}
              </div>
              <p className="font-mono-ui text-xs text-[#ff8c00] flex-shrink-0">₱{(item.price * item.quantity).toLocaleString()}</p>
            </div>
            );
          })}
        </div>

          {/* Promo Code */}
          <div>
            <p className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest mb-2">Promo Code</p>
            <PromoCodeInput
              subtotal={subtotal}
              appliedPromo={appliedPromo}
              onApply={(promo, discount) => { setAppliedPromo(promo); setPromoDiscount(discount); }}
              onRemove={() => { setAppliedPromo(null); setPromoDiscount(0); }}
            />
          </div>

          <div className="border border-[#222] p-4 space-y-2">
            <div className="flex justify-between font-mono-ui text-xs text-[#888]">
              <span>Subtotal</span><span>₱{subtotal.toLocaleString()}</span>
            </div>
            {shipping != null ? (
              <>
                <div className="flex justify-between font-mono-ui text-xs text-[#888]">
                  <span>Shipping ({shipping.count} item{shipping.count !== 1 ? 's' : ''})</span>
                  <span>₱{shipping.raw.toLocaleString()}</span>
                </div>
                {shipping.discount > 0 && (
                  <div className="flex justify-between font-mono-ui text-xs text-green-400">
                    <span>Multi-item discount (10%)</span>
                    <span>-₱{shipping.discount.toLocaleString()}</span>
                  </div>
                )}
              </>
            ) : (
              <div className="flex justify-between font-mono-ui text-xs text-[#888]">
                <span>Shipping</span><span>TBD</span>
              </div>
            )}
            {promoDiscount > 0 && (
              <div className="flex justify-between font-mono-ui text-xs text-green-400">
                <span>Promo ({appliedPromo?.code})</span>
                <span>-₱{promoDiscount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-mono-ui text-sm text-white font-bold border-t border-[#222] pt-2 mt-2">
              <span>Total</span>
              <span className="text-[#ff8c00]">₱{total.toLocaleString()}{shippingFee == null ? ' + shipping' : ''}</span>
            </div>
          </div>

          {/* QRPh Payment Notice */}
          <div className="border border-[#ff6b00]/30 bg-[#ff6b00]/5 px-4 py-3 flex gap-3">
            <span className="text-lg flex-shrink-0">📱</span>
            <p className="font-mono-ui text-[10px] text-[#ff8c00] leading-relaxed">
              We currently accept payment via <strong>QRPh (Scan to Pay)</strong>. Open your GCash, Maya, or any banking app and scan the QR code to complete your payment. More payment options coming soon!
            </p>
          </div>

          <button
            onClick={handlePlace}
            disabled={!canPlace || placing || !isPhilippines}
            style={
              hasStockViolations || stockChecking
                ? { background: '#444', border: '1px solid #444', color: '#888', cursor: 'not-allowed' }
                : undefined
            }
            className={`w-full font-mono-ui text-xs uppercase tracking-widest py-4 flex items-center justify-center gap-2 disabled:cursor-not-allowed ${
              hasStockViolations || stockChecking ? '' : 'btn-glow-orange disabled:opacity-40'
            }`}>
            {placing
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Preparing Payment...</>
              : stockChecking
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Validating Stock...</>
              : hasStockViolations
              ? '❌ Fix Stock Issues to Continue'
              : 'Proceed to Payment'}
          </button>
          {isPhilippines && !canPlace && !hasStockViolations && !stockChecking && (
            <p className="font-mono-ui text-[10px] text-[#444] text-center">Fill in all required fields and confirm to continue</p>
          )}
          <div className="flex items-center justify-center gap-3 pt-1">
            <img src="https://assets.paymongo.com/assets/paymongo-logo-white.png" alt="PayMongo" className="h-4 opacity-30" onError={e => e.target.style.display='none'} />
            <p className="font-mono-ui text-[9px] text-[#333] uppercase tracking-widest">Secured by PayMongo</p>
          </div>
        </div>
      </div>
    </div>
  );
}