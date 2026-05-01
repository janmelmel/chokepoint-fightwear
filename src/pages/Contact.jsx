import React, { useState } from 'react';
import { Mail, MapPin, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import StickyHeader from '@/components/cp/StickyHeader';
import FooterLinks from '@/components/cp/FooterLinks';
import { base44 } from '@/api/base44Client';

const FB_URL = 'https://www.facebook.com/profile.php?id=61571430141920';
const IG_URL = 'https://www.instagram.com/chokepoint_fightwear/';
const MAPS_URL = 'https://maps.app.goo.gl/uhT8fLbgT7RUFM5d7';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSending(true);
    await base44.integrations.Core.SendEmail({
      to: 'sales@chokepoint-fightwear.com',
      subject: `Website inquiry from ${form.name}`,
      body: `Name: ${form.name}\nEmail: ${form.email}\n\nMessage:\n${form.message}`,
    });
    setSending(false);
    setSent(true);
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <StickyHeader />

      <section className="pt-32 pb-12 px-4 text-center">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
          className="font-mono-ui text-xs uppercase tracking-[0.4em] text-[#ff6b00] mb-3">
          Get in Touch
        </motion.p>
        <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.1 }}
          className="font-tactical text-5xl sm:text-7xl text-white leading-none">
          CONTACT US
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.2 }}
          className="font-mono-ui text-sm text-[#666] mt-4 max-w-md mx-auto">
          Questions about an order, custom gear, or just want to talk shop? We're here.
        </motion.p>
      </section>

      <section className="pb-20 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* LEFT: Contact info */}
          <div className="space-y-4">
            {/* Email */}
            <motion.a href="mailto:sales@chokepoint-fightwear.com" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="flex items-start gap-4 border border-[#1a1a1a] bg-[#111] p-5 hover:border-[#ff6b00]/40 transition-colors group">
              <Mail className="w-5 h-5 text-[#ff6b00] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest mb-1">Email</p>
                <p className="font-mono-ui text-sm text-white group-hover:text-[#ff8c00] transition-colors">sales@chokepoint-fightwear.com</p>
              </div>
            </motion.a>

            {/* Facebook */}
            <motion.a href={FB_URL} target="_blank" rel="noreferrer" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="flex items-start gap-4 border border-[#1a1a1a] bg-[#111] p-5 hover:border-[#ff6b00]/40 transition-colors group">
              <MessageCircle className="w-5 h-5 text-[#ff6b00] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest mb-1">Facebook / Messenger</p>
                <p className="font-mono-ui text-sm text-white group-hover:text-[#ff8c00] transition-colors">Chokepoint Fightwear</p>
                <p className="font-mono-ui text-[10px] text-[#555] mt-0.5">Message us for fast replies</p>
              </div>
            </motion.a>

            {/* Instagram */}
            <motion.a href={IG_URL} target="_blank" rel="noreferrer" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="flex items-start gap-4 border border-[#1a1a1a] bg-[#111] p-5 hover:border-[#ff6b00]/40 transition-colors group">
              <svg className="w-5 h-5 text-[#ff6b00] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <div>
                <p className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest mb-1">Instagram</p>
                <p className="font-mono-ui text-sm text-white group-hover:text-[#ff8c00] transition-colors">@chokepoint_fightwear</p>
              </div>
            </motion.a>

            {/* Location */}
            <motion.a href={MAPS_URL} target="_blank" rel="noreferrer" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="flex items-start gap-4 border border-[#1a1a1a] bg-[#111] p-5 hover:border-[#ff6b00]/40 transition-colors group">
              <MapPin className="w-5 h-5 text-[#ff6b00] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest mb-1">Physical Location</p>
                <p className="font-mono-ui text-sm text-white">Lapu-Lapu City, Cebu</p>
                <p className="font-mono-ui text-[10px] text-[#555] mt-0.5">Philippines</p>
                <p className="font-mono-ui text-[10px] text-[#ff6b00] mt-1 group-hover:underline">View on Google Maps →</p>
              </div>
            </motion.a>
          </div>

          {/* RIGHT: Contact form */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="border border-[#1a1a1a] bg-[#111] p-6">
            <p className="font-tactical text-2xl text-white mb-5">Send a Message</p>

            {sent ? (
              <div className="border border-green-500/30 bg-green-500/5 px-4 py-6 text-center">
                <p className="font-tactical text-xl text-green-400">Message Sent!</p>
                <p className="font-mono-ui text-xs text-[#666] mt-2">We'll get back to you as soon as possible.</p>
                <button onClick={() => setSent(false)} className="mt-4 font-mono-ui text-xs text-[#ff6b00] uppercase tracking-widest hover:underline">
                  Send another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest block mb-1">Name</label>
                  <input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Your name"
                    required
                    className="w-full bg-[#0a0a0a] border border-[#333] text-white font-mono-ui text-sm px-3 py-2.5 focus:outline-none focus:border-[#ff8c00]/60"
                  />
                </div>
                <div>
                  <label className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest block mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="your@email.com"
                    required
                    className="w-full bg-[#0a0a0a] border border-[#333] text-white font-mono-ui text-sm px-3 py-2.5 focus:outline-none focus:border-[#ff8c00]/60"
                  />
                </div>
                <div>
                  <label className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest block mb-1">Message</label>
                  <textarea
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="How can we help?"
                    required
                    rows={5}
                    className="w-full bg-[#0a0a0a] border border-[#333] text-white font-mono-ui text-sm px-3 py-2.5 focus:outline-none focus:border-[#ff8c00]/60 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full py-3 font-mono-ui text-xs uppercase tracking-widest font-bold disabled:opacity-40"
                  style={{ background: '#ff6b00', border: '1px solid #ff6b00', color: '#fff' }}
                >
                  {sending ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      <FooterLinks />
    </div>
  );
}