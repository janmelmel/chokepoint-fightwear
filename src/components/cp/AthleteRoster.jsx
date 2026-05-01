import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Instagram } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.45 } }),
};

export default function AthleteRoster() {
  const [athletes, setAthletes] = useState([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await base44.entities.Athlete.filter({ is_active: true }, 'sort_order');
      setAthletes(data);
      setLoading(false);
    })();
  }, []);

  if (loading || athletes.length === 0) return null;

  const athlete = athletes[active];

  return (
    <section className="py-20 px-4 border-t border-[#1a1a1a] bg-[#0d0d0d]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="font-mono-ui text-xs uppercase tracking-[0.4em] text-[#4f8ef7] mb-2">
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
          {athletes.map((a, i) => (
            <button key={i} onClick={() => setActive(i)}
              className={`flex-shrink-0 px-5 py-2.5 font-mono-ui text-xs uppercase tracking-widest transition-all border whitespace-nowrap ${
                active === i
                  ? 'border-[#4f8ef7] text-[#4f8ef7] bg-[#4f8ef7]/5'
                  : 'border-[#222] text-[#555] hover:border-[#444] hover:text-[#888]'
              }`}>
              {a.name ? (a.name.length > 15 ? a.name.split(' ')[0] : a.name) : 'Athlete'}
            </button>
          ))}
        </div>

        {/* Active athlete card */}
        <motion.div key={active} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#1a1a1a]">
          {/* Image */}
          <div className="relative overflow-hidden aspect-square">
            <img
              src={athlete.image}
              alt={athlete.name}
              style={{
                objectFit: 'cover',
                objectPosition: `${athlete.imageFit?.cropX || 0}% ${athlete.imageFit?.cropY || 0}%`,
                width: '100%',
                height: '100%',
                opacity: 0.8,
              }}
              className="w-full h-full"
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, transparent 50%, #0d0d0d), linear-gradient(to top, #0d0d0d 0%, transparent 40%)' }} />
            <div className="absolute bottom-4 left-4">
              <span className="font-mono-ui text-[10px] uppercase tracking-widest border border-[#4f8ef7]/40 text-[#4f8ef7] px-2 py-1 bg-[#0a0a0a]/80">
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
                    <span className="w-1 h-1 rounded-full bg-[#4f8ef7] flex-shrink-0 mt-1.5" />
                    {ach}
                  </li>
                ))}
              </ul>

              <blockquote className="border-l-2 border-[#4f8ef7]/40 pl-4">
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
          {athletes.map((_, i) => (
            <button key={i} onClick={() => setActive(i)}
              className={`h-1 transition-all ${i === active ? 'w-8 bg-[#4f8ef7]' : 'w-2 bg-[#2a2a2a]'}`} />
          ))}
        </div>
      </div>
    </section>
  );
}