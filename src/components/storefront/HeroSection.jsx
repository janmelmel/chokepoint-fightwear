import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function HeroSection() {
  const titleWords = ['CHOKEPOINT'];
  const subtitleWords = ['ELITE', 'FIGHTWEAR'];

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(255,10,10,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,10,10,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#FF0A0A] rounded-full blur-[200px] opacity-10" />

      {/* Content */}
      <div className="relative z-10 text-center">
        {/* Main Title */}
        <div className="overflow-hidden mb-2">
          {titleWords.map((word, i) => (
            <motion.h1
              key={i}
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ 
                duration: 0.8, 
                delay: i * 0.15,
                ease: [0.16, 1, 0.3, 1]
              }}
              className="font-blackletter text-5xl sm:text-7xl md:text-8xl lg:text-9xl text-white tracking-wide"
            >
              {word}
            </motion.h1>
          ))}
        </div>

        {/* Subtitle */}
        <div className="flex items-center justify-center gap-3 sm:gap-6 overflow-hidden">
          {subtitleWords.map((word, i) => (
            <motion.span
              key={i}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ 
                duration: 0.6, 
                delay: 0.4 + i * 0.1,
                ease: [0.16, 1, 0.3, 1]
              }}
              className="font-body text-sm sm:text-lg md:text-xl lg:text-2xl font-light tracking-[0.3em] text-[#FF0A0A]"
            >
              {word}
            </motion.span>
          ))}
        </div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="font-body text-xs sm:text-sm text-white/50 mt-8 tracking-[0.2em] uppercase"
        >
          Submit or Get Submitted
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-12"
        >
          <a 
            href="#drops"
            className="inline-flex items-center gap-2 px-8 py-4 border border-[#FF0A0A]/50 text-[#FF0A0A] font-body text-sm tracking-widest uppercase hover:bg-[#FF0A0A] hover:text-white transition-all duration-300 neon-border"
          >
            Shop Now
          </a>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <ChevronDown className="w-6 h-6 text-white/30" />
        </motion.div>
      </motion.div>

      {/* Corner Accents */}
      <div className="absolute top-4 left-4 w-12 h-12 border-l-2 border-t-2 border-[#FF0A0A]/30" />
      <div className="absolute top-4 right-4 w-12 h-12 border-r-2 border-t-2 border-[#FF0A0A]/30" />
      <div className="absolute bottom-4 left-4 w-12 h-12 border-l-2 border-b-2 border-[#FF0A0A]/30" />
      <div className="absolute bottom-4 right-4 w-12 h-12 border-r-2 border-b-2 border-[#FF0A0A]/30" />
    </section>
  );
}