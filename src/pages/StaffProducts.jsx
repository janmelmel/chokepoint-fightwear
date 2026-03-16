import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import AdminSidebar from '@/components/cp/AdminSidebar';
import ProductPreviewModal from '@/components/cp/ProductPreviewModal';
import { Plus, Eye, Archive, Edit2, CheckCircle, Clock, X, Trash2, ImagePlus, XCircle, Copy, Star } from 'lucide-react';

const GI_SIZE_GROUPS = [
  { label: 'Adult & Unisex (A-Sizes)', sizes: ['A00','A0','A1','A2','A3','A4','A5','A6','A0L','A1L','A2L','A3L','A4L','A0H','A1H','A2H','A3H','A4H','A1S','A2S','A3S'] },
  { label: 'Female (F/W Sizes)', sizes: ['F0','F1','F2','F3','F4','F5'] },
  { label: 'Kids M-Series (Mini)', sizes: ['M0000','M000','M00','M0','M1','M2','M3','M4','M5'] },
  { label: 'Kids K-Series', sizes: ['K00','K0','K1','K2','K3','K4'] },
  { label: 'Kids C-Series (Children)', sizes: ['C000','C00','C0','C1','C2','C3'] },
  { label: 'Kids Y-Series (Youth)', sizes: ['Y0','Y1','Y2','Y3'] },
];

const NOGI_SIZE_GROUPS = [
  { label: 'Unisex', sizes: ['XS','S','M','L','XL','XXL','2XL','3XL','4XL','5XL'] },
  { label: 'Kids', sizes: ['KXS','KS','KM','KL','KXL'] },
];

const DEFAULT_SIZE_GROUPS = [
  { label: 'Sizes', sizes: ['XS','S','M','L','XL','XXL','2XL','3XL'] },
];

const STATUS_STYLE = {
  'Draft': 'text-[#555] border-[#333]',
  'Pending Review': 'text-yellow-400 border-yellow-400/30',
  'Live': 'text-green-400 border-green-400/30'
};

