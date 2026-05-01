import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Edit2, Trash2, Upload, X } from 'lucide-react';
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
  });
  const [uploadingImg, setUploadingImg] = useState(false);

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
    });
    setEditingId(null);
  };

  const handleEdit = (athlete) => {
    setForm(athlete);
    setEditingId(athlete.id);
    setShowForm(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImg(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm(f => ({ ...f, image: file_url }));
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
                className="btn-glow-orange px-4 py-2 flex items-center gap-2">
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
                        className="btn-glow-white px-3">Add</button>
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
                      <div className="relative w-32 h-32 border border-[#333]">
                        <img src={form.image} alt="preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setForm(f => ({ ...f, image: '' }))}
                          className="absolute top-1 right-1 bg-black/70 text-white p-0.5">
                          <X className="w-3 h-3" />
                        </button>
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
                    <button type="submit" className="btn-glow-orange px-6 py-2 flex-1">
                      {editingId ? 'Update' : 'Create'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowForm(false); resetForm(); }}
                      className="btn-glow-white px-6 py-2">Cancel</button>
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
                          className="p-2 text-[#555] hover:text-white transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(athlete.id)}
                          className="p-2 text-[#555] hover:text-[#ff0000] transition-colors">
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
    </StaffGuard>
  );
}