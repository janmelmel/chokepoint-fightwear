import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Search, XCircle, ChevronLeft, Loader2, Truck } from 'lucide-react';
import CPLogo from '@/components/cp/CPLogo';
import FooterLinks from '@/components/cp/FooterLinks';
import OrderTimeline from '@/components/cp/OrderTimeline';
import OrderEDC from '@/components/cp/OrderEDC';

function OrderCard({ order }) {
  const [trelloStatus, setTrelloStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const isCancelled = order.status === 'Cancelled';
  const isCompleted = order.status === 'Completed';

  useEffect(() => {
    if (!isCancelled) loadStatus();
  }, [order.id]);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const [statusRes, histRes] = await Promise.all([
        order.trello_card_id
          ? base44.functions.invoke('getTrelloCardStatus', {
              trello_card_id: order.trello_card_id,
              order_id: order.id,
            })
          : Promise.resolve(null),
        base44.functions.invoke('getOrderStatusHistory', { order_id: order.id }),
      ]);

      if (statusRes) setTrelloStatus(statusRes.data);
      if (histRes?.data?.history) setHistory(histRes.data.history);
    } catch {
      setTrelloStatus(null);
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  };

  const currentStep = isCompleted ? 7 : (trelloStatus?.step || 1);

  return (
    <div className="card-tactical overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#1a1a1a] flex items-start justify-between flex-wrap gap-3">
        <div>
          <p className="font-mono-ui text-xs text-white font-bold">{order.order_number || `#${order.id.slice(-6)}`}</p>
          <p className="font-mono-ui text-[10px] text-[#555]">
            Ordered {new Date(order.created_date).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}
          </p>
        </div>
        <div>
          <p className="font-tactical text-lg text-white leading-tight">{order.product_name}</p>
          <p className="font-mono-ui text-[10px] text-[#555]">
            Size: {order.size} · Qty: {order.quantity || 1}
            {order.is_preorder ? ' · Pre-order' : ''}
            {order.custom_print_text ? ` · Custom: ${order.custom_print_text}` : ''}
          </p>
          <p className="font-mono-ui text-sm text-[#ff8c00] font-bold mt-0.5">₱{Number(order.total_amount || 0).toLocaleString()}</p>
        </div>
      </div>

      {/* EDC */}
      {!isCancelled && (
        <div className="px-5 pt-4">
          <OrderEDC order={order} isCompleted={isCompleted} isCancelled={isCancelled} />
        </div>
      )}

      {/* Timeline */}
      <div className="px-5 py-5">
        <p className="font-mono-ui text-[9px] text-[#444] uppercase tracking-widest mb-4">Production Trail</p>
        <OrderTimeline
          history={history}
          currentStep={currentStep}
          isCancelled={isCancelled}
          isCompleted={isCompleted}
          loadingTrello={loading}
        />
      </div>

      {/* Tracking Number */}
      {order.tracking_number && (
        <div className="mx-5 mb-5 border border-[#ff8c00]/30 bg-[#ff8c00]/5 px-4 py-3 flex items-start gap-3">
          <Truck className="w-4 h-4 text-[#ff8c00] flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-mono-ui text-[9px] text-[#ff8c00] uppercase tracking-widest mb-0.5">Tracking Number</p>
            <p className="font-mono-ui text-sm text-white font-bold">{order.logistics}: {order.tracking_number}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackOrder() {
  const [query, setQuery] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);

    const allOrders = await base44.entities.Order.list('-created_date', 100);
    const found = allOrders.filter(o =>
      o.order_number?.toLowerCase().includes(query.toLowerCase()) ||
      o.customer_email?.toLowerCase() === query.toLowerCase()
    );

    setOrders(found);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="border-b border-[#1a1a1a] px-4 sm:px-6 h-16 flex items-center justify-between max-w-5xl mx-auto">
        <Link to="/Home"><CPLogo size={32} variant="white" /></Link>
        <Link to="/Home" className="flex items-center gap-1 font-mono-ui text-[10px] text-[#555] hover:text-white uppercase tracking-widest transition-colors">
          <ChevronLeft className="w-3 h-3" /> Back to Shop
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <p className="font-mono-ui text-[10px] text-[#ff8c00] uppercase tracking-widest mb-2">Live Production Status</p>
          <h1 className="font-tactical text-4xl sm:text-5xl text-white">Track Your Order</h1>
          <p className="font-mono-ui text-sm text-[#666] mt-3">Enter your order number or email to see your production trail.</p>
        </div>

        <form onSubmit={handleSearch} className="mb-10">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Order number (e.g., CP-ABC123) or email"
                className="w-full bg-[#111] border border-[#333] text-white font-mono-ui text-sm pl-10 pr-4 py-3 focus:outline-none focus:border-[#ff8c00]/60"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{ background: '#ff6b00', border: '1px solid #ff6b00', color: '#fff', fontWeight: 700 }}
              className="px-6 py-3 font-mono-ui text-xs uppercase tracking-widest disabled:opacity-50 flex items-center gap-2">
              {loading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Searching...</> : 'Track'}
            </button>
          </div>
        </form>

        {searched && !loading && (
          <div className="space-y-6">
            {orders.length === 0 ? (
              <div className="card-tactical p-8 text-center">
                <XCircle className="w-10 h-10 text-[#333] mx-auto mb-3" />
                <p className="font-mono-ui text-sm text-[#666]">No orders found.</p>
                <p className="font-mono-ui text-[10px] text-[#444] mt-1">Double-check your order number or email.</p>
              </div>
            ) : (
              orders.map(order => <OrderCard key={order.id} order={order} />)
            )}
          </div>
        )}
      </main>

      <FooterLinks />
    </div>
  );
}