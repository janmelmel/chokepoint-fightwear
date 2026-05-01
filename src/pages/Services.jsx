import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Zap, Shield, Award, MessageCircle, ChevronDown } from 'lucide-react';
import FooterLinks from '@/components/cp/FooterLinks';
import StickyHeader from '@/components/cp/StickyHeader';

const SERVICES = [
  {
    id: 'nogi',
    tag: 'Most Popular',
    title: 'Custom No-Gi Sets',
    subtitle: 'Rashguard + Shorts — Built for the Mat',
    description: 'Full sublimation printing on competition-grade compression fabric. Your design, your colors, your brand — printed edge to edge with zero fading. Perfect for teams, academies, and serious competitors.',
    highlights: ['Rashguard + Grappling Shorts set', 'Full sublimation — unlimited colors', 'Competition-grade 4-way stretch', 'Custom embroidery available', 'Academy bulk pricing'],
    image: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800&q=80',
    accent: '#ff6b00',
  },
  {
    id: 'handwraps',
    tag: 'Fighter Essential',
    title: 'Custom Handwraps',
    subtitle: 'Brand Every Wrap, Every Round',
    description: 'Custom-printed handwraps with your gym logo, fighter name, or full graphic design. 4.5m elastic stretch cotton blend — built to protect and represent.',
    highlights: ['4.5m competition length', 'Custom logo & text print', 'Elastic cotton-poly blend', 'Available in team bulk packs', 'Wrist protection reinforced'],
    image: 'https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?w=800&q=80',
    accent: '#E87722',
  },
  {
    id: 'singlets',
    tag: 'Competition Ready',
    title: 'Custom Wrestling Singlets',
    subtitle: 'Dominate the Mat in Your Colors',
    description: 'Tailored singlets for wrestling and submission grappling competitions. Cut for performance, printed for identity — for school teams or national squads.',
    highlights: ['Full-body sublimation print', 'Compression-fit polyester', 'Men\'s & women\'s cuts', 'Meets FILA competition standards', 'Team numbering included'],
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
    accent: '#ff6b00',
  },
  {
    id: 'shirts',
    tag: 'Everyday Wear',
    title: 'Custom Dri-Fit Shirts',
    subtitle: 'Represent Off the Mat',
    description: 'High-performance dri-fit shirts for training, events, and everyday gym life. Full front and back print with moisture-wicking fabric.',
    highlights: ['Moisture-wicking dri-fit fabric', 'Full front + back print', 'Short & long sleeve options', 'Sleeveless/muscle cut available', 'Bulk academy discounts'],
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
    accent: '#E87722',
  },
];

const ADVANTAGES = [
  { icon: Zap,          title: 'Fast Turnaround',           body: 'Most custom orders ship within 7–10 business days. No months-long waits — your team is ready when it matters.' },
  { icon: Award,        title: '20+ Years Manufacturing',    body: 'Backed by a manufacturer with over two decades producing fight gear across Southeast Asia. Proven craft behind every stitch.' },
  { icon: Shield,       title: 'No Minimums on Most Items',  body: 'Ordering for yourself or a 50-person academy — we have a solution. Small runs and bulk orders get the same quality.' },
  { icon: CheckCircle,  title: 'You Own the Design',         body: 'Send your artwork or work with our in-house design team. Your logo, your colors, your identity.' },
];

