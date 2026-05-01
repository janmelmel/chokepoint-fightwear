import React, { useState, useEffect } from 'react';
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
  const [cropScale, setCropScale] = useState(1);
  const [cropOffsetX, setCropOffsetX] = useState(50);
  const [cropOffsetY, setCropOffsetY] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

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
      imageFit: { scale: 1, offsetX: 50, offsetY: 50 },
    });
    setEditingId(null);
    setShowCropModal(false);
  };

  const handleEdit = (athlete) => {
    const imageFit = athlete.imageFit || { scale: 1, offsetX: 50, offsetY: 50 };
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
    setCropScale(imageFit.scale);
    setCropOffsetX(imageFit.offsetX);
    setCropOffsetY(imageFit.offsetY);
    setEditingId(athlete.id);
    setShowForm(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImg(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm(f => ({ ...f, image: file_url, imageFit: { scale: 1, offsetX: 50, offsetY: 50 } }));
      setCropScale(1);
      setCropOffsetX(50);
      setCropOffsetY(50);
      setShowCropModal(true);
    } finally {
      setUploadingImg(false);
    }
  };

  const saveCrop = () => {
    setForm(f => ({
      ...f,
      imageFit: { scale: cropScale, offsetX: cropOffsetX, offsetY: cropOffsetY },
    }));
    setShowCropModal(false);
  };

  const handleCropMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleCropMouseMove = (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    setCropOffsetX(prev => Math.max(0, Math.min(100, prev + deltaX / 2)));
    setCropOffsetY(prev => Math.max(0, Math.min(100, prev + deltaY / 2)));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleCropMouseUp = () => {
    setIsDragging(false);
  };

  const handleCropWheel = (e) => {
    e.preventDefault();
    const zoom = e.deltaY > 0 ? 0.9 : 1.1;
    setCropScale(prev => Math.max(1, Math.min(3, prev * zoom)));
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
                              width: `${100 * form.imageFit.scale}%`,
                              height: `${100 * form.imageFit.scale}%`,
                              left: `${form.imageFit.offsetX - 50 * form.imageFit.scale}%`,
                              top: `${form.imageFit.offsetY - 50 * form.imageFit.scale}%`,
                              position: 'absolute',
                              objectFit: 'cover',
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
              {/* Interactive crop preview */}
              <div
                className="relative w-full aspect-square bg-[#0a0a0a] border border-[#222] overflow-hidden cursor-move select-none"
                onMouseDown={handleCropMouseDown}
                onMouseMove={handleCropMouseMove}
                onMouseUp={handleCropMouseUp}
                onMouseLeave={handleCropMouseUp}
                onWheel={handleCropWheel}
                style={{ userSelect: 'none' }}
              >
                <img
                  src={form.image}
                  style={{
                    width: `${100 * cropScale}%`,
                    height: `${100 * cropScale}%`,
                    left: `${cropOffsetX - 50 * cropScale}%`,
                    top: `${cropOffsetY - 50 * cropScale}%`,
                    position: 'absolute',
                    objectFit: 'cover',
                  }}
                  alt="crop preview"
                  draggable="false"
                />
              </div>

              {/* Instructions */}
              <div className="bg-[#0a0a0a] border border-[#222] px-3 py-2.5 space-y-1.5">
                <p className="font-mono-ui text-[10px] text-[#4f8ef7] uppercase tracking-widest">Instructions</p>
                <ul className="space-y-1 text-[10px] text-[#666]">
                  <li>• <strong>Drag</strong> to move the image</li>
                  <li>• <strong>Scroll</strong> to zoom in/out</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowCropModal(false)} style={{ background: '#1a1a1a', border: '1px solid #555', color: '#ccc' }} className="flex-1 py-2.5 font-mono-ui text-xs uppercase tracking-widest hover:border-white hover:text-white transition-colors">Cancel</button>
                <button onClick={saveCrop} style={{ background: '#4f8ef7', border: '1px solid #4f8ef7', color: '#fff', fontWeight: 700 }} className="flex-1 py-2.5 font-mono-ui text-xs uppercase tracking-widest">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </StaffGuard>
  );
}