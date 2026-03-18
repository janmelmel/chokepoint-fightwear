import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, ChevronLeft, CheckCircle, CreditCard, Loader2, AlertCircle } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { removeFromCart, updateQuantity, clearCart } from '@/lib/cartStore';
import { base44 } from '@/api/base44Client';
import CPLogo from '@/components/cp/CPLogo';
import PromoCodeInput from '@/components/cp/PromoCodeInput';
import FooterLinks from '@/components/cp/FooterLinks';
import ShippingAddressForm from '@/components/cp/ShippingAddressForm';
import { getShippingRate, getShippingZone } from '@/lib/philippineAddress';

const EMPTY_SHIPPING = {
  country: 'Philippines',
  province: '',
  city: '',
  barangay: '',
  street: '',
  postalCode: '',
  deliveryNotes: '',
};

export default function Checkout() {
  const { cart } = useCart();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [shipping, setShipping] = useState(EMPTY_SHIPPING);
  const [errors, setErrors] = useState({});
  const [shippingErrors, setShippingErrors] = useState({});
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [doneOrderNum, setDoneOrderNum] = useState('');
  const [promoCode, setPromoCode] = useState(null);
  const [paymongoLoading, setPaymongoLoading] = useState(false);
  const [paymongoError, setPaymongoError] = useState('');

  // Handle return from PayMongo
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') setDone(true);
  }, []);

  const isPhilippines = shipping.country === 'Philippines';

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const discount = promoCode?.type === 'percent' ? Math.round(subtotal * (promoCode.value / 100)) : 0;
  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);

  // Shipping fee calculation
  const hasTBDShipping = cart.some(i => i.shipping_fee_override === null && !isPhilippines === false);
  const shippingFee = (() => {
    if (!isPhilippines) return 0;
    if (!shipping.province) return null; // not calculated yet
    let fee = 0;
    const zoneRate = getShippingRate(shipping.province);
    const hasLifestyle = cart.some(i => i.shipping_fee_override === null && i.shipping_fee_override !== 0);
    // Items with override use override, others use zone rate
    cart.forEach(item => {
      if (item.shipping_fee_override != null && item.shipping_fee_override > 0) {
        fee += item.shipping_fee_override * item.quantity;
      } else if (item.shipping_fee_override === null) {
        // TBD - lifestyle product
        fee = null; // signals TBD
      } else {
        fee += zoneRate;
      }
    });
    if (fee === null) return null; // TBD
    // Don't double-count zone rate; just use it once
    const hasOverride = cart.some(i => i.shipping_fee_override != null && i.shipping_fee_override > 0);
    if (!hasOverride) return zoneRate;
    return fee;
  })();

  // Simplified: use zone rate unless all items have overrides
  const computedShippingFee = (() => {
    if (!isPhilippines || !shipping.province) return null;
    const zoneRate = getShippingRate(shipping.province);
    const allHaveOverride = cart.every(i => i.shipping_fee_override != null && i.shipping_fee_override > 0);
    if (allHaveOverride) {
      return cart.reduce((sum, i) => sum + (i.shipping_fee_override || 0), 0);
    }
    const hasTBD = cart.some(i => i.shipping_fee_override === null);
    if (hasTBD) return null; // TBD
    return zoneRate;
  })();

  const shippingIsTBD = isPhilippines && shipping.province && computedShippingFee === null;
  const grandTotal = subtotal - discount + (computedShippingFee || 0);

  const validateForm = () => {
    const e = {};
    if (!name.trim()) e.name = 'Required';
    if (!email.trim()) e.email = 'Required';
    if (!phone.trim()) e.phone = 'Required';

    const se = {};
    if (isPhilippines) {
      if (!shipping.province) se.province = 'Select your province';
      if (!shipping.city) se.city = 'Select your city';
      if (!shipping.barangay) se.barangay = 'Select your barangay';
      if (!shipping.street.trim()) se.street = 'Enter your street address';
    }

    setErrors(e);
    setShippingErrors(se);
    return Object.keys(e).length === 0 && Object.keys(se).length === 0;
  };

  const buildOrderBase = (orderNum) => ({
    order_number: orderNum,
    customer_name: name,
    customer_email: email,
    customer_phone: phone,
    shipping_province: shipping.province,
    shipping_city: shipping.city,
    shipping_barangay: shipping.barangay,
    shipping_street: shipping.street,
    shipping_postal_code: shipping.postalCode,
    shipping_delivery_notes: shipping.deliveryNotes,
    shipping_zone: isPhilippines && shipping.province ? getShippingZone(shipping.province) : '',
    shipping_fee: computedShippingFee || 0,
    status: 'Processing',
  });

  const handlePaymongo = async () => {
    if (!validateForm()) return;
    if (!confirmed) { setErrors(e => ({ ...e, confirmed: 'Please confirm your order details' })); return; }
    if (cart.length === 0) return;

    setPaymongoLoading(true);
    setPaymongoError('');

    const orderNum = `CP-${Date.now().toString().slice(-6)}`;
    const base = buildOrderBase(orderNum);

    await Promise.all(
      cart.map(async (item) => {
        const itemDiscount = discount > 0 ? Math.round((item.price * item.quantity / subtotal) * discount) : 0;
        await base44.entities.Order.create({
          ...base,
          product_id: item.productId,
          product_name: item.name,
          size: item.size,
          quantity: item.quantity,
          total_amount: item.price * item.quantity - itemDiscount,
          payment_method: 'GCash',
          is_preorder: !!item.is_preorder,
          custom_print_text: item.custom_text || '',
          notes: 'PayMongo online payment',
        });
        if (item.productId) {
          const prods = await base44.entities.Product.filter({ id: item.productId });
          const prod = prods[0];
          if (prod) {
            const updates = { total_ordered: (prod.total_ordered || 0) + item.quantity };
            // Decrement per-size stock
            if (prod.stock_per_size && prod.stock_per_size[item.size] != null) {
              updates.stock_per_size = {
                ...prod.stock_per_size,
                [item.size]: Math.max(0, prod.stock_per_size[item.size] - item.quantity),
              };
            }
            await base44.entities.Product.update(item.productId, updates);
          }
        }
      })
    );

    if (email) {
      const itemsList = cart.map(i => `${i.name} (Size: ${i.size}${i.custom_text ? ` | Print: ${i.custom_text}` : ''}) x${i.quantity} — ₱${(i.price * i.quantity).toLocaleString()}`).join('\n');
      const shippingLine = computedShippingFee ? `Shipping: ₱${computedShippingFee.toLocaleString()}` : 'Shipping: To be quoted';
      await base44.integrations.Core.SendEmail({
        to: email,
        subject: `Order Confirmed #${orderNum} — Chokepoint Fightwear`,
        body: `Hi ${name}!\n\nYour order has been received.\n\nOrder #: ${orderNum}\n\n${itemsList}${discount > 0 ? `\nDiscount: -₱${discount.toLocaleString()}` : ''}\n${shippingLine}\nTotal: ₱${grandTotal.toLocaleString()}\n\nShipping to:\n${shipping.street}, ${shipping.barangay}, ${shipping.city}, ${shipping.province} ${shipping.postalCode}\n\nTo track your order, visit:\n${window.location.origin}/TrackOrder\n\nOrder #: ${orderNum}\n\nThank you for supporting Chokepoint Fightwear!\n\n— Chokepoint Fightwear Team`,
      });
    }

    const res = await base44.functions.invoke('createPaymongoPayment', {
      amount: grandTotal,
      description: `Chokepoint Order #${orderNum}`,
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      lineItems: cart.map((i) => ({ name: i.name, size: i.size, price: i.price, quantity: i.quantity })),
    });

    clearCart();

    if (res.data?.checkout_url) {
      window.location.href = res.data.checkout_url;
    } else {
      setPaymongoError(res.data?.error || 'Could not create payment. Try again.');
      setPaymongoLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto" />
          <h1 className="font-tactical text-4xl text-white">Order Received!</h1>
          <p className="font-mono-ui text-sm text-[#666] max-w-xs">
            Thanks{name ? ` ${name}` : ''}! Your order has been logged. We'll process it shortly.
          </p>
          {doneOrderNum && (
            <p className="font-mono-ui text-xs text-[#ff8c00]">Order #{doneOrderNum}</p>
          )}
          <Link to="/Home" style={{ background: '#ff6b00', border: '1px solid #ff6b00', color: '#fff', fontWeight: 700 }}
            className="inline-block px-8 py-3 font-mono-ui text-xs tracking-widest uppercase mt-4">
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
        <Link to="/Home"><CPLogo size={32} variant="white" /></Link>
        <Link to="/Home" className="flex items-center gap-1 font-mono-ui text-[10px] text-[#555] hover:text-white uppercase tracking-widest transition-colors">
          <ChevronLeft className="w-3 h-3" /> Back to Shop
        </Link>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* LEFT: Order items + summary */}
        <div className="lg:col-span-3 space-y-4">
          <div>
            <p className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest">Review</p>
            <h1 className="font-tactical text-4xl text-white">Your Order</h1>
          </div>

          {cart.length === 0 ? (
            <div className="card-tactical p-8 text-center">
              <p className="font-mono-ui text-sm text-[#333]">Your bag is empty.</p>
              <Link to="/Home" style={{ background: '#1c1c1c', border: '1px solid #444', color: '#d0d0d0' }}
                className="inline-block mt-4 px-6 py-2.5 font-mono-ui text-xs tracking-widest uppercase">
                Shop Now
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="card-tactical p-4 flex gap-4 items-center">
                  <div className="w-16 h-16 flex-shrink-0 bg-[#111] overflow-hidden">
                    {item.image
                      ? <img src={item.image} className="w-full h-full object-cover opacity-80" alt={item.name} />
                      : <div className="w-full h-full flex items-center justify-center"><span className="font-tactical text-lg text-[#222]">CP</span></div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-tactical text-lg text-white leading-tight">{item.name}</p>
                    <p className="font-mono-ui text-[10px] text-[#555]">
                      Size: {item.size}{item.is_preorder ? ' · PRE-ORDER' : ''}
                    </p>
                    {item.custom_text && (
                      <p className="font-mono-ui text-[10px] text-[#ff8c00]">Print: {item.custom_text}</p>
                    )}
                    <p className="font-mono-ui text-sm text-[#ff8c00] mt-1">₱{item.price.toLocaleString()} each</p>
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
                      <button onClick={() => removeFromCart(item.id)} className="ml-1 text-[#333] hover:text-[#ff0000] transition-colors">
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
                  <span>Shipping {isPhilippines && shipping.province ? `(${getShippingZone(shipping.province)})` : ''}</span>
                  <span>
                    {!isPhilippines ? 'N/A' :
                      !shipping.province ? 'Select province above' :
                      shippingIsTBD ? 'To be quoted' :
                      `₱${computedShippingFee?.toLocaleString()}`}
                  </span>
                </div>
                {shippingIsTBD && (
                  <p className="font-mono-ui text-[10px] text-[#ff8c00]">
                    Shipping for one or more items will be quoted by our team. We will contact you after your order is placed.
                  </p>
                )}
                <div className="border-t border-[#222] pt-2 flex justify-between items-center">
                  <span className="font-mono-ui text-xs text-[#888] uppercase tracking-wider">Order Total</span>
                  <span className="font-tactical text-3xl text-white">₱{grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Contact + Shipping + Checkout */}
        <div className="lg:col-span-2 space-y-5">
          {/* Contact Details */}
          <div>
            <p className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest">Contact</p>
            <h2 className="font-tactical text-3xl text-white">Your Details</h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest block mb-1">Full Name *</label>
              <input value={name} onChange={e => setName(e.target.value)}
                className={`w-full bg-[#111] border text-white font-mono-ui text-sm px-3 py-2.5 focus:outline-none focus:border-[#ff8c00]/60 ${errors.name ? 'border-[#ff0000]' : 'border-[#333]'}`}
                placeholder="Juan Dela Cruz" />
              {errors.name && <p className="font-mono-ui text-[10px] text-[#ff0000] mt-0.5">Required</p>}
            </div>
            <div>
              <label className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest block mb-1">Email *</label>
              <input value={email} onChange={e => setEmail(e.target.value)} type="email"
                className={`w-full bg-[#111] border text-white font-mono-ui text-sm px-3 py-2.5 focus:outline-none focus:border-[#ff8c00]/60 ${errors.email ? 'border-[#ff0000]' : 'border-[#333]'}`}
                placeholder="you@email.com" />
              {errors.email && <p className="font-mono-ui text-[10px] text-[#ff0000] mt-0.5">Required</p>}
            </div>
            <div>
              <label className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest block mb-1">Contact Number *</label>
              <input value={phone} onChange={e => setPhone(e.target.value)}
                className={`w-full bg-[#111] border text-white font-mono-ui text-sm px-3 py-2.5 focus:outline-none focus:border-[#ff8c00]/60 ${errors.phone ? 'border-[#ff0000]' : 'border-[#333]'}`}
                placeholder="+63 9XX XXX XXXX" />
              {errors.phone && <p className="font-mono-ui text-[10px] text-[#ff0000] mt-0.5">Required</p>}
            </div>
          </div>

          {/* Shipping Address */}
          <div>
            <p className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest mb-1">Shipping Address</p>
            <h2 className="font-tactical text-2xl text-white mb-3">Delivery Info</h2>
            <ShippingAddressForm value={shipping} onChange={setShipping} errors={shippingErrors} />
          </div>

          {/* Place Order */}
          {cart.length > 0 && isPhilippines && (
            <div className="space-y-4 pt-1">
              {/* Order Confirmation Checkbox */}
              <div className={`border p-4 ${errors.confirmed ? 'border-[#ff0000]/50 bg-[#ff0000]/5' : 'border-[#222]'}`}>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={confirmed} onChange={e => { setConfirmed(e.target.checked); if (e.target.checked) setErrors(er => ({ ...er, confirmed: undefined })); }}
                    className="mt-0.5 accent-[#ff8c00] flex-shrink-0" />
                  <span className="font-mono-ui text-[11px] text-[#888] leading-relaxed">
                    I confirm my order details and shipping address are correct
                  </span>
                </label>
                {errors.confirmed && (
                  <p className="font-mono-ui text-[10px] text-[#ff0000] mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.confirmed}
                  </p>
                )}
              </div>

              {/* Pay Online */}
              <div className="space-y-2">
                <p className="font-mono-ui text-[10px] text-[#ff8c00] uppercase tracking-widest">Pay Online</p>
                <button onClick={handlePaymongo} disabled={paymongoLoading || submitting}
                  style={{ background: '#ff6b00', border: '1px solid #ff6b00', color: '#fff', fontWeight: 700 }}
                  className="w-full py-4 font-mono-ui text-sm uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                  {paymongoLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                  ) : (
                    <><CreditCard className="w-4 h-4" /> Pay with GCash / Maya / Card</>
                  )}
                </button>
                {paymongoError && (
                  <p className="font-mono-ui text-[10px] text-[#ff0000]">{paymongoError}</p>
                )}
                <p className="font-mono-ui text-[9px] text-[#444] text-center">Secured by PayMongo · GCash · Maya · Visa · Mastercard</p>
              </div>
            </div>
          )}

          {/* International message */}
          {cart.length > 0 && !isPhilippines && (
            <div className="border border-[#333] p-4">
              <p className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest mb-2">International Order</p>
              <p className="font-mono-ui text-xs text-[#888]">
                We currently only ship within the Philippines. Please contact us for international orders.
              </p>
            </div>
          )}
        </div>
      </main>

      <FooterLinks />
    </div>
  );
}