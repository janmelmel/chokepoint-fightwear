import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import CPLogo from '@/components/cp/CPLogo';
import { CheckCircle, MapPin, Package, Clock, Loader2 } from 'lucide-react';

export default function OrderConfirmed() {
  const params = new URLSearchParams(window.location.search);
  const status = params.get('status');
  const customerName = decodeURIComponent(params.get('name') || '');
  const orderNumbers = (() => { try { return JSON.parse(decodeURIComponent(params.get('orderNumbers') || '[]')); } catch { return []; } })();
  const orderIds = (() => { try { return JSON.parse(decodeURIComponent(params.get('orderIds') || '[]')); } catch { return []; } })();

  const [orders, setOrders] = useState([]);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [paymentTimeout, setPaymentTimeout] = useState(false);

  useEffect(() => {
    if (orderIds.length === 0) return;

    const load = async () => {
      const fetched = await Promise.all(orderIds.map(id => base44.entities.Order.filter({ id }).then(r => r[0]).catch(() => null)));
      return fetched.filter(Boolean);
    };

    let attempts = 0;
    const MAX_ATTEMPTS = 40; // 40 × 3s = 2 minutes
    let intervalId;

    const poll = async () => {
      attempts++;
      const fetched = await load();
      setOrders(fetched);

      const allPaid = fetched.length > 0 && fetched.every(o => o.payment_status === 'Paid');
      if (allPaid) {
        setPaymentConfirmed(true);
        clearInterval(intervalId);
        return;
      }

      if (attempts >= MAX_ATTEMPTS) {
        clearInterval(intervalId);
        setPaymentTimeout(true);
      }
    };

    poll(); // immediate first check
    intervalId = setInterval(poll, 3000);
    return () => clearInterval(intervalId);
  }, []);

  if (status !== 'success') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4 text-center gap-6">
        <CPLogo size={40} />
        <p className="font-mono-ui text-xs text-[#ff0000]">Invalid order confirmation link.</p>
        <Link to="/Home" className="btn-glow-orange font-mono-ui text-xs uppercase tracking-widest px-8 py-3">Back to Store</Link>
      </div>
    );
  }

  // Waiting for webhook to confirm payment
  if (!paymentConfirmed && !paymentTimeout) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4 text-center gap-6">
        <CPLogo size={32} />
        <Loader2 className="w-8 h-8 text-[#ff6b00] animate-spin" />
        <div>
          <p className="font-mono-ui text-[11px] text-[#ff6b00] uppercase tracking-widest mb-2">Confirming your payment...</p>
          <p className="font-mono-ui text-xs text-[#555]">Please wait while we verify your payment. Do not close this page.</p>
        </div>
      </div>
    );
  }

  // Timed out — webhook never arrived
  if (paymentTimeout && !paymentConfirmed) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4 text-center gap-6">
        <CPLogo size={32} />
        <div className="w-16 h-16 border border-yellow-500/30 bg-yellow-500/5 flex items-center justify-center">
          <Clock className="w-8 h-8 text-yellow-400" />
        </div>
        <div>
          <p className="font-mono-ui text-[11px] text-yellow-400 uppercase tracking-widest mb-2">Payment Verification Pending</p>
          <p className="font-mono-ui text-sm text-white mb-2">Your payment is being verified.</p>
          <p className="font-mono-ui text-xs text-[#888] leading-relaxed max-w-sm">
            You will receive a confirmation email shortly. If you have questions, contact us with your order number:
          </p>
          <div className="mt-4 space-y-1">
            {orderNumbers.map(n => (
              <p key={n} className="font-mono-ui text-sm text-[#ff8c00] font-bold">{n}</p>
            ))}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <a href="mailto:sales@chokepoint-fightwear.com"
            className="btn-glow-white font-mono-ui text-xs uppercase tracking-widest px-8 py-3">
            Contact Support
          </a>
          <Link to="/Home" className="btn-glow-orange font-mono-ui text-xs uppercase tracking-widest px-8 py-3">
            Back to Store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="border-b border-[#1a1a1a] px-4 py-4 flex justify-center">
        <CPLogo size={32} />
      </div>

      <div className="max-w-xl mx-auto px-4 py-12 flex flex-col items-center gap-8">
        {/* Success icon */}
        <div className="w-20 h-20 border-2 border-green-500/40 bg-green-500/5 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-400" />
        </div>

        {/* Heading */}
        <div className="text-center">
          <p className="font-mono-ui text-[11px] text-[#ff6b00] uppercase tracking-[0.3em] mb-2">Order Confirmed</p>
          <h1 className="font-tactical text-4xl sm:text-5xl text-white">
            Thank You{customerName ? `, ${customerName.split(' ')[0]}` : ''}!
          </h1>
        </div>

        {/* Order numbers */}
        <div className="w-full border border-[#222] bg-[#111] divide-y divide-[#1a1a1a]">
          <div className="px-5 py-3 flex items-center gap-2">
            <Package className="w-4 h-4 text-[#ff6b00]" />
            <p className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest">Order{orderNumbers.length > 1 ? 's' : ''}</p>
          </div>
          {orderNumbers.map((num, i) => {
            const order = orders[i];
            return (
              <div key={num} className="px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-mono-ui text-sm text-[#ff8c00] font-bold">{num}</p>
                    {order && (
                      <>
                        <p className="font-mono-ui text-xs text-white mt-1">{order.product_name}</p>
                        <p className="font-mono-ui text-[10px] text-[#555] mt-0.5">
                          Size: {order.size} · Qty: {order.quantity}
                          {order.custom_print_text && ` · Print: ${order.custom_print_text}`}
                        </p>
                        {order.is_preorder && (
                          <div className="flex items-center gap-1.5 mt-2">
                            <Clock className="w-3 h-3 text-[#ff6b00]" />
                            <p className="font-mono-ui text-[10px] text-[#ff6b00]">Est. production: 7–10 working days</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  {order && (
                    <div className="text-right flex-shrink-0">
                      <p className="font-mono-ui text-sm text-[#ff8c00]">₱{Number(order.total_amount || 0).toLocaleString()}</p>
                      <span className={`font-mono-ui text-[9px] border px-1.5 py-0.5 mt-1 inline-block uppercase tracking-wider ${
                        order.payment_status === 'Paid' ? 'text-green-400 border-green-500/30' : 'text-yellow-400 border-yellow-400/30'
                      }`}>{order.payment_status || 'Pending'}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Shipping summary */}
        {orders[0]?.shipping_province && (
          <div className="w-full border border-[#222] bg-[#111] px-5 py-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-[#ff6b00]" />
              <p className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest">Shipping To</p>
            </div>
            <p className="font-mono-ui text-xs text-white">
              {[orders[0].shipping_street, orders[0].shipping_barangay, orders[0].shipping_city, orders[0].shipping_province, orders[0].shipping_postal_code].filter(Boolean).join(', ')}
            </p>
            {orders[0].shipping_fee > 0 && (
              <p className="font-mono-ui text-[10px] text-[#555] mt-1">Shipping Fee: ₱{orders[0].shipping_fee}</p>
            )}
          </div>
        )}

        {/* Payment instructions */}
        <div className="w-full border-l-2 border-[#ff6b00] bg-[#111] px-5 py-4 space-y-2">
          <p className="font-mono-ui text-[10px] text-[#ff6b00] uppercase tracking-widest">Payment Instructions</p>
          <p className="font-mono-ui text-xs text-[#888] leading-relaxed">
            Please scan the QR code sent to your email to complete your payment. If you need help, contact us at{' '}
            <a href="mailto:sales@chokepoint-fightwear.com" className="text-[#ff6b00] hover:underline">
              sales@chokepoint-fightwear.com
            </a>
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Link to="/TrackOrder" className="flex-1 btn-glow-white font-mono-ui text-xs uppercase tracking-widest py-3 text-center">
            Track Order
          </Link>
          <Link to="/Home" className="flex-1 btn-glow-orange font-mono-ui text-xs uppercase tracking-widest py-3 text-center">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}