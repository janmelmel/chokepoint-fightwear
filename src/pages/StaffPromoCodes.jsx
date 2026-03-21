import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import AdminSidebar from '@/components/cp/AdminSidebar';
import StaffGuard from '@/components/cp/StaffGuard';
import { Plus, X, Copy, Check, ToggleLeft, ToggleRight, Trash2, RefreshCw, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const INPUT = "w-full bg-[#0a0a0a] border border-[#333] text-white font-mono-ui text-sm px-3 py-2.5 focus:outline-none focus:border-[#ff8c00]/60";
const LABEL = "font-mono-ui text-[10px] text-[#555] uppercase tracking-widest block mb-1";

function generateCode(assignedTo) {
  const prefix = (assignedTo || 'CODE').replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase();
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${suffix}`;
}

export default function StaffPromoCodes() {
  const [user, setUser] = useState(null);
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editCode, setEditCode] = useState(null);
  const [copied, setCopied] = useState(null);
  const [form, setForm] = useState({
    assigned_to: '', code: '', discount_type: 'percentage', discount_value: '',
    min_order_amount: '', usage_limit: '', per_user_limit: 1, expiry_date: '', is_active: true, notes: ''
  });

  useEffect(() => {
    (async () => {
      const u = await base44.auth.me().catch(() => null);
      setUser(u);
      await load();
    })();
  }, []);

  const load = async () => {
    setLoading(true);
    const c = await base44.entities.PromoCode.list('-created_date', 100);
    setCodes(c);
    setLoading(false);
  };

  const openCreate = () => {
    setForm({ assigned_to: '', code: '', discount_type: 'percentage', discount_value: '', min_order_amount: '', usage_limit: '', per_user_limit: 1, expiry_date: '', is_active: true, notes: '' });
    setShowForm(true);
  };

  const handleSave = async () => {
    const code = (form.code.trim() || generateCode(form.assigned_to)).toUpperCase().replace(/\s/g, '');
    await base44.entities.PromoCode.create({
      ...form,
      code,
      discount_value: Number(form.discount_value),
      min_order_amount: form.min_order_amount ? Number(form.min_order_amount) : 0,
      usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
      per_user_limit: Number(form.per_user_limit) || 1,
      usage_count: 0
    });
    setShowForm(false);
    await load();
  };

  const toggle = async (c) => {
    await base44.entities.PromoCode.update(c.id, { is_active: !c.is_active });
    await load();
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this promo code?')) return;
    await base44.entities.PromoCode.delete(id);
    await load();
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  };

  const isExpired = (c) => c.expiry_date && new Date(c.expiry_date) < new Date();
  const isMaxed = (c) => c.usage_limit && c.usage_count >= c.usage_limit;

  return (
    <StaffGuard>
      <div className="min-h-screen bg-[#0a0a0a] flex">
        <AdminSidebar user={user} />
        <div className="flex-1 overflow-auto">
          <div className="px-6 py-8 w-full">
            <div className="flex items-center justify-between mb-8 gap-4">
              <div>
                <p className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest">Marketing</p>
                <h1 className="font-tactical text-4xl text-white">Promo Codes</h1>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={load} className="bg-amber-600 p-2.5 btn-glow-white"><RefreshCw className="w-4 h-4" /></button>
                <button onClick={openCreate} style={{ background: '#ff6b00', border: '1px solid #ff6b00', color: '#fff', fontWeight: 700 }} className="px-5 py-3 font-mono-ui text-xs uppercase tracking-widest flex items-center gap-2 cursor-pointer hover:opacity-90">
                  <Plus className="w-4 h-4" /> New Code
                </button>
              </div>
            </div>

            {loading ?
            <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="card-tactical h-14 animate-pulse" />)}</div> :

            <div className="card-tactical overflow-x-auto w-full">
                <div className="px-4 py-3 border-b border-[#222] bg-[#0d0d0d] grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-4 min-w-[600px]">
                  {['Code', 'Assigned To', 'Discount', 'Usage', 'Actions'].map((h) =>
                <p key={h} className="font-mono-ui text-[9px] text-[#444] uppercase tracking-widest">{h}</p>
                )}
                </div>
                <div className="divide-y divide-[#1a1a1a]">
                  {codes.map((c) => {
                  const expired = isExpired(c);
                  const maxed = isMaxed(c);
                  const statusOk = c.is_active && !expired && !maxed;
                  return (
                    <div key={c.id} className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-4 items-center px-4 py-3 min-w-[600px]">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono-ui text-sm font-bold ${statusOk ? 'text-[#ff8c00]' : 'text-[#444]'}`}>{c.code}</span>
                          <button onClick={() => copyCode(c.code)} className="text-[#444] hover:text-white transition-colors">
                            {copied === c.code ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        <div>
                          <p className="font-mono-ui text-xs text-white">{c.assigned_to || '—'}</p>
                          {c.expiry_date && <p className={`font-mono-ui text-[9px] ${expired ? 'text-[#ff0000]' : 'text-[#555]'}`}>Exp: {c.expiry_date}</p>}
                          {c.notes && <p className="font-mono-ui text-[9px] text-[#444] truncate max-w-[120px]">{c.notes}</p>}
                        </div>
                        <div>
                          <p className="font-mono-ui text-xs text-white">
                            {c.discount_type === 'percentage' ? `${c.discount_value}% off` : `₱${c.discount_value} off`}
                          </p>
                          {c.min_order_amount > 0 && <p className="font-mono-ui text-[9px] text-[#555]">Min ₱{c.min_order_amount}</p>}
                        </div>
                        <div>
                          <p className="font-mono-ui text-xs text-white">{c.usage_count || 0}{c.usage_limit ? ` / ${c.usage_limit}` : ''}</p>
                          {maxed && <p className="font-mono-ui text-[9px] text-[#ff0000]">Maxed out</p>}
                          {!maxed && <p className="font-mono-ui text-[9px] text-[#555]">per user: {c.per_user_limit || 1}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => toggle(c)} title={c.is_active ? 'Deactivate' : 'Activate'}
                        className={`transition-colors ${c.is_active ? 'text-green-400 hover:text-red-400' : 'text-[#444] hover:text-green-400'}`}>
                            {c.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                          </button>
                          <button onClick={() => remove(c.id)} className="p-1.5 border border-[#ff0000]/30 text-[#ff0000]/50 hover:border-[#ff0000] hover:text-[#ff0000] transition-all">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>);

                })}
                  {codes.length === 0 &&
                <div className="text-center py-12">
                      <p className="font-mono-ui text-[#333] text-xs">No promo codes yet.</p>
                    </div>
                }
                </div>
              </div>
            }
          </div>
        </div>

        <AnimatePresence>
          {showForm &&
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={() => setShowForm(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[#111] border border-[#333] max-h-[90vh] overflow-y-auto scrollbar-tactical">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#222]">
                  <h2 className="font-tactical text-2xl text-white">New Promo Code</h2>
                  <button onClick={() => setShowForm(false)} className="text-[#555] hover:text-white"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <label className={LABEL}>Assigned To *</label>
                    <input value={form.assigned_to} onChange={(e) => setForm((f) => ({ ...f, assigned_to: e.target.value }))}
                  className={INPUT} placeholder="e.g. Justin Dela Cruz, Summer Sale" />
                  </div>
                  <div>
                    <label className={LABEL}>Code (leave blank to auto-generate)</label>
                    <input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase().replace(/\s/g, '') }))}
                  className={INPUT} placeholder={`e.g. ${generateCode(form.assigned_to || 'CODE')}`} />
                    <p className="font-mono-ui text-[9px] text-[#444] mt-1">Auto-format: first 4 letters + 4 digits (e.g. JUST1234)</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={LABEL}>Discount Type</label>
                      <select value={form.discount_type} onChange={(e) => setForm((f) => ({ ...f, discount_type: e.target.value }))} className={INPUT}>
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount (₱)</option>
                      </select>
                    </div>
                    <div>
                      <label className={LABEL}>Discount Value *</label>
                      <input type="number" value={form.discount_value} onChange={(e) => setForm((f) => ({ ...f, discount_value: e.target.value }))}
                    className={INPUT} placeholder={form.discount_type === 'percentage' ? '10' : '500'} />
                    </div>
                    <div>
                      <label className={LABEL}>Min. Order (₱)</label>
                      <input type="number" value={form.min_order_amount} onChange={(e) => setForm((f) => ({ ...f, min_order_amount: e.target.value }))}
                    className={INPUT} placeholder="0" />
                    </div>
                    <div>
                      <label className={LABEL}>Usage Limit</label>
                      <input type="number" value={form.usage_limit} onChange={(e) => setForm((f) => ({ ...f, usage_limit: e.target.value }))}
                    className={INPUT} placeholder="Unlimited" />
                    </div>
                    <div>
                      <label className={LABEL}>Per User Limit</label>
                      <input type="number" value={form.per_user_limit} onChange={(e) => setForm((f) => ({ ...f, per_user_limit: e.target.value }))}
                    className={INPUT} placeholder="1" />
                    </div>
                    <div>
                      <label className={LABEL}>Expiry Date</label>
                      <input type="date" value={form.expiry_date} onChange={(e) => setForm((f) => ({ ...f, expiry_date: e.target.value }))}
                    className={INPUT} />
                    </div>
                  </div>
                  <div>
                    <label className={LABEL}>Internal Notes</label>
                    <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={2} className={`${INPUT} resize-none`} placeholder="e.g. For Justin's IG promo Aug 2026" />
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="active" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} className="accent-[#ff8c00]" />
                    <label htmlFor="active" className="font-mono-ui text-xs text-[#ff8c00] uppercase tracking-wider cursor-pointer">Active</label>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setShowForm(false)} className="bg-red-600 text-gray-50 py-3 text-xs font-mono-ui uppercase tracking-widest btn-glow-white flex-1">Cancel</button>
                    <button onClick={handleSave} disabled={!form.discount_value} className="bg-green-500 text-gray-50 py-3 text-xs font-mono-ui uppercase tracking-widest btn-glow-orange flex-1 disabled:opacity-40">
                    
                      Create Code
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          }
        </AnimatePresence>
      </div>
    </StaffGuard>);

}