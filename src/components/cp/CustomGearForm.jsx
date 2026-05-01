import React, { useState, useRef } from 'react';
import { Send, Upload, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const CATEGORIES = [
  { value: 'Rashguard', label: 'Rashguard', moq: '10 pcs minimum' },
  { value: 'Grappling Shorts', label: 'Grappling Shorts', moq: '10 pcs minimum' },
  { value: 'Gi', label: 'Gi', moq: '5 pcs per color minimum' },
  { value: 'Dri-fit Shirt', label: 'Dri-fit Shirt', moq: '10 pcs minimum' },
  { value: 'Sleeveless', label: 'Sleeveless', moq: '10 pcs minimum' },
  { value: 'Rollup Mats', label: 'Rollup Mats', moq: '10 sqm minimum' },
  { value: 'Other', label: 'Other', moq: '' },
];

const GI_STANDARD_COLORS = ['White', 'Blue', 'Black'];

const FIELD_CLS = "w-full bg-[#111] border border-[#333] text-white font-mono-ui text-sm px-4 py-3 focus:outline-none focus:border-[#4f8ef7]/60 placeholder-[#444]";
const LABEL_CLS = "font-mono-ui text-[10px] text-[#666] uppercase tracking-widest block mb-1.5";

export default function CustomGearForm({ onSuccess }) {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', category: '',
    details: '', rashguard_sleeve: '', shorts_slit: '',
    gi_colors: [], gi_color_request: '',
    color_hex: '#4f8ef7', quantity: '', mat_sqm: '',
    design_image_url: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const fileRef = useRef();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleGiColor = (c) => set('gi_colors', form.gi_colors.includes(c) ? form.gi_colors.filter(x => x !== c) : [...form.gi_colors, c]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImg(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    set('design_image_url', file_url);
    setUploadingImg(false);
    e.target.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await base44.entities.CustomRequest.create({
      name: form.name,
      email: form.email,
      phone: form.phone,
      category: form.category,
      details: form.details,
      rashguard_sleeve: form.rashguard_sleeve || undefined,
      shorts_slit: form.shorts_slit || undefined,
      gi_colors: form.gi_colors.length ? form.gi_colors : undefined,
      gi_color_request: form.gi_color_request || undefined,
      color_hex: form.color_hex,
      quantity: form.quantity ? Number(form.quantity) : undefined,
      mat_sqm: form.mat_sqm ? Number(form.mat_sqm) : undefined,
      design_image_url: form.design_image_url || undefined,
      status: 'New',
    });
    setSubmitting(false);
    if (onSuccess) onSuccess();
  };

  const cat = form.category;
  const catInfo = CATEGORIES.find(c => c.value === cat);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Contact Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className={LABEL_CLS}>Your Name *</label>
          <input required value={form.name} onChange={e => set('name', e.target.value)}
            placeholder="Juan Dela Cruz" className={FIELD_CLS} />
        </div>
        <div>
          <label className={LABEL_CLS}>Email *</label>
          <input required type="email" value={form.email} onChange={e => set('email', e.target.value)}
            placeholder="you@email.com" className={FIELD_CLS} />
        </div>
        <div>
          <label className={LABEL_CLS}>Phone</label>
          <input value={form.phone} onChange={e => set('phone', e.target.value)}
            placeholder="09XX XXX XXXX" className={FIELD_CLS} />
        </div>
      </div>

      {/* Category */}
      <div>
        <label className={LABEL_CLS}>What do you want to customize? *</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CATEGORIES.map(c => (
            <button key={c.value} type="button" onClick={() => set('category', c.value)}
              className={`px-3 py-2.5 border font-mono-ui text-xs text-left transition-all ${
                cat === c.value
                  ? 'border-[#4f8ef7] bg-[#4f8ef7]/10 text-[#4f8ef7]'
                  : 'border-[#333] text-[#666] hover:border-[#555] hover:text-white'
              }`}>
              <span className="block font-bold">{c.label}</span>
              {c.moq && <span className="text-[9px] opacity-60">{c.moq}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Category-specific options */}
      {cat === 'Rashguard' && (
        <div>
          <label className={LABEL_CLS}>Sleeve Style *</label>
          <div className="flex gap-2">
            {['Long Sleeve', 'Short Sleeve'].map(s => (
              <button key={s} type="button" onClick={() => set('rashguard_sleeve', s)}
                className={`flex-1 py-3 border font-mono-ui text-xs uppercase tracking-widest transition-all ${
                  form.rashguard_sleeve === s ? 'border-[#4f8ef7] bg-[#4f8ef7]/10 text-[#4f8ef7]' : 'border-[#333] text-[#666] hover:border-[#555] hover:text-white'
                }`}>{s}</button>
            ))}
          </div>
        </div>
      )}

      {cat === 'Grappling Shorts' && (
        <div>
          <label className={LABEL_CLS}>Slit Option *</label>
          <div className="flex gap-2">
            {['With Slit', 'No Slit'].map(s => (
              <button key={s} type="button" onClick={() => set('shorts_slit', s)}
                className={`flex-1 py-3 border font-mono-ui text-xs uppercase tracking-widest transition-all ${
                  form.shorts_slit === s ? 'border-[#4f8ef7] bg-[#4f8ef7]/10 text-[#4f8ef7]' : 'border-[#333] text-[#666] hover:border-[#555] hover:text-white'
                }`}>{s}</button>
            ))}
          </div>
        </div>
      )}

      {cat === 'Gi' && (
        <div className="space-y-3">
          <div>
            <label className={LABEL_CLS}>Gi Color(s) — min. 5 pcs per color *</label>
            <div className="flex gap-2">
              {GI_STANDARD_COLORS.map(c => (
                <button key={c} type="button" onClick={() => toggleGiColor(c)}
                  className={`flex-1 py-2.5 border font-mono-ui text-xs uppercase tracking-widest transition-all ${
                    form.gi_colors.includes(c) ? 'border-[#4f8ef7] bg-[#4f8ef7]/10 text-[#4f8ef7]' : 'border-[#333] text-[#666] hover:border-[#555] hover:text-white'
                  }`}>{c}</button>
              ))}
            </div>
          </div>
          <div>
            <label className={LABEL_CLS}>Other Color Request (subject to approval)</label>
            <input value={form.gi_color_request} onChange={e => set('gi_color_request', e.target.value)}
              placeholder="e.g. Red, Navy Blue, Forest Green..." className={FIELD_CLS} />
          </div>
        </div>
      )}

      {cat === 'Rollup Mats' && (
        <div>
          <label className={LABEL_CLS}>Area in sqm * (min. 10 sqm · ₱2,350/sqm for 4cm thickness · min. 1 sqm custom print)</label>
          <input type="number" min="10" value={form.mat_sqm} onChange={e => set('mat_sqm', e.target.value)}
            placeholder="e.g. 20" className={FIELD_CLS} />
        </div>
      )}

      {/* Color Picker — shown for apparel */}
      {cat && cat !== 'Rollup Mats' && cat !== 'Gi' && (
        <div>
          <label className={LABEL_CLS}>Primary Color</label>
          <div className="flex items-center gap-4">
            <input type="color" value={form.color_hex} onChange={e => set('color_hex', e.target.value)}
              className="w-14 h-12 border-0 bg-transparent cursor-pointer rounded" />
            <div className="flex-1 bg-[#111] border border-[#333] px-4 py-3 font-mono-ui text-sm text-white">
              {form.color_hex.toUpperCase()}
            </div>
            <div className="w-12 h-12 border border-[#333] flex-shrink-0" style={{ backgroundColor: form.color_hex }} />
          </div>
          <p className="font-mono-ui text-[10px] text-[#444] mt-1">Use the color picker or drag to select your exact color</p>
        </div>
      )}

      {/* Quantity */}
      {cat && cat !== 'Rollup Mats' && (
        <div>
          <label className={LABEL_CLS}>
            Quantity *
            {catInfo?.moq && <span className="ml-2 text-[#4f8ef7]">({catInfo.moq})</span>}
          </label>
          <input type="number" min="1" value={form.quantity} onChange={e => set('quantity', e.target.value)}
            placeholder="e.g. 15" className={FIELD_CLS} />
        </div>
      )}

      {/* Details */}
      <div>
        <label className={LABEL_CLS}>Design Details & Notes</label>
        <textarea value={form.details} onChange={e => set('details', e.target.value)} rows={4}
          placeholder="Team name, logo placement, text, special instructions..."
          className={`${FIELD_CLS} resize-none`} />
      </div>

      {/* Design Upload */}
      <div>
        <label className={LABEL_CLS}>Upload Design / Reference Image (optional)</label>
        {form.design_image_url ? (
          <div className="relative w-32 h-32 border border-[#4f8ef7] overflow-hidden">
            <img src={form.design_image_url} className="w-full h-full object-cover" alt="design" />
            <button type="button" onClick={() => set('design_image_url', '')}
              className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-0.5">
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <label className={`flex items-center gap-2 border border-dashed border-[#444] px-4 py-3 font-mono-ui text-xs text-[#555] hover:border-[#4f8ef7]/60 hover:text-[#4f8ef7] transition-colors cursor-pointer ${uploadingImg ? 'opacity-50 pointer-events-none' : ''}`}>
            <Upload className="w-4 h-4" />
            {uploadingImg ? 'Uploading...' : 'Click to upload image'}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
        )}
      </div>

      <button type="submit" disabled={submitting || !form.category}
        style={{ background: '#4f8ef7', color: '#000', border: '1px solid #4f8ef7', fontWeight: 700 }}
        className="w-full py-4 font-mono-ui text-xs tracking-[0.3em] uppercase flex items-center justify-center gap-2 transition-all hover:bg-[#ffa020] disabled:opacity-40 disabled:cursor-not-allowed rounded-sm">
        <Send className="w-4 h-4" />
        {submitting ? 'Sending...' : 'Submit Custom Request'}
      </button>
    </form>
  );
}