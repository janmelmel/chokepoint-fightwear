import React, { useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { format, subDays, eachDayOfInterval } from 'date-fns';

const CARD = "bg-[#1c1c1c] border border-[#333] p-5";
const LABEL = "font-mono-ui text-[10px] text-[#555] uppercase tracking-widest mb-4";

const FULFILLMENT_COLORS = {
  Completed: '#22c55e',
  'Out for Delivery': '#ff6b00',
  Packing: '#3b82f6',
  Processing: '#f59e0b',
  Cancelled: '#555',
  Pending: '#444',
};

const PIE_COLORS = ['#ff6b00', '#ff8c00', '#ffa020', '#ffb840', '#ffd060', '#ffe080'];

const CustomTooltip = ({ active, payload, label, prefix = '' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#111] border border-[#333] px-3 py-2">
      <p className="font-mono-ui text-[10px] text-[#555] mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-mono-ui text-xs font-bold" style={{ color: p.color }}>
          {p.name}: {prefix}{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  );
};

// --- Revenue trend: last 30 days ---
function buildRevenueTrend(orders) {
  const today = new Date();
  const days = eachDayOfInterval({ start: subDays(today, 29), end: today });
  const map = {};
  days.forEach(d => { map[format(d, 'MMM d')] = 0; });

  orders.forEach(o => {
    if (o.status === 'Cancelled') return;
    const d = format(new Date(o.created_date), 'MMM d');
    if (d in map) map[d] += (o.total_amount || 0);
  });

  return days.map(d => ({ date: format(d, 'MMM d'), revenue: map[format(d, 'MMM d')] }));
}

// --- Category breakdown by revenue ---
function buildCategoryData(orders, products) {
  const prodMap = Object.fromEntries(products.map(p => [p.id, p]));
  const catTotals = {};

  orders.forEach(o => {
    if (o.status === 'Cancelled') return;
    const prod = prodMap[o.product_id];
    const cat = prod?.category_name || o.product_name?.split(' ')[0] || 'Other';
    catTotals[cat] = (catTotals[cat] || 0) + (o.total_amount || 0);
  });

  return Object.entries(catTotals)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
}

// --- Fulfillment breakdown ---
function buildFulfillmentData(orders) {
  const counts = {};
  orders.forEach(o => {
    counts[o.status] = (counts[o.status] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value, fill: FULFILLMENT_COLORS[name] || '#555' }))
    .sort((a, b) => b.value - a.value);
}

// --- Daily order count ---
function buildOrderVolume(orders) {
  const today = new Date();
  const days = eachDayOfInterval({ start: subDays(today, 29), end: today });
  const map = {};
  days.forEach(d => { map[format(d, 'MMM d')] = 0; });

  orders.forEach(o => {
    const d = format(new Date(o.created_date), 'MMM d');
    if (d in map) map[d]++;
  });

  return days.map(d => ({ date: format(d, 'MMM d'), orders: map[format(d, 'MMM d')] }));
}

export default function DashboardCharts({ orders, products }) {
  const revenueTrend = useMemo(() => buildRevenueTrend(orders), [orders]);
  const categoryData = useMemo(() => buildCategoryData(orders, products), [orders, products]);
  const fulfillmentData = useMemo(() => buildFulfillmentData(orders), [orders]);
  const orderVolume = useMemo(() => buildOrderVolume(orders), [orders]);

  const thirtyDayRevenue = revenueTrend.reduce((s, d) => s + d.revenue, 0);
  const thirtyDayOrders = orderVolume.reduce((s, d) => s + d.orders, 0);

  // Thin out x-axis labels for readability
  const tickInterval = 4;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-tactical text-2xl text-white">Analytics</h2>
        <span className="font-mono-ui text-[10px] text-[#444] uppercase tracking-widest">Last 30 Days</span>
      </div>

      {/* Summary mini-stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className={CARD}>
          <p className={LABEL}>30-Day Revenue</p>
          <p className="font-mono-ui text-2xl font-bold text-[#ff8c00]">₱{thirtyDayRevenue.toLocaleString()}</p>
        </div>
        <div className={CARD}>
          <p className={LABEL}>30-Day Orders</p>
          <p className="font-mono-ui text-2xl font-bold text-white">{thirtyDayOrders}</p>
        </div>
      </div>

      {/* Revenue Trend */}
      <div className={CARD}>
        <p className={LABEL}>Daily Revenue Trend</p>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={revenueTrend} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff6b00" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ff6b00" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
            <XAxis dataKey="date" tick={{ fontFamily: 'JetBrains Mono', fontSize: 9, fill: '#444' }}
              interval={tickInterval} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontFamily: 'JetBrains Mono', fontSize: 9, fill: '#444' }}
              axisLine={false} tickLine={false} tickFormatter={v => `₱${(v / 1000).toFixed(0)}k`} width={40} />
            <Tooltip content={<CustomTooltip prefix="₱" />} />
            <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#ff6b00" strokeWidth={2}
              fill="url(#revGrad)" dot={false} activeDot={{ r: 4, fill: '#ff6b00' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Order Volume + Fulfillment side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Order Volume */}
        <div className={CARD}>
          <p className={LABEL}>Daily Order Volume</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={orderVolume} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
              <XAxis dataKey="date" tick={{ fontFamily: 'JetBrains Mono', fontSize: 9, fill: '#444' }}
                interval={tickInterval} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontFamily: 'JetBrains Mono', fontSize: 9, fill: '#444' }}
                axisLine={false} tickLine={false} width={24} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="orders" name="Orders" fill="#ff6b00" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Fulfillment status breakdown */}
        <div className={CARD}>
          <p className={LABEL}>Fulfillment Status (All Time)</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={fulfillmentData} layout="vertical" margin={{ top: 4, right: 4, bottom: 0, left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" horizontal={false} />
              <XAxis type="number" tick={{ fontFamily: 'JetBrains Mono', fontSize: 9, fill: '#444' }}
                axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fontFamily: 'JetBrains Mono', fontSize: 9, fill: '#888' }}
                axisLine={false} tickLine={false} width={80} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Orders" radius={[0, 2, 2, 0]}>
                {fulfillmentData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Revenue Breakdown */}
      {categoryData.length > 0 && (
        <div className={CARD}>
          <p className={LABEL}>Revenue by Category (All Time)</p>
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                  dataKey="value" paddingAngle={3}>
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `₱${Number(v).toLocaleString()}`}
                  contentStyle={{ background: '#111', border: '1px solid #333', fontFamily: 'JetBrains Mono', fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {categoryData.map((d, i) => {
                const total = categoryData.reduce((s, x) => s + x.value, 0);
                const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
                return (
                  <div key={d.name}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="font-mono-ui text-[10px] text-[#888] truncate max-w-[120px]">{d.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono-ui text-[10px] text-[#555]">{pct}%</span>
                        <span className="font-mono-ui text-xs text-white">₱{d.value.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}