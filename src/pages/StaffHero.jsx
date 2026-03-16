import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import AdminSidebar from '@/components/cp/AdminSidebar';
import { Plus, Trash2, X, ImagePlus, ChevronUp, ChevronDown, Eye, EyeOff } from 'lucide-react';
import ImagePositioner from '@/components/cp/ImagePositioner';

export default function StaffHero() {
  const [user, setUser] = useState(null);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', subtitle: '', image_url: '', image_position: '50% 50%', cta_label: 'Shop Now', cta_href: '#gear', sort_order: 0, is_active: true });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    (async () => {
      const u = await base44.auth.me();
      setUser(u);
      await load();
    })();
  }, []);

  const load = async () => {
    setLoading(true);
    const b = await base44.entities.HeroBanner.list('sort_order', 50);
    setBanners(b);
    setLoading(false);
  };

  const openCreate = () => {
    setForm({ title: '', subtitle: '', image_url: '', image_position: '50% 50%', cta_label: 'Shop Now', cta_href: '#gear', sort_order: banners.length, is_active: true });
    setShowForm(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, image_url: file_url }));
    setUploading(false);
    e.target.value = '';
  };

  const handleSave = async () => {
    if (!form.image_url) return;
    await base44.entities.HeroBanner.create({ ...form, sort_order: Number(form.sort_order) });
    setShowForm(false);
    await load();
  };

  const toggleActive = async (b) => {
    await base44.entities.HeroBanner.update(b.id, { is_active: !b.is_active });
    await load();
  };

  const deleteBanner = async (id) => {
    if (!window.confirm('Delete this banner?')) return;
    await base44.entities.HeroBanner.delete(id);
    await load();
  };

  const moveUp = async (b, i) => {
    if (i === 0) return;
    const prev = banners[i - 1];
    await Promise.all([
      base44.entities.HeroBanner.update(b.id, { sort_order: prev.sort_order }),
      base44.entities.HeroBanner.update(prev.id, { sort_order: b.sort_order }),
    ]);
    await load();
  };

  const moveDown = async (b, i) => {
    if (i === banners.length - 1) return;
    const next = banners[i + 1];
    await Promise.all([
      base44.entities.HeroBanner.update(b.id, { sort_order: next.sort_order }),
      base44.entities.HeroBanner.update(next.id, { sort_order: b.sort_order }),
    ]);
    await load();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <AdminSidebar user={user} />
      <div className="flex-1 overflow-auto">
        <div className="px-6 py-8 max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest">Storefront</p>
              <h1 className="font-tactical text-4xl text-white">Hero Banners</h1>
            </div>
            <button onClick={openCreate} className="px-5 py-3 text-xs font-mono-ui uppercase tracking-widest bg-[#ff8c00] text-black font-bold hover:bg-[#ffa020] flex items-center gap-2 transition-all">
              <Plus className="w-4 h-4" /> Add Banner
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="card-tactical h-24 animate-pulse" />)}</div>
          ) : (
            <div className="space-y-3">
              {banners.map((b, i) => (
                <div key={b.id} className={`card-tactical flex gap-4 items-center p-3 ${!b.is_active ? 'opacity-40' : ''}`}>
                  <div className="w-24 h-16 flex-shrink-0 bg-[#0d0d0d] overflow-hidden border border-[#222]">
                    {b.image_url ? <img src={b.image_url} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-tactical text-lg text-white truncate">{b.title || <span className="text-[#444]">No title</span>}</p>
                    <p className="font-mono-ui text-[10px] text-[#555] truncate">{b.subtitle}</p>
                    <p className="font-mono-ui text-[9px] text-[#333] mt-0.5">CTA: {b.cta_label} → {b.cta_href}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex flex-col gap-0.5">
                      <button onClick={() => moveUp(b, i)} disabled={i === 0} className="p-1 text-[#555] hover:text-white disabled:opacity-20 transition-colors">
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => moveDown(b, i)} disabled={i === banners.length - 1} className="p-1 text-[#555] hover:text-white disabled:opacity-20 transition-colors">
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button onClick={() => toggleActive(b)} title={b.is_active ? 'Hide' : 'Show'}
                      className="p-2 border border-[#333] text-[#555] hover:text-white hover:border-[#555] transition-all">
                      {b.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button onClick={() => deleteBanner(b.id)}
                      className="p-2 border border-[#ff0000]/30 text-[#ff0000]/60 hover:border-[#ff0000] hover:text-[#ff0000] transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {banners.length === 0 && (
                <div className="text-center py-16 card-tactical">
                  <p className="font-mono-ui text-[#333] text-sm">No banners yet. Add one to replace the default hero.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowForm(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md bg-[#111] border border-[#333] max-h-[90vh] overflow-y-auto scrollbar-tactical">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#222]">
                <h2 className="font-tactical text-2xl text-white">New Banner</h2>
                <button onClick={() => setShowForm(false)} className="text-[#555] hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-5 space-y-4">
                {/* Image upload */}
                <div>
                  <label className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest block mb-2">Hero Image *</label>
                  {form.image_url ? (
                    <div className="mb-2 space-y-2">
                      <ImagePositioner
                        imageUrl={form.image_url}
                        position={form.image_position}
                        onChange={(pos) => setForm(f => ({ ...f, image_position: pos }))}
                      />
                      <button onClick={() => setForm(f => ({ ...f, image_url: '', image_position: '50% 50%' }))}
                        className="font-mono-ui text-[10px] text-[#ff0000]/60 hover:text-[#ff0000] uppercase tracking-widest flex items-center gap-1 transition-colors">
                        <X className="w-3 h-3" /> Remove image
                      </button>
                    </div>
                  ) : (
                    <label className={`flex items-center gap-2 w-full border border-dashed border-[#444] px-4 py-6 font-mono-ui text-xs text-[#555] hover:border-[#ff8c00]/60 hover:text-[#ff8c00] transition-colors cursor-pointer justify-center ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                      <ImagePlus className="w-5 h-5" />
                      {uploading ? 'Uploading...' : 'Click to upload banner image'}
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                    </label>
                  )}
                </div>

                {[
                  { key: 'title', label: 'Title (large text)', placeholder: 'OG Collection' },
                  { key: 'subtitle', label: 'Subtitle (small text above)', placeholder: 'New Drop' },
                  { key: 'cta_label', label: 'Button Text', placeholder: 'Shop Now' },
                  { key: 'cta_href', label: 'Button Link', placeholder: '#gear or https://...' },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest block mb-1">{label}</label>
                    <input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full bg-[#0a0a0a] border border-[#333] text-white font-mono-ui text-sm px-3 py-2.5 focus:outline-none focus:border-[#ff8c00]/60" />
                  </div>
                ))}

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowForm(false)} className="flex-1 py-3 border border-[#333] text-[#555] font-mono-ui text-xs uppercase tracking-widest hover:border-[#555] hover:text-white transition-all">Cancel</button>
                  <button onClick={handleSave} disabled={!form.image_url}
                    className="flex-1 py-3 bg-[#ff8c00] text-black font-bold font-mono-ui text-xs uppercase tracking-widest hover:bg-[#ffa020] disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                    Add Banner
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}