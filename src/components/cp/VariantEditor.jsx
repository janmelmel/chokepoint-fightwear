import React, { useState } from 'react';
import { Plus, Trash2, ImagePlus, XCircle, GripVertical } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const NOGI_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL', '4XL', '5XL', 'KXS', 'KS', 'KM', 'KL', 'KXL'];

function newVariant() {
  return {
    id: `v_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: '',
    price: '',
    images: [],
    sizes: [],
  };
}

function VariantBlock({ variant, isPreorder, allSizes, onUpdate, onDelete, uploadingId, setUploadingId }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const toggleSize = (s) => {
    const exists = variant.sizes.find(vs => vs.size === s);
    if (exists) {
      onUpdate({ ...variant, sizes: variant.sizes.filter(vs => vs.size !== s) });
    } else {
      onUpdate({ ...variant, sizes: [...variant.sizes, { size: s, stock: '', available: true }] });
    }
  };

  const setStock = (s, val) => {
    onUpdate({
      ...variant,
      sizes: variant.sizes.map(vs => vs.size === s ? { ...vs, stock: val === '' ? '' : Number(val) } : vs),
    });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploadingId(variant.id);
    const urls = await Promise.all(files.map(async (file) => {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      return file_url;
    }));
    onUpdate({ ...variant, images: [...variant.images, ...urls] });
    setUploadingId(null);
    e.target.value = '';
  };

  const removeImage = (idx) => onUpdate({ ...variant, images: variant.images.filter((_, i) => i !== idx) });

  const isUploading = uploadingId === variant.id;
  const sizesToShow = allSizes.length > 0 ? allSizes : NOGI_SIZES;

  return (
    <div className="relative border border-[#333] bg-[#1a1a1a] rounded-lg border-l-4 border-l-[#ff6b00] p-4 space-y-4">
      {/* Delete */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-[#444] cursor-grab" />
          <p className="font-mono-ui text-[10px] text-[#ff6b00] uppercase tracking-widest">Variant</p>
        </div>
        {confirmDelete ? (
          <div className="flex items-center gap-2">
            <span className="font-mono-ui text-[10px] text-[#888]">Delete this variant?</span>
            <button onClick={onDelete} className="font-mono-ui text-[10px] text-[#ff0000] border border-[#ff0000]/30 px-2 py-0.5 hover:bg-[#ff0000]/10">Yes</button>
            <button onClick={() => setConfirmDelete(false)} className="font-mono-ui text-[10px] text-[#555] border border-[#333] px-2 py-0.5">Cancel</button>
          </div>
        ) : (
          <button onClick={() => setConfirmDelete(true)} className="text-[#444] hover:text-[#ff0000] transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Name + Price */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest block mb-1">Variant Name *</label>
          <input
            value={variant.name}
            onChange={e => onUpdate({ ...variant, name: e.target.value })}
            placeholder="e.g. Black Edition"
            className="w-full bg-[#0a0a0a] border border-[#333] text-white font-mono-ui text-sm px-3 py-2 focus:outline-none focus:border-[#ff8c00]/60"
          />
        </div>
        <div>
          <label className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest block mb-1">Price Override (₱)</label>
          <input
            type="number"
            value={variant.price}
            onChange={e => onUpdate({ ...variant, price: e.target.value })}
            placeholder="Inherits main price"
            className="w-full bg-[#0a0a0a] border border-[#333] text-white font-mono-ui text-sm px-3 py-2 focus:outline-none focus:border-[#ff8c00]/60"
          />
        </div>
      </div>

      {/* Images */}
      <div>
        <label className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest block mb-1">Variant Images (optional)</label>
        {variant.images.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {variant.images.map((url, idx) => (
              <div key={idx} className="relative group w-16 h-16 border border-[#333] overflow-hidden">
                <img src={url} className="w-full h-full object-cover opacity-80" alt="" />
                <button type="button" onClick={() => removeImage(idx)}
                  className="absolute top-0.5 right-0.5 text-white bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <XCircle className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        <label className={`flex items-center gap-2 border border-dashed border-[#333] px-3 py-2 font-mono-ui text-[10px] text-[#555] hover:border-[#ff8c00]/60 hover:text-[#ff8c00] transition-colors cursor-pointer ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
          <ImagePlus className="w-3.5 h-3.5" />
          {isUploading ? 'Uploading...' : 'Upload variant images'}
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={isUploading} />
        </label>
      </div>

      {/* Sizes + Stock */}
      <div>
        <label className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest block mb-2">
          Sizes {isPreorder ? '(Pre-order — no stock limit)' : '+ Stock'}
        </label>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {sizesToShow.map(s => {
            const active = variant.sizes.some(vs => vs.size === s);
            return (
              <button key={s} type="button" onClick={() => toggleSize(s)}
                className={`px-2.5 py-1 font-mono-ui text-[10px] border transition-all ${
                  active
                    ? 'border-[#ff8c00] bg-[#ff8c00]/10 text-[#ff8c00]'
                    : 'border-[#333] text-[#555] hover:border-[#555]'
                }`}>
                {s}
              </button>
            );
          })}
        </div>
        {!isPreorder && variant.sizes.length > 0 && (
          <div className="space-y-1.5 mt-2">
            {variant.sizes.map(vs => (
              <div key={vs.size} className="flex items-center gap-3">
                <span className="font-mono-ui text-[10px] text-[#888] w-10 flex-shrink-0">{vs.size}</span>
                <input
                  type="number"
                  min="0"
                  value={vs.stock === '' || vs.stock == null ? '' : vs.stock}
                  onChange={e => setStock(vs.size, e.target.value)}
                  placeholder="∞"
                  className="w-24 bg-[#0a0a0a] border border-[#333] text-white font-mono-ui text-xs px-2 py-1 focus:outline-none focus:border-[#ff8c00]/60"
                />
                <span className="font-mono-ui text-[9px] text-[#444]">units</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function VariantEditor({ variants, isPreorder, productSizes, onChange }) {
  const [uploadingId, setUploadingId] = useState(null);

  const addVariant = () => onChange([...variants, newVariant()]);
  const updateVariant = (idx, updated) => onChange(variants.map((v, i) => i === idx ? updated : v));
  const deleteVariant = (idx) => onChange(variants.filter((_, i) => i !== idx));

  return (
    <div className="col-span-2 space-y-3">
      <div className="flex items-center justify-between">
        <label className="font-mono-ui text-[10px] text-[#ff6b00] uppercase tracking-widest">Product Variants</label>
        <p className="font-mono-ui text-[9px] text-[#444]">{variants.length > 0 ? `${variants.length} variant${variants.length !== 1 ? 's' : ''}` : 'No variants — simple product'}</p>
      </div>

      {variants.length === 0 && (
        <p className="font-mono-ui text-[10px] text-[#444] border border-dashed border-[#222] px-4 py-3">
          No variants added. Add variants if this product comes in multiple colors, sizes, or configurations.
        </p>
      )}

      {variants.map((v, idx) => (
        <VariantBlock
          key={v.id}
          variant={v}
          isPreorder={isPreorder}
          allSizes={productSizes}
          onUpdate={(updated) => updateVariant(idx, updated)}
          onDelete={() => deleteVariant(idx)}
          uploadingId={uploadingId}
          setUploadingId={setUploadingId}
        />
      ))}

      <button type="button" onClick={addVariant}
        className="w-full py-2.5 border border-dashed border-[#ff6b00]/40 text-[#ff6b00] font-mono-ui text-[10px] uppercase tracking-widest hover:bg-[#ff6b00]/5 transition-colors flex items-center justify-center gap-2">
        <Plus className="w-3.5 h-3.5" /> Add Variant
      </button>
    </div>
  );
}