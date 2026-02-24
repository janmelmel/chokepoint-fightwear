import React from 'react';
import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section className="relative flex flex-col items-center justify-center py-24 px-4 overflow-hidden border-b border-white/10">
      <div className="absolute inset-0 bg-gradient-to-b from-[#8b0000]/10 to-transparent pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center relative z-10"
      >
        <p className="font-inter text-[10px] tracking-[0.4em] text-[#8b0000] uppercase mb-4">
          Elite Fightwear
        </p>
        <h1
          className="text-6xl sm:text-8xl text-white leading-none mb-4"
          style={{ fontFamily: "'UnifrakturMaguntia', cursive" }}
        >
          Chokepoint
        </h1>
        <div className="w-16 h-px bg-[#8b0000] mx-auto mb-6" />
        <p className="font-inter text-xs text-white/40 tracking-widest uppercase">
          Submit or Get Submitted
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="mt-10"
      >
        <a
          href="#gear"
          className="font-inter text-xs tracking-[0.3em] uppercase border border-[#8b0000] text-[#8b0000] px-8 py-3 hover:bg-[#8b0000] hover:text-white transition-all duration-300"
        >
          Shop Gear
        </a>
      </motion.div>
    </section>
  );
}