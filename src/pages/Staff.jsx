import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import AdminSidebar from '@/components/cp/AdminSidebar';
import { ShoppingBag, Package, TrendingUp, Clock, Truck, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import StaffGuard from '@/components/cp/StaffGuard';

export default function Staff() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const u = await base44.auth.me().catch(() => null);
      setUser(u);
      const [o, p] = await Promise.all([
        base44.entities.Order.list('-created_date', 20),
        base44.entities.Product.filter({ is_archived: false }),
      ]);
      setOrders(o);
      setProducts(p);
      setLoading(false);
    })();
  }, []);

  const isAdmin = user?.role === 'admin';

  const stats = {
    processing: orders.filter(o => o.status === 'Processing').length,
    packing: orders.filter(o => o.status === 'Packing').length,
    outForDelivery: orders.filter(o => o.status === 'Out for Delivery').length,
    completed: orders.filter(o => o.status === 'Completed').length,
    liveProducts: products.filter(p => p.status === 'Live').length,
    pendingReview: products.filter(p => p.status === 'Pending Review').length,
    totalRevenue: orders.filter(o => o.status !== 'Cancelled').reduce((sum, o) => sum + (o.total_amount || 0), 0),
  };

  const StatCard = ({ label, value, icon: Icon, color = '#ff8c00', sub }) => (  // eslint-disable-line
    <div className="bg-[#1c1c1c] border border-[#333] p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest">{label}</p>
          <p className="font-mono-ui text-3xl font-bold text-white mt-1">{value}</p>
          {sub && <p className="font-mono-ui text-[10px] text-[#444] mt-1">{sub}</p>}
        </div>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <p className="font-mono-ui text-[#444] text-sm animate-pulse">Loading...</p>
    </div>
  );

  return (
    <StaffGuard>
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <AdminSidebar user={user} />
      <div className="flex-1 overflow-auto">
        <div className="px-6 py-8 max-w-5xl">
          <div className="mb-8">
            <p className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest">Chokepoint</p>
            <h1 className="font-tactical text-4xl text-white">Operations Dashboard</h1>
          </div>

          {/* Order Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <StatCard label="Processing" value={stats.processing} icon={Clock} color="#ff8c00" />
            <StatCard label="Packing" value={stats.packing} icon={Package} color="#3b82f6" />
            <StatCard label="Out for Delivery" value={stats.outForDelivery} icon={Truck} color="#ff8c00" />
            <StatCard label="Completed" value={stats.completed} icon={CheckCircle} color="#22c55e" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
            <StatCard label="Live Products" value={stats.liveProducts} icon={Package} color="#ff8c00" />
            <StatCard label="Pending Review" value={stats.pendingReview} icon={AlertCircle} color="#ff0000"
              sub={stats.pendingReview > 0 ? 'Needs admin approval' : ''} />
            {isAdmin && (
              <StatCard label="Total Revenue"
                value={`₱${stats.totalRevenue.toLocaleString()}`}
                icon={TrendingUp} color="#22c55e" sub="All time" />
            )}
          </div>

          {/* Recent Orders */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-tactical text-2xl text-white">Recent Orders</h2>
              <Link to={createPageUrl('StaffOrders')} className="font-mono-ui text-[10px] text-[#ff8c00] hover:text-white uppercase tracking-widest transition-colors">
                View All →
              </Link>
            </div>
            <div className="space-y-2">
              {orders.slice(0, 8).map(o => (
                <div key={o.id} className="bg-[#1c1c1c] border border-[#333] px-4 py-3 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-mono-ui text-xs text-white truncate">{o.customer_name}</p>
                    <p className="font-mono-ui text-[10px] text-[#555] truncate">{o.product_name} · {o.size}</p>
                  </div>
                  <span className={`font-mono-ui text-[10px] uppercase tracking-wider px-2 py-1 border flex-shrink-0 ${
                    o.status === 'Completed' ? 'border-green-500/30 text-green-400' :
                    o.status === 'Out for Delivery' ? 'border-[#ff6b00]/30 text-[#ff6b00]' :
                    o.status === 'Packing' ? 'border-blue-500/30 text-blue-400' :
                    'border-[#333] text-[#666]'
                  }`}>{o.status}</span>
                </div>
              ))}
              {orders.length === 0 && (
                <p className="font-mono-ui text-[#333] text-xs text-center py-8">No orders yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </StaffGuard>
  );
}