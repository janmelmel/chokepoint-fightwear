import React, { useState, useRef } from 'react';
import { X, Upload, ZoomIn, ZoomOut, Move } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function ReviewCard({ review, onUpdate }) {
  const [showCropModal, setShowCropModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [scale, setScale] = useState(review.imageFit?.scale || 1);
  const [offsetX, setOffsetX] = useState(review.imageFit?.offsetX || 50);
  const [offsetY, setOffsetY] = useState(review.imageFit?.offsetY || 50);
  const fileInputRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onUpdate({ ...review, image: file_url });
      setShowCropModal(true);
    } finally {
      setUploading(false);
    }
  };

  const saveCrop = () => {
    onUpdate({
      ...review,
      imageFit: { scale, offsetX, offsetY },
    });
    setShowCropModal(false);
  };

  const removeImage = () => {
    onUpdate({ ...review, image: null });
  };

  return (
    <>
      <div className="bg-[#0a0a0a] p-6 flex flex-col gap-4 hover:bg-[#111] transition-colors">
        {/* Image section */}
        {review.image ? (
          <div className="relative w-full aspect-square bg-[#111] border border-[#222] overflow-hidden rounded">
            <img
              src={review.image}
              alt={review.name}
              style={{
                width: `${100 * (scale || 1)}%`,
                height: `${100 * (scale || 1)}%`,
                left: `${(offsetX || 50) - 50 * (scale || 1)}%`,
                top: `${(offsetY || 50) - 50 * (scale || 1)}%`,
                position: 'absolute',
                objectFit: 'cover',
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/50 transition-opacity gap-2">
              <button
                onClick={() => setShowCropModal(true)}
                className="p-2 bg-[#4f8ef7] text-white hover:bg-[#6ea8ff] rounded transition-colors"
                title="Edit crop">
                <Move className="w-4 h-4" />
              </button>
              <button
                onClick={removeImage}
                className="p-2 bg-[#ff0000]/50 text-white hover:bg-[#ff0000] rounded transition-colors"
                title="Remove image">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <label className="w-full aspect-square border-2 border-dashed border-[#333] rounded flex items-center justify-center cursor-pointer hover:border-[#4f8ef7] hover:bg-[#4f8ef7]/5 transition-all">
            <div className="text-center">
              <Upload className="w-6 h-6 text-[#555] mx-auto mb-2" />
              <p className="font-mono-ui text-[10px] text-[#555]">{uploading ? 'Uploading...' : 'Click to upload'}</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        )}

        {/* Stars & Review */}
        <div className="space-y-3">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-3 h-3" viewBox="0 0 24 24" fill={i < review.rating ? '#4f8ef7' : 'none'} stroke="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
          <p className="font-mono-ui text-xs text-[#888] leading-relaxed">"{review.text}"</p>
        </div>

        {/* Author info */}
        <div className="border-t border-[#1a1a1a] pt-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#4f8ef7]/10 border border-[#4f8ef7]/20 flex items-center justify-center flex-shrink-0">
            <span className="font-mono-ui text-[10px] text-[#4f8ef7] font-bold">{review.avatar}</span>
          </div>
          <div>
            <p className="font-mono-ui text-xs text-white font-semibold">{review.name}</p>
            <p className="font-mono-ui text-[10px] text-[#555]">{review.product} · {review.location}</p>
          </div>
        </div>
      </div>

      {/* Crop Modal */}
      {showCropModal && review.image && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm" onClick={() => setShowCropModal(false)}>
          <div
            className="w-full max-w-md bg-[#111] border border-[#333] rounded"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#222]">
              <h3 className="font-tactical text-xl text-white">Adjust Image</h3>
              <button onClick={() => setShowCropModal(false)} className="text-[#555] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Preview */}
              <div className="relative w-full aspect-square bg-[#0a0a0a] border border-[#222] overflow-hidden rounded">
                <img
                  src={review.image}
                  style={{
                    width: `${100 * scale}%`,
                    height: `${100 * scale}%`,
                    left: `${offsetX - 50 * scale}%`,
                    top: `${offsetY - 50 * scale}%`,
                    position: 'absolute',
                    objectFit: 'cover',
                  }}
                  alt="preview"
                />
              </div>

              {/* Controls */}
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest">Zoom</label>
                    <span className="font-mono-ui text-xs text-white">{(scale * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.1"
                    value={scale}
                    onChange={(e) => setScale(parseFloat(e.target.value))}
                    className="w-full h-1 bg-[#222] rounded cursor-pointer accent-[#4f8ef7]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest">Horizontal</label>
                    <span className="font-mono-ui text-xs text-white">{offsetX.toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={offsetX}
                    onChange={(e) => setOffsetX(parseFloat(e.target.value))}
                    className="w-full h-1 bg-[#222] rounded cursor-pointer accent-[#4f8ef7]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest">Vertical</label>
                    <span className="font-mono-ui text-xs text-white">{offsetY.toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={offsetY}
                    onChange={(e) => setOffsetY(parseFloat(e.target.value))}
                    className="w-full h-1 bg-[#222] rounded cursor-pointer accent-[#4f8ef7]"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCropModal(false)}
                  className="flex-1 py-2.5 border border-[#333] text-[#555] font-mono-ui text-xs uppercase tracking-widest hover:border-[#555] hover:text-white transition-all">
                  Cancel
                </button>
                <button
                  onClick={saveCrop}
                  style={{ background: '#4f8ef7', border: '1px solid #4f8ef7', color: '#fff', fontWeight: 700 }}
                  className="flex-1 py-2.5 font-mono-ui text-xs uppercase tracking-widest">
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}