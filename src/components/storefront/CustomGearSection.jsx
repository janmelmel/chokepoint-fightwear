import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';

export default function CustomGearSection() {
  const [form, setForm] = useState({ name: '', email: '', details: '' });
  const [sent, setSent] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    const res = await fetch('https://formspree.io/f/yourformid', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setSent(true);
      setForm({ name: '', email: '', details: '' });
    }
  };

  return (
    <section className="py-16 px-4 sm:px-6 border-t border-white/10">
      <div className="max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <p className="font-inter text-[10px] tracking-[0.4em] text-[#8b0000] uppercase mb-2">
            Bespoke Orders
          </p>
          <h2
            className="text-4xl text-white"
            style={{ fontFamily: "'UnifrakturMaguntia', cursive" }}
          >
            Custom Gear
          </h2>
          <div className="w-12 h-px bg-[#8b0000] mx-auto mt-4 mb-4" />
          <p className="font-inter text-xs text-white/40 leading-relaxed">
            Team uniforms, custom patches, academy sets — minimum 10 pieces.
          </p>
        </motion.div>

        {sent ? (
          <div className="text-center py-8 border border-white/10">
            <p
              className="text-3xl text-[#8b0000] mb-2"
              style={{ fontFamily: "'UnifrakturMaguntia', cursive" }}
            >
              Received
            </p>
            <p className="font-inter text-xs text-white/40">We'll reach out within 24–48 hours.</p>
            <button onClick={() => setSent(false)} className="mt-4 font-inter text-[10px] text-white/30 hover:text-white/60 underline">
              Send another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Your Name"
              className="w-full bg-[#0a0a0a] border border-white/10 text-white font-inter text-sm px-4 py-3 focus:outline-none focus:border-[#8b0000]/60 placeholder-white/20"
            />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="Email Address"
              className="w-full bg-[#0a0a0a] border border-white/10 text-white font-inter text-sm px-4 py-3 focus:outline-none focus:border-[#8b0000]/60 placeholder-white/20"
            />
            <textarea
              name="details"
              value={form.details}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Describe your custom gear: product type, quantity, team name, design ideas..."
              className="w-full bg-[#0a0a0a] border border-white/10 text-white font-inter text-sm px-4 py-3 focus:outline-none focus:border-[#8b0000]/60 placeholder-white/20 resize-none"
            />
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-4 bg-[#8b0000] text-white font-inter text-xs tracking-[0.25em] uppercase hover:bg-[#a80000] transition-colors"
            >
              <Send className="w-4 h-4" />
              Send Request
            </button>
          </form>
        )}
      </div>
    </section>
  );
}