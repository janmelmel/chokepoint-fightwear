import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import AdminSidebar from '@/components/cp/AdminSidebar';
import StaffGuard from '@/components/cp/StaffGuard';
import { RefreshCw, TrendingUp, TrendingDown, Package } from 'lucide-react';

export default function StaffStockLog() {
  const [user, setUser] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterProduct, setFilterProduct] = useState('');
  const [filterReason, setFilterReason] = useState('');

  useEffect(() => {
    (async () => {
      const u = await base44.auth.me().catch(() => null);
      setUser(u);
      await load();
    })();
  }, []);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.StockAdjustLog.list('-created_date', 200);
    setLogs(data);
    setLoading(false);
  };

  const productNames = [...new Set(logs.map(l => l.product_name))].filter(Boolean).sort();
  const reasons = [...new Set(logs.map(l => l.reason))].filter(Boolean).sort();

  const filtered = logs.filter(l => {
    if (filterProduct && l.product_name !== filterProduct) return false;
    if (filterReason && l.reason !== filterReason) return false;
    return true;
  });

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' });
  };

  return (
    <StaffGuard>
      <div className="min-h-screen bg-[#0a0a0a] flex">
        <AdminSidebar user={user} />
        <div className="flex-1 overflow-auto">
          <div className="px-6 py-8">
            <div className="flex items-center justify-between mb-8 gap-4">
              <div>
                <p className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest">Inventory</p>
                <h1 className="font-tactical text-4xl text-white">Stock Adjustment Log</h1>
              </div>
              <button onClick={load} className="btn-glow-white p-2.5"><RefreshCw className="w-4 h-4" /></button>
            </div>

            {/* Filters */}
            <div className="flex gap-3 mb-6 flex-wrap">
              <select value={filterProduct} onChange={e => setFilterProduct(e.target.value)}
                className="bg-[#111] border border-[#333] text-white font-mono-ui text-xs px-3 py-2 focus:outline-none focus:border-[#E87722]/60">
                <option value="">All Products</option>
                {productNames.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              <select value={filterReason} onChange={e => setFilterReason(e.target.value)}
                className="bg-[#111] border border-[#333] text-white font-mono-ui text-xs px-3 py-2 focus:outline-none focus:border-[#E87722]/60">
                <option value="">All Reasons</option>
                {reasons.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              {(filterProduct || filterReason) && (
                <button onClick={() => { setFilterProduct(''); setFilterReason(''); }}
                  className="font-mono-ui text-[10px] text-[#555] hover:text-white uppercase tracking-widest border border-[#333] px-3 py-2 hover:border-[#555] transition-all">
                  Clear Filters
                </button>
              )}
              <span className="font-mono-ui text-[10px] text-[#444] self-center">{filtered.length} entries</span>
            </div>

            {loading ? (
              <div className="space-y-2">{[...Array(6)].map((_, i) => <div key={i} className="card-tactical h-14 animate-pulse" />)}</div>
            ) : (
              <div className="card-tactical overflow-x-auto">
                <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-4 py-3 border-b border-[#222] bg-[#0d0d0d] min-w-[700px]">
                  {['Date', 'Product / Variant / Size', 'Change', 'Stock', 'Reason', 'Staff'].map(h => (
                    <p key={h} className="font-mono-ui text-[9px] text-[#444] uppercase tracking-widest">{h}</p>
                  ))}
                </div>
                <div className="divide-y divide-[#1a1a1a] min-w-[700px]">
                  {filtered.map(log => {
                    const isPositive = log.change_amount > 0;
                    return (
                      <div key={log.id} className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 items-center px-4 py-3">
                        <div className="flex-shrink-0">
                          {isPositive
                            ? <TrendingUp className="w-4 h-4 text-green-400" />
                            : <TrendingDown className="w-4 h-4 text-[#ff0000]" />}
                        </div>
                        <div>
                          <p className="font-mono-ui text-xs text-white">{log.product_name}</p>
                          <p className="font-mono-ui text-[10px] text-[#555]">
                            {[log.variant_name, log.size].filter(Boolean).join(' · ')}
                          </p>
                          <p className="font-mono-ui text-[9px] text-[#333]">{formatDate(log.created_date)}</p>
                        </div>
                        <span className={`font-mono-ui text-sm font-bold ${isPositive ? 'text-green-400' : 'text-[#ff0000]'}`}>
                          {isPositive ? '+' : ''}{log.change_amount}
                        </span>
                        <span className="font-mono-ui text-xs text-[#888]">
                          {log.prev_stock} → {log.new_stock}
                        </span>
                        <span className="font-mono-ui text-[10px] text-[#888] max-w-[180px] truncate">{log.reason}</span>
                        <span className="font-mono-ui text-[10px] text-[#555] truncate max-w-[100px]">{log.staff_name}</span>
                      </div>
                    );
                  })}
                  {filtered.length === 0 && (
                    <div className="text-center py-12">
                      <Package className="w-8 h-8 text-[#222] mx-auto mb-2" />
                      <p className="font-mono-ui text-[#333] text-xs">No stock adjustment logs yet.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </StaffGuard>
  );
}