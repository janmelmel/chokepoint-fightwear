import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Search, Clock, CheckCircle, Truck, MapPin } from 'lucide-react';

export default function OrderTrackingSection() {
  const [trackingCode, setTrackingCode] = useState('');
  const [showDemo, setShowDemo] = useState(false);

  const handleTrack = (e) => {
    e.preventDefault();
    // Demo tracking - in real implementation, this would query your order system
    if (trackingCode.toLowerCase() === 'demo' || trackingCode.length >= 6) {
      setShowDemo(true);
    }
  };

  const demoSteps = [
    { status: 'confirmed', label: 'Order Confirmed', date: 'Feb 20, 2026', icon: CheckCircle, completed: true },
    { status: 'processing', label: 'Processing', date: 'Feb 21, 2026', icon: Package, completed: true },
    { status: 'shipped', label: 'Shipped', date: 'Feb 22, 2026', icon: Truck, completed: true },
    { status: 'delivery', label: 'Out for Delivery', date: 'Expected Feb 23', icon: MapPin, completed: false }
  ];

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-white/10 text-white/60 mb-6">
            <Package className="w-4 h-4" />
            <span className="font-body text-xs tracking-[0.2em] uppercase">Order Tracking</span>
          </div>
          <h2 className="font-blackletter text-4xl sm:text-5xl text-white">
            Track Your Order
          </h2>
        </motion.div>

        {/* Tracking Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onSubmit={handleTrack}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="flex-1 relative">
            <input
              type="text"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              placeholder="Enter tracking code or order number"
              className="w-full px-5 py-4 bg-[#0A0A0A] border border-white/10 text-white font-body text-sm focus:outline-none focus:border-[#FF0A0A]/50 transition-colors pl-12"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
          </div>
          <button
            type="submit"
            className="px-8 py-4 bg-[#FF0A0A] text-white font-body text-sm tracking-widest uppercase hover:bg-[#cc0808] transition-colors"
          >
            Track
          </button>
        </motion.form>

        <p className="font-body text-xs text-white/30 text-center mt-4">
          Type "demo" to see a sample tracking result
        </p>

        {/* Demo Tracking Result */}
        {showDemo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-6 bg-[#0A0A0A] border border-white/10"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-body text-xs text-white/40 uppercase tracking-wider">Order</p>
                <p className="font-body text-lg font-semibold text-white">#CP-2026-0223</p>
              </div>
              <span className="px-3 py-1 bg-[#FF0A0A]/10 text-[#FF0A0A] font-body text-xs tracking-wider uppercase">
                In Transit
              </span>
            </div>

            {/* Timeline */}
            <div className="space-y-0">
              {demoSteps.map((step, index) => (
                <div key={step.status} className="relative flex gap-4">
                  {/* Line */}
                  {index < demoSteps.length - 1 && (
                    <div className={`absolute left-[15px] top-8 w-[2px] h-[calc(100%-8px)] ${step.completed ? 'bg-[#FF0A0A]' : 'bg-white/10'}`} />
                  )}
                  
                  {/* Icon */}
                  <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${step.completed ? 'bg-[#FF0A0A]' : 'bg-white/10'}`}>
                    <step.icon className={`w-4 h-4 ${step.completed ? 'text-white' : 'text-white/40'}`} />
                  </div>
                  
                  {/* Content */}
                  <div className="pb-6">
                    <p className={`font-body text-sm font-medium ${step.completed ? 'text-white' : 'text-white/40'}`}>
                      {step.label}
                    </p>
                    <p className="font-body text-xs text-white/30 mt-0.5">{step.date}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowDemo(false)}
              className="mt-4 font-body text-xs text-white/40 hover:text-white transition-colors"
            >
              Clear tracking
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}