import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import AdminSidebar from '@/components/cp/AdminSidebar';
import { CheckSquare, Square, RefreshCw, X, MapPin, Printer, Plus, CheckCircle, AlertTriangle, Clock, Trash2, AlertOctagon } from 'lucide-react';
import { getPreOrderTimeline } from '@/lib/preorderTimeline';
import CreateOrderModal from '@/components/cp/CreateOrderModal';
import { AnimatePresence as AM2 } from 'framer-motion';
import { AnimatePresence, motion } from 'framer-motion';
import StaffGuard from '@/components/cp/StaffGuard';

const STAGES = ['Processing', 'Packing', 'Out for Delivery', 'Pending_Completion', 'Completed', 'Cancelled'];
const LOGISTICS = ['LBC', 'J&T', 'Capex', 'DHL', 'UPS'];

const STAGE_COLOR = {
  'Processing':         'text-blue-400 border-blue-400/30',
  'Packing':            'text-purple-400 border-purple-400/30',
  'Out for Delivery':   'text-[#E87722] border-[#E87722]/30',
  'Pending_Completion': 'text-green-400 border-green-400/30',
  'Completed':          'text-[#555] border-[#333]',
  'Cancelled':          'text-[#ff0000] border-[#ff0000]/30',
};

const ROW_BORDER = {
  'Processing':         'border-l-2 border-l-[#2980b9]',
  'Packing':            'border-l-2 border-l-[#8e44ad]',
  'Out for Delivery':   'border-l-2 border-l-[#E87722]',
  'Pending_Completion': 'border-l-2 border-l-[#27ae60]',
  'Completed':          'border-l-2 border-l-[#333] opacity-70',
  'Cancelled':          'border-l-2 border-l-[#ff0000]/50',
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatPaidAt(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export default function StaffOrders() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [batchStatus, setBatchStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'pending'
  const [deliveryModal, setDeliveryModal] = useState(null);
  const [logistics, setLogistics] = useState('LBC');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [cleanupModal, setCleanupModal] = useState(false);
  const [cleaningUp, setCleaningUp] = useState(false);
  const [cleanupResult, setCleanupResult] = useState(null);

  const [completeModal, setCompleteModal] = useState(null);
  const [completionNote, setCompletionNote] = useState('');
  const [completing, setCompleting] = useState(false);
  const [editTracking, setEditTracking] = useState({});

  useEffect(() => {
    (async () => {
      const u = await base44.auth.me().catch(() => null);
      setUser(u);
      const params = new URLSearchParams(window.location.search);
      const f = params.get('filter');
      if (f) setFilterStatus(f);
      await loadOrders();
    })();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    const o = await base44.entities.Order.list('-created_date', 300);
    setOrders(o);
    setLoading(false);
  };

  // Split into paid (active) and unpaid (pending payment)
  const paidOrders = orders.filter(o => o.payment_status === 'Paid' && o.status !== 'Cancelled');
  const unpaidOrders = orders.filter(o => o.payment_status !== 'Paid');

  // Active tab filtering
  const rawFiltered = filterStatus === 'All' ? paidOrders : paidOrders.filter(o => o.status === filterStatus);
  const filtered = [
    ...rawFiltered.filter(o => o.status === 'Pending_Completion'),
    ...rawFiltered.filter(o => o.status !== 'Pending_Completion'),
  ];

  const displayOrders = activeTab === 'active' ? filtered : unpaidOrders;

  const toggleSelect = (id) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };

  const toggleAll = () => {
    if (selected.size === displayOrders.length) setSelected(new Set());
    else setSelected(new Set(displayOrders.map(o => o.id)));
  };

  const batchUpdate = async () => {
    if (!batchStatus || selected.size === 0) return;
    if (batchStatus === 'Out for Delivery') {
      setLogistics('LBC'); setTrackingNumber('');
      setDeliveryModal({ isBatch: true }); return;
    }
    setUpdating(true);
    await Promise.all([...selected].map(id => base44.entities.Order.update(id, { status: batchStatus })));
    setSelected(new Set()); setBatchStatus('');
    await loadOrders(); setUpdating(false);
  };

  const updateSingle = async (id, status) => {
    if (status === 'Out for Delivery') {
      setLogistics('LBC'); setTrackingNumber('');
      setDeliveryModal({ orderId: id, isBatch: false }); return;
    }
    await base44.entities.Order.update(id, { status });
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const confirmDelivery = async () => {
    setUpdating(true);
    const update = { status: 'Out for Delivery', logistics, tracking_number: trackingNumber };
    if (deliveryModal.isBatch) {
      await Promise.all([...selected].map(id => base44.entities.Order.update(id, update)));
      setSelected(new Set()); setBatchStatus('');
    } else {
      await base44.entities.Order.update(deliveryModal.orderId, update);
    }
    setDeliveryModal(null);
    await loadOrders(); setUpdating(false);
  };

  const handleCompleteOrder = async () => {
    if (!completeModal) return;
    setCompleting(true);
    await base44.functions.invoke('completeOrder', { orderId: completeModal.orderId, completionNote });
    setCompleteModal(null); setCompletionNote('');
    await loadOrders(); setCompleting(false);
  };

  const saveTrackingEdit = async (orderId) => {
    const edit = editTracking[orderId];
    if (!edit) return;
    await base44.entities.Order.update(orderId, { logistics: edit.logistics, tracking_number: edit.tracking_number });
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...edit } : o));
    setEditTracking(prev => { const n = { ...prev }; delete n[orderId]; return n; });
  };

  const handleCleanup = async () => {
    setCleaningUp(true);
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    const stale = unpaidOrders.filter(o => new Date(o.created_date).getTime() < cutoff);
    await Promise.all(stale.map(o => base44.entities.Order.update(o.id, { status: 'Cancelled', payment_status: 'Failed' })));
    setCleanupResult(stale.length);
    setCleaningUp(false);
    setCleanupModal(false);
    await loadOrders();
  };

  const isAdmin = user?.role === 'admin';

  return (
    <StaffGuard>
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <AdminSidebar user={user} processingCount={paidOrders.filter(o => o.status === 'Processing').length} />
      <div className="flex-1 overflow-auto">
        <div className="px-6 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <p className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest">Operations</p>
              <h1 className="font-tactical text-4xl text-white">Order Stream</h1>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {activeTab === 'active' && (
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                  className="bg-[#111] border border-[#333] text-white font-mono-ui text-xs px-3 py-2 focus:outline-none focus:border-[#ff8c00]/60">
                  <option value="All">All Status</option>
                  {STAGES.map(s => <option key={s}>{s}</option>)}
                </select>
              )}
              {selected.size > 0 && activeTab === 'active' && (
                <div className="flex items-center gap-2">
                  <span className="font-mono-ui text-[10px] text-[#ff6b00]">{selected.size} selected</span>
                  <select value={batchStatus} onChange={e => setBatchStatus(e.target.value)}
                    className="bg-[#111] border border-[#333] text-white font-mono-ui text-xs px-3 py-2 focus:outline-none focus:border-[#ff8c00]/60">
                    <option value="">Set Status...</option>
                    {STAGES.map(s => <option key={s}>{s}</option>)}
                  </select>
                  <button onClick={batchUpdate} disabled={!batchStatus || updating}
                    style={{ background: '#ff6b00', border: '1px solid #ff6b00', color: '#fff', fontWeight: 700 }}
                    className="px-4 py-2 font-mono-ui text-xs tracking-widest uppercase disabled:opacity-40 flex items-center gap-2">
                    {updating && <RefreshCw className="w-3 h-3 animate-spin" />} Apply
                  </button>
                </div>
              )}
              {isAdmin && activeTab === 'pending' && unpaidOrders.length > 0 && (
                <button onClick={() => setCleanupModal(true)}
                  className="flex items-center gap-2 px-4 py-2 border border-[#ff0000]/40 text-[#ff0000]/70 hover:border-[#ff0000] hover:text-[#ff0000] font-mono-ui text-xs uppercase tracking-widest transition-all">
                  <Trash2 className="w-3.5 h-3.5" /> Clean Up
                </button>
              )}
              <button onClick={() => setShowCreateOrder(true)}
                style={{ background: '#ff6b00', border: '1px solid #ff6b00', color: '#fff', fontWeight: 700 }}
                className="px-4 py-2 font-mono-ui text-xs uppercase tracking-widest flex items-center gap-2">
                <Plus className="w-4 h-4" /> Create Order
              </button>
              <button onClick={loadOrders} className="btn-glow-white p-2"><RefreshCw className="w-4 h-4 text-slate-300" /></button>
            </div>
          </div>

          {/* Cleanup result banner */}
          {cleanupResult !== null && (
            <div className="mb-4 px-4 py-3 border border-green-500/30 bg-green-500/5 flex items-center justify-between">
              <p className="font-mono-ui text-xs text-green-400">{cleanupResult} unpaid order{cleanupResult !== 1 ? 's' : ''} cancelled.</p>
              <button onClick={() => setCleanupResult(null)} className="text-[#555] hover:text-white"><X className="w-4 h-4" /></button>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-0 mb-4 border-b border-[#222]">
            <button
              onClick={() => { setActiveTab('active'); setSelected(new Set()); }}
              className={`px-5 py-2.5 font-mono-ui text-xs uppercase tracking-widest transition-all border-b-2 -mb-px ${
                activeTab === 'active'
                  ? 'text-[#ff6b00] border-[#ff6b00]'
                  : 'text-[#555] border-transparent hover:text-white'
              }`}>
              📦 Active Orders <span className="ml-1.5 text-[#ff6b00]">({paidOrders.filter(o => o.status !== 'Completed').length})</span>
            </button>
            <button
              onClick={() => { setActiveTab('pending'); setSelected(new Set()); }}
              className={`px-5 py-2.5 font-mono-ui text-xs uppercase tracking-widest transition-all border-b-2 -mb-px ${
                activeTab === 'pending'
                  ? 'text-yellow-400 border-yellow-400'
                  : 'text-[#555] border-transparent hover:text-white'
              }`}>
              ⏳ Pending Payment
              {unpaidOrders.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 text-[9px] bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                  {unpaidOrders.length}
                </span>
              )}
            </button>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => <div key={i} className="card-tactical h-14 animate-pulse" />)}
            </div>
          ) : (
            <div className="card-tactical overflow-hidden">
              {/* Table Header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[#222] bg-[#0d0d0d]">
                <button onClick={toggleAll} className="text-[#555] hover:text-white flex-shrink-0">
                  {selected.size === displayOrders.length && displayOrders.length > 0
                    ? <CheckSquare className="w-4 h-4 text-[#ff8c00]" />
                    : <Square className="w-4 h-4" />}
                </button>
                <span className="font-mono-ui text-[10px] text-[#444] uppercase tracking-widest">Order</span>
                <span className="font-mono-ui text-[10px] text-[#444] uppercase tracking-widest hidden sm:block ml-auto mr-4">
                  {activeTab === 'active' ? 'Status' : 'Awaiting Payment'}
                </span>
              </div>

              <div className="divide-y divide-[#1a1a1a]">
                {/* ACTIVE (PAID) ORDERS */}
                {activeTab === 'active' && filtered.map(order => {
                  const isPendingCompletion = order.status === 'Pending_Completion';
                  const isOutForDelivery = order.status === 'Out for Delivery';
                  const canComplete = isPendingCompletion || isOutForDelivery;
                  const trackEdit = editTracking[order.id];

                  return (
                    <div key={order.id} className={`${selected.has(order.id) ? 'bg-[#ff8c00]/5' : ''} ${
                      order.is_preorder && (order.status === 'Processing' || order.status === 'Packing') && (() => { const tl = getPreOrderTimeline(order.created_date); return new Date() > tl.productionMax; })()
                        ? 'border-l-2 border-l-red-500/60'
                        : ROW_BORDER[order.status] || ''
                    }`}>
                      <div className="flex items-center gap-3 px-4 py-3 hover:bg-[#111] transition-colors">
                        <button onClick={() => toggleSelect(order.id)} className="text-[#555] hover:text-[#ff8c00] flex-shrink-0">
                          {selected.has(order.id) ? <CheckSquare className="w-4 h-4 text-[#ff8c00]" /> : <Square className="w-4 h-4" />}
                        </button>

                        <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4">
                          {/* Col 1: Customer */}
                          <div>
                            <p className="font-mono-ui text-xs text-white font-bold truncate">{order.customer_name}</p>
                            <p className="font-mono-ui text-[10px] text-[#555]">{order.order_number || order.id.slice(-6)}</p>
                            {order.customer_phone && <p className="font-mono-ui text-[10px] text-[#444]">{order.customer_phone}</p>}
                          </div>
                          {/* Col 2: Product + payment badge */}
                          <div className="hidden sm:block">
                            <p className="font-mono-ui text-xs text-[#ccc] truncate">
                              {order.product_name}{order.size ? ` · ${order.size}` : ''}{order.variant_name ? ` · ${order.variant_name}` : ''}
                            </p>
                            {order.custom_print_text && (
                              <p className="font-mono-ui text-[10px] text-[#ff8c00] flex items-center gap-1">
                                <Printer className="w-3 h-3" /> {order.custom_print_text}
                              </p>
                            )}
                            {order.is_preorder && (() => {
                              const tl = getPreOrderTimeline(order.created_date);
                              const isOverdue = (order.status === 'Processing' || order.status === 'Packing') && new Date() > tl.productionMax;
                              return (
                                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                  {isOverdue ? (
                                    <span className="font-mono-ui text-[9px] px-1.5 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
                                      ⚠️ OVERDUE
                                    </span>
                                  ) : (
                                    <span className="font-mono-ui text-[9px] px-1.5 py-0.5 bg-[#E87722]/15 text-[#E87722] border border-[#E87722]/30">
                                      PRE-ORDER
                                    </span>
                                  )}
                                  <span className="font-mono-ui text-[9px] text-[#555]">
                                    Due by {tl.productionMax.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  </span>
                                </div>
                              );
                            })()}
                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                              <span className="font-mono-ui text-[9px] px-1.5 py-0.5 bg-green-500/20 text-green-400 border border-green-500/30">
                                ✅ PAID
                              </span>
                              {order.paymongo_payment_method && (
                                <span className="font-mono-ui text-[9px] text-[#666]">· {order.paymongo_payment_method}</span>
                              )}
                              {order.updated_date && (
                                <span className="font-mono-ui text-[9px] text-[#444]">· {formatPaidAt(order.updated_date)}</span>
                              )}
                            </div>
                          </div>
                          {/* Col 3: Amount */}
                          <div className="hidden sm:block">
                            <p className="font-mono-ui text-xs text-white font-bold">₱{Number(order.total_amount || 0).toLocaleString()}</p>
                            {order.shipping_fee > 0 && <p className="font-mono-ui text-[10px] text-[#555]">+₱{order.shipping_fee} ship</p>}
                            {order.is_preorder && <span className="font-mono-ui text-[9px] text-[#ff8c00] border border-[#ff8c00]/30 px-1">PRE-ORDER</span>}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {isPendingCompletion && (
                            <span className="font-mono-ui text-[9px] text-green-400 border border-green-500/30 bg-green-500/5 px-2 py-1 hidden sm:inline">
                              ✓ Confirmed
                            </span>
                          )}
                          {(order.shipping_province || order.shipping_street) && (
                            <button onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                              className={`p-1.5 border transition-all ${expandedOrder === order.id ? 'border-[#ff8c00]/50 text-[#ff8c00]' : 'border-[#333] text-[#555] hover:text-white hover:border-[#555]'}`}
                              title="Shipping details">
                              <MapPin className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <select value={order.status} onChange={e => updateSingle(order.id, e.target.value)}
                            className={`bg-[#0a0a0a] border font-mono-ui text-[10px] px-2 py-1.5 focus:outline-none transition-colors ${STAGE_COLOR[order.status] || 'border-[#333] text-[#666]'}`}>
                            {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      </div>

                      {/* Expanded panel */}
                      {expandedOrder === order.id && (
                        <div className="px-4 py-4 bg-[#0d0d0d] border-t border-[#1a1a1a] space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <p className="font-mono-ui text-[9px] text-[#555] uppercase tracking-widest mb-1">Ship To</p>
                              <p className="font-mono-ui text-xs text-white">{order.customer_name}</p>
                              <p className="font-mono-ui text-[10px] text-[#888]">{order.customer_phone}</p>
                              <p className="font-mono-ui text-[10px] text-[#888]">{order.customer_email}</p>
                              <div className="mt-1.5 font-mono-ui text-[10px] text-[#888] leading-relaxed">
                                {[order.shipping_street, order.shipping_barangay, order.shipping_city, order.shipping_province, order.shipping_postal_code].filter(Boolean).join(', ')}
                              </div>
                              {order.shipping_delivery_notes && (
                                <p className="font-mono-ui text-[10px] text-[#ff8c00] mt-1">Note: {order.shipping_delivery_notes}</p>
                              )}
                            </div>
                            <div>
                              <p className="font-mono-ui text-[9px] text-[#555] uppercase tracking-widest mb-1">Shipping</p>
                              <p className="font-mono-ui text-[10px] text-[#888]">Zone: {order.shipping_zone || '—'}</p>
                              <p className="font-mono-ui text-[10px] text-[#888]">Fee: {order.shipping_fee ? `₱${order.shipping_fee}` : 'TBD'}</p>
                              {order.tracking_number && !trackEdit && (
                                <p className="font-mono-ui text-[10px] text-[#ff8c00] mt-1">{order.logistics}: {order.tracking_number}</p>
                              )}
                            </div>
                          </div>

                          {canComplete && (
                            <div className="border border-[#222] p-4 space-y-3">
                              <p className="font-mono-ui text-[9px] text-[#555] uppercase tracking-widest">Tracking Info</p>
                              {trackEdit ? (
                                <div className="flex gap-2 flex-wrap">
                                  <select value={trackEdit.logistics}
                                    onChange={e => setEditTracking(prev => ({ ...prev, [order.id]: { ...prev[order.id], logistics: e.target.value } }))}
                                    className="bg-[#0a0a0a] border border-[#333] text-white font-mono-ui text-xs px-2 py-1.5 focus:outline-none">
                                    {LOGISTICS.map(l => <option key={l}>{l}</option>)}
                                  </select>
                                  <input value={trackEdit.tracking_number}
                                    onChange={e => setEditTracking(prev => ({ ...prev, [order.id]: { ...prev[order.id], tracking_number: e.target.value } }))}
                                    placeholder="Tracking number"
                                    className="flex-1 bg-[#0a0a0a] border border-[#333] text-white font-mono-ui text-xs px-3 py-1.5 focus:outline-none focus:border-[#ff8c00]/60" />
                                  <button onClick={() => saveTrackingEdit(order.id)}
                                    style={{ background: '#ff6b00', border: '1px solid #ff6b00', color: '#fff', fontWeight: 700 }}
                                    className="px-4 py-1.5 font-mono-ui text-[10px] uppercase tracking-widest">Save</button>
                                  <button onClick={() => setEditTracking(prev => { const n = { ...prev }; delete n[order.id]; return n; })}
                                    className="px-3 py-1.5 border border-[#333] text-[#555] font-mono-ui text-[10px] hover:text-white hover:border-[#555]">Cancel</button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-3">
                                  <p className="font-mono-ui text-xs text-[#888] flex-1">
                                    {order.tracking_number ? `${order.logistics}: ${order.tracking_number}` : 'No tracking number set'}
                                  </p>
                                  <button
                                    onClick={() => setEditTracking(prev => ({ ...prev, [order.id]: { logistics: order.logistics || 'LBC', tracking_number: order.tracking_number || '' } }))}
                                    className="font-mono-ui text-[10px] text-[#ff8c00] hover:text-white uppercase tracking-widest border border-[#ff8c00]/30 px-3 py-1 hover:border-[#ff8c00]">
                                    Edit
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          {canComplete && (
                            <div className="border border-green-500/20 bg-green-500/5 p-4 space-y-3">
                              <div className="flex items-center gap-2">
                                {isPendingCompletion
                                  ? <><CheckCircle className="w-4 h-4 text-green-400" /><p className="font-mono-ui text-[10px] text-green-400">Customer confirmed receipt — verify tracking before completing</p></>
                                  : <><AlertTriangle className="w-4 h-4 text-[#ff8c00]" /><p className="font-mono-ui text-[10px] text-[#888]">Customer has not confirmed receipt yet</p></>
                                }
                              </div>
                              <button
                                onClick={() => { setCompleteModal({ orderId: order.id, order }); setCompletionNote(''); }}
                                style={{ background: '#27ae60', border: '1px solid #27ae60', color: '#fff', fontWeight: 700 }}
                                className="w-full py-2.5 font-mono-ui text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                                <CheckCircle className="w-4 h-4" /> Mark as Completed
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* PENDING PAYMENT ORDERS */}
                {activeTab === 'pending' && unpaidOrders.map(order => (
                  <div key={order.id} className="flex items-center gap-3 px-4 py-3 hover:bg-[#111] transition-colors opacity-70">
                    <button onClick={() => toggleSelect(order.id)} className="text-[#555] hover:text-[#ff8c00] flex-shrink-0">
                      {selected.has(order.id) ? <CheckSquare className="w-4 h-4 text-[#ff8c00]" /> : <Square className="w-4 h-4" />}
                    </button>
                    <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4">
                      <div>
                        <p className="font-mono-ui text-xs text-[#888] truncate">{order.customer_name}</p>
                        <p className="font-mono-ui text-[10px] text-[#444]">{order.order_number || order.id.slice(-6)}</p>
                        {order.customer_email && <p className="font-mono-ui text-[10px] text-[#444] truncate">{order.customer_email}</p>}
                      </div>
                      <div className="hidden sm:block">
                        <p className="font-mono-ui text-xs text-[#666] truncate">{order.product_name}{order.size ? ` · ${order.size}` : ''}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono-ui text-[9px] px-1.5 py-0.5 bg-yellow-500/10 text-yellow-500 border border-yellow-500/30">
                            ⏳ AWAITING PAYMENT
                          </span>
                        </div>
                      </div>
                      <div className="hidden sm:block">
                        <p className="font-mono-ui text-xs text-[#666]">₱{Number(order.total_amount || 0).toLocaleString()}</p>
                        <p className="font-mono-ui text-[10px] text-[#444] flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Created {timeAgo(order.created_date)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => base44.entities.Order.update(order.id, { status: 'Cancelled', payment_status: 'Failed' }).then(loadOrders)}
                      className="flex-shrink-0 p-1.5 border border-[#ff0000]/30 text-[#ff0000]/50 hover:border-[#ff0000] hover:text-[#ff0000] transition-all"
                      title="Cancel order">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {displayOrders.length === 0 && (
                  <div className="text-center py-12">
                    <p className="font-mono-ui text-[#333] text-xs">
                      {activeTab === 'active' ? 'No paid orders found' : 'No pending payment orders'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

    <AM2>
      {showCreateOrder && (
        <CreateOrderModal onClose={() => setShowCreateOrder(false)} onCreated={() => loadOrders()} />
      )}
    </AM2>

    {/* Delivery Modal */}
    <AnimatePresence>
      {deliveryModal && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          onClick={() => setDeliveryModal(null)}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-sm bg-[#111] border border-[#333]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#222]">
              <h2 className="font-tactical text-2xl text-white">Out for Delivery</h2>
              <button onClick={() => setDeliveryModal(null)} className="text-[#555] hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest block mb-1">Logistics</label>
                <select value={logistics} onChange={e => setLogistics(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#333] text-white font-mono-ui text-sm px-3 py-2.5 focus:outline-none focus:border-[#ff8c00]/60">
                  {LOGISTICS.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest block mb-1">Tracking Number</label>
                <input value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)}
                  placeholder="e.g. 1234567890"
                  className="w-full bg-[#0a0a0a] border border-[#333] text-white font-mono-ui text-sm px-3 py-2.5 focus:outline-none focus:border-[#ff8c00]/60" />
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={() => setDeliveryModal(null)}
                  className="flex-1 py-3 border border-[#333] text-[#555] font-mono-ui text-xs uppercase tracking-widest hover:border-[#555] hover:text-white transition-all">
                  Cancel
                </button>
                <button onClick={confirmDelivery} disabled={!trackingNumber || updating}
                  style={{ background: '#ff6b00', border: '1px solid #ff6b00', color: '#fff', fontWeight: 700 }}
                  className="flex-1 py-3 font-mono-ui text-xs uppercase tracking-widest disabled:opacity-40">
                  {updating ? 'Saving...' : 'Confirm'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Complete Order Modal */}
    <AnimatePresence>
      {completeModal && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          onClick={() => setCompleteModal(null)}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-sm bg-[#111] border border-[#333]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#222]">
              <h2 className="font-tactical text-2xl text-white">Complete Order</h2>
              <button onClick={() => setCompleteModal(null)} className="text-[#555] hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-[#0d0d0d] border border-[#222] px-4 py-3">
                <p className="font-mono-ui text-xs text-white">{completeModal.order.customer_name}</p>
                <p className="font-mono-ui text-[10px] text-[#555]">{completeModal.order.order_number} · {completeModal.order.product_name}</p>
              </div>
              {completeModal.order.status === 'Pending_Completion' ? (
                <div className="flex items-center gap-2 border border-green-500/30 bg-green-500/5 px-3 py-2">
                  <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                  <p className="font-mono-ui text-[10px] text-green-400">Customer has confirmed receipt</p>
                </div>
              ) : (
                <div className="flex items-center gap-2 border border-[#ff8c00]/30 bg-[#ff8c00]/5 px-3 py-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#ff8c00] flex-shrink-0" />
                  <p className="font-mono-ui text-[10px] text-[#ff8c00]">Customer has not confirmed receipt yet</p>
                </div>
              )}
              <div>
                <label className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest block mb-1">Completion Note (optional)</label>
                <textarea value={completionNote} onChange={e => setCompletionNote(e.target.value)}
                  rows={2} placeholder="e.g. Verified via J&T tracking — delivered Mar 20"
                  className="w-full bg-[#0a0a0a] border border-[#333] text-white font-mono-ui text-sm px-3 py-2.5 focus:outline-none focus:border-[#ff8c00]/60 resize-none" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setCompleteModal(null)}
                  className="flex-1 py-3 border border-[#333] text-[#555] font-mono-ui text-xs uppercase tracking-widest hover:border-[#555] hover:text-white transition-all">
                  Cancel
                </button>
                <button onClick={handleCompleteOrder} disabled={completing}
                  style={{ background: '#27ae60', border: '1px solid #27ae60', color: '#fff', fontWeight: 700 }}
                  className="flex-1 py-3 font-mono-ui text-xs uppercase tracking-widest disabled:opacity-40 flex items-center justify-center gap-2">
                  {completing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                  {completing ? 'Completing...' : 'Mark Complete'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Cleanup Confirmation Modal */}
    <AnimatePresence>
      {cleanupModal && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          onClick={() => setCleanupModal(false)}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-sm bg-[#111] border border-[#333] p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Trash2 className="w-5 h-5 text-[#ff0000]" />
              <h2 className="font-tactical text-2xl text-white">Clean Up Unpaid Orders</h2>
            </div>
            <p className="font-mono-ui text-xs text-[#888] leading-relaxed">
              This will cancel all unpaid orders older than 24 hours ({unpaidOrders.filter(o => Date.now() - new Date(o.created_date).getTime() > 86400000).length} orders). This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setCleanupModal(false)}
                className="flex-1 py-3 border border-[#333] text-[#555] font-mono-ui text-xs uppercase tracking-widest hover:border-[#555] hover:text-white transition-all">
                Cancel
              </button>
              <button onClick={handleCleanup} disabled={cleaningUp}
                style={{ background: '#c0392b', border: '1px solid #c0392b', color: '#fff', fontWeight: 700 }}
                className="flex-1 py-3 font-mono-ui text-xs uppercase tracking-widest disabled:opacity-40 flex items-center justify-center gap-2">
                {cleaningUp ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                {cleaningUp ? 'Cleaning...' : 'Confirm'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </StaffGuard>
  );
}