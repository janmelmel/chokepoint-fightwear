import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Award, Users } from 'lucide-react';

const REGIONS = [
  {
    region: 'Southeast Asia',
    icon: Globe,
    stats: '1000+ Athletes',
    athletes: 'BJJ competitors, MMA fighters, submission grapplers',
    story: 'From Bangkok gyms to Manila competitions, Chokepoint gear is the standard in Southeast Asian fight sports. Built for the climate, tested on the mats.',
    image: 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=600&q=80',
  },
  {
    region: 'North America',
    icon: Award,
    stats: '500+ Teams',
    athletes: 'College wrestling, UFC training camps, BJJ academies',
    story: 'From university wrestling rooms to UFC Octagon preparation, American athletes trust Chokepoint for durability under pressure.',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80',
  },
  {
    region: 'Europe',
    icon: Users,
    stats: '300+ Clubs',
    athletes: 'IBJJF competitors, European tournament teams',
    story: 'European fight communities depend on Chokepoint for consistency across borders. One brand, one standard, everywhere.',
    image: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=600&q=80',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.4 } }),
};

export default function GlobalAthletes() {
  return (
    <section className="py-20 px-4 border-t border-[#1a1a1a]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="font-mono-ui text-xs uppercase tracking-[0.4em] text-[#4f8ef7] mb-2">
            Global Community
          </motion.p>
          <motion.h2 initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-tactical text-4xl sm:text-6xl text-white leading-none">
            ATHLETES WORLDWIDE
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="font-mono-ui text-xs text-[#666] mt-4 max-w-2xl mx-auto leading-relaxed">
            From Tokyo dojos to São Paulo academies, athletes on every continent choose Chokepoint.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#1a1a1a]">
          {REGIONS.map((region, i) => (
            <motion.div key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              className="bg-[#0a0a0a] p-6 flex flex-col group hover:bg-[#111] transition-colors">
              
              {/* Image */}
              <div className="relative overflow-hidden mb-5" style={{ height: '200px' }}>
                <img src={region.image} alt={region.region} className="w-full h-full object-cover opacity-70 group-hover:opacity-80 transition-opacity" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #0a0a0a 0%, transparent 70%)' }} />
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <region.icon className="w-4 h-4 text-[#4f8ef7]" />
                  <h3 className="font-tactical text-2xl text-white">{region.region}</h3>
                </div>

                <p className="font-mono-ui text-[10px] text-[#4f8ef7] uppercase tracking-widest mb-1">{region.stats}</p>
                <p className="font-mono-ui text-xs text-[#999] mb-4">{region.athletes}</p>

                <p className="font-mono-ui text-xs text-[#666] leading-relaxed border-l border-[#4f8ef7]/30 pl-3">
                  {region.story}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom stat */}
        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 py-8 px-6 border border-[#4f8ef7]/20 bg-[#4f8ef7]/5 text-center">
          <p className="font-tactical text-5xl text-[#6ea8ff] leading-none mb-2">2000+</p>
          <p className="font-mono-ui text-xs text-[#666] uppercase tracking-widest">Athletes competing in Chokepoint every month</p>
        </motion.div>
      </div>
    </section>
  );
}