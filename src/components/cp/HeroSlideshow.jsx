import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function HeroSlideshow({ banners, onShopClick }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => setIdx(i => (i + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, [banners.length]);

  if (!banners.length) {
    // Fallback plain hero
    return (
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(ellipse at center, #1a0000 0%, #0a0a0a 70%)', opacity: 0.6 }} />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 40px,#fff 40px,#fff 41px),repeating-linear-gradient(90deg,transparent,transparent 40px,#fff 40px,#fff 41px)' }} />
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="relative z-10 text-center">
          <h1 style={{ fontFamily: "'Bitsumishi', sans-serif" }} className="text-6xl sm:text-8xl md:text-9xl text-white mt-6 leading-none uppercase">CHOKEPOINT</h1>
          <p className="font-mono-ui text-[11px] tracking-[0.5em] text-[#ff0000] uppercase mt-3">No Escape From Chokepoint</p>
          <div className="w-24 h-px bg-[#ff8c00] mx-auto mt-6 mb-8" />
          <a href="#gear" className="font-mono-ui text-xs tracking-[0.3em] uppercase px-8 py-4 inline-block bg-[#ff8c00] text-black font-bold hover:bg-[#ffa020] transition-all">
            Shop the Drop
          </a>
        </motion.div>
      </section>
    );
  }

  const banner = banners[idx];

  return (
    <section className="relative min-h-screen overflow-hidden bg-black">
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <img src={banner.image_url} alt={banner.title || 'Hero'} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-end min-h-screen pb-20 px-6 sm:px-12 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.5 }}>
            {banner.subtitle && (
              <p className="font-mono-ui text-[11px] tracking-[0.4em] text-[#ff8c00] uppercase mb-3">{banner.subtitle}</p>
            )}
            {banner.title && (
              <h2 style={{ fontFamily: "'Bitsumishi', sans-serif" }} className="text-5xl sm:text-7xl md:text-8xl text-white leading-none uppercase mb-6">
                {banner.title}
              </h2>
            )}
            <a
              href={banner.cta_href || '#gear'}
              className="inline-block font-mono-ui text-xs tracking-[0.3em] uppercase px-8 py-4 bg-[#ff8c00] text-black font-bold hover:bg-[#ffa020] transition-all"
            >
              {banner.cta_label || 'Shop Now'}
            </a>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Arrows */}
      {banners.length > 1 && (
        <>
          <button onClick={() => setIdx(i => (i - 1 + banners.length) % banners.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-black/40 border border-white/10 text-white hover:border-[#ff8c00] hover:text-[#ff8c00] transition-all">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={() => setIdx(i => (i + 1) % banners.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-black/40 border border-white/10 text-white hover:border-[#ff8c00] hover:text-[#ff8c00] transition-all">
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {banners.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)}
                className={`h-1 transition-all ${i === idx ? 'w-8 bg-[#ff8c00]' : 'w-2 bg-white/30'}`} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}