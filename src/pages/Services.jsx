import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Zap, Shield, Award, MessageCircle, ChevronDown } from 'lucide-react';
import CPLogo from '@/components/cp/CPLogo';
import FooterLinks from '@/components/cp/FooterLinks';
import StickyHeader from '@/components/cp/StickyHeader';

const SERVICES = [
  {
    id: 'nogi',
    tag: 'Most Popular',
    title: 'Custom No-Gi Sets',
    subtitle: 'Rashguard + Shorts — Built for the Mat',
    description:
      'Our flagship offering. Full sublimation printing on competition-grade compression fabric. Your design, your colors, your brand — printed edge to edge with zero fading. Perfect for teams, academies, and serious competitors.',
    highlights: ['Rashguard + Grappling Shorts set', 'Full sublimation — unlimited colors', 'Competition-grade 4-way stretch', 'Custom embroidery available', 'Academy bulk pricing'],
    image: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800&q=80',
    accent: '#ff6b00',
    cta: 'Order a No-Gi Set',
  },
  {
    id: 'handwraps',
    tag: 'Fighter Essential',
    title: 'Custom Handwraps',
    subtitle: 'Brand Every Wrap, Every Round',
    description:
      'Turn fight-day gear into a branding moment. Custom-printed handwraps with your gym logo, fighter name, or full graphic design. 4.5m length, elastic stretch cotton blend — built to protect and represent.',
    highlights: ['4.5m competition length', 'Custom logo & text print', 'Elastic cotton-poly blend', 'Available in team bulk packs', 'Wrist protection reinforced'],
    image: 'https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?w=800&q=80',
    accent: '#E87722',
    cta: 'Order Custom Handwraps',
  },
  {
    id: 'singlets',
    tag: 'Competition Ready',
    title: 'Custom Wrestling Singlets',
    subtitle: 'Dominate the Mat in Your Colors',
    description:
      'Tailored singlets for wrestling and submission grappling competitions. Cut for performance, printed for identity. Whether you\'re suiting up a school team or a national squad — we deliver precision fit and sharp prints.',
    highlights: ['Full-body sublimation print', 'Compression-fit polyester', 'Men\'s & women\'s cuts', 'Meets FILA competition standards', 'Team numbering included'],
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
    accent: '#ff6b00',
    cta: 'Order Custom Singlets',
  },
  {
    id: 'shirts',
    tag: 'Everyday Wear',
    title: 'Custom Dri-Fit Shirts',
    subtitle: 'Represent Off the Mat',
    description:
      'High-performance dri-fit shirts for training, events, and everyday gym life. Full front and back print capability with moisture-wicking fabric that keeps you cool during the hardest sessions.',
    highlights: ['Moisture-wicking dri-fit fabric', 'Full front + back print', 'Short & long sleeve options', 'Sleeveless/muscle cut available', 'Bulk academy discounts'],
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
    accent: '#E87722',
    cta: 'Order Custom Shirts',
  },
];

const ADVANTAGES = [
  {
    icon: Zap,
    title: 'Industry-Fast Turnaround',
    body: 'Most custom orders ship within 7–10 business days from confirmation. No months-long waits. We move fast so your team is ready when it matters.',
  },
  {
    icon: Award,
    title: '20+ Years of Manufacturing',
    body: 'We\'re backed by a manufacturer with over two decades of experience producing fight gear for athletes across Southeast Asia. That\'s 20 years of craft behind every stitch.',
  },
  {
    icon: Shield,
    title: 'No Minimums on Most Items',
    body: 'Whether you\'re ordering for yourself or your 50-person academy, we\'ve got a solution. Small runs and bulk orders both get the same quality treatment.',
  },
  {
    icon: CheckCircle,
    title: 'You Own the Design',
    body: 'Full creative control. Send us your artwork or work with our in-house design team to bring your vision to life — your logo, your colors, your identity.',
  },
];

