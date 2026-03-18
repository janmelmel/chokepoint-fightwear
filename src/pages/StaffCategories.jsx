import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import AdminSidebar from '@/components/cp/AdminSidebar';
import { Plus, Edit2, ToggleLeft, ToggleRight, X, ChevronRight, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function StaffCategories() {
  const [user, setUser] = useState(null);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '', parent_id: '', sort_order: 0, is_active: true });

  useEffect(() => {
    (async () => {
      const u = await base44.auth.me().catch(() => null);
      if (!u) { base44.auth.redirectToLogin(window.location.href); return; }
      setUser(u);
      await load();
    })();
  }, []);

  const load = async () => {
    setLoading(true);
    setCats(await base44.entities.Category.list('sort_order'));
    setLoading(false);
  };

  const openCreate = (parentId = '') => {
    setEditCat(null);
    setForm({ name: '', slug: '', description: '', parent_id: parentId, sort_order: 0, is_active: true });
    setShowForm(true);
  };

  const openEdit = (c) => {
    setEditCat(c);
    setForm({ name: c.name, slug: c.slug || '', description: c.description || '', parent_id: c.parent_id || '', sort_order: c.sort_order || 0, is_active: c.is_active !== false });
    setShowForm(true);
  };

  const handleSave = async () => {
    const data = { ...form, slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-'), sort_order: Number(form.sort_order) };
    if (!data.parent_id) delete data.parent_id;
    if (editCat) await base44.entities.Category.update(editCat.id, data);else
    await base44.entities.Category.create(data);
    setShowForm(false);
    await load();
  };

  const toggle = async (c) => {
    await base44.entities.Category.update(c.id, { is_active: !c.is_active });
    await load();
  };

  const deleteCategory = async (c) => {
    if (!window.confirm(`Delete "${c.name}"? This cannot be undone.`)) return;
    await base44.entities.Category.delete(c.id);
    await load();
  };

  // Separate parents and children
  const parents = cats.filter((c) => !c.parent_id);
  const childrenOf = (parentId) => cats.filter((c) => c.parent_id === parentId);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <AdminSidebar user={user} />
      <div className="flex-1 overflow-auto">
        <div className="px-6 py-8 max-w-2xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest">Inventory</p>
              <h1 className="font-tactical text-4xl text-white">Categories</h1>
            </div>
            <button onClick={() => openCreate()} style={{ background: '#ff6b00', border: '1px solid #ff6b00', color: '#fff', fontWeight: 700 }} className="px-5 py-3 text-xs font-mono-ui uppercase tracking-widest flex items-center gap-2 cursor-pointer">
              <Plus className="w-4 h-4" /> New Category
            </button>
          </div>

          {loading ?
          <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="card-tactical h-14 animate-pulse" />)}</div> :
          <div className="space-y-4">
              {parents.map((parent) =>
            <div key={parent.id}>
                  {/* Parent row */}
                  <div className="card-tactical flex items-center justify-between px-4 py-4 gap-4 border-l-2 border-[#ff6b00]">
                    <div className="flex-1 min-w-0">
                      <p className="font-tactical text-xl text-white">{parent.name}</p>
                      <p className="font-mono-ui text-[10px] text-[#555]">{parent.slug || '—'}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => openCreate(parent.id)}
                  style={{ background: '#1c1c1c', border: '1px solid #444', color: '#d0d0d0', fontWeight: 600, cursor: 'pointer' }}
                  className="px-3 py-1.5 font-mono-ui text-[10px] uppercase tracking-wider flex items-center gap-1">
                        <Plus className="w-3 h-3" /> Sub
                      </button>
                      <button onClick={() => openEdit(parent)} style={{ background: '#1c1c1c', border: '1px solid #444', color: '#d0d0d0', cursor: 'pointer' }} className="p-2"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => toggle(parent)} className={`transition-colors ${parent.is_active !== false ? 'text-green-400 hover:text-red-400' : 'text-[#444] hover:text-green-400'}`}>
                        {parent.is_active !== false ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                      </button>
                      <button onClick={() => deleteCategory(parent)} style={{ background: 'transparent', border: '1px solid #ff0000', color: '#ff0000', cursor: 'pointer' }} className="p-2"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>

                  {/* Children */}
                  {childrenOf(parent.id).map((child) =>
              <div key={child.id} className="card-tactical flex items-center justify-between px-4 py-3 gap-4 ml-6 border-l border-[#2a2a2a] mt-1">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <ChevronRight className="w-3 h-3 text-[#444] flex-shrink-0" />
                        <div>
                          <p className="font-tactical text-base text-[#ccc]">{child.name}</p>
                          <p className="font-mono-ui text-[10px] text-[#444]">{child.slug || '—'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={() => openEdit(child)} style={{ background: '#1c1c1c', border: '1px solid #444', color: '#d0d0d0', cursor: 'pointer' }} className="p-2"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => toggle(child)} className={`transition-colors ${child.is_active !== false ? 'text-green-400 hover:text-red-400' : 'text-[#444] hover:text-green-400'}`}>
                          {child.is_active !== false ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                        </button>
                        <button onClick={() => deleteCategory(child)} style={{ background: 'transparent', border: '1px solid #ff0000', color: '#ff0000', cursor: 'pointer' }} className="p-2"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
              )}
                </div>
            )}

              {/* Orphan subcategories (shouldn't happen but just in case) */}
              {cats.filter((c) => c.parent_id && !cats.find((p) => p.id === c.parent_id)).map((c) =>
            <div key={c.id} className="card-tactical flex items-center justify-between px-4 py-3 gap-4 opacity-50">
                  <p className="font-mono-ui text-xs text-[#888]">{c.name} (orphan)</p>
                  <button onClick={() => openEdit(c)} className="btn-glow-white p-2"><Edit2 className="w-3.5 h-3.5" /></button>
                </div>
            )}

              {cats.length === 0 && <p className="font-mono-ui text-[#333] text-xs text-center py-12">No categories yet.</p>}
            </div>
          }
        </div>
      </div>

      <AnimatePresence>
        {showForm &&
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={() => setShowForm(false)}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-sm bg-[#111] border border-[#333]">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#222]">
                <h2 className="font-tactical text-2xl text-white">{editCat ? 'Edit Category' : 'New Category'}</h2>
                <button onClick={() => setShowForm(false)} className="text-[#555] hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-5 space-y-3">
                <div>
                  <label className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest block mb-1">Name *</label>
                  <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full bg-[#0a0a0a] border border-[#333] text-white font-mono-ui text-sm px-3 py-2.5 focus:outline-none focus:border-[#ff6b00]/60"
                placeholder="e.g. Rashguards" />
                </div>
                <div>
                  <label className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest block mb-1">Parent Category</label>
                  <select value={form.parent_id} onChange={(e) => setForm((f) => ({ ...f, parent_id: e.target.value }))}
                className="w-full bg-[#0a0a0a] border border-[#333] text-white font-mono-ui text-sm px-3 py-2.5 focus:outline-none focus:border-[#ff6b00]/60">
                    <option value="">— None (top-level) —</option>
                    {cats.filter((c) => !c.parent_id && c.id !== editCat?.id).map((p) =>
                  <option key={p.id} value={p.id}>{p.name}</option>
                  )}
                  </select>
                </div>
                <div>
                  <label className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest block mb-1">Slug (auto if empty)</label>
                  <input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                className="w-full bg-[#0a0a0a] border border-[#333] text-white font-mono-ui text-sm px-3 py-2.5 focus:outline-none focus:border-[#ff6b00]/60"
                placeholder="rashguards" />
                </div>
                <div>
                  <label className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest block mb-1">Sort Order</label>
                  <input type="number" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))}
                className="w-full bg-[#0a0a0a] border border-[#333] text-white font-mono-ui text-sm px-3 py-2.5 focus:outline-none focus:border-[#ff6b00]/60" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowForm(false)} className="bg-red-600 text-slate-50 py-3 text-xs font-mono-ui uppercase tracking-widest btn-glow-white flex-1">Cancel</button>
                  <button onClick={handleSave} className="bg-green-500 text-slate-50 py-3 text-xs font-mono-ui uppercase tracking-widest btn-glow-orange flex-1">Save</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}