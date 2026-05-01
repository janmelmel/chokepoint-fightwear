import React, { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Edit2, Trash2, Upload, X, Move } from 'lucide-react';
import StaffGuard from '@/components/cp/StaffGuard';
import AdminSidebar from '@/components/cp/AdminSidebar';

export default function StaffAthletes() {
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: '', discipline: '', belt: '', location: '',
    achievements: [], image: '', quote: '', ig: '',
    sort_order: 0, is_active: true,
    imageFit: { scale: 1, offsetX: 50, offsetY: 50 },
  });
  const [uploadingImg, setUploadingImg] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [cropSize, setCropSize] = useState(200);
  const cropContainerRef = useRef(null);

  useEffect(() => {
    loadAthletes();
  }, []);

  const loadAthletes = async () => {
    setLoading(true);
    const data = await base44.entities.Athlete.list('sort_order', 100);
    setAthletes(data);
    setLoading(false);
  };

  const resetForm = () => {
    setForm({
      name: '', discipline: '', belt: '', location: '',
      achievements: [], image: '', quote: '', ig: '',
      sort_order: 0, is_active: true,
      imageFit: { cropX: 0, cropY: 0, cropWidth: 100 },
    });
    setEditingId(null);
    setShowCropModal(false);
  };

  const handleEdit = (athlete) => {
    const imageFit = athlete.imageFit || { cropX: 0, cropY: 0, cropWidth: 100 };
    setForm({
      name: athlete.name,
      discipline: athlete.discipline,
      belt: athlete.belt,
      location: athlete.location,
      achievements: Array.isArray(athlete.achievements) ? athlete.achievements : [],
      image: athlete.image || '',
      quote: athlete.quote || '',
      ig: athlete.ig || '',
      sort_order: athlete.sort_order || 0,
      is_active: athlete.is_active !== false,
      imageFit,
    });
    setCropX(0);
    setCropY(0);
    setCropSize(200);
    setEditingId(athlete.id);
    setShowForm(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImg(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm(f => ({ ...f, image: file_url, imageFit: { cropX: 0, cropY: 0, cropWidth: 100 } }));
      setCropX(0);
      setCropY(0);
      setCropSize(200);
      setShowCropModal(true);
    } finally {
      setUploadingImg(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await base44.entities.Athlete.update(editingId, form);
    } else {
      await base44.entities.Athlete.create(form);
    }
    loadAthletes();
    setShowForm(false);
    resetForm();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this athlete?')) return;
    await base44.entities.Athlete.delete(id);
    loadAthletes();
  };

  const handleAchievementAdd = (text) => {
    if (text.trim()) {
      setForm(f => ({ ...f, achievements: [...f.achievements, text] }));
    }
  };

  const handleAchievementRemove = (idx) => {
    setForm(f => ({ ...f, achievements: f.achievements.filter((_, i) => i !== idx) }));
  };

  return (
    <StaffGuard>
      <div className="min-h-screen bg-[#0a0a0a] flex">
        <AdminSidebar />
        <main className="flex-1 px-6 py-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h1 className="font-tactical text-4xl text-white">Athletes</h1>
              <button
                onClick={() => { setShowForm(!showForm); resetForm(); }}
                style={{ background: '#4f8ef7', border: '1px solid #4f8ef7', color: '#fff', fontWeight: 700 }}
                className="px-4 py-2 flex items-center gap-2 hover:bg-[#6ea8ff] transition-colors">
                <Plus className="w-4 h-4" /> Add Athlete
              </button>
            </div>

            {/* Form */}
            {showForm && (
              <div className="card-tactical p-6 mb-8">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-[#666] uppercase tracking-widest mb-1">Name *</label>
                      <input
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="e.g. Kyle 'The Technician' Santos"
                        className="w-full bg-[#111] border border-[#333] text-white px-3 py-2 text-sm focus:border-[#4f8ef7]" />
                    </div>
                    <div>
                      <label className="block text-xs text-[#666] uppercase tracking-widest mb-1">Discipline *</label>
                      <input
                        value={form.discipline}
                        onChange={e => setForm(f => ({ ...f, discipline: e.target.value }))}
                        placeholder="e.g. Brazilian Jiu-Jitsu"
                        className="w-full bg-[#111] border border-[#333] text-white px-3 py-2 text-sm focus:border-[#4f8ef7]" />
                    </div>
                    <div>
                      <label className="block text-xs text-[#666] uppercase tracking-widest mb-1">Belt *</label>
                      <input
                        value={form.belt}
                        onChange={e => setForm(f => ({ ...f, belt: e.target.value }))}
                        placeholder="e.g. Brown Belt"
                        className="w-full bg-[#111] border border-[#333] text-white px-3 py-2 text-sm focus:border-[#4f8ef7]" />
                    </div>
                    <div>
                      <label className="block text-xs text-[#666] uppercase tracking-widest mb-1">Location *</label>
                      <input
                        value={form.location}
                        onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                        placeholder="e.g. Cebu City, PH"
                        className="w-full bg-[#111] border border-[#333] text-white px-3 py-2 text-sm focus:border-[#4f8ef7]" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-[#666] uppercase tracking-widest mb-1">Quote</label>
                    <textarea
                      value={form.quote}
                      onChange={e => setForm(f => ({ ...f, quote: e.target.value }))}
                      placeholder="e.g. 'Chokepoint gear moves with me...'"
                      rows="2"
                      className="w-full bg-[#111] border border-[#333] text-white px-3 py-2 text-sm focus:border-[#4f8ef7]" />
                  </div>

                  <div>
                    <label className="block text-xs text-[#666] uppercase tracking-widest mb-2">Achievements</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        id="achievementInput"
                        placeholder="Add achievement..."
                        className="flex-1 bg-[#111] border border-[#333] text-white px-3 py-2 text-sm focus:border-[#4f8ef7]"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAchievementAdd(e.target.value);
                            e.target.value = '';
                          }
                        }} />
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.getElementById('achievementInput');
                          handleAchievementAdd(input.value);
                          input.value = '';
                        }}
                        style={{ background: '#1a1a1a', border: '1px solid #555', color: '#ccc' }}
                        className="px-3 hover:border-[#4f8ef7] hover:text-white transition-colors">Add</button>
                    </div>
                    <div className="space-y-1">
                      {form.achievements.map((ach, i) => (
                        <div key={i} className="flex items-center justify-between bg-[#111] border border-[#333] px-3 py-2">
                          <span className="text-sm text-white">{ach}</span>
                          <button
                            type="button"
                            onClick={() => handleAchievementRemove(i)}
                            className="text-[#555] hover:text-white">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-[#666] uppercase tracking-widest mb-1">Instagram Link</label>
                      <input
                        value={form.ig}
                        onChange={e => setForm(f => ({ ...f, ig: e.target.value }))}
                        placeholder="https://..."
                        className="w-full bg-[#111] border border-[#333] text-white px-3 py-2 text-sm focus:border-[#4f8ef7]" />
                    </div>
                    <div>
                      <label className="block text-xs text-[#666] uppercase tracking-widest mb-1">Sort Order</label>
                      <input
                        type="number"
                        value={form.sort_order}
                        onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))}
                        className="w-full bg-[#111] border border-[#333] text-white px-3 py-2 text-sm focus:border-[#4f8ef7]" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-[#666] uppercase tracking-widest mb-2">Photo</label>
                    {form.image ? (
                      <div className="space-y-2">
                        <div className="relative w-full aspect-square border border-[#333] overflow-hidden">
                           <img
                             src={form.image}
                             alt="preview"
                             style={{
                               width: '100%',
                               height: '100%',
                               left: `-${form.imageFit.cropX}%`,
                               top: `-${form.imageFit.cropY}%`,
                               position: 'absolute',
                               objectFit: 'cover',
                               clipPath: `inset(${form.imageFit.cropY}% ${100 - form.imageFit.cropX - form.imageFit.cropWidth}% ${100 - form.imageFit.cropY - form.imageFit.cropWidth}% ${form.imageFit.cropX}%)`,
                             }}
                           />
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setShowCropModal(true)}
                            style={{ background: '#4f8ef7', border: '1px solid #4f8ef7', color: '#fff' }}
                            className="flex-1 px-3 py-2 text-xs flex items-center justify-center gap-2 hover:bg-[#6ea8ff] transition-colors">
                            <Move className="w-3 h-3" /> Adjust
                          </button>
                          <button
                            type="button"
                            onClick={() => setForm(f => ({ ...f, image: '' }))}
                            style={{ background: '#ff0000', border: '1px solid #ff0000', color: '#fff' }}
                            className="flex-1 px-3 py-2 text-xs hover:bg-[#ff4444] transition-colors">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex items-center gap-2 border border-dashed border-[#444] px-3 py-2 cursor-pointer hover:border-[#4f8ef7]/60 transition-colors">
                        <Upload className="w-4 h-4" />
                        <span className="text-xs text-[#555]">{uploadingImg ? 'Uploading...' : 'Click to upload'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploadingImg}
                          className="hidden" />
                      </label>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                      id="active" />
                    <label htmlFor="active" className="text-sm text-[#666]">Active</label>
                  </div>

                  <div className="flex gap-2">
                    <button type="submit" style={{ background: '#4f8ef7', border: '1px solid #4f8ef7', color: '#fff', fontWeight: 700 }} className="px-6 py-2 flex-1 hover:bg-[#6ea8ff] transition-colors">
                      {editingId ? 'Update' : 'Create'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowForm(false); resetForm(); }}
                      style={{ background: '#1a1a1a', border: '1px solid #555', color: '#ccc' }}
                      className="px-6 py-2 hover:border-white hover:text-white transition-colors">Cancel</button>
                  </div>
                </form>
              </div>
            )}

            {/* Athletes List */}
            {loading ? (
              <div className="text-center py-10">
                <div className="w-6 h-6 border-2 border-[#333] border-t-[#4f8ef7] rounded-full animate-spin mx-auto" />
              </div>
            ) : (
              <div className="space-y-3">
                {athletes.length === 0 ? (
                  <p className="text-[#555] text-sm">No athletes yet.</p>
                ) : (
                  athletes.map(athlete => (
                    <div key={athlete.id} className="card-tactical p-4 flex items-start gap-4">
                      {athlete.image && (
                        <img src={athlete.image} alt={athlete.name} className="w-24 h-24 object-cover flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <h3 className="font-tactical text-lg text-white">{athlete.name}</h3>
                        <p className="text-xs text-[#555]">{athlete.discipline} · {athlete.belt} · {athlete.location}</p>
                        {athlete.achievements.length > 0 && (
                          <ul className="mt-2 space-y-0.5">
                            {athlete.achievements.slice(0, 2).map((ach, i) => (
                              <li key={i} className="text-xs text-[#666]">• {ach}</li>
                            ))}
                            {athlete.achievements.length > 2 && (
                              <li className="text-xs text-[#555]">+{athlete.achievements.length - 2} more</li>
                            )}
                          </ul>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(athlete)}
                          style={{ background: '#4f8ef7', border: '1px solid #4f8ef7', color: '#fff' }}
                          className="p-2 hover:bg-[#6ea8ff] transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(athlete.id)}
                          style={{ background: '#ff0000', border: '1px solid #ff0000', color: '#fff' }}
                          className="p-2 hover:bg-[#ff4444] transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Crop Modal */}
      {showCropModal && form.image && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm" onClick={() => setShowCropModal(false)}>
          <div className="w-full max-w-md bg-[#111] border border-[#333]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#222]">
              <h3 className="font-tactical text-xl text-white">Crop Photo</h3>
              <button onClick={() => setShowCropModal(false)} className="text-[#555] hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              {/* Crop container */}
              <div
                ref={cropContainerRef}
                className="relative w-full aspect-square bg-[#0a0a0a] border border-[#222]"
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  touchAction: 'none',
                  userSelect: 'none',
                }}
              >
                {/* Full image */}
                <img
                  src={form.image}
                  alt="crop"
                  draggable="false"
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Top overlay */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: `${cropY}px`,
                    background: 'rgba(0,0,0,0.6)',
                    pointerEvents: 'none',
                  }}
                />

                {/* Bottom overlay */}
                <div
                  style={{
                    position: 'absolute',
                    top: `${cropY + cropSize}px`,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.6)',
                    pointerEvents: 'none',
                  }}
                />

                {/* Left overlay */}
                <div
                  style={{
                    position: 'absolute',
                    top: `${cropY}px`,
                    left: 0,
                    width: `${cropX}px`,
                    height: `${cropSize}px`,
                    background: 'rgba(0,0,0,0.6)',
                    pointerEvents: 'none',
                  }}
                />

                {/* Right overlay */}
                <div
                  style={{
                    position: 'absolute',
                    top: `${cropY}px`,
                    left: `${cropX + cropSize}px`,
                    right: 0,
                    height: `${cropSize}px`,
                    background: 'rgba(0,0,0,0.6)',
                    pointerEvents: 'none',
                  }}
                />

                {/* Crop box */}
                <div
                  style={{
                    position: 'absolute',
                    left: `${cropX}px`,
                    top: `${cropY}px`,
                    width: `${cropSize}px`,
                    height: `${cropSize}px`,
                    border: '2px solid white',
                    cursor: 'move',
                  }}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const container = cropContainerRef.current;
                    if (!container) return;
                    const startX = e.clientX - cropX;
                    const startY = e.clientY - cropY;
                    
                    const handleMove = (e) => {
                      const newX = e.clientX - startX;
                      const newY = e.clientY - startY;
                      const maxX = container.offsetWidth - cropSize;
                      const maxY = container.offsetHeight - cropSize;
                      setCropX(Math.max(0, Math.min(newX, maxX)));
                      setCropY(Math.max(0, Math.min(newY, maxY)));
                    };
                    const handleUp = () => {
                      document.removeEventListener('pointermove', handleMove);
                      document.removeEventListener('pointerup', handleUp);
                    };
                    document.addEventListener('pointermove', handleMove);
                    document.addEventListener('pointerup', handleUp);
                  }}
                >
                  {/* Grid lines */}
                  <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                    <div style={{ position: 'absolute', left: '33.333%', top: 0, width: '1px', height: '100%', background: 'rgba(255,255,255,0.3)' }} />
                    <div style={{ position: 'absolute', left: '66.666%', top: 0, width: '1px', height: '100%', background: 'rgba(255,255,255,0.3)' }} />
                    <div style={{ position: 'absolute', top: '33.333%', left: 0, width: '100%', height: '1px', background: 'rgba(255,255,255,0.3)' }} />
                    <div style={{ position: 'absolute', top: '66.666%', left: 0, width: '100%', height: '1px', background: 'rgba(255,255,255,0.3)' }} />
                  </div>
                </div>

                {/* Corner handles */}
                {[
                  { corner: 'se', style: { top: `${cropY + cropSize - 10}px`, left: `${cropX + cropSize - 10}px` }, cursor: 'se-resize' },
                  { corner: 'sw', style: { top: `${cropY + cropSize - 10}px`, left: `${cropX - 10}px` }, cursor: 'sw-resize' },
                  { corner: 'ne', style: { top: `${cropY - 10}px`, left: `${cropX + cropSize - 10}px` }, cursor: 'ne-resize' },
                  { corner: 'nw', style: { top: `${cropY - 10}px`, left: `${cropX - 10}px` }, cursor: 'nw-resize' },
                ].map(h => (
                  <div
                    key={h.corner}
                    style={{
                      position: 'absolute',
                      width: '20px',
                      height: '20px',
                      ...h.style,
                      cursor: h.cursor,
                      zIndex: 10,
                    }}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const container = cropContainerRef.current;
                      if (!container) return;
                      const maxSize = Math.min(container.offsetWidth, container.offsetHeight);
                      const startX = e.clientX;
                      const startY = e.clientY;
                      
                      const handleMove = (e) => {
                        const dx = e.clientX - startX;
                        const dy = e.clientY - startY;
                        let newSize = cropSize;
                        let newX = cropX;
                        let newY = cropY;
                        
                        if (h.corner === 'se') {
                          newSize = Math.max(50, Math.min(cropSize + dx, maxSize - cropX, cropSize + dy, maxSize - cropY));
                        } else if (h.corner === 'sw') {
                          const dSize = Math.max(50, cropSize - dx);
                          newX = cropX + (cropSize - dSize);
                          newSize = Math.max(50, Math.min(dSize, maxSize - newX, cropSize + dy, maxSize - cropY));
                          newX = cropX + (cropSize - newSize);
                        } else if (h.corner === 'ne') {
                          const dSize = Math.max(50, cropSize + dx);
                          newSize = Math.max(50, Math.min(dSize, maxSize - cropX, cropSize - dy, maxSize - cropY));
                          newY = cropY + (cropSize - newSize);
                        } else if (h.corner === 'nw') {
                          const dSize = Math.max(50, Math.min(cropSize - dx, cropSize - dy));
                          newX = cropX + (cropSize - dSize);
                          newY = cropY + (cropSize - dSize);
                          newSize = dSize;
                        }
                        
                        setCropSize(newSize);
                        setCropX(Math.max(0, newX));
                        setCropY(Math.max(0, newY));
                      };
                      
                      const handleUp = () => {
                        document.removeEventListener('pointermove', handleMove);
                        document.removeEventListener('pointerup', handleUp);
                      };
                      
                      document.addEventListener('pointermove', handleMove);
                      document.addEventListener('pointerup', handleUp);
                    }}
                  >
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: '8px', height: '8px', background: 'white', border: '1px solid rgba(0,0,0,0.5)' }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Instructions */}
              <div className="bg-[#0a0a0a] border border-[#222] px-3 py-2.5">
                <p className="font-mono-ui text-[10px] text-[#4f8ef7] uppercase tracking-widest">Instructions</p>
                <p className="font-mono-ui text-[10px] text-[#666] mt-1">Drag the box to reposition · Drag corners to resize</p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowCropModal(false)} style={{ background: '#1a1a1a', border: '1px solid #555', color: '#ccc' }} className="flex-1 py-2.5 font-mono-ui text-xs uppercase tracking-widest hover:border-white hover:text-white transition-colors">Cancel</button>
                <button onClick={() => {
                  const container = cropContainerRef.current;
                  if (container) {
                    const newCropX = (cropX / container.offsetWidth) * 100;
                    const newCropY = (cropY / container.offsetHeight) * 100;
                    const newCropWidth = (cropSize / container.offsetWidth) * 100;
                    setForm(f => ({ ...f, imageFit: { cropX: newCropX, cropY: newCropY, cropWidth: newCropWidth } }));
                    setShowCropModal(false);
                  }
                }} style={{ background: '#4f8ef7', border: '1px solid #4f8ef7', color: '#fff', fontWeight: 700 }} className="flex-1 py-2.5 font-mono-ui text-xs uppercase tracking-widest">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </StaffGuard>
  );
}