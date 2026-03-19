import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import StickyHeader from '@/components/cp/StickyHeader';
import FooterLinks from '@/components/cp/FooterLinks';
import CartDrawer from '@/components/cp/CartDrawer';
import ReviewModal from '@/components/cp/ReviewModal';
import { addToCart } from '@/lib/cartStore';
import { Package, RotateCcw, MessageCircle, ChevronDown, ChevronUp, ExternalLink, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_STYLE = {
  'Pending':          'text-yellow-300 border-yellow-400/50 bg-yellow-400/15',
  'Processing':       'text-blue-300 border-blue-400/50 bg-blue-400/15',
  'Packing':          'text-purple-300 border-purple-400/50 bg-purple-400/15',
  'Out for Delivery': 'text-orange-300 border-orange-400/50 bg-orange-400/15',
  'Completed':        'text-green-300 border-green-400/50 bg-green-400/15',
  'Cancelled':        'text-red-300 border-red-400/50 bg-red-400/15',
};

const PAYMENT_STYLE = {
  'Paid':     'text-black bg-green-400 px-2 py-0.5 font-bold',
  'Pending':  'text-black bg-yellow-400 px-2 py-0.5 font-bold',
  'Failed':   'text-white bg-red-600 px-2 py-0.5 font-bold',
  'Refunded': 'text-white bg-blue-500 px-2 py-0.5 font-bold',
};

const STATUS_STEPS = ['Pending', 'Processing', 'Packing', 'Out for Delivery', 'Completed'];

export default function MyOrders() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [reordering, setReordering] = useState(null);
  const [reviewOrder, setReviewOrder] = useState(null);

  useEffect(() => {
    (async () => {
      const u = await base44.auth.me().catch(() => null);
      if (!u) { base44.auth.redirectToLogin(window.location.href); return; }
      setUser(u);
      const o = await base44.entities.Order.filter({ customer_email: u.email }, '-created_date', 50);
      setOrders(o);
      setLoading(false);
    })();
  }, []);

  const handleReorder = async (order) => {
    setReordering(order.id);
    // Fetch product to get full details
    const products = await base44.entities.Product.filter({ name: order.product_name });
    const product = products[0] || {
      id: order.product_id,
      name: order.product_name,
      price: order.total_amount - (order.shipping_fee || 0),
      images: [],
      sizes: order.size ? [order.size] : [],
    };
    addToCart(product, order.size || 'One Size');
    setCartOpen(true);
    setReordering(null);
  };

  const getProgressIdx = (status) => {
    if (status === 'Cancelled') return -1;
    return STATUS_STEPS.indexOf(status);
  };

  const toggleExpand = (id) => setExpanded(prev => prev === id ? null : id);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <StickyHeader onCartClick={() => setCartOpen(true)} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <div className="mb-10">
          <p className="font-mono-ui text-[10px] text-[#ff6b00] uppercase tracking-widest mb-1">Account</p>
          <h1 className="font-tactical text-5xl text-white">My Orders</h1>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card-tactical h-24 animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="card-tactical p-12 text-center">
            <Package className="w-10 h-10 text-[#333] mx-auto mb-4" />
            <p className="font-tactical text-2xl text-[#444] mb-2">No orders yet</p>
            <p className="font-mono-ui text-xs text-[#555] mb-6">Your past and current orders will appear here.</p>
            <Link to="/Home#gear"
              className="btn-glow-orange px-6 py-3 font-mono-ui text-xs uppercase tracking-widest inline-flex items-center gap-2">
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const isOpen = expanded === order.id;
              const progIdx = getProgressIdx(order.status);
              const isCancelled = order.status === 'Cancelled';

              return (
                <div key={order.id} className="card-tactical overflow-hidden">
                  {/* Header Row */}
                  <button
                    className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[#111] transition-colors text-left"
                    onClick={() => toggleExpand(order.id)}
                  >
                    {/* Order # */}
                    <div className="flex-1 min-w-0">
                      <p className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest">
                        {order.order_number || `#${order.id.slice(-6).toUpperCase()}`}
                      </p>
                      <p className="font-tactical text-lg text-white leading-tight truncate">{order.product_name}</p>
                      <p className="font-mono-ui text-[10px] text-[#888] mt-0.5">
                        {order.size && `Size: ${order.size}`}
                        {order.quantity > 1 && ` · Qty: ${order.quantity}`}
                        {order.created_date && ` · ${new Date(order.created_date).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}`}
                      </p>
                    </div>

                    {/* Amounts + statuses */}
                    <div className="text-right flex-shrink-0 mr-2">
                      <p className="font-mono-ui text-base text-[#ff6b00] font-bold">
                        ₱{Number(order.total_amount || 0).toLocaleString()}
                      </p>
                      <p className={`font-mono-ui text-[10px] ${PAYMENT_STYLE[order.payment_status] || 'text-[#555]'}`}>
                        {order.payment_status || 'Pending'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`font-mono-ui text-[9px] uppercase tracking-wider border px-2 py-1 ${STATUS_STYLE[order.status] || 'border-[#333] text-[#555]'}`}>
                        {order.status}
                      </span>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-[#555]" /> : <ChevronDown className="w-4 h-4 text-[#555]" />}
                    </div>
                  </button>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden border-t border-[#1a1a1a]"
                      >
                        <div className="px-5 py-5 space-y-5">

                          {/* Progress bar */}
                          {!isCancelled && (
                            <div>
                              <p className="font-mono-ui text-[9px] text-[#555] uppercase tracking-widest mb-2">Order Progress</p>
                              <div className="flex items-center gap-0">
                                {STATUS_STEPS.map((step, i) => (
                                  <React.Fragment key={step}>
                                    <div className="flex flex-col items-center">
                                      <div className={`w-2.5 h-2.5 rounded-full border transition-all ${
                                        i <= progIdx
                                          ? 'bg-[#ff6b00] border-[#ff6b00]'
                                          : 'bg-transparent border-[#333]'
                                      }`} />
                                      <p className={`font-mono-ui text-[8px] mt-1 text-center leading-tight max-w-[50px] ${
                                        i <= progIdx ? 'text-[#ff6b00]' : 'text-[#444]'
                                      }`}>{step}</p>
                                    </div>
                                    {i < STATUS_STEPS.length - 1 && (
                                      <div className={`flex-1 h-px mb-3 ${i < progIdx ? 'bg-[#ff6b00]' : 'bg-[#222]'}`} />
                                    )}
                                  </React.Fragment>
                                ))}
                              </div>
                            </div>
                          )}
                          {isCancelled && (
                            <div className="px-3 py-2 border border-[#ff0000]/20 bg-[#ff0000]/5">
                              <p className="font-mono-ui text-xs text-[#ff0000]">This order was cancelled.</p>
                            </div>
                          )}

                          {/* Order Details */}
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <p className="font-mono-ui text-[9px] text-[#555] uppercase tracking-widest mb-1">Item Details</p>
                              <p className="font-mono-ui text-[#aaa]">{order.product_name}</p>
                              {order.size && <p className="font-mono-ui text-[#666]">Size: {order.size}</p>}
                              {order.quantity > 1 && <p className="font-mono-ui text-[#666]">Qty: {order.quantity}</p>}
                              {order.custom_print_text && (
                                <p className="font-mono-ui text-[#ff8c00]">Print: {order.custom_print_text}</p>
                              )}
                              {order.is_preorder && (
                                <p className="font-mono-ui text-[9px] text-[#ff8c00] border border-[#ff8c00]/30 inline-block px-1.5 py-0.5 mt-1">PRE-ORDER</p>
                              )}
                            </div>
                            <div>
                              <p className="font-mono-ui text-[9px] text-[#555] uppercase tracking-widest mb-1">Payment</p>
                              <p className={`font-mono-ui ${PAYMENT_STYLE[order.payment_status] || 'text-[#aaa]'}`}>
                                {order.payment_status || 'Pending'}
                              </p>
                              {order.paymongo_payment_method && (
                                <p className="font-mono-ui text-[#666]">{order.paymongo_payment_method}</p>
                              )}
                              <p className="font-mono-ui text-[#aaa] mt-1">Subtotal: ₱{Number((order.total_amount || 0) - (order.shipping_fee || 0)).toLocaleString()}</p>
                              {order.shipping_fee > 0 && (
                                <p className="font-mono-ui text-[#666]">Shipping: ₱{Number(order.shipping_fee).toLocaleString()}</p>
                              )}
                              <p className="font-mono-ui text-[#ff6b00] font-bold mt-0.5">Total: ₱{Number(order.total_amount || 0).toLocaleString()}</p>
                            </div>

                            {(order.shipping_province || order.shipping_city) && (
                              <div className="col-span-2">
                                <p className="font-mono-ui text-[9px] text-[#555] uppercase tracking-widest mb-1">Shipping Address</p>
                                <p className="font-mono-ui text-[#888] leading-relaxed">
                                  {[order.shipping_street, order.shipping_barangay, order.shipping_city, order.shipping_province, order.shipping_postal_code].filter(Boolean).join(', ')}
                                </p>
                              </div>
                            )}

                            {order.tracking_number && (
                              <div className="col-span-2">
                                <p className="font-mono-ui text-[9px] text-[#555] uppercase tracking-widest mb-1">Tracking</p>
                                <p className="font-mono-ui text-[#ff8c00]">
                                  {order.logistics}: <span className="text-white">{order.tracking_number}</span>
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={() => handleReorder(order)}
                              disabled={!!reordering}
                              style={{ background: '#ff6b00', border: '1px solid #ff6b00', color: '#fff', fontWeight: 700 }}
                              className="flex-1 py-2.5 font-mono-ui text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 disabled:opacity-50"
                            >
                              {reordering === order.id ? (
                                <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <RotateCcw className="w-3 h-3" />
                              )}
                              Reorder
                            </button>
                            <a
                              href={`https://m.me/chokepointfightwear`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ background: '#2a2a2a', border: '1px solid #555', color: '#e0e0e0' }}
                              className="flex-1 py-2.5 font-mono-ui text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 hover:border-white hover:text-white transition-colors"
                            >
                              <MessageCircle className="w-3 h-3" />
                              Contact Support
                            </a>
                            <Link
                              to={`/TrackOrder?order=${order.order_number || order.id.slice(-6)}`}
                              style={{ background: '#2a2a2a', border: '1px solid #555', color: '#e0e0e0' }}
                              className="px-4 py-2.5 font-mono-ui text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 hover:border-white hover:text-white transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Track
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <FooterLinks />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}