import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import AdminSidebar from '@/components/cp/AdminSidebar';
import { RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STATUSES = ['New', 'In Review', 'Quoted', 'Confirmed', 'Declined'];

const STATUS_COLOR = {
  'New': 'text-[#ff6b00] border-[#ff6b00]/30',
  'In Review': 'text-blue-400 border-blue-400/30',
  'Quoted': 'text-yellow-400 border-yellow-400/30',
  'Confirmed': 'text-green-400 border-green-400/30',
  'Declined': 'text-[#ff0000] border-[#ff0000]/30',
};

export default function StaffCustomRequests() {
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    (async () => {
      const u = await base44.auth.me();
      setUser(u);
      await load();
    })();
  }, []);

  const load = async () => {
    setLoading(true);
    const r = await base44.entities.CustomRequest.list('-created_date', 100);
    setRequests(r);
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    await base44.entities.CustomRequest.update(id, { status });
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    if (selected?.id === id) setSelected(s => ({ ...s, status }));
  };

  const saveNotes = async (id, notes) => {
    await base44.entities.CustomRequest.update(id, { staff_notes: notes });
    setRequests(prev => prev.map(r => r.id === id ? { ...r, staff_notes: notes } : r));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <AdminSidebar user={user} />
      <div className="flex-1 overflow-auto">
        <div className="px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest">Inquiries</p>
              <h1 className="font-tactical text-4xl text-white">Custom Requests</h1>
            </div>
            <button onClick={load} className="btn-glow-white p-2"><RefreshCw className="w-4 h-4" /></button>
          </div>

          {loading ? (
            <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="card-tactical h-14 animate-pulse" />)}</div>
          ) : (
            <div className="card-tactical overflow-hidden">
              <div className="px-4 py-3 border-b border-[#222] bg-[#0d0d0d]">
                <p className="font-mono-ui text-[10px] text-[#444] uppercase tracking-widest">{requests.length} requests</p>
              </div>
              <div className="divide-y divide-[#1a1a1a]">
                {requests.map(r => (
                  <div key={r.id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-[#111] transition-colors cursor-pointer"
                    onClick={() => setSelected(r)}>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono-ui text-xs text-white truncate">{r.name}</p>
                      <p className="font-mono-ui text-[10px] text-[#555] truncate">{r.email}</p>
                    </div>
                    <p className="font-mono-ui text-[10px] text-[#ff8c00] hidden sm:block flex-shrink-0">{r.category || '—'}</p>
                    <p className="font-mono-ui text-[10px] text-[#444] hidden md:block max-w-xs truncate">{r.details}</p>
                    <select value={r.status || 'New'}
                      onClick={e => e.stopPropagation()}
                      onChange={e => updateStatus(r.id, e.target.value)}
                      className={`bg-[#0a0a0a] border font-mono-ui text-[10px] px-2 py-1.5 focus:outline-none flex-shrink-0 ${STATUS_COLOR[r.status] || 'border-[#333] text-[#666]'}`}>
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                ))}
                {requests.length === 0 && (
                  <div className="text-center py-12">
                    <p className="font-mono-ui text-[#333] text-xs">No custom requests yet</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Panel */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-[#0d0d0d] border-l border-[#222] overflow-y-auto z-40 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-tactical text-2xl text-white">Request Detail</h2>
              <button onClick={() => setSelected(null)} className="text-[#555] hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-3">
              <div>
                <p className="font-mono-ui text-[9px] text-[#555] uppercase tracking-widest mb-1">Customer</p>
                <p className="font-mono-ui text-sm text-white">{selected.name}</p>
                <p className="font-mono-ui text-xs text-[#888]">{selected.email}</p>
                {selected.phone && <p className="font-mono-ui text-xs text-[#666]">{selected.phone}</p>}
              </div>
              {selected.category && (
                <div>
                  <p className="font-mono-ui text-[9px] text-[#555] uppercase tracking-widest mb-1">Category</p>
                  <p className="font-mono-ui text-xs text-[#ff8c00]">{selected.category}</p>
                </div>
              )}
              {selected.rashguard_sleeve && (
                <div>
                  <p className="font-mono-ui text-[9px] text-[#555] uppercase tracking-widest mb-1">Sleeve</p>
                  <p className="font-mono-ui text-xs text-white">{selected.rashguard_sleeve}</p>
                </div>
              )}
              {selected.shorts_slit && (
                <div>
                  <p className="font-mono-ui text-[9px] text-[#555] uppercase tracking-widest mb-1">Slit Option</p>
                  <p className="font-mono-ui text-xs text-white">{selected.shorts_slit}</p>
                </div>
              )}
              {(selected.gi_colors?.length > 0 || selected.gi_color_request) && (
                <div>
                  <p className="font-mono-ui text-[9px] text-[#555] uppercase tracking-widest mb-1">Gi Colors</p>
                  {selected.gi_colors?.length > 0 && <p className="font-mono-ui text-xs text-white">{selected.gi_colors.join(', ')}</p>}
                  {selected.gi_color_request && <p className="font-mono-ui text-xs text-[#aaa]">Custom: {selected.gi_color_request}</p>}
                </div>
              )}
              {selected.color_hex && (
                <div>
                  <p className="font-mono-ui text-[9px] text-[#555] uppercase tracking-widest mb-1">Primary Color</p>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 border border-[#333]" style={{ backgroundColor: selected.color_hex }} />
                    <p className="font-mono-ui text-xs text-white">{selected.color_hex.toUpperCase()}</p>
                  </div>
                </div>
              )}
              {selected.quantity && (
                <div>
                  <p className="font-mono-ui text-[9px] text-[#555] uppercase tracking-widest mb-1">Quantity</p>
                  <p className="font-mono-ui text-xs text-white">{selected.quantity} pcs</p>
                </div>
              )}
              {selected.mat_sqm && (
                <div>
                  <p className="font-mono-ui text-[9px] text-[#555] uppercase tracking-widest mb-1">Mat Area</p>
                  <p className="font-mono-ui text-xs text-white">{selected.mat_sqm} sqm · ₱{(selected.mat_sqm * 2350).toLocaleString()} est.</p>
                </div>
              )}
              {selected.design_image_url && (
                <div>
                  <p className="font-mono-ui text-[9px] text-[#555] uppercase tracking-widest mb-1">Design Reference</p>
                  <a href={selected.design_image_url} target="_blank" rel="noreferrer">
                    <img src={selected.design_image_url} className="w-full max-h-40 object-contain border border-[#333]" alt="design" />
                  </a>
                </div>
              )}
              <div>
                <p className="font-mono-ui text-[9px] text-[#555] uppercase tracking-widest mb-1">Details / Notes</p>
                <p className="font-mono-ui text-xs text-[#aaa] leading-relaxed whitespace-pre-wrap">{selected.details || '—'}</p>
              </div>
              <div>
                <p className="font-mono-ui text-[9px] text-[#555] uppercase tracking-widest mb-1">Status</p>
                <select value={selected.status || 'New'}
                  onChange={e => updateStatus(selected.id, e.target.value)}
                  className={`bg-[#0a0a0a] border font-mono-ui text-xs px-3 py-2 focus:outline-none w-full ${STATUS_COLOR[selected.status] || 'border-[#333] text-[#666]'}`}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <p className="font-mono-ui text-[9px] text-[#555] uppercase tracking-widest mb-1">Staff Notes</p>
                <StaffNotes request={selected} onSave={saveNotes} />
              </div>
              <div>
                <p className="font-mono-ui text-[9px] text-[#444] uppercase tracking-widest mb-1">Submitted</p>
                <p className="font-mono-ui text-[10px] text-[#444]">{new Date(selected.created_date).toLocaleString()}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StaffNotes({ request, onSave }) {
  const [notes, setNotes] = useState(request.staff_notes || '');
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    await onSave(request.id, notes);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="space-y-2">
      <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
        className="w-full bg-[#0a0a0a] border border-[#333] text-white font-mono-ui text-xs px-3 py-2 focus:outline-none focus:border-[#ff8c00]/60 resize-none"
        placeholder="Add internal notes..." />
      <button onClick={handleSave}
        className="btn-glow-orange w-full py-2 font-mono-ui text-[10px] tracking-widest uppercase">
        {saved ? 'Saved ✓' : 'Save Notes'}
      </button>
    </div>
  );
}