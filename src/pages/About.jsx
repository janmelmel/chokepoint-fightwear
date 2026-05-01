import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users, Shield, Zap } from 'lucide-react';
import StickyHeader from '@/components/cp/StickyHeader';
import FooterLinks from '@/components/cp/FooterLinks';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.4 } }),
};

const PILLARS = [
  { icon: Shield, title: 'Built for the Mat', body: 'Every product is designed with real combat sports performance in mind — not just aesthetics.' },
  { icon: Users,  title: 'Made by Athletes', body: 'Our team trains. We know what it feels like to roll, drill, and compete. That lived experience shapes every decision we make.' },
  { icon: Zap,    title: 'Confidence Through Gear', body: 'When your gear fits right and performs under pressure, you compete with confidence. That\'s the standard we hold ourselves to.' },
];

export default function About() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <StickyHeader />

      {/* HERO */}
      <section className="pt-32 pb-16 px-4 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] blur-[120px] pointer-events-none opacity-30"
          style={{ background: 'radial-gradient(circle, #2563eb, transparent)' }} />
        <div className="max-w-3xl mx-auto relative z-10">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
            className="font-mono-ui text-xs uppercase tracking-[0.4em] text-[#4f8ef7] mb-3">
            Our Story
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.1 }}
            className="font-tactical text-5xl sm:text-7xl text-white leading-none mb-6">
            WHO WE ARE
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.2 }}
            className="font-mono-ui text-sm text-[#888] leading-relaxed max-w-2xl mx-auto">
            Chokepoint Fightwear is a combat sports apparel brand built from the ground up in <span className="text-white font-semibold">Cebu, Philippines</span> — by athletes, for athletes. We were frustrated by gear that looked good on a hanger but fell apart on the mat. So we stopped waiting for someone else to fix it and built Chokepoint ourselves.
          </motion.p>
        </div>
      </section>

      {/* PHOTO GRID */}
      <section className="py-8 px-4">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-2">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}
            className="col-span-2 relative overflow-hidden" style={{ height: '280px' }}>
            <img src="https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800&q=80" alt="BJJ training" className="w-full h-full object-cover opacity-80" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #0a0a0a 0%, transparent 60%)' }} />
          </motion.div>
          <div className="flex flex-col gap-2">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1} variants={fadeUp}
              className="relative overflow-hidden flex-1">
              <img src="https://images.unsplash.com/photo-1579216715010-7a0420c53c05?w=400&q=80" alt="Grappling gear" className="w-full h-full object-cover opacity-80" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #0a0a0a 0%, transparent 60%)' }} />
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2} variants={fadeUp}
              className="relative overflow-hidden flex-1">
              <img src="https://images.unsplash.com/photo-1517438322307-e67111335449?w=400&q=80" alt="MMA fighters" className="w-full h-full object-cover opacity-80" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #0a0a0a 0%, transparent 60%)' }} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* STORY BODY */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              className="relative overflow-hidden" style={{ height: '360px' }}>
              <img src="https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=700&q=80" alt="Custom fight gear" className="w-full h-full object-cover opacity-75" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, transparent 60%, #0a0a0a)' }} />
              <div className="absolute bottom-4 left-4">
                <span className="font-mono-ui text-[10px] text-[#4f8ef7] uppercase tracking-widest border border-[#4f8ef7]/30 px-2 py-1 bg-[#0a0a0a]/70">Cebu, PH</span>
              </div>
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1} variants={fadeUp}
              className="border border-[#1a1a1a] bg-[#111] p-8">
              <p className="font-mono-ui text-sm text-[#999] leading-relaxed">
                We are a brand made by athletes who understand what real training demands. Our founders compete and roll regularly — which means we design and test every piece of gear from the inside out. We know the difference between a seam that holds through a scramble and one that doesn't.
              </p>
              <p className="font-mono-ui text-sm text-[#999] leading-relaxed mt-4">
                Our mission is simple: <span className="text-[#6ea8ff]">give fighters the confidence to perform at their best by giving them gear that won't let them down.</span> Whether you're a beginner finding your footing or a seasoned competitor preparing for your next tournament, Chokepoint gear is made to move with you.
              </p>
              <p className="font-mono-ui text-sm text-[#999] leading-relaxed mt-4">
                We're based in Lapu-Lapu City, Cebu — the heart of Philippine combat sports culture. Our community drives everything we do.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* PILLARS */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#1a1a1a]">
            {PILLARS.map((p, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}
                className="bg-[#0a0a0a] p-6 flex flex-col gap-3">
                <p.icon className="w-5 h-5 text-[#4f8ef7]" />
                <h3 className="font-tactical text-xl text-white">{p.title}</h3>
                <p className="font-mono-ui text-xs text-[#666] leading-relaxed">{p.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* LOCATION */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.a
            href="https://maps.app.goo.gl/uhT8fLbgT7RUFM5d7"
            target="_blank"
            rel="noreferrer"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="flex items-start gap-5 border border-[#1a1a1a] bg-[#111] p-6 hover:border-[#4f8ef7]/40 transition-colors group"
          >
            <MapPin className="w-6 h-6 text-[#4f8ef7] flex-shrink-0 mt-1" />
            <div>
              <p className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest mb-1">Our Location</p>
              <p className="font-tactical text-2xl text-white">Lapu-Lapu City, Cebu</p>
              <p className="font-mono-ui text-xs text-[#666] mt-1">Philippines</p>
              <p className="font-mono-ui text-xs text-[#4f8ef7] mt-2 group-hover:underline">View on Google Maps →</p>
            </div>
          </motion.a>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 text-center">
        <div className="max-w-xl mx-auto">
          <p className="font-tactical text-3xl text-white mb-3">Ready to gear up?</p>
          <p className="font-mono-ui text-xs text-[#666] mb-6">Browse the collection or reach out to us directly.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/Home" className="btn-glow-orange px-8 py-3 font-mono-ui text-xs uppercase tracking-widest">
              Shop Now
            </Link>
            <Link to="/Contact" className="btn-glow-white px-8 py-3 font-mono-ui text-xs uppercase tracking-widest">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <FooterLinks />
    </div>
  );
}