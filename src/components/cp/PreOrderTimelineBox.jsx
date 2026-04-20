/**
 * PreOrderTimelineBox — compact info box for ProductDetailModal and Checkout
 * Shows production + shipping estimate before ordering.
 */
import React from 'react';
import { getPreOrderTimeline } from '@/lib/preorderTimeline';

export default function PreOrderTimelineBox({ orderDate }) {
  const tl = getPreOrderTimeline(orderDate || new Date());

  return (
    <div style={{
      background: '#111',
      borderLeft: '3px solid #E87722',
      padding: '10px 14px',
      fontSize: '11px',
    }}>
      <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', color: '#E87722', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '8px' }}>
        📦 Pre-Order Timeline
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#aaa' }}>🔧 Production</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#fff' }}>7–10 business days</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#aaa' }}>🚚 Shipping</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#fff' }}>3–7 days</span>
        </div>
        <div style={{ borderTop: '1px solid #222', marginTop: '4px', paddingTop: '4px', display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#aaa' }}>⏱ Est. Arrival</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#E87722', fontWeight: 700 }}>{tl.arrivalRange}</span>
        </div>
      </div>
    </div>
  );
}