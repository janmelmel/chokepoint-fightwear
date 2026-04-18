import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import CPLogo from '@/components/cp/CPLogo';
import { CheckCircle, MapPin, Package, Clock } from 'lucide-react';

export default function OrderConfirmed() {
  const params = new URLSearchParams(window.location.search);
  const status = params.get('status');
  const customerName = decodeURIComponent(params.get('name') || '');
  const orderNumbers = (() => {try {return JSON.parse(decodeURIComponent(params.get('orderNumbers') || '[]'));} catch {return [];}})();
  const orderIds = (() => {try {return JSON.parse(decodeURIComponent(params.get('orderIds') || '[]'));} catch {return [];}})();

  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (orderIds.length === 0) return;

    const load = async () => {
      const fetched = await Promise.all(orderIds.map((id) => base44.entities.Order.filter({ id }).then((r) => r[0]).catch(() => null)));
      return fetched.filter(Boolean);
    };

    const init = async () => {
      // First fetch
      const fetched = await load();
      setOrders(fetched);

      // If any order is still Pending payment, mark it Paid (user arrived from PayMongo success redirect)
      const stillPending = fetched.filter((o) => o.payment_status !== 'Paid');
      if (stillPending.length > 0) {
        await Promise.all(stillPending.map((o) =>
        base44.entities.Order.update(o.id, {
          payment_status: 'Paid',
          status: o.status === 'Pending' ? 'Processing' : o.status
        }).catch(() => {})
        ));
        // Re-fetch after update
        const updated = await load();
        setOrders(updated);
      } else {
        // Re-fetch once more after 3s in case webhook is slightly delayed
        setTimeout(async () => {
          const refreshed = await load();
          setOrders(refreshed);
        }, 3000);
      }
    };

    init();
  }, []);

  if (status !== 'success') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4 text-center gap-6">
        <CPLogo size={40} />
        <p className="font-mono-ui text-xs text-[#ff0000]">Invalid order confirmation link.</p>
        <Link to="/Home" className="bg-[hsl(var(--sidebar-border))] text-[hsl(var(--foreground))] px-8 py-3 text-xs font-mono-ui uppercase tracking-widest rounded-xl btn-glow-orange">BACK TO STORE</Link>
      </div>);

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
                    {order &&
                    <>
                        <p className="font-mono-ui text-xs text-white mt-1">{order.product_name}</p>
                        <p className="font-mono-ui text-[10px] text-[#555] mt-0.5">
                          Size: {order.size} · Qty: {order.quantity}
                          {order.custom_print_text && ` · Print: ${order.custom_print_text}`}
                        </p>
                        {order.is_preorder &&
                      <div className="flex items-center gap-1.5 mt-2">
                            <Clock className="w-3 h-3 text-[#ff6b00]" />
                            <p className="font-mono-ui text-[10px] text-[#ff6b00]">Est. production: 7–10 working days</p>
                          </div>
                      }
                      </>
                    }
                  </div>
                  {order &&
                  <div className="text-right flex-shrink-0">
                      <p className="font-mono-ui text-sm text-[#ff8c00]">₱{Number(order.total_amount || 0).toLocaleString()}</p>
                      <span className={`font-mono-ui text-[9px] border px-1.5 py-0.5 mt-1 inline-block uppercase tracking-wider ${
                    order.payment_status === 'Paid' ? 'text-green-400 border-green-500/30' : 'text-yellow-400 border-yellow-400/30'}`
                    }>{order.payment_status || 'Pending'}</span>
                    </div>
                  }
                </div>
              </div>);

          })}
        </div>

        {/* Shipping summary */}
        {orders[0]?.shipping_province &&
        <div className="w-full border border-[#222] bg-[#111] px-5 py-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-[#ff6b00]" />
              <p className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest">Shipping To</p>
            </div>
            <p className="font-mono-ui text-xs text-white">
              {[orders[0].shipping_street, orders[0].shipping_barangay, orders[0].shipping_city, orders[0].shipping_province, orders[0].shipping_postal_code].filter(Boolean).join(', ')}
            </p>
            {orders[0].shipping_fee > 0 &&
          <p className="font-mono-ui text-[10px] text-[#555] mt-1">Shipping Fee: ₱{orders[0].shipping_fee}</p>
          }
          </div>
        }

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
    </div>);

}