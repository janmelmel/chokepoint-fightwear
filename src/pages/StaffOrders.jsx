import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import AdminSidebar from '@/components/cp/AdminSidebar';
import { CheckSquare, Square, RefreshCw, X } from 'lucide-react';
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
    setUpdating(true);
    await Promise.all([...selected].map((id) => base44.entities.Order.update(id, { status: batchStatus })));
    setSelected(new Set());
    setBatchStatus('');
    await loadOrders();
    setUpdating(false);
  };

  const updateSingle = async (id, status) => {
    await base44.entities.Order.update(id, { status });
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
  };

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
                {filtered.map((order) =>
                <div key={order.id}
                className={`flex items-center gap-3 px-4 py-3 hover:bg-[#111] transition-colors ${selected.has(order.id) ? 'bg-[#ff8c00]/5' : ''}`}>
                    <button onClick={() => toggleSelect(order.id)} className="text-[#555] hover:text-[#ff8c00] flex-shrink-0">
                      {selected.has(order.id) ?
                    <CheckSquare className="w-4 h-4 text-[#ff8c00]" /> :
                    <Square className="w-4 h-4" />}
                    </button>

                    <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4">
                      <div>
                        <p className="font-mono-ui text-xs text-white truncate">{order.customer_name}</p>
                        <p className="font-mono-ui text-[10px] text-[#555]">{order.order_number || order.id.slice(-6)}</p>
                      </div>
                      <div className="hidden sm:block">
                        <p className="font-mono-ui text-xs text-[#888] truncate">{order.product_name}</p>
                        <p className="font-mono-ui text-[10px] text-[#555]">Size: {order.size} · {order.payment_method}</p>
                      </div>
                      <div className="hidden sm:block">
                        <p className="font-mono-ui text-xs text-[#ff8c00]">₱{Number(order.total_amount || 0).toLocaleString()}</p>
                        {order.is_preorder && <span className="font-mono-ui text-[9px] text-[#555]">PRE-ORDER</span>}
                      </div>
                    </div>

                    <select value={order.status} onChange={(e) => updateSingle(order.id, e.target.value)}
                  className={`bg-[#0a0a0a] border font-mono-ui text-[10px] px-2 py-1.5 focus:outline-none transition-colors flex-shrink-0 ${STAGE_COLOR[order.status] || 'border-[#333] text-[#666]'}`}>
                      {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                )}

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
    </StaffGuard>);

}