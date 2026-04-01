import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import AdminSidebar from '@/components/cp/AdminSidebar';
import StaffGuard from '@/components/cp/StaffGuard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Loader2, RefreshCw, TrendingUp, Clock, AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react';

function formatHours(h) {
  if (h === null || h === undefined) return '—';
  if (h < 1) return `${Math.round(h * 60)}m`;
  if (h < 24) return `${h.toFixed(1)}h`;
  return `${(h / 24).toFixed(1)}d`;
}

function StageBar({ stage, maxAvg }) {
  const pct = maxAvg > 0 ? Math.round((stage.avg_hours / maxAvg) * 100) : 0;
  const isBottleneck = pct >= 80;
  const color = isBottleneck ? '#ff4444' : pct >= 50 ? '#ff8c00' : '#22c55e';

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="font-mono-ui text-[10px] text-[#888] truncate flex-1 pr-4">{stage.status}</span>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="font-mono-ui text-[10px] text-[#555]">
            {stage.sample_count} orders · min {formatHours(stage.min_hours)} · max {formatHours(stage.max_hours)}
          </span>
          <span className="font-mono-ui text-xs font-bold" style={{ color, minWidth: 40, textAlign: 'right' }}>
            {formatHours(stage.avg_hours)}
          </span>
          {isBottleneck && <AlertTriangle className="w-3.5 h-3.5 text-[#ff4444]" />}
        </div>
      </div>
      <div className="h-2 bg-[#1a1a1a] w-full">
        <div className="h-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function OrderRow({ metric }) {
  const [expanded, setExpanded] = useState(false);

  const statusColor = {
    Completed: '#22c55e',
    Cancelled: '#ff4444',
    'Ready for Delivery': '#86efac',
    Packing: '#22d3ee',
  }[metric.status] || '#ff8c00';

  return (
    <div className="border border-[#1e1e1e] bg-[#0d0d0d]">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-[#111] transition-colors"
      >
        {expanded ? <ChevronDown className="w-3.5 h-3.5 text-[#555] flex-shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-[#555] flex-shrink-0" />}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-mono-ui text-xs text-white">{metric.order_number}</span>
            <span className="font-mono-ui text-[10px] text-[#555] truncate">{metric.product_name}</span>
            <span className="font-mono-ui text-[9px] uppercase tracking-widest px-1.5 py-0.5 border" style={{ color: statusColor, borderColor: `${statusColor}44` }}>
              {metric.status}
            </span>
          </div>
          <p className="font-mono-ui text-[10px] text-[#444] mt-0.5">{metric.customer_name}</p>
        </div>
        <div className="flex-shrink-0 text-right">
          <p className="font-mono-ui text-xs text-[#ff8c00] font-bold">{formatHours(metric.total_hours)}</p>
          <p className="font-mono-ui text-[9px] text-[#444]">total time</p>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-[#1a1a1a] pt-3 space-y-2">
          {metric.stages.map((s, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#ff8c00] mt-1.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono-ui text-[10px] text-[#888]">{s.status}</span>
                  <span className="font-mono-ui text-[10px] text-[#555] flex-shrink-0">
                    {s.duration_hours !== null ? formatHours(s.duration_hours) : 'ongoing'}
                  </span>
                </div>
                <p className="font-mono-ui text-[9px] text-[#444]">
                  {new Date(s.started_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  {s.ended_at ? ` → ${new Date(s.ended_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}` : ' → now'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function StaffMetrics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | completed | in_progress

  const load = async () => {
    setLoading(true);
    const res = await base44.functions.invoke('getOrderProcessMetrics', {});
    setData(res.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filteredOrders = data?.orderMetrics?.filter(o => {
    if (filter === 'completed') return o.is_completed;
    if (filter === 'in_progress') return !o.is_completed && o.status !== 'Cancelled';
    return o.status !== 'Cancelled';
  }) || [];

  const maxAvg = data?.stageAverages
    ? Math.max(...data.stageAverages.filter(s => s.avg_hours !== null).map(s => s.avg_hours), 1)
    : 1;

  // Chart data
  const chartData = data?.stageAverages?.filter(s => s.avg_hours !== null).map(s => ({
    name: s.status.replace('Pending Customer Approval', 'Client Approval').replace('Digitizing Order', 'Digitizing').replace('Quality Control', 'QC').replace('Ready for Delivery', 'Delivery'),
    hours: s.avg_hours,
    full: s.status,
  })) || [];

  return (
    <StaffGuard>
      <div className="min-h-screen bg-[#0a0a0a] text-white flex">
        <AdminSidebar />
        <div className="flex-1 min-w-0 p-6 space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="font-tactical text-3xl text-white">Production Metrics</h1>
              <p className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest mt-0.5">Stage durations · Bottleneck analysis</p>
            </div>
            <button onClick={load} disabled={loading} className="btn-glow-white px-4 py-2 flex items-center gap-2 font-mono-ui text-[10px] uppercase tracking-widest disabled:opacity-40">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-6 h-6 animate-spin text-[#ff8c00]" />
            </div>
          ) : data ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Orders Tracked', value: data.orderMetrics?.length || 0, icon: TrendingUp },
                  { label: 'Completed Orders', value: data.orderMetrics?.filter(o => o.is_completed).length || 0, icon: TrendingUp, color: '#22c55e' },
                  { label: 'In Progress', value: data.orderMetrics?.filter(o => !o.is_completed && o.status !== 'Cancelled').length || 0, icon: Clock, color: '#ff8c00' },
                  {
                    label: 'Avg Completion Time',
                    value: (() => {
                      const completed = data.orderMetrics?.filter(o => o.is_completed && o.total_hours !== null) || [];
                      if (!completed.length) return '—';
                      const avg = completed.reduce((s, o) => s + o.total_hours, 0) / completed.length;
                      return formatHours(avg);
                    })(),
                    icon: Clock,
                    color: '#60a5fa',
                  },
                ].map((card, i) => (
                  <div key={i} className="card-tactical px-4 py-4">
                    <p className="font-mono-ui text-[9px] text-[#555] uppercase tracking-widest">{card.label}</p>
                    <p className="font-tactical text-3xl mt-1" style={{ color: card.color || '#fff' }}>{card.value}</p>
                  </div>
                ))}
              </div>

              {/* Stage Average Chart */}
              {chartData.length > 0 && (
                <div className="card-tactical p-5">
                  <p className="font-mono-ui text-[10px] text-[#ff8c00] uppercase tracking-widest mb-4">Avg Hours per Stage</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 60 }}>
                      <XAxis dataKey="name" tick={{ fill: '#555', fontSize: 9, fontFamily: 'JetBrains Mono' }} angle={-30} textAnchor="end" interval={0} />
                      <YAxis tick={{ fill: '#555', fontSize: 9, fontFamily: 'JetBrains Mono' }} />
                      <Tooltip
                        contentStyle={{ background: '#111', border: '1px solid #333', fontFamily: 'JetBrains Mono', fontSize: 11 }}
                        labelStyle={{ color: '#ff8c00' }}
                        formatter={(v, n, p) => [formatHours(v), p.payload.full]}
                      />
                      {chartData.map((entry, index) => {
                        const pct = maxAvg > 0 ? entry.hours / maxAvg : 0;
                        const color = pct >= 0.8 ? '#ff4444' : pct >= 0.5 ? '#ff8c00' : '#22c55e';
                        return <Cell key={index} fill={color} />;
                      })}
                      <Bar dataKey="hours" radius={[2, 2, 0, 0]}>
                        {chartData.map((entry, index) => {
                          const pct = maxAvg > 0 ? entry.hours / maxAvg : 0;
                          const color = pct >= 0.8 ? '#ff4444' : pct >= 0.5 ? '#ff8c00' : '#22c55e';
                          return <Cell key={index} fill={color} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Stage Breakdown */}
              <div className="card-tactical p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="font-mono-ui text-[10px] text-[#ff8c00] uppercase tracking-widest">Stage Breakdown</p>
                  <p className="font-mono-ui text-[9px] text-[#444]">Red = bottleneck · Orange = moderate · Green = fast</p>
                </div>
                {data.stageAverages.map((s, i) => (
                  <StageBar key={i} stage={s} maxAvg={maxAvg} />
                ))}
              </div>

              {/* Per-Order Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <p className="font-mono-ui text-[10px] text-[#ff8c00] uppercase tracking-widest">Order Timelines</p>
                  <div className="flex gap-2">
                    {['all', 'in_progress', 'completed'].map(f => (
                      <button key={f} onClick={() => setFilter(f)}
                        className={`font-mono-ui text-[9px] uppercase tracking-widest px-3 py-1.5 border transition-colors ${filter === f ? 'border-[#ff8c00] text-[#ff8c00]' : 'border-[#333] text-[#555] hover:border-[#555]'}`}>
                        {f === 'in_progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  {filteredOrders.length === 0
                    ? <p className="font-mono-ui text-xs text-[#444] text-center py-8">No data yet — history is recorded as orders move through Trello.</p>
                    : filteredOrders.map(o => <OrderRow key={o.order_id} metric={o} />)
                  }
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </StaffGuard>
  );
}