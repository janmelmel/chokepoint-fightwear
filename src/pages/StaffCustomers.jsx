import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import AdminSidebar from '@/components/cp/AdminSidebar';
import StaffGuard from '@/components/cp/StaffGuard';
import { Search, X, Mail, Phone, MapPin, ShoppingBag, TrendingUp, Clock } from 'lucide-react';

const STATUS_COLORS = {
  Completed: 'text-green-400 border-green-500/30',
  'Out for Delivery': 'text-[#ff6b00] border-[#ff6b00]/30',
  Packing: 'text-blue-400 border-blue-500/30',
  Processing: 'text-yellow-400 border-yellow-500/30',
  Cancelled: 'text-[#555] border-[#333]',
  Pending: 'text-[#666] border-[#333]',
};

function buildCustomerMap(orders) {
  const map = {};
  orders.forEach(o => {
    const key = o.customer_email || o.customer_name;
    if (!key) return;
    if (!map[key]) {
      map[key] = {
        email: o.customer_email || '',
        name: o.customer_name || '',
        phone: o.customer_phone || '',
        orders: [],
      };
    }
    map[key].orders.push(o);
    // Keep freshest phone/name
    if (o.customer_phone) map[key].phone = o.customer_phone;
    if (o.customer_name) map[key].name = o.customer_name;
  });
  return Object.values(map).map(c => ({
    ...c,
    orderCount: c.orders.length,
    lifetimeValue: c.orders
      .filter(o => o.status !== 'Cancelled')
      .reduce((s, o) => s + (o.total_amount || 0), 0),
    lastOrderDate: c.orders
      .map(o => o.created_date)
      .sort()
      .reverse()[0],
  })).sort((a, b) => b.lifetimeValue - a.lifetimeValue);
}

function CustomerRow({ customer, onClick, selected }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 border-b border-[#1a1a1a] flex items-center justify-between gap-4 transition-colors hover:bg-[#222] ${selected ? 'bg-[#222] border-l-2 border-l-[#ff6b00]' : ''}`}
    >
      <div className="flex-1 min-w-0">
        <p className="font-mono-ui text-xs text-white truncate">{customer.name}</p>
        <p className="font-mono-ui text-[10px] text-[#555] truncate">{customer.email}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="font-mono-ui text-xs text-[#ff8c00]">₱{customer.lifetimeValue.toLocaleString()}</p>
        <p className="font-mono-ui text-[10px] text-[#444]">{customer.orderCount} order{customer.orderCount !== 1 ? 's' : ''}</p>
      </div>
    </button>
  );
}

