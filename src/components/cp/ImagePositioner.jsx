import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Move } from 'lucide-react';

/**
 * ImagePositioner
 * Lets the user drag an image within a fixed 16:9 frame to set focal point.
 * Outputs a CSS `object-position` string (e.g. "42% 30%") via onChange.
 */
export default function ImagePositioner({ imageUrl, position = '50% 50%', onChange }) {
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pos, setPos] = useState(() => parsePosition(position));
  const startRef = useRef(null);

  // Parse "X% Y%" into { x, y }
  function parsePosition(str) {
    const parts = str.split(' ');
    return { x: parseFloat(parts[0]) || 50, y: parseFloat(parts[1]) || 50 };
  }

  const clamp = (v) => Math.min(100, Math.max(0, v));

  const startDrag = useCallback((clientX, clientY) => {
    setIsDragging(true);
    startRef.current = { clientX, clientY, posX: pos.x, posY: pos.y };
  }, [pos]);

  const onDrag = useCallback((clientX, clientY) => {
    if (!isDragging || !startRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dx = (clientX - startRef.current.clientX) / rect.width * 100;
    const dy = (clientY - startRef.current.clientY) / rect.height * 100;
    // Moving image RIGHT means focal point moves LEFT
    const newX = clamp(startRef.current.posX - dx);
    const newY = clamp(startRef.current.posY - dy);
    setPos({ x: newX, y: newY });
    onChange?.(`${Math.round(newX)}% ${Math.round(newY)}%`);
  }, [isDragging, onChange]);

  const endDrag = useCallback(() => setIsDragging(false), []);

  // Mouse events
  const onMouseDown = (e) => { e.preventDefault(); startDrag(e.clientX, e.clientY); };
  const onMouseMove = (e) => onDrag(e.clientX, e.clientY);

  // Touch events
  const onTouchStart = (e) => { const t = e.touches[0]; startDrag(t.clientX, t.clientY); };
  const onTouchMove = (e) => { const t = e.touches[0]; onDrag(t.clientX, t.clientY); };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', endDrag);
      window.addEventListener('touchmove', onTouchMove);
      window.addEventListener('touchend', endDrag);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', endDrag);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', endDrag);
    };
  }, [isDragging, onMouseMove, endDrag, onTouchMove]);

  return (
    <div className="space-y-2">
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden border border-[#ff8c00] select-none"
        style={{ aspectRatio: '16/7', cursor: isDragging ? 'grabbing' : 'grab' }}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
      >
        <img
          src={imageUrl}
          alt="banner preview"
          draggable={false}
          className="w-full h-full object-cover pointer-events-none"
          style={{ objectPosition: `${pos.x}% ${pos.y}%` }}
        />
        {/* Crosshair overlay */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="bg-black/40 backdrop-blur-sm rounded-full p-2 border border-white/20">
            <Move className="w-5 h-5 text-white/80" />
          </div>
        </div>
        {/* Rule-of-thirds grid */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-1/3 left-0 right-0 h-px bg-white" />
          <div className="absolute top-2/3 left-0 right-0 h-px bg-white" />
          <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white" />
          <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white" />
        </div>
      </div>
      <p className="font-mono-ui text-[10px] text-[#555] text-center">
        Drag to adjust focal point · {Math.round(pos.x)}% {Math.round(pos.y)}%
      </p>
    </div>
  );
}