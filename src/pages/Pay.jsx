import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import CPLogo from '@/components/cp/CPLogo';
import { Loader2, AlertCircle, ShoppingBag, Lock } from 'lucide-react';

export default function Pay() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderNum = params.get('order');
    if (!orderNum) { setError('Invalid payment link.'); setLoading(false); return; }

    (async () => {
      // Get current user (may be null if not logged in)
      const u = await base44.auth.me().catch(() => null);
      setCurrentUser(u);

      const res = await base44.functions.invoke('getOrderByNumber', { orderNumber: orderNum });
      if (res.data?.error || !res.data?.order) {
        setError(res.data?.error || 'Order not found.');
        setLoading(false);
        return;
      }

      const fetchedOrder = res.data.order;

      // Check if logged-in user's email matches the order email
      if (u && u.email && fetchedOrder.customer_email &&
          u.email.toLowerCase() !== fetchedOrder.customer_email.toLowerCase()) {
        setAccessDenied(true);
        setLoading(false);
        return;
      }

      setOrder(fetchedOrder);
      setLoading(false);
    })();
  }, []);

  const handlePay = async () => {
    if (!order) return;
    setPaying(true);
    setError('');

    const response = await base44.functions.invoke('createPaymongoPayment', {
      amount: order.total_amount,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      customerPhone: order.customer_phone,
      lineItems: [{
        name: order.product_name,
        price: order.total_amount - (order.shipping_fee || 0),
        size: order.size,
        quantity: order.quantity || 1,
        custom_text: order.custom_print_text,
        shipping_fee: order.shipping_fee || 0,
      }],
      orderIds: [order.id],
      orderNumbers: [order.order_number],
    });

    const { checkout_url, error: pmError } = response.data;
    if (pmError || !checkout_url) {
      setError(pmError || 'Payment setup failed. Please try again.');
      setPaying(false);
      return;
    }
    window.location.href = checkout_url;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="border-b border-[#1a1a1a] px-4 py-4 flex items-center gap-4">
        <Link to="/Home"><CPLogo size={28} /></Link>
        <span className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest">Secure Payment</span>
      </div>

      <div className="max-w-md mx-auto px-4 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-[#ff8c00]" />
          </div>
        ) : error ? (
          <div className="card-tactical p-8 text-center space-y-4">
            <AlertCircle className="w-10 h-10 text-[#ff0000] mx-auto" />
            <p className="font-tactical text-2xl text-white">Invalid Link</p>
            <p className="font-mono-ui text-xs text-[#555]">{error}</p>
            <Link to="/Home" className="btn-glow-orange font-mono-ui text-xs uppercase tracking-widest px-6 py-3 inline-flex">Back to Store</Link>
          </div>
        ) : accessDenied ? (
          <div className="card-tactical p-8 text-center space-y-4">
            <Lock className="w-10 h-10 text-[#ff6b00] mx-auto" />
            <p className="font-tactical text-2xl text-white">Access Restricted</p>
            <p className="font-mono-ui text-xs text-[#888]">
              This payment link can only be opened by the account associated with this order.
            </p>
            <p className="font-mono-ui text-[10px] text-[#555]">
              Logged in as: <span className="text-[#ff6b00]">{currentUser?.email}</span>
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => base44.auth.logout(window.location.href)}
                className="btn-glow-white font-mono-ui text-xs uppercase tracking-widest px-6 py-3 w-full"
              >
                Switch Account / Login
              </button>
              <Link to="/Home" className="font-mono-ui text-[10px] text-[#444] hover:text-[#888] uppercase tracking-widest">
                Back to Store
              </Link>
            </div>
          </div>
        ) : order ? (
          <div className="space-y-6">
            {order.payment_status === 'Paid' ? (
              <div className="card-tactical p-8 text-center space-y-4">
                <div className="w-12 h-12 bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-6 h-6 text-green-400" />
                </div>
                <p className="font-tactical text-2xl text-white">Already Paid</p>
                <p className="font-mono-ui text-xs text-[#888]">Order {order.order_number} has already been paid. Thank you!</p>
                <Link to="/MyOrders" className="btn-glow-orange font-mono-ui text-xs uppercase tracking-widest px-6 py-3 inline-flex">View My Orders</Link>
              </div>
            ) : (
            <>
            <div>
              <p className="font-mono-ui text-[10px] text-[#ff6b00] uppercase tracking-widest mb-1">Payment Due</p>
              <h1 className="font-tactical text-4xl text-white">{order.order_number}</h1>
              <p className="font-mono-ui text-xs text-[#888] mt-1">Hi {order.customer_name}, please complete your payment below.</p>
            </div>

            {/* Order Summary */}
            <div className="card-tactical divide-y divide-[#1a1a1a]">
              <div className="p-4 space-y-3">
                <p className="font-mono-ui text-[9px] text-[#555] uppercase tracking-widest">Order Summary</p>
                <div className="space-y-2">
                  <div className="flex justify-between font-mono-ui text-xs">
                    <span className="text-[#888]">{order.product_name}</span>
                    <span className="text-white">×{order.quantity || 1}</span>
                  </div>
                  {order.size && <p className="font-mono-ui text-[10px] text-[#555]">Size: {order.size}</p>}
                  {order.custom_print_text && <p className="font-mono-ui text-[10px] text-[#ff8c00]">Print: {order.custom_print_text}</p>}
                </div>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex justify-between font-mono-ui text-xs text-[#888]">
                  <span>Subtotal</span>
                  <span>₱{Number((order.total_amount || 0) - (order.shipping_fee || 0)).toLocaleString()}</span>
                </div>
                {order.shipping_fee > 0 && (
                  <div className="flex justify-between font-mono-ui text-xs text-[#888]">
                    <span>Shipping</span>
                    <span>₱{Number(order.shipping_fee).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-mono-ui text-sm font-bold border-t border-[#222] pt-2 mt-1">
                  <span className="text-white">Total</span>
                  <span className="text-[#ff6b00]">₱{Number(order.total_amount || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="card-tactical p-4 space-y-1">
              <p className="font-mono-ui text-[9px] text-[#555] uppercase tracking-widest mb-2">Shipping To</p>
              <p className="font-mono-ui text-xs text-white">{order.customer_name}</p>
              <p className="font-mono-ui text-[10px] text-[#888]">
                {[order.shipping_street, order.shipping_barangay, order.shipping_city, order.shipping_province].filter(Boolean).join(', ')}
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 border border-[#ff0000]/30 bg-[#ff0000]/5 px-4 py-3">
                <AlertCircle className="w-4 h-4 text-[#ff0000]" />
                <p className="font-mono-ui text-xs text-[#ff0000]">{error}</p>
              </div>
            )}

            <button onClick={handlePay} disabled={paying}
              className="w-full btn-glow-orange font-mono-ui text-xs uppercase tracking-widest py-4 flex items-center justify-center gap-2 disabled:opacity-40">
              {paying ? <><Loader2 className="w-4 h-4 animate-spin" /> Preparing...</> : <><ShoppingBag className="w-4 h-4" /> Pay Now</>}
            </button>

            <p className="font-mono-ui text-[9px] text-[#333] text-center uppercase tracking-widest">Secured by PayMongo · GCash · Credit Card · GrabPay</p>
            </>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}