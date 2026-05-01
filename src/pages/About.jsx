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
          style={{ background: 'radial-gradient(circle, #ff6b00, transparent)' }} />
        <div className="max-w-3xl mx-auto relative z-10">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
            className="font-mono-ui text-xs uppercase tracking-[0.4em] text-[#ff6b00] mb-3">
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

      {/* STORY BODY */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="border border-[#1a1a1a] bg-[#111] p-8">
            <p className="font-mono-ui text-sm text-[#999] leading-relaxed">
              We are a brand made by athletes who understand what real training demands. Our founders compete and roll regularly — which means we design and test every piece of gear from the inside out. We know the difference between a seam that holds through a scramble and one that doesn't. We know how important it is to feel locked in when you step onto the mat.
            </p>
            <p className="font-mono-ui text-sm text-[#999] leading-relaxed mt-4">
              Our mission is simple: <span className="text-[#ff8c00]">give fighters the confidence to perform at their best by giving them gear that won't let them down.</span> Whether you're a beginner finding your footing or a seasoned competitor preparing for your next tournament, Chokepoint gear is made to move with you — and take whatever the mat throws at it.
            </p>
            <p className="font-mono-ui text-sm text-[#999] leading-relaxed mt-4">
              We're based in Lapu-Lapu City, Cebu — the heart of Philippine combat sports culture. Our community drives everything we do. We work with local gyms, academies, and fighters to make sure what we build actually serves the people who train every day.
            </p>
          </motion.div>
        </div>
      </section>

      {/* PILLARS */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#1a1a1a]">
            {PILLARS.map((p, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}
                className="bg-[#0a0a0a] p-6 flex flex-col gap-3">
                <p.icon className="w-5 h-5 text-[#ff6b00]" />
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
            className="flex items-start gap-5 border border-[#1a1a1a] bg-[#111] p-6 hover:border-[#ff6b00]/40 transition-colors group"
          >
            <MapPin className="w-6 h-6 text-[#ff6b00] flex-shrink-0 mt-1" />
            <div>
              <p className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest mb-1">Our Location</p>
              <p className="font-tactical text-2xl text-white">Lapu-Lapu City, Cebu</p>
              <p className="font-mono-ui text-xs text-[#666] mt-1">Philippines</p>
              <p className="font-mono-ui text-xs text-[#ff6b00] mt-2 group-hover:underline">View on Google Maps →</p>
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