const PROCESS_STEPS = [
  { step: '01', label: 'Inquire', desc: 'Send us your idea, design, or reference. We\'ll get back within 24 hours.' },
  { step: '02', label: 'Quote', desc: 'We send you a detailed quote with material specs and a delivery estimate.' },
  { step: '03', label: 'Design Proof', desc: 'Our team creates a digital mockup for your approval before production.' },
  { step: '04', label: 'Production', desc: 'Your gear enters production — 7 to 10 business days for most orders.' },
  { step: '05', label: 'Ship', desc: 'Your custom gear ships directly to your door or training facility.' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' } }),
};

export default function Services() {
  const [activeService, setActiveService] = useState(null);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <StickyHeader />

      {/* HERO */}
      <section className="relative overflow-hidden pt-24 pb-20 px-4">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, #fff 0px, #fff 1px, transparent 1px, transparent 40px)' }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#ff6b00]/8 blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.p
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="font-mono-ui text-[10px] text-[#ff6b00] uppercase tracking-[0.4em] mb-4">
            Custom Fight Gear
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="font-tactical text-6xl sm:text-8xl text-white leading-none mb-6">
            BUILT FOR<br />
            <span className="text-[#ff6b00]">FIGHTERS.</span><br />
            MADE FOR<br />
            <span style={{ WebkitTextStroke: '1px #ff6b00', color: 'transparent' }}>YOUR BRAND.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.3 }}
            className="font-mono-ui text-sm text-[#888] max-w-xl mx-auto leading-relaxed mb-8">
            From academy sets to competition singlets — we manufacture custom fight gear with
            20+ years of production expertise and turnaround times that won't make you wait.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/Custom"
              className="btn-glow-orange font-mono-ui text-xs uppercase tracking-widest px-8 py-4 flex items-center justify-center gap-2">
              Start a Custom Order <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#services"
              className="btn-glow-white font-mono-ui text-xs uppercase tracking-widest px-8 py-4 flex items-center justify-center gap-2">
              See What We Offer <ChevronDown className="w-4 h-4" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* LEVERAGE STRIP */}
      <section className="border-y border-[#1a1a1a] bg-[#0d0d0d] py-5 overflow-hidden">
        <div className="flex gap-12 items-center justify-center flex-wrap px-6">
          {['7–10 Business Day Turnaround', '20+ Years of Manufacturing', 'Full Sublimation Printing', 'No Hidden Fees', 'Custom for Teams & Academies'].map((item, i) => (
            <p key={i} className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest whitespace-nowrap flex items-center gap-3">
              <span className="w-1 h-1 bg-[#ff6b00] rounded-full inline-block" />
              {item}
            </p>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="font-mono-ui text-[10px] text-[#ff6b00] uppercase tracking-[0.3em] mb-3">What We Make</p>
            <h2 className="font-tactical text-5xl sm:text-6xl text-white">Our Services</h2>
          </div>

          <div className="space-y-6">
            {SERVICES.map((service, i) => (
              <motion.div
                key={service.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i * 0.05}
                variants={fadeUp}
                className="border border-[#1a1a1a] bg-[#0d0d0d] overflow-hidden group">

                {/* Collapsed header — always visible */}
                <button
                  onClick={() => setActiveService(activeService === service.id ? null : service.id)}
                  className="w-full text-left px-6 py-6 flex items-center gap-6 hover:bg-[#111] transition-colors">
                  {/* Number */}
                  <span className="font-tactical text-5xl text-[#1a1a1a] group-hover:text-[#222] transition-colors flex-shrink-0 leading-none">
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <span className="font-mono-ui text-[9px] px-2 py-0.5 border"
                        style={{ color: service.accent, borderColor: `${service.accent}40`, background: `${service.accent}10` }}>
                        {service.tag}
                      </span>
                    </div>
                    <p className="font-tactical text-3xl sm:text-4xl text-white">{service.title}</p>
                    <p className="font-mono-ui text-xs text-[#555] mt-0.5">{service.subtitle}</p>
                  </div>

                  <ChevronDown className={`w-5 h-5 text-[#555] flex-shrink-0 transition-transform duration-300 ${activeService === service.id ? 'rotate-180 text-[#ff6b00]' : ''}`} />
                </button>

                {/* Expanded panel */}
                {activeService === service.id && (
                  <div className="border-t border-[#1a1a1a] grid grid-cols-1 md:grid-cols-2 gap-0">
                    {/* Image */}
                    <div className="relative h-64 md:h-auto min-h-[220px] overflow-hidden">
                      <img src={service.image} alt={service.title}
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-70 transition-opacity duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d0d] via-transparent to-transparent md:block hidden" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-transparent to-transparent md:hidden block" />
                    </div>

                    {/* Content */}
                    <div className="p-6 md:p-8 flex flex-col justify-between">
                      <div>
                        <p className="font-mono-ui text-xs text-[#888] leading-relaxed mb-6">{service.description}</p>
                        <ul className="space-y-2 mb-8">
                          {service.highlights.map((h, j) => (
                            <li key={j} className="flex items-center gap-2 font-mono-ui text-[10px] text-[#ccc] uppercase tracking-wide">
                              <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: service.accent }} />
                              {h}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <Link to="/Custom"
                        className="btn-glow-orange font-mono-ui text-xs uppercase tracking-widest px-6 py-3 flex items-center justify-center gap-2 w-full sm:w-auto">
                        {service.cta} <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOKEPOINT */}
      <section className="py-24 px-4 border-t border-[#1a1a1a] bg-[#0d0d0d]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="font-mono-ui text-[10px] text-[#ff6b00] uppercase tracking-[0.3em] mb-3">Why Us</p>
            <h2 className="font-tactical text-5xl sm:text-6xl text-white">The Chokepoint<br />Advantage</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[#1a1a1a]">
            {ADVANTAGES.map((adv, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i * 0.1}
                variants={fadeUp}
                className="bg-[#0d0d0d] p-8 flex flex-col gap-4">
                <adv.icon className="w-6 h-6 text-[#ff6b00]" />
                <h3 className="font-tactical text-2xl text-white">{adv.title}</h3>
                <p className="font-mono-ui text-xs text-[#666] leading-relaxed">{adv.body}</p>
              </motion.div>
            ))}
          </div>

          {/* 20 years badge */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mt-12 border border-[#ff6b00]/20 bg-[#ff6b00]/5 p-8 text-center">
            <p className="font-tactical text-7xl sm:text-9xl text-[#ff6b00] leading-none mb-2">20+</p>
            <p className="font-mono-ui text-xs text-[#ff8c00] uppercase tracking-widest">Years of Manufacturing Expertise</p>
            <p className="font-mono-ui text-[11px] text-[#555] mt-3 max-w-md mx-auto">
              Every piece of gear we produce is backed by a manufacturing partner with over two decades of experience supplying fight sports equipment across Southeast Asia. You're not ordering from a startup — you're ordering from proven craft.
            </p>
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 px-4 border-t border-[#1a1a1a]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="font-mono-ui text-[10px] text-[#ff6b00] uppercase tracking-[0.3em] mb-3">The Process</p>
            <h2 className="font-tactical text-5xl sm:text-6xl text-white">From Idea to<br />Your Doorstep</h2>
          </div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[22px] top-0 bottom-0 w-px bg-[#1a1a1a] hidden sm:block" />

            <div className="space-y-0">
              {PROCESS_STEPS.map((step, i) => (
                <motion.div
                  key={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i * 0.1}
                  variants={fadeUp}
                  className="flex gap-6 items-start py-6 border-b border-[#111] last:border-0">
                  <div className="flex-shrink-0 w-11 h-11 border border-[#ff6b00]/40 bg-[#ff6b00]/5 flex items-center justify-center z-10">
                    <span className="font-mono-ui text-[10px] text-[#ff6b00]">{step.step}</span>
                  </div>
                  <div className="flex-1 pt-2">
                    <p className="font-tactical text-2xl text-white mb-1">{step.label}</p>
                    <p className="font-mono-ui text-xs text-[#666] leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 px-4 border-t border-[#1a1a1a] bg-[#0d0d0d] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#ff6b00]/6 blur-[150px] pointer-events-none" />
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <p className="font-mono-ui text-[10px] text-[#ff6b00] uppercase tracking-[0.3em] mb-4">Ready to Build?</p>
          <h2 className="font-tactical text-5xl sm:text-7xl text-white leading-none mb-6">
            YOUR GEAR.<br />
            <span className="text-[#ff6b00]">YOUR IDENTITY.</span><br />
            OUR CRAFT.
          </h2>
          <p className="font-mono-ui text-sm text-[#666] mb-10 leading-relaxed">
            Stop wearing generic gear. Build something that represents your academy, your team, your brand.
            Send us a message and we'll get your custom order started within 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/Custom"
              className="btn-glow-orange font-mono-ui text-xs uppercase tracking-widest px-10 py-5 flex items-center justify-center gap-2">
              Request a Custom Order <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="https://m.me/chokepointfightwear" target="_blank" rel="noreferrer"
              style={{ background: '#1877F2', border: '1px solid #1877F2', color: '#fff', fontWeight: 700 }}
              className="font-mono-ui text-xs uppercase tracking-widest px-10 py-5 flex items-center justify-center gap-2">
              <MessageCircle className="w-4 h-4" /> Message Us on Facebook
            </a>
          </div>
          <p className="font-mono-ui text-[10px] text-[#333] mt-8 uppercase tracking-widest">
            No Escape From Chokepoint.
          </p>
        </div>
      </section>

      <FooterLinks />
    </div>
  );
}