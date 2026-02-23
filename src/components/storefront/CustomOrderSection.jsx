import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Palette, Send, CheckCircle, Loader2 } from 'lucide-react';

export default function CustomOrderSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    teamName: '',
    quantity: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Formspree endpoint - replace with your actual form ID
    const formspreeEndpoint = 'https://formspree.io/f/yourformid';

    try {
      const response = await fetch(formspreeEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setIsSubmitted(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          teamName: '',
          quantity: '',
          description: ''
        });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-[#080808]">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #FF0A0A 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative max-w-4xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-[#FF0A0A]/30 text-[#FF0A0A] mb-6">
            <Palette className="w-4 h-4" />
            <span className="font-body text-xs tracking-[0.2em] uppercase">Custom Orders</span>
          </div>
          <h2 className="font-blackletter text-4xl sm:text-5xl text-white">
            Team Gear
          </h2>
          <p className="font-body text-white/50 text-sm sm:text-base mt-4 max-w-md mx-auto">
            Design custom rashguards, shorts, and apparel for your team. Minimum order of 10 pieces.
          </p>
        </motion.div>

        {/* Form */}
        {isSubmitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#FF0A0A]/10 mb-6">
              <CheckCircle className="w-8 h-8 text-[#FF0A0A]" />
            </div>
            <h3 className="font-body text-xl font-semibold text-white">Request Submitted!</h3>
            <p className="font-body text-white/50 text-sm mt-2">
              We'll get back to you within 24-48 hours.
            </p>
            <button
              onClick={() => setIsSubmitted(false)}
              className="mt-6 font-body text-sm text-[#FF0A0A] hover:underline"
            >
              Submit another request
            </button>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <div className="space-y-1">
              <label className="font-body text-xs text-white/40 uppercase tracking-wider">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-white/10 text-white font-body text-sm focus:outline-none focus:border-[#FF0A0A]/50 transition-colors"
                placeholder="Juan Dela Cruz"
              />
            </div>

            <div className="space-y-1">
              <label className="font-body text-xs text-white/40 uppercase tracking-wider">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-white/10 text-white font-body text-sm focus:outline-none focus:border-[#FF0A0A]/50 transition-colors"
                placeholder="you@email.com"
              />
            </div>

            <div className="space-y-1">
              <label className="font-body text-xs text-white/40 uppercase tracking-wider">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-white/10 text-white font-body text-sm focus:outline-none focus:border-[#FF0A0A]/50 transition-colors"
                placeholder="09XX XXX XXXX"
              />
            </div>

            <div className="space-y-1">
              <label className="font-body text-xs text-white/40 uppercase tracking-wider">
                Team / Academy Name
              </label>
              <input
                type="text"
                name="teamName"
                value={formData.teamName}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-white/10 text-white font-body text-sm focus:outline-none focus:border-[#FF0A0A]/50 transition-colors"
                placeholder="e.g. Manila BJJ"
              />
            </div>

            <div className="space-y-1">
              <label className="font-body text-xs text-white/40 uppercase tracking-wider">
                Estimated Quantity *
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                min="10"
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-white/10 text-white font-body text-sm focus:outline-none focus:border-[#FF0A0A]/50 transition-colors"
                placeholder="Minimum 10"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="font-body text-xs text-white/40 uppercase tracking-wider">
                Design Details *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-white/10 text-white font-body text-sm focus:outline-none focus:border-[#FF0A0A]/50 transition-colors resize-none"
                placeholder="Describe your design concept, colors, logos, etc..."
              />
            </div>

            <div className="sm:col-span-2 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-4 bg-[#FF0A0A] text-white font-body text-sm tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-[#cc0808] transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Request
                  </>
                )}
              </button>
            </div>
          </motion.form>
        )}
      </div>
    </section>
  );
}