import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Instagram } from 'lucide-react';

const ATHLETES = [
  {
    name: 'Kyle "The Technician" Santos',
    discipline: 'Brazilian Jiu-Jitsu',
    belt: 'Brown Belt',
    location: 'Cebu City, PH',
    achievements: ['2x Regional IBJJF Champion', 'NABJJF Gold Medalist', 'Head Coach — Apex BJJ Cebu'],
    image: 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=600&q=80',
    quote: 'Chokepoint gear moves with me in every scramble. The fit is dialed in and it never lets me down on the mat.',
    ig: '#',
  },
  {
    name: 'Maria "Iron" Reyes',
    discipline: 'Muay Thai / MMA',
    belt: 'Pro Fighter',
    location: 'Lapu-Lapu City, PH',
    achievements: ['ONE Championship Contender', '5x National Muay Thai Champ', 'Featured in Fight PH Magazine'],
    image: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=600&q=80',
    quote: 'Training in Chokepoint rashguards changed the game for me — no rashes, no restrictions, just pure performance.',
    ig: '#',
  },
  {
    name: 'Jomar "Lockdown" Cruz',
    discipline: 'No-Gi Grappling',
    belt: 'Black Belt',
    location: 'Mandaue, Cebu PH',
    achievements: ['ADCC Regional Trials Finalist', '3x Cebu Open Gold', 'Head Instructor — Ground Zero Grappling'],
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80',
    quote: 'I\'ve worn a lot of brands. Chokepoint is the only one I trust in a high-stakes match.',
    ig: '#',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.45 } }),
};

export default function AthleteRoster() {
  const [active, setActive] = useState(0);
  const athlete = ATHLETES[active];

  return (
    <section className="py-20 px-4 border-t border-[#1a1a1a] bg-[#0d0d0d]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="font-mono-ui text-xs uppercase tracking-[0.4em] text-[#ff6b00] mb-2">
            Team Chokepoint
          </motion.p>
          <motion.h2 initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-tactical text-4xl sm:text-6xl text-white leading-none">
            OUR ATHLETES
          </motion.h2>
        </div>

        {/* Athlete tab selector */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
          {ATHLETES.map((a, i) => (
            <button key={i} onClick={() => setActive(i)}
              className={`flex-shrink-0 px-5 py-2.5 font-mono-ui text-xs uppercase tracking-widest transition-all border ${
                active === i
                  ? 'border-[#ff6b00] text-[#ff6b00] bg-[#ff6b00]/5'
                  : 'border-[#222] text-[#555] hover:border-[#444] hover:text-[#888]'
              }`}>
              {a.name.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Active athlete card */}
        <motion.div key={active} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#1a1a1a]">
          {/* Image */}
          <div className="relative overflow-hidden" style={{ minHeight: '380px' }}>
            <img src={athlete.image} alt={athlete.name} className="w-full h-full object-cover object-top opacity-80" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, transparent 50%, #0d0d0d), linear-gradient(to top, #0d0d0d 0%, transparent 40%)' }} />
            <div className="absolute bottom-4 left-4">
              <span className="font-mono-ui text-[10px] uppercase tracking-widest border border-[#ff6b00]/40 text-[#ff6b00] px-2 py-1 bg-[#0a0a0a]/80">
                {athlete.belt}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="bg-[#0d0d0d] p-8 flex flex-col justify-between">
            <div>
              <p className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest mb-1">{athlete.discipline} · {athlete.location}</p>
              <h3 className="font-tactical text-3xl sm:text-4xl text-white mb-5">{athlete.name}</h3>

              <ul className="space-y-2 mb-6">
                {athlete.achievements.map((ach, j) => (
                  <li key={j} className="flex items-start gap-2 font-mono-ui text-xs text-[#888]">
                    <span className="w-1 h-1 rounded-full bg-[#ff6b00] flex-shrink-0 mt-1.5" />
                    {ach}
                  </li>
                ))}
              </ul>

              <blockquote className="border-l-2 border-[#ff6b00]/40 pl-4">
                <p className="font-mono-ui text-xs text-[#666] italic leading-relaxed">"{athlete.quote}"</p>
              </blockquote>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <a href={athlete.ig} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 font-mono-ui text-xs text-[#555] hover:text-white transition-colors uppercase tracking-widest">
                <Instagram className="w-4 h-4" /> Follow
              </a>
            </div>
          </div>
        </motion.div>

        {/* Dot indicators */}
        <div className="flex gap-2 justify-center mt-5">
          {ATHLETES.map((_, i) => (
            <button key={i} onClick={() => setActive(i)}
              className={`h-1 transition-all ${i === active ? 'w-8 bg-[#ff8c00]' : 'w-2 bg-[#333]'}`} />
          ))}
        </div>
      </div>
    </section>
  );
}