const PROCESS_STEPS = [
  { step: '01', label: 'Inquire',       desc: 'Send us your idea or reference. We\'ll reply within 24 hours.' },
  { step: '02', label: 'Quote',         desc: 'Detailed quote with material specs and a delivery estimate.' },
  { step: '03', label: 'Design Proof', desc: 'Digital mockup for your approval before production starts.' },
  { step: '04', label: 'Production',   desc: '7–10 business days for most orders.' },
  { step: '05', label: 'Ship',          desc: 'Delivered straight to your door or training facility.' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' } }),
};

export default function Services() {
  const [activeService, setActiveService] = useState(null);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <StickyHeader />

      {/* HERO */}
      <section className="relative overflow-hidden pt-20 pb-14 px-4">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-[#ff6b00]/8 blur-[120px] pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
            className="font-mono-ui text-[10px] text-[#ff6b00] uppercase tracking-[0.4em] mb-3">
            Custom Fight Gear
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.1 }}
            className="font-tactical text-5xl sm:text-7xl text-white leading-none mb-4">
            BUILT FOR FIGHTERS.<br />
            <span className="text-[#ff6b00]">MADE FOR YOUR BRAND.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.25 }}
            className="font-mono-ui text-xs text-[#777] max-w-lg mx-auto leading-relaxed mb-6">
            From academy sets to competition singlets — custom fight gear with 20+ years of production expertise and turnaround times that won't make you wait.
          </motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.35 }}
            className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/Custom" className="btn-glow-orange font-mono-ui text-xs uppercase tracking-widest px-8 py-3 flex items-center justify-center gap-2">
              Start a Custom Order <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#services" className="btn-glow-white font-mono-ui text-xs uppercase tracking-widest px-8 py-3 flex items-center justify-center gap-2">
              See What We Offer <ChevronDown className="w-4 h-4" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* TICKER STRIP */}
      <section className="border-y border-[#1a1a1a] bg-[#0d0d0d] py-3 overflow-hidden">
        <div className="flex gap-10 items-center justify-center flex-wrap px-6">
          {['7–10 Business Day Turnaround', '20+ Years of Manufacturing', 'Full Sublimation Printing', 'No Hidden Fees', 'Custom for Teams & Academies'].map((item, i) => (
            <p key={i} className="font-mono-ui text-[10px] text-[#444] uppercase tracking-widest whitespace-nowrap flex items-center gap-2">
              <span className="w-1 h-1 bg-[#ff6b00] rounded-full inline-block flex-shrink-0" />{item}
            </p>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="font-mono-ui text-[10px] text-[#ff6b00] uppercase tracking-[0.3em] mb-2">What We Make</p>
            <h2 className="font-tactical text-4xl sm:text-5xl text-white">Our Services</h2>
          </div>

          <div className="space-y-3">
            {SERVICES.map((service, i) => (
              <motion.div key={service.id} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i * 0.05} variants={fadeUp}
                className="border border-[#1a1a1a] bg-[#0d0d0d] overflow-hidden">

                <button onClick={() => setActiveService(activeService === service.id ? null : service.id)}
                  className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-[#111] transition-colors">
                  <span className="font-tactical text-4xl text-[#1a1a1a] flex-shrink-0 leading-none w-10">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono-ui text-[9px] px-1.5 py-0.5 border"
                        style={{ color: service.accent, borderColor: `${service.accent}40`, background: `${service.accent}10` }}>
                        {service.tag}
                      </span>
                    </div>
                    <p className="font-tactical text-2xl sm:text-3xl text-white">{service.title}</p>
                    <p className="font-mono-ui text-[10px] text-[#555]">{service.subtitle}</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-[#555] flex-shrink-0 transition-transform duration-300 ${activeService === service.id ? 'rotate-180 text-[#ff6b00]' : ''}`} />
                </button>

                {activeService === service.id && (
                  <div className="border-t border-[#1a1a1a] grid grid-cols-1 md:grid-cols-2">
                    <div className="relative h-48 md:h-auto overflow-hidden">
                      <img src={service.image} alt={service.title} className="w-full h-full object-cover opacity-60" />
                      <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d0d] via-transparent to-transparent hidden md:block" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-transparent to-transparent md:hidden" />
                    </div>
                    <div className="p-5 flex flex-col justify-between gap-4">
                      <div>
                        <p className="font-mono-ui text-xs text-[#777] leading-relaxed mb-4">{service.description}</p>
                        <ul className="space-y-1.5">
                          {service.highlights.map((h, j) => (
                            <li key={j} className="flex items-center gap-2 font-mono-ui text-[10px] text-[#bbb] uppercase tracking-wide">
                              <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: service.accent }} />{h}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <Link to="/Custom" className="btn-glow-orange font-mono-ui text-xs uppercase tracking-widest px-5 py-2.5 flex items-center justify-center gap-2">
                        Order Now <ArrowRight className="w-3.5 h-3.5" />
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
      <section className="py-16 px-4 border-t border-[#1a1a1a] bg-[#0d0d0d]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="font-mono-ui text-[10px] text-[#ff6b00] uppercase tracking-[0.3em] mb-2">Why Us</p>
            <h2 className="font-tactical text-4xl sm:text-5xl text-white">The Chokepoint Advantage</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[#1a1a1a]">
            {ADVANTAGES.map((adv, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i * 0.08} variants={fadeUp}
                className="bg-[#0d0d0d] p-6 flex gap-4">
                <adv.icon className="w-5 h-5 text-[#ff6b00] flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-tactical text-xl text-white mb-1">{adv.title}</h3>
                  <p className="font-mono-ui text-[10px] text-[#555] leading-relaxed">{adv.body}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* 20 years badge */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="mt-6 border border-[#ff6b00]/20 bg-[#ff6b00]/5 px-8 py-6 flex flex-col sm:flex-row items-center gap-6">
            <p className="font-tactical text-7xl text-[#ff6b00] leading-none flex-shrink-0">20+</p>
            <div>
              <p className="font-mono-ui text-xs text-[#ff8c00] uppercase tracking-widest mb-1">Years of Manufacturing Expertise</p>
              <p className="font-mono-ui text-[10px] text-[#555] leading-relaxed">
                Every piece we produce is backed by a manufacturer with over two decades of experience supplying fight sports equipment across Southeast Asia. You're not ordering from a startup — you're ordering from proven craft.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 px-4 border-t border-[#1a1a1a]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <p className="font-mono-ui text-[10px] text-[#ff6b00] uppercase tracking-[0.3em] mb-2">The Process</p>
            <h2 className="font-tactical text-4xl sm:text-5xl text-white">From Idea to Your Doorstep</h2>
          </div>

          <div className="divide-y divide-[#111]">
            {PROCESS_STEPS.map((step, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i * 0.08} variants={fadeUp}
                className="flex gap-5 items-start py-4">
                <div className="flex-shrink-0 w-9 h-9 border border-[#ff6b00]/40 bg-[#ff6b00]/5 flex items-center justify-center">
                  <span className="font-mono-ui text-[9px] text-[#ff6b00]">{step.step}</span>
                </div>
                <div className="flex-1 pt-1">
                  <span className="font-tactical text-xl text-white">{step.label}</span>
                  <span className="font-mono-ui text-[10px] text-[#555] ml-3">{step.desc}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 border-t border-[#1a1a1a] bg-[#0d0d0d] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#ff6b00]/6 blur-[130px] pointer-events-none" />
        <div className="max-w-xl mx-auto text-center relative z-10">
          <p className="font-mono-ui text-[10px] text-[#ff6b00] uppercase tracking-[0.3em] mb-3">Ready to Build?</p>
          <h2 className="font-tactical text-4xl sm:text-6xl text-white leading-none mb-4">
            YOUR GEAR.<br /><span className="text-[#ff6b00]">YOUR IDENTITY.</span>
          </h2>
          <p className="font-mono-ui text-xs text-[#555] mb-8 leading-relaxed">
            Stop wearing generic gear. Build something that represents your academy, your team, your brand. Send us a message and we'll get your custom order started within 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/Custom" className="btn-glow-orange font-mono-ui text-xs uppercase tracking-widest px-8 py-4 flex items-center justify-center gap-2">
              Request a Custom Order <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="https://m.me/chokepointfightwear" target="_blank" rel="noreferrer"
              style={{ background: '#1877F2', border: '1px solid #1877F2', color: '#fff', fontWeight: 700 }}
              className="font-mono-ui text-xs uppercase tracking-widest px-8 py-4 flex items-center justify-center gap-2">
              <MessageCircle className="w-4 h-4" /> Message on Facebook
            </a>
          </div>
          <p className="font-mono-ui text-[10px] text-[#2a2a2a] mt-6 uppercase tracking-widest">No Escape From Chokepoint.</p>
        </div>
      </section>

      <FooterLinks />
    </div>
  );
}