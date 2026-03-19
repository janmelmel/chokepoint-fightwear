import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import AdminSidebar from '@/components/cp/AdminSidebar';
import { CheckSquare, Square, RefreshCw, X, MapPin, Printer, CreditCard, Plus } from 'lucide-react';
import CreateOrderModal from '@/components/cp/CreateOrderModal';
import { AnimatePresence as AM2 } from 'framer-motion';
import { AnimatePresence, motion } from 'framer-motion';
import StaffGuard from '@/components/cp/StaffGuard';

const STAGES = ['Processing', 'Packing', 'Out for Delivery', 'Completed', 'Cancelled'];
const LOGISTICS = ['LBC', 'J&T', 'Capex', 'DHL', 'UPS'];

const STAGE_COLOR = {
  'Processing': 'text-yellow-400 border-yellow-400/30',
  'Packing': 'text-blue-400 border-blue-400/30',
  'Out for Delivery': 'text-[#ff6b00] border-[#ff6b00]/30',
  'Completed': 'text-green-400 border-green-400/30',
  'Cancelled': 'text-[#ff0000] border-[#ff0000]/30'
};

export default function StaffOrders() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [batchStatus, setBatchStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const [deliveryModal, setDeliveryModal] = useState(null); // { orderId, isBatch }
  const [logistics, setLogistics] = useState('LBC');
  const [trackingNumber, setTrackingNumber] = useState('');

  useEffect(() => {
    (async () => {
      const u = await base44.auth.me().catch(() => null);
      setUser(u);
      await loadOrders();
    })();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    const o = await base44.entities.Order.list('-created_date', 100);
    setOrders(o);
    setLoading(false);
  };

  const toggleSelect = (id) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());else
    setSelected(new Set(filtered.map((o) => o.id)));
  };

  const batchUpdate = async () => {
    if (!batchStatus || selected.size === 0) return;
    if (batchStatus === 'Out for Delivery') {
      setLogistics('LBC');
      setTrackingNumber('');
      setDeliveryModal({ isBatch: true });
      return;
    }
    setUpdating(true);
    await Promise.all([...selected].map((id) => base44.entities.Order.update(id, { status: batchStatus })));
    setSelected(new Set());
    setBatchStatus('');
    await loadOrders();
    setUpdating(false);
  };

  const updateSingle = async (id, status) => {
    if (status === 'Out for Delivery') {
      setLogistics('LBC');
      setTrackingNumber('');
      setDeliveryModal({ orderId: id, isBatch: false });
      return;
    }
    await base44.entities.Order.update(id, { status });
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
  };

  const confirmDelivery = async () => {
    setUpdating(true);
    const update = { status: 'Out for Delivery', logistics, tracking_number: trackingNumber };
    if (deliveryModal.isBatch) {
      await Promise.all([...selected].map((id) => base44.entities.Order.update(id, update)));
      setSelected(new Set());
      setBatchStatus('');
    } else {
      await base44.entities.Order.update(deliveryModal.orderId, update);
    }
    setDeliveryModal(null);
    await loadOrders();
    setUpdating(false);
  };

  const [expandedOrder, setExpandedOrder] = useState(null);
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const filtered = filterStatus === 'All' ? orders : orders.filter((o) => o.status === filterStatus);

  return (
    <StaffGuard>
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <AdminSidebar user={user} />
      <div className="flex-1 overflow-auto">
        <div className="px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <p className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest">Operations</p>
              <h1 className="font-tactical text-4xl text-white">Order Stream</h1>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Filter */}
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-[#111] border border-[#333] text-white font-mono-ui text-xs px-3 py-2 focus:outline-none focus:border-[#ff8c00]/60">
                <option value="All">All Status</option>
                {STAGES.map((s) => <option key={s}>{s}</option>)}
              </select>

              {/* Batch */}
              {selected.size > 0 &&
                <div className="flex items-center gap-2">
                  <span className="font-mono-ui text-[10px] text-[#ff6b00]">{selected.size} selected</span>
                  <select value={batchStatus} onChange={(e) => setBatchStatus(e.target.value)}
                  className="bg-[#111] border border-[#333] text-white font-mono-ui text-xs px-3 py-2 focus:outline-none focus:border-[#ff8c00]/60">
                    <option value="">Set Status...</option>
                    {STAGES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <button onClick={batchUpdate} disabled={!batchStatus || updating}
                  style={{ background: '#ff6b00', border: '1px solid #ff6b00', color: '#fff', fontWeight: 700 }}
                  className="px-4 py-2 font-mono-ui text-xs tracking-widest uppercase disabled:opacity-40 flex items-center gap-2">
                    {updating && <RefreshCw className="w-3 h-3 animate-spin" />}
                    Apply
                  </button>
                </div>
                }
              <button onClick={() => setShowCreateOrder(true)} className="btn-glow-orange px-4 py-2 font-mono-ui text-xs uppercase tracking-widest flex items-center gap-2">
                <Plus className="w-4 h-4" /> Create Order
              </button>
              <button onClick={loadOrders} className="btn-glow-white p-2"><RefreshCw className="text-slate-300 lucide lucide-refresh-cw w-4 h-4" /></button>
            </div>
          </div>

          {loading ?
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => <div key={i} className="card-tactical h-14 animate-pulse" />)}
            </div> :

            <div className="card-tactical overflow-hidden">
              {/* Table Header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[#222] bg-[#0d0d0d]">
                <button onClick={toggleAll} className="text-[#555] hover:text-white flex-shrink-0">
                  {selected.size === filtered.length && filtered.length > 0 ?
                  <CheckSquare className="w-4 h-4 text-[#ff8c00]" /> :
                  <Square className="w-4 h-4" />}
                </button>
                <span className="font-mono-ui text-[10px] text-[#444] uppercase tracking-widest">Order</span>
                <span className="font-mono-ui text-[10px] text-[#444] uppercase tracking-widest hidden sm:block ml-auto mr-4">Status</span>
              </div>

              <div className="divide-y divide-[#1a1a1a]">
                {filtered.map((order) => (
                <div key={order.id} className={`${selected.has(order.id) ? 'bg-[#ff8c00]/5' : ''}`}>
                  {/* Main row */}
                  <div className="flex items-center gap-3 px-4 py-3 hover:bg-[#111] transition-colors">
                    <button onClick={() => toggleSelect(order.id)} className="text-[#555] hover:text-[#ff8c00] flex-shrink-0">
                      {selected.has(order.id) ? <CheckSquare className="w-4 h-4 text-[#ff8c00]" /> : <Square className="w-4 h-4" />}
                    </button>

                    <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4">
                      <div>
                        <p className="font-mono-ui text-xs text-white truncate">{order.customer_name}</p>
                        <p className="font-mono-ui text-[10px] text-[#555]">{order.order_number || order.id.slice(-6)}</p>
                        {order.customer_phone && <p className="font-mono-ui text-[10px] text-[#444]">{order.customer_phone}</p>}
                      </div>
                      <div className="hidden sm:block">
                        <p className="font-mono-ui text-xs text-[#888] truncate">{order.product_name}</p>
                        <p className="font-mono-ui text-[10px] text-[#555]">Size: {order.size} · {order.payment_method}</p>
                        {order.custom_print_text && (
                          <p className="font-mono-ui text-[10px] text-[#ff8c00] flex items-center gap-1">
                            <Printer className="w-3 h-3" /> {order.custom_print_text}
                          </p>
                        )}
                      {order.payment_status && (
                        <p className={`font-mono-ui text-[10px] flex items-center gap-1 ${
                          order.payment_status === 'Paid' ? 'text-green-400' : order.payment_status === 'Failed' ? 'text-[#ff0000]' : 'text-yellow-400'
                        }`}>
                          <CreditCard className="w-3 h-3" /> {order.payment_status}
                          {order.paymongo_payment_method && ` · ${order.paymongo_payment_method}`}
                        </p>
                      )}
                      </div>
                      <div className="hidden sm:block">
                        <p className="font-mono-ui text-xs text-[#ff8c00]">₱{Number(order.total_amount || 0).toLocaleString()}</p>
                        {order.shipping_fee > 0 && <p className="font-mono-ui text-[10px] text-[#555]">+₱{order.shipping_fee} ship</p>}
                        {order.is_preorder && <span className="font-mono-ui text-[9px] text-[#555]">PRE-ORDER</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Expand button for shipping details */}
                      {(order.shipping_province || order.shipping_street) && (
                        <button onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                          className={`p-1.5 border transition-all ${expandedOrder === order.id ? 'border-[#ff8c00]/50 text-[#ff8c00]' : 'border-[#333] text-[#555] hover:text-white hover:border-[#555]'}`}
                          title="Shipping details">
                          <MapPin className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <select value={order.status} onChange={(e) => updateSingle(order.id, e.target.value)}
                        className={`bg-[#0a0a0a] border font-mono-ui text-[10px] px-2 py-1.5 focus:outline-none transition-colors ${STAGE_COLOR[order.status] || 'border-[#333] text-[#666]'}`}>
                        {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Expanded Shipping Details */}
                  {expandedOrder === order.id && (
                    <div className="px-12 py-3 bg-[#0d0d0d] border-t border-[#1a1a1a] grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="font-mono-ui text-[9px] text-[#555] uppercase tracking-widest mb-1">Ship To</p>
                        <p className="font-mono-ui text-xs text-white">{order.customer_name}</p>
                        <p className="font-mono-ui text-[10px] text-[#888]">{order.customer_phone}</p>
                        <p className="font-mono-ui text-[10px] text-[#888]">{order.customer_email}</p>
                        <div className="mt-1.5 font-mono-ui text-[10px] text-[#888] leading-relaxed">
                          {order.shipping_street && <span>{order.shipping_street}, </span>}
                          {order.shipping_barangay && <span>{order.shipping_barangay}, </span>}
                          {order.shipping_city && <span>{order.shipping_city}, </span>}
                          {order.shipping_province && <span>{order.shipping_province} </span>}
                          {order.shipping_postal_code && <span>{order.shipping_postal_code}</span>}
                        </div>
                        {order.shipping_delivery_notes && (
                          <p className="font-mono-ui text-[10px] text-[#ff8c00] mt-1">Note: {order.shipping_delivery_notes}</p>
                        )}
                      </div>
                      <div>
                        <p className="font-mono-ui text-[9px] text-[#555] uppercase tracking-widest mb-1">Shipping</p>
                        <p className="font-mono-ui text-[10px] text-[#888]">Zone: {order.shipping_zone || '—'}</p>
                        <p className="font-mono-ui text-[10px] text-[#888]">Fee: {order.shipping_fee ? `₱${order.shipping_fee}` : 'TBD'}</p>
                        {order.tracking_number && (
                          <p className="font-mono-ui text-[10px] text-[#ff8c00] mt-1">{order.logistics}: {order.tracking_number}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                ))}

                {filtered.length === 0 &&
                <div className="text-center py-12">
                    <p className="font-mono-ui text-[#333] text-xs">No orders found</p>
                  </div>
                }
              </div>
            </div>
            }
        </div>
      </div>
    </div>
      <AM2>
        {showCreateOrder && (
          <CreateOrderModal
            onClose={() => setShowCreateOrder(false)}
            onCreated={() => loadOrders()}
          />
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
    </StaffGuard>);

}