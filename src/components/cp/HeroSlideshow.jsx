import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function HeroSlideshow({ banners }) {
  const [idx, setIdx] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const sectionRef = useRef(null);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Auto-advance slides
  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => setIdx(i => (i + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, [banners.length]);

  // Scroll-based parallax + dimming (desktop only)
  useEffect(() => {
    const onScroll = () => {
      if (!sectionRef.current || isMobile) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const sectionH = sectionRef.current.offsetHeight;
      const progress = Math.min(1, Math.max(0, -rect.top / sectionH));
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isMobile]);

  // Disable parallax on mobile so image isn't cropped
  const parallaxY = isMobile ? 0 : scrollProgress * 20;
  const dimOpacity = isMobile ? 0 : scrollProgress * 0.82;
  const contentOpacity = isMobile ? 1 : Math.max(0, 1 - scrollProgress * 2.5);

  if (!banners.length) {
    return (
      <section
        ref={sectionRef}
        className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden"
      >
        <div
          className="absolute inset-0"
          style={{ backgroundImage: 'radial-gradient(ellipse at center, #1a0000 0%, #0a0a0a 70%)', opacity: 0.6 }}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 40px,#fff 40px,#fff 41px),repeating-linear-gradient(90deg,transparent,transparent 40px,#fff 40px,#fff 41px)' }}
        />
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
          className="relative z-10 text-center"
          style={{ opacity: contentOpacity }}
        >
          <h1 style={{ fontFamily: "'Bitsumishi', sans-serif" }} className="text-[11vw] sm:text-8xl md:text-9xl text-white mt-6 leading-none uppercase">CHOKEPOINT</h1>
          <p className="font-mono-ui text-[11px] tracking-[0.5em] text-[#4f8ef7] uppercase mt-3">No Escape From Chokepoint</p>
          <div className="w-24 h-px bg-[#4f8ef7] mx-auto mt-6 mb-8" />
          <a href="#gear" className="font-mono-ui text-xs tracking-[0.3em] uppercase py-4 inline-block bg-[#4f8ef7] text-white font-bold hover:bg-[#6ea8ff] transition-all w-4/5 sm:w-auto sm:px-8">
            Shop the Drop
          </a>
        </motion.div>
      </section>
    );
  }

  const banner = banners[idx];

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen overflow-hidden bg-black"
    >
      {/* Parallax image layer */}
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 will-change-transform"
          style={{
            transform: `translateY(${parallaxY}%)`,
            top: isMobile ? '0' : '-5%',
            bottom: isMobile ? '0' : '-5%',
          }}
        >
          <img
            src={banner.image_url}
            alt={banner.title || 'Hero'}
            className="w-full h-full object-cover"
            style={{ objectPosition: banner.image_position || '50% 50%' }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Static base gradient (always visible) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none z-[1]" />

      {/* Scroll-driven dim overlay */}
      <div
        className="absolute inset-0 bg-black pointer-events-none z-[2]"
        style={{ opacity: dimOpacity }}
      />

      {/* Content */}
      <div
        className="relative z-10 flex flex-col justify-end min-h-screen pb-20 px-6 sm:px-12 max-w-7xl mx-auto"
        style={{ opacity: contentOpacity }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
          >
            {banner.subtitle && (
              <p className="font-mono-ui text-[11px] tracking-[0.4em] text-[#4f8ef7] uppercase mb-3">{banner.subtitle}</p>
            )}
            {banner.title && (
              <h2
                style={{ fontFamily: "'Bitsumishi', sans-serif" }}
                className="text-5xl sm:text-7xl md:text-8xl text-white leading-none uppercase mb-6"
              >
                {banner.title}
              </h2>
            )}
            <a
              href={banner.cta_href || '#gear'}
              className="inline-block font-mono-ui text-xs tracking-[0.3em] uppercase px-8 py-4 bg-[#4f8ef7] text-white font-bold hover:bg-[#6ea8ff] transition-all"
            >
              {banner.cta_label || 'Shop Now'}
            </a>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={() => setIdx(i => (i - 1 + banners.length) % banners.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-black/40 border border-white/10 text-white hover:border-[#4f8ef7] hover:text-[#4f8ef7] transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIdx(i => (i + 1) % banners.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-black/40 border border-white/10 text-white hover:border-[#4f8ef7] hover:text-[#4f8ef7] transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`h-1 transition-all ${i === idx ? 'w-8 bg-[#4f8ef7]' : 'w-2 bg-white/20'}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}