export default function StaffProducts() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [previewProduct, setPreviewProduct] = useState(null);
  const [form, setForm] = useState({
    name: '', category_id: '', price: '', description: '',
    images: [], status: 'Draft', is_preorder: false, is_featured: false,
    stock_limit: 0, sizes: [], edition: ''
  });

  useEffect(() => {
    (async () => {
      const u = await base44.auth.me();
      setUser(u);
      await loadData();
    })();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [p, c] = await Promise.all([
    base44.entities.Product.filter({ is_archived: false }),
    base44.entities.Category.list()]
    );
    const catMap = Object.fromEntries(c.map((cat) => [cat.id, cat.name]));
    setProducts(p.map((prod) => ({ ...prod, category_name: catMap[prod.category_id] || '—' })));
    setCategories(c);
    setLoading(false);
  };

  const isAdmin = user?.role === 'admin';

  const openCreate = () => {
    setEditProduct(null);
    setForm({ name: '', category_id: '', price: '', description: '', images: [], status: 'Draft', is_preorder: false, stock_limit: 0, sizes: [], edition: '' });
    setShowForm(true);
  };

  const openEdit = (p) => {
    setEditProduct(p);
    setForm({ name: p.name, category_id: p.category_id || '', price: p.price, description: p.description || '', images: p.images || [], status: p.status, is_preorder: !!p.is_preorder, is_featured: !!p.is_featured, stock_limit: p.stock_limit || 0, sizes: p.sizes || [], edition: p.edition || '' });
    setShowForm(true);
  };

  const handleSave = async () => {
    const data = { ...form, price: Number(form.price), stock_limit: Number(form.stock_limit) };
    if (editProduct) await base44.entities.Product.update(editProduct.id, data);else
    await base44.entities.Product.create(data);
    setShowForm(false);
    await loadData();
  };

  const archive = async (id) => {
    await base44.entities.Product.update(id, { is_archived: true });
    await loadData();
  };

  const approve = async (id) => {
    await base44.entities.Product.update(id, { status: 'Live' });
    await loadData();
  };

  const duplicateProduct = (p) => {
    setEditProduct(null);
    setForm({
      name: p.name + ' (Copy)',
      category_id: p.category_id || '',
      price: p.price,
      description: p.description || '',
      images: p.images || [],
      status: 'Draft',
      is_preorder: !!p.is_preorder,
      is_featured: false,
      stock_limit: p.stock_limit || 0,
      sizes: p.sizes || [],
      edition: p.edition || '',
    });
    setShowForm(true);
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Permanently delete this product? This cannot be undone.')) return;
    await base44.entities.Product.delete(id);
    await loadData();
  };

  const toggleSize = (s) => setForm((f) => ({ ...f, sizes: f.sizes.includes(s) ? f.sizes.filter((x) => x !== s) : [...f.sizes, s] }));

  const getSizeGroups = () => {
    const cat = categories.find(c => c.id === form.category_id);
    if (!cat) return DEFAULT_SIZE_GROUPS;
    const name = cat.name.toLowerCase();
    if (name.includes('gi') && !name.includes('no')) return GI_SIZE_GROUPS;
    if (name.includes('no-gi') || name.includes('no gi') || name.includes('nogi')) return NOGI_SIZE_GROUPS;
    return DEFAULT_SIZE_GROUPS;
  };

  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploadingImage(true);
    const urls = await Promise.all(files.map(async (file) => {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      return file_url;
    }));
    setForm((f) => ({ ...f, images: [...f.images, ...urls] }));
    setUploadingImage(false);
    e.target.value = '';
  };

  const removeImage = (idx) => setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <AdminSidebar user={user} />
      <div className="flex-1 overflow-auto">
        <div className="px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest">Inventory</p>
              <h1 className="font-tactical text-4xl text-white">Products</h1>
            </div>
            <button onClick={openCreate} className="bg-[#1a0505] text-slate-50 px-5 py-3 text-xs font-mono-ui uppercase tracking-widest btn-glow-orange flex items-center gap-2">
              <Plus className="w-4 h-4" /> New Product
            </button>
          </div>

          {loading ?
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => <div key={i} className="card-tactical h-48 animate-pulse" />)}
            </div> :

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((p) =>
            <div key={p.id} className="card-tactical overflow-hidden">
                  <div className="aspect-video bg-[#0d0d0d] relative">
                    {p.images?.[0] ?
                <img src={p.images[0]} className="w-full h-full object-cover opacity-70" /> :
                <div className="w-full h-full flex items-center justify-center"><span className="font-tactical text-4xl text-[#1a1a1a]">CP</span></div>}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-mono-ui text-[10px] text-[#555] truncate">{p.category_name}</p>
                        <p className="font-tactical text-lg text-white truncate">{p.name}</p>
                        <p className="font-mono-ui text-sm text-[#ff6b00] font-bold">₱{Number(p.price).toLocaleString()}</p>
                      </div>
                      <span className={`font-mono-ui text-[9px] uppercase tracking-wider border px-2 py-1 flex-shrink-0 ${STATUS_STYLE[p.status] || 'text-[#555] border-[#333]'}`}>
                        {p.status}
                      </span>
                    </div>
                    <div className="bg-transparent text-slate-50 mt-4 flex items-center gap-2">
                      <button
                        onClick={() => base44.entities.Product.update(p.id, { is_featured: !p.is_featured }).then(loadData)}
                        title={p.is_featured ? 'Remove from Featured' : 'Add to Featured'}
                        className={`p-2 flex-shrink-0 border transition-all ${p.is_featured ? 'border-[#ff6b00] text-[#ff6b00] bg-[#ff6b00]/10' : 'btn-glow-white'}`}>
                        <Star className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setPreviewProduct(p)} className="btn-glow-white p-2 flex-shrink-0" title="Preview">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => openEdit(p)} className="btn-glow-white p-2 flex-shrink-0" title="Edit">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => duplicateProduct(p)} className="btn-glow-white p-2 flex-shrink-0" title="Duplicate">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      {isAdmin && p.status === 'Pending Review' &&
                  <button onClick={() => approve(p.id)} className="btn-glow-orange flex-1 py-2 font-mono-ui text-[10px] tracking-widest uppercase flex items-center justify-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Approve
                        </button>
                  }
                      {!isAdmin && p.status === 'Draft' &&
                  <button onClick={() => base44.entities.Product.update(p.id, { status: 'Pending Review' }).then(loadData)}
                  className="btn-glow-white flex-1 py-2 font-mono-ui text-[10px] tracking-widest uppercase flex items-center justify-center gap-1">
                          <Clock className="w-3 h-3" /> Submit Review
                        </button>
                  }
                      <button onClick={() => archive(p.id)} className="btn-glow-white p-2 flex-shrink-0" title="Archive">
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                      {isAdmin &&
                  <button onClick={() => deleteProduct(p.id)} className="btn-glow-red p-2 flex-shrink-0" title="Delete permanently">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                  }
                    </div>
                  </div>
                </div>
            )}
              {products.length === 0 &&
            <div className="col-span-full text-center py-20">
                  <p className="font-mono-ui text-[#333] text-sm">No products. Create one to get started.</p>
                </div>
            }
            </div>
          }
        </div>
      </div>

      {/* Product Form Modal */}
      <AnimatePresence>
        {showForm &&
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={() => setShowForm(false)}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg bg-[#111] border border-[#333] max-h-[90vh] overflow-y-auto scrollbar-tactical">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#222]">
                <h2 className="font-tactical text-2xl text-white">{editProduct ? 'Edit Product' : 'New Product'}</h2>
                <button onClick={() => setShowForm(false)} className="text-[#555] hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest block mb-1">Product Name *</label>
                    <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full bg-[#0a0a0a] border border-[#333] text-white font-mono-ui text-sm px-3 py-2.5 focus:outline-none focus:border-[#ff8c00]/60"
                  placeholder="e.g. No Gi Rashguard V3" />
                  </div>
                  <div>
                    <label className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest block mb-1">Price (₱) *</label>
                    <input type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  className="w-full bg-[#0a0a0a] border border-[#333] text-white font-mono-ui text-sm px-3 py-2.5 focus:outline-none focus:border-[#ff8c00]/60"
                  placeholder="1899" />
                  </div>
                  <div>
                    <label className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest block mb-1">Category</label>
                    <select value={form.category_id} onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value, sizes: [] }))}
                  className="w-full bg-[#0a0a0a] border border-[#333] text-white font-mono-ui text-sm px-3 py-2.5 focus:outline-none focus:border-[#ff8c00]/60">
                      <option value="">None</option>
                      {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest block mb-1">Status</label>
                    <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                  disabled={!isAdmin && editProduct?.status === 'Live'}
                  className="w-full bg-[#0a0a0a] border border-[#333] text-white font-mono-ui text-sm px-3 py-2.5 focus:outline-none focus:border-[#ff8c00]/60 disabled:opacity-50">
                      <option>Draft</option>
                      <option>Pending Review</option>
                      {isAdmin && <option>Live</option>}
                    </select>
                  </div>
                  <div>
                    <label className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest block mb-1">Stock Limit (0=unlimited)</label>
                    <input type="number" value={form.stock_limit} onChange={(e) => setForm((f) => ({ ...f, stock_limit: e.target.value }))}
                  className="w-full bg-[#0a0a0a] border border-[#333] text-white font-mono-ui text-sm px-3 py-2.5 focus:outline-none focus:border-[#ff8c00]/60" />
                  </div>
                  <div className="col-span-2">
                    <label className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest block mb-1">Edition / Tag</label>
                    <input value={form.edition} onChange={(e) => setForm((f) => ({ ...f, edition: e.target.value }))}
                  className="w-full bg-[#0a0a0a] border border-[#333] text-white font-mono-ui text-sm px-3 py-2.5 focus:outline-none focus:border-[#ff8c00]/60"
                  placeholder="e.g. Limited Edition, National Series" />
                  </div>
                  <div className="col-span-2">
                    <label className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest block mb-2">Images</label>
                    {form.images.length > 0 &&
                  <div className="flex flex-wrap gap-2 mb-2">
                        {form.images.map((url, idx) =>
                    <div key={idx} className={`relative group w-20 h-20 border overflow-hidden ${idx === 0 ? 'border-[#ff8c00]' : 'border-[#333]'}`}>
                            <img src={url} className="w-full h-full object-cover opacity-80" />
                            {idx === 0 && (
                              <span className="absolute bottom-0 left-0 right-0 font-mono-ui text-[8px] text-center bg-[#ff8c00] text-black py-0.5 uppercase tracking-wider">Cover</span>
                            )}
                            {idx !== 0 && (
                              <button type="button" title="Set as cover"
                                onClick={() => setForm(f => ({ ...f, images: [url, ...f.images.filter((_, i) => i !== idx)] }))}
                                className="absolute bottom-0 left-0 right-0 font-mono-ui text-[8px] text-center bg-black/70 text-[#ff8c00] py-0.5 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                                Set Cover
                              </button>
                            )}
                            <button type="button" onClick={() => removeImage(idx)}
                      className="absolute top-0.5 right-0.5 text-white bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                    )}
                      </div>
                  }
                    <label className={`flex items-center gap-2 w-full border border-dashed border-[#444] px-4 py-3 font-mono-ui text-xs text-[#555] hover:border-[#ff8c00]/60 hover:text-[#ff8c00] transition-colors cursor-pointer ${uploadingImage ? 'opacity-50 pointer-events-none' : ''}`}>
                      <ImagePlus className="w-4 h-4" />
                      {uploadingImage ? 'Uploading...' : 'Click to upload image(s)'}
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                    </label>
                  </div>
                  <div className="col-span-2">
                    <label className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest block mb-1">Description</label>
                    <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3} className="w-full bg-[#0a0a0a] border border-[#333] text-white font-mono-ui text-sm px-3 py-2.5 focus:outline-none focus:border-[#ff8c00]/60 resize-none" />
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center justify-between mb-2">
                      <label className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest">Available Sizes</label>
                      {form.sizes.length > 0 && (
                        <button type="button" onClick={() => setForm(f => ({ ...f, sizes: [] }))}
                          className="font-mono-ui text-[9px] text-[#555] hover:text-[#ff0000] uppercase tracking-wider transition-colors">
                          Clear all
                        </button>
                      )}
                    </div>
                    <div className="space-y-3">
                      {getSizeGroups().map(group => (
                        <div key={group.label}>
                          <p className="font-mono-ui text-[9px] text-[#444] uppercase tracking-widest mb-1.5">{group.label}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {group.sizes.map(s => (
                              <button key={s} type="button" onClick={() => toggleSize(s)}
                                className={`px-2.5 py-1 font-mono-ui text-[10px] border transition-all ${form.sizes.includes(s) ? 'border-[#ff8c00] bg-[#ff8c00]/10 text-[#ff8c00]' : 'border-[#333] text-[#555] hover:border-[#555]'}`}>
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center gap-6">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" id="preorder" checked={form.is_preorder}
                    onChange={(e) => setForm((f) => ({ ...f, is_preorder: e.target.checked }))}
                    className="accent-[#ff8c00]" />
                      <label htmlFor="preorder" className="font-mono-ui text-xs text-[#888] uppercase tracking-wider cursor-pointer">
                        Pre-Order
                      </label>
                    </div>
                    <div className="flex items-center gap-3">
                      <input type="checkbox" id="featured" checked={form.is_featured}
                    onChange={(e) => setForm((f) => ({ ...f, is_featured: e.target.checked }))}
                    className="accent-[#ff8c00]" />
                      <label htmlFor="featured" className="font-mono-ui text-xs text-[#ff6b00] uppercase tracking-wider cursor-pointer flex items-center gap-1">
                        <Star className="w-3 h-3" /> Featured
                      </label>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowForm(false)} className="bg-[#ff0000] text-[#ffffff] py-3 text-xs font-mono-ui uppercase tracking-widest rounded-[40px] btn-glow-white flex-1">Cancel</button>
                  <button onClick={handleSave} className="bg-[#21c700] text-zinc-100 py-3 text-xs font-mono-ui uppercase tracking-widest rounded-[40px] btn-glow-orange flex-1">
                    {editProduct ? 'Save Changes' : 'Create Product'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        }
      </AnimatePresence>

      <AnimatePresence>
        {previewProduct && <ProductPreviewModal product={previewProduct} onClose={() => setPreviewProduct(null)} />}
      </AnimatePresence>
    </div>);

}