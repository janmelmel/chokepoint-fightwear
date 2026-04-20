/**
 * PreOrderTimelineVertical — vertical timeline for OrderConfirmed and TrackOrder pages.
 * Shows stages: Order Placed → Production → Shipping → Delivered
 */
import React from 'react';
import { getPreOrderTimeline, formatDate } from '@/lib/preorderTimeline';

const STAGES = [
  { key: 'order', icon: '📋', label: 'Order Placed' },
  { key: 'production', icon: '🔧', label: 'In Production' },
  { key: 'shipping', icon: '🚚', label: 'Ready to Ship' },
  { key: 'delivery', icon: '📦', label: 'Out for Delivery' },
  { key: 'delivered', icon: '✅', label: 'Delivered' },
];

function getActiveStage(orderStatus) {
  switch (orderStatus) {
    case 'Pending': return 'order';
    case 'Processing': return 'production';
    case 'Packing': return 'production';
    case 'Out for Delivery': return 'delivery';
    case 'Pending_Completion': return 'delivery';
    case 'Completed': return 'delivered';
    default: return 'order';
  }
}

const STAGE_ORDER = ['order', 'production', 'shipping', 'delivery', 'delivered'];

export default function PreOrderTimelineVertical({ order, orderDate, showDates = true }) {
  const date = orderDate || order?.created_date || new Date();
  const tl = getPreOrderTimeline(date);
  const status = order?.status || 'Pending';
  const activeKey = getActiveStage(status);
  const activeIdx = STAGE_ORDER.indexOf(activeKey);

  const stageInfo = {
    order: {
      date: formatDate(date),
      sub: null,
    },
    production: {
      date: '7–10 business days',
      sub: `Est. ready: ${tl.productionRange}`,
    },
    shipping: {
      date: '3–7 days after production',
      sub: `Est. arrival: ${tl.arrivalRange}`,
    },
    delivery: {
      date: order?.tracking_number ? `${order.logistics}: ${order.tracking_number}` : '3–7 days shipping',
      sub: null,
    },
    delivered: {
      date: status === 'Completed' && order?.updated_date ? formatDate(order.updated_date) : `Est. ${tl.arrivalRange}`,
      sub: null,
    },
  };

  return (
    <div style={{ background: '#0d0d0d', borderLeft: '3px solid #E87722', padding: '12px 16px' }}>
      <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', color: '#E87722', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '12px' }}>
        ⏱ Pre-Order Timeline
      </p>
      <div style={{ position: 'relative' }}>
        {/* Vertical line */}
        <div style={{ position: 'absolute', left: '10px', top: '20px', bottom: '20px', width: '1px', background: '#333' }} />

        {STAGES.map((stage, i) => {
          const stageIdx = STAGE_ORDER.indexOf(stage.key);
          const isDone = stageIdx < activeIdx || status === 'Completed';
          const isActive = stageIdx === activeIdx;
          const isUpcoming = stageIdx > activeIdx;

          const dotColor = isDone ? '#27ae60' : isActive ? '#E87722' : '#444';
          const labelColor = isDone ? '#27ae60' : isActive ? '#E87722' : '#555';
          const info = stageInfo[stage.key];

          return (
            <div key={stage.key} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: i < STAGES.length - 1 ? '14px' : '0', position: 'relative' }}>
              {/* Dot */}
              <div style={{
                width: '20px', height: '20px', borderRadius: '50%',
                background: dotColor, border: `2px solid ${dotColor}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, zIndex: 1,
                boxShadow: isActive ? `0 0 8px ${dotColor}` : 'none',
              }}>
                {isDone && <span style={{ fontSize: '9px' }}>✓</span>}
                {isActive && (
                  <div style={{
                    width: '6px', height: '6px', borderRadius: '50%', background: '#fff',
                    animation: 'pulse 1.5s infinite',
                  }} />
                )}
              </div>

              {/* Content */}
              <div style={{ flex: 1, paddingTop: '1px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '4px' }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: labelColor, fontWeight: isActive ? 700 : 400 }}>
                    {stage.icon} {stage.label}
                  </span>
                  {showDates && (
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: isActive ? '#E87722' : isDone ? '#27ae60' : '#444' }}>
                      {info.date}
                    </span>
                  )}
                </div>
                {showDates && info.sub && (
                  <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', color: '#555', marginTop: '2px', marginLeft: '0' }}>
                    {info.sub}
                  </p>
                )}
                {isActive && !isDone && (
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', color: '#E87722', background: 'rgba(232,119,34,0.1)', padding: '1px 6px', marginTop: '3px', display: 'inline-block' }}>
                    ⏳ Current
                  </span>
                )}
                {isDone && (
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', color: '#27ae60', marginTop: '2px', display: 'inline-block' }}>
                    ✅ Done
                  </span>
                )}
                {isUpcoming && (
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', color: '#444', marginTop: '2px', display: 'inline-block' }}>
                    ⏙ Upcoming
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.4); }
        }
      `}</style>
    </div>
  );
}