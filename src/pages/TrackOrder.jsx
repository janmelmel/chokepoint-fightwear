import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import {
  Search, Package, Truck, CheckCircle, Clock, XCircle, ChevronLeft,
  Loader2, Hammer, Scissors, Star, ShieldCheck, ExternalLink
} from 'lucide-react';
import CPLogo from '@/components/cp/CPLogo';
import FooterLinks from '@/components/cp/FooterLinks';

// 7 customer-facing steps mapped from Trello
const TRELLO_STEPS = [
  { step: 1, label: 'Order Confirmed',           icon: CheckCircle,  color: 'text-green-400',   bg: 'bg-green-400/10',   border: 'border-green-400/30' },
  { step: 2, label: 'Pending Approval',           icon: Clock,        color: 'text-yellow-400',  bg: 'bg-yellow-400/10',  border: 'border-yellow-400/30' },
  { step: 3, label: 'Digitizing Order',           icon: Star,         color: 'text-blue-400',    bg: 'bg-blue-400/10',    border: 'border-blue-400/30' },
  { step: 4, label: 'In Production',              icon: Hammer,       color: 'text-[#ff8c00]',   bg: 'bg-[#ff8c00]/10',   border: 'border-[#ff8c00]/30' },
  { step: 5, label: 'Quality Control',            icon: ShieldCheck,  color: 'text-purple-400',  bg: 'bg-purple-400/10',  border: 'border-purple-400/30' },
  { step: 6, label: 'Packing',                    icon: Package,      color: 'text-cyan-400',    bg: 'bg-cyan-400/10',    border: 'border-cyan-400/30' },
  { step: 7, label: 'Ready for Delivery',         icon: Truck,        color: 'text-green-300',   bg: 'bg-green-300/10',   border: 'border-green-300/30' },
];

function OrderCard({ order }) {
  const [trelloStatus, setTrelloStatus] = useState(null);
  const [loadingTrello, setLoadingTrello] = useState(false);
  const [trelloLoaded, setTrelloLoaded] = useState(false);

  const loadTrelloStatus = async () => {
    if (!order.trello_card_id || trelloLoaded) return;
    setLoadingTrello(true);
    try {
      const res = await base44.functions.invoke('getTrelloCardStatus', { trello_card_id: order.trello_card_id });
      setTrelloStatus(res.data);
    } catch {
      setTrelloStatus(null);
    } finally {
      setLoadingTrello(false);
      setTrelloLoaded(true);
    }
  };

  // Auto-load if card exists
  React.useEffect(() => {
    if (order.trello_card_id) loadTrelloStatus();
  }, [order.trello_card_id]);

  // Determine current step
  const isCancelled = order.status === 'Cancelled';
  const isCompleted = order.status === 'Completed';

  let currentStep = 1;
  if (isCompleted) {
    currentStep = 7;
  } else if (trelloStatus?.step) {
    currentStep = trelloStatus.step;
  }

  const currentStepInfo = TRELLO_STEPS.find(s => s.step === currentStep) || TRELLO_STEPS[0];
  const Icon = currentStepInfo.icon;

  return (
    <div className="card-tactical overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#222] flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="font-mono-ui text-xs text-white font-bold">{order.order_number || `#${order.id.slice(-6)}`}</p>
          <p className="font-mono-ui text-[10px] text-[#555]">Placed {new Date(order.created_date).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 border ${isCancelled ? 'border-red-500/30 bg-red-500/10' : currentStepInfo.border + ' ' + currentStepInfo.bg}`}>
          {isCancelled
            ? <XCircle className="w-4 h-4 text-red-500" />
            : loadingTrello
            ? <Loader2 className="w-4 h-4 animate-spin text-[#555]" />
            : <Icon className={`w-4 h-4 ${currentStepInfo.color}`} />
          }
          <span className={`font-mono-ui text-[10px] uppercase tracking-widest ${isCancelled ? 'text-red-500' : currentStepInfo.color}`}>
            {isCancelled ? 'Cancelled' : isCompleted ? 'Completed' : (trelloStatus?.status || 'Order Confirmed')}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      {!isCancelled && (
        <div className="px-5 py-5 border-b border-[#222]">
          {loadingTrello ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#555]" />
              <p className="font-mono-ui text-[10px] text-[#555]">Fetching live production status...</p>
            </div>
          ) : (
            <>
              {/* Desktop: all 7 steps */}
              <div className="hidden sm:flex items-start justify-between relative">
                <div className="absolute top-3 left-0 right-0 h-0.5 bg-[#222]" />
                <div
                  className="absolute top-3 left-0 h-0.5 bg-[#ff8c00] transition-all"
                  style={{ width: `${((currentStep - 1) / 6) * 100}%` }}
                />
                {TRELLO_STEPS.map(s => {
                  const isActive = s.step <= currentStep;
                  const S = s.icon;
                  return (
                    <div key={s.step} className="flex flex-col items-center z-10 relative" style={{ width: '14.28%' }}>
                      <div className={`w-6 h-6 flex items-center justify-center border-2 transition-colors ${
                        isActive ? 'border-[#ff8c00] bg-[#ff8c00]' : 'border-[#333] bg-[#0a0a0a]'
                      }`}>
                        {isActive && <CheckCircle className="w-3 h-3 text-white" />}
                      </div>
                      <p className={`font-mono-ui text-[7px] uppercase tracking-widest mt-2 text-center leading-tight ${
                        isActive ? 'text-[#ff8c00]' : 'text-[#333]'
                      }`}>{s.label}</p>
                    </div>
                  );
                })}
              </div>

              {/* Mobile: compact step indicator */}
              <div className="sm:hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono-ui text-[10px] text-[#ff8c00]">Step {currentStep} of 7</span>
                  <span className="font-mono-ui text-[10px] text-[#555]">{currentStepInfo.label}</span>
                </div>
                <div className="w-full bg-[#222] h-1.5">
                  <div
                    className="h-1.5 bg-[#ff8c00] transition-all"
                    style={{ width: `${((currentStep - 1) / 6) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  {TRELLO_STEPS.map(s => (
                    <div key={s.step} className={`w-2 h-2 rounded-full ${s.step <= currentStep ? 'bg-[#ff8c00]' : 'bg-[#333]'}`} />
                  ))}
                </div>
              </div>

              {/* Live Trello status badge */}
              {trelloStatus?.trello_list && (
                <div className="mt-3 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <p className="font-mono-ui text-[9px] text-[#555] uppercase tracking-widest">
                    Production: <span className="text-[#888]">{trelloStatus.trello_list}</span>
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Order Details */}
      <div className="px-5 py-4 space-y-2">
        <p className="font-tactical text-lg text-white">{order.product_name}</p>
        <p className="font-mono-ui text-[10px] text-[#555]">
          Size: {order.size} · Qty: {order.quantity || 1}
          {order.is_preorder && ' · Pre-order'}
        </p>
        <p className="font-mono-ui text-sm text-[#ff8c00] font-bold">₱{Number(order.total_amount || 0).toLocaleString()}</p>

        {/* Shipping */}
        {order.shipping_province && (
          <p className="font-mono-ui text-[10px] text-[#555]">
            Ship to: {[order.shipping_street, order.shipping_city, order.shipping_province].filter(Boolean).join(', ')}
          </p>
        )}

        {/* Tracking Number */}
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
          <p className="font-mono-ui text-sm text-[#666] mt-3">Enter your order number or email to see real-time production updates.</p>
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