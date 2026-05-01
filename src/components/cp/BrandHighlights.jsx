import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Users, Award } from 'lucide-react';

const HIGHLIGHTS = [
  {
    icon: Shield,
    stat: '100%',
    label: 'Competition-Grade',
    body: 'Every product tested on real mats by real athletes before it ships.',
  },
  {
    icon: Zap,
    stat: 'Full Sublimation',
    label: 'Edge-to-Edge Print',
    body: 'Colors locked into the fabric — won\'t crack, peel, or fade after hundreds of washes.',
  },
  {
    icon: Award,
    stat: '20+',
    label: 'Years of Manufacturing',
    body: 'Backed by a factory with two decades of fight gear production across Southeast Asia.',
  },
  {
    icon: Users,
    stat: 'Athlete-Led',
    label: 'Built by Fighters',
    body: 'Our team rolls, drills, and competes. That lived experience is in every stitch.',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

export default function BrandHighlights() {
  return (
    <section className="py-20 px-4 border-t border-[#1a1a1a]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="font-mono-ui text-xs uppercase tracking-[0.4em] text-[#4f8ef7] mb-2">
            Why Chokepoint
          </motion.p>
          <motion.h2 initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-tactical text-4xl sm:text-6xl text-white leading-none">
            GEAR THAT EARNS ITS PLACE ON THE MAT
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[#1a1a1a]">
          {HIGHLIGHTS.map((h, i) => (
            <motion.div key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              className="bg-[#0a0a0a] p-8 flex gap-5 group hover:bg-[#111] transition-colors">
              <div className="flex-shrink-0 w-10 h-10 border border-[#4f8ef7]/20 flex items-center justify-center bg-[#4f8ef7]/5 group-hover:border-[#4f8ef7]/50 transition-colors">
                <h.icon className="w-5 h-5 text-[#4f8ef7]" />
              </div>
              <div>
                <p className="font-tactical text-2xl text-[#6ea8ff] leading-none">{h.stat}</p>
                <p className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest mt-0.5 mb-2">{h.label}</p>
                <p className="font-mono-ui text-xs text-[#666] leading-relaxed">{h.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}