function CustomerDetail({ customer }) {
  if (!customer) return (
    <div className="flex-1 flex items-center justify-center text-[#333] font-mono-ui text-xs">
      Select a customer to view details
    </div>
  );

  const lastOrder = customer.orders.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0];

  return (
    <div className="flex-1 overflow-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <p className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest">Customer Profile</p>
        <h2 className="font-tactical text-3xl text-white mt-1">{customer.name}</h2>
      </div>

      {/* Contact Info */}
      <div className="bg-[#1c1c1c] border border-[#333] p-4 space-y-3">
        <p className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest mb-3">Contact</p>
        {customer.email && (
          <div className="flex items-center gap-3">
            <Mail className="w-3.5 h-3.5 text-[#555] flex-shrink-0" />
            <a href={`mailto:${customer.email}`} className="font-mono-ui text-xs text-[#aaa] hover:text-white transition-colors">{customer.email}</a>
          </div>
        )}
        {customer.phone && (
          <div className="flex items-center gap-3">
            <Phone className="w-3.5 h-3.5 text-[#555] flex-shrink-0" />
            <span className="font-mono-ui text-xs text-[#aaa]">{customer.phone}</span>
          </div>
        )}
        {lastOrder?.shipping_province && (
          <div className="flex items-center gap-3">
            <MapPin className="w-3.5 h-3.5 text-[#555] flex-shrink-0" />
            <span className="font-mono-ui text-xs text-[#aaa]">
              {[lastOrder.shipping_barangay, lastOrder.shipping_city, lastOrder.shipping_province].filter(Boolean).join(', ')}
            </span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#1c1c1c] border border-[#333] p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-green-400" />
            <p className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest">Lifetime Value</p>
          </div>
          <p className="font-mono-ui text-xl font-bold text-[#ff8c00]">₱{customer.lifetimeValue.toLocaleString()}</p>
        </div>
        <div className="bg-[#1c1c1c] border border-[#333] p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingBag className="w-3.5 h-3.5 text-blue-400" />
            <p className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest">Total Orders</p>
          </div>
          <p className="font-mono-ui text-xl font-bold text-white">{customer.orderCount}</p>
        </div>
        <div className="bg-[#1c1c1c] border border-[#333] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-3.5 h-3.5 text-[#ff8c00]" />
            <p className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest">Last Order</p>
          </div>
          <p className="font-mono-ui text-xs font-bold text-white">
            {customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
          </p>
        </div>
      </div>

      {/* Order History */}
      <div>
        <p className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest mb-3">Order History</p>
        <div className="space-y-2">
          {customer.orders
            .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
            .map(o => (
              <div key={o.id} className="bg-[#1c1c1c] border border-[#222] px-4 py-3 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-mono-ui text-xs text-white truncate">{o.product_name}</p>
                  <p className="font-mono-ui text-[10px] text-[#555]">
                    {o.size && `Size ${o.size} · `}
                    {o.order_number && `#${o.order_number} · `}
                    {new Date(o.created_date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="font-mono-ui text-xs text-white">₱{(o.total_amount || 0).toLocaleString()}</span>
                  <span className={`font-mono-ui text-[9px] uppercase tracking-wider px-2 py-1 border ${STATUS_COLORS[o.status] || 'text-[#666] border-[#333]'}`}>
                    {o.status}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default function StaffCustomers() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    (async () => {
      const u = await base44.auth.me().catch(() => null);
      setUser(u);
      const o = await base44.entities.Order.list('-created_date', 500);
      setOrders(o);
      setLoading(false);
    })();
  }, []);

  const customers = useMemo(() => buildCustomerMap(orders), [orders]);

  const filtered = useMemo(() => {
    if (!search.trim()) return customers;
    const q = search.toLowerCase();
    return customers.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.includes(q)
    );
  }, [customers, search]);

  const selectedCustomer = useMemo(() =>
    selected ? customers.find(c => c.email === selected || c.name === selected) : null,
    [selected, customers]
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
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Top bar */}
          <div className="px-6 py-5 border-b border-[#1a1a1a] flex items-center justify-between flex-shrink-0">
            <div>
              <p className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest">Chokepoint</p>
              <h1 className="font-tactical text-3xl text-white">Customer Directory</h1>
            </div>
            <p className="font-mono-ui text-[10px] text-[#444]">{customers.length} customers</p>
          </div>

          {/* Body: list + detail */}
          <div className="flex-1 flex overflow-hidden">

            {/* Left: search + list */}
            <div className="w-72 flex-shrink-0 border-r border-[#1a1a1a] flex flex-col overflow-hidden">
              <div className="p-3 border-b border-[#1a1a1a]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#444]" />
                  <input
                    type="text"
                    placeholder="Search customers..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-[#111] border border-[#222] pl-9 pr-8 py-2 font-mono-ui text-xs text-white placeholder-[#333] focus:outline-none focus:border-[#444]"
                  />
                  {search && (
                    <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                      <X className="w-3 h-3 text-[#444] hover:text-white" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {filtered.length === 0 && (
                  <p className="font-mono-ui text-[10px] text-[#333] text-center py-8">No customers found</p>
                )}
                {filtered.map(c => (
                  <CustomerRow
                    key={c.email || c.name}
                    customer={c}
                    selected={selected === (c.email || c.name)}
                    onClick={() => setSelected(c.email || c.name)}
                  />
                ))}
              </div>
            </div>

            {/* Right: detail */}
            <CustomerDetail customer={selectedCustomer} />
          </div>

        </div>
      </div>
    </StaffGuard>
  );
}