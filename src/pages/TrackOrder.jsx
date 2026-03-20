import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Search, Package, Truck, CheckCircle, Clock, XCircle, ChevronLeft } from 'lucide-react';
import CPLogo from '@/components/cp/CPLogo';
import FooterLinks from '@/components/cp/FooterLinks';

const STATUS_CONFIG = {
  'Processing': { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30' },
  'Packing': { icon: Package, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30' },
  'Out for Delivery': { icon: Truck, color: 'text-[#ff8c00]', bg: 'bg-[#ff8c00]/10', border: 'border-[#ff8c00]/30' },
  'Completed': { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/30' },
  'Cancelled': { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30' },
};

const STEPS = ['Processing', 'Packing', 'Out for Delivery', 'Completed'];

export default function TrackOrder() {
  const [query, setQuery] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setSearched(true);

    // Search by order number or email
    const allOrders = await base44.entities.Order.list('-created_date', 100);
    const found = allOrders.filter(o => 
      o.order_number?.toLowerCase().includes(query.toLowerCase()) ||
      o.customer_email?.toLowerCase() === query.toLowerCase()
    );

    setOrders(found);
    setLoading(false);
  };

  const getStepIndex = (status) => {
    if (status === 'Cancelled') return -1;
    return STEPS.indexOf(status);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-[#1a1a1a] px-4 sm:px-6 h-16 flex items-center justify-between max-w-5xl mx-auto">
        <Link to="/Home">
          <CPLogo size={32} variant="white" />
        </Link>
        <Link to="/Home" className="flex items-center gap-1 font-mono-ui text-[10px] text-[#555] hover:text-white uppercase tracking-widest transition-colors">
          <ChevronLeft className="w-3 h-3" /> Back to Shop
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <p className="font-mono-ui text-[10px] text-[#ff8c00] uppercase tracking-widest mb-2">Order Status</p>
          <h1 className="font-tactical text-4xl sm:text-5xl text-white">Track Your Order</h1>
          <p className="font-inter text-sm text-[#666] mt-3">Enter your order number or email to check your order status.</p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-10">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Order number (e.g., CP-123456) or email"
                className="w-full bg-[#111] border border-[#333] text-white font-mono-ui text-sm pl-10 pr-4 py-3 focus:outline-none focus:border-[#ff8c00]/60"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{ background: '#ff6b00', border: '1px solid #ff6b00', color: '#fff', fontWeight: 700 }}
              className="px-6 py-3 font-mono-ui text-xs uppercase tracking-widest disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Track'}
            </button>
          </div>
        </form>

        {/* Results */}
        {searched && !loading && (
          <div className="space-y-6">
            {orders.length === 0 ? (
              <div className="card-tactical p-8 text-center">
                <XCircle className="w-10 h-10 text-[#333] mx-auto mb-3" />
                <p className="font-mono-ui text-sm text-[#666]">No orders found.</p>
                <p className="font-mono-ui text-[10px] text-[#444] mt-1">Double-check your order number or email.</p>
              </div>
            ) : (
              orders.map(order => {
                const config = STATUS_CONFIG[order.status] || STATUS_CONFIG['Processing'];
                const Icon = config.icon;
                const stepIndex = getStepIndex(order.status);

                return (
                  <div key={order.id} className="card-tactical overflow-hidden">
                    {/* Header */}
                    <div className="px-5 py-4 border-b border-[#222] flex items-center justify-between">
                      <div>
                        <p className="font-mono-ui text-xs text-white">{order.order_number || `#${order.id.slice(-6)}`}</p>
                        <p className="font-mono-ui text-[10px] text-[#555]">{new Date(order.created_date).toLocaleDateString()}</p>
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-1.5 border ${config.border} ${config.bg}`}>
                        <Icon className={`w-4 h-4 ${config.color}`} />
                        <span className={`font-mono-ui text-[10px] uppercase tracking-widest ${config.color}`}>{order.status}</span>
                      </div>
                    </div>

                    {/* Progress */}
                    {order.status !== 'Cancelled' && (
                      <div className="px-5 py-4 border-b border-[#222]">
                        <div className="flex items-center justify-between relative">
                          {STEPS.map((step, i) => {
                            const isActive = i <= stepIndex;
                            const isCurrent = i === stepIndex;
                            return (
                              <div key={step} className="flex flex-col items-center z-10 relative">
                                <div className={`w-6 h-6 flex items-center justify-center border-2 transition-colors ${
                                  isActive 
                                    ? 'border-[#ff8c00] bg-[#ff8c00]' 
                                    : 'border-[#333] bg-[#0a0a0a]'
                                }`}>
                                  {isActive && <CheckCircle className="w-3 h-3 text-white" />}
                                </div>
                                <p className={`font-mono-ui text-[8px] uppercase tracking-widest mt-2 text-center ${
                                  isActive ? 'text-[#ff8c00]' : 'text-[#444]'
                                }`}>{step}</p>
                              </div>
                            );
                          })}
                          {/* Progress line */}
                          <div className="absolute top-3 left-0 right-0 h-0.5 bg-[#222] -z-0" />
                          <div 
                            className="absolute top-3 left-0 h-0.5 bg-[#ff8c00] -z-0 transition-all"
                            style={{ width: `${(stepIndex / (STEPS.length - 1)) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Order Details */}
                    <div className="px-5 py-4 space-y-2">
                      <p className="font-tactical text-lg text-white">{order.product_name}</p>
                      <p className="font-mono-ui text-[10px] text-[#555]">
                        Size: {order.size} · Qty: {order.quantity || 1} · {order.payment_method}
                        {order.is_preorder && ' · Pre-order'}
                      </p>
                      <p className="font-mono-ui text-sm text-[#ff8c00]">₱{Number(order.total_amount || 0).toLocaleString()}</p>

                      {/* Tracking Info */}
                      {order.tracking_number && (
                        <div className="mt-3 border border-[#ff8c00]/30 bg-[#ff8c00]/5 px-4 py-3 flex items-start gap-3">
                          <Truck className="w-4 h-4 text-[#ff8c00] flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-mono-ui text-[9px] text-[#ff8c00] uppercase tracking-widest mb-0.5">Tracking Number</p>
                            <p className="font-mono-ui text-sm text-white font-bold">{order.logistics}: {order.tracking_number}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>

      <FooterLinks />
    </div>
  );
}