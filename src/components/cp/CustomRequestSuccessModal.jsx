import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, X } from 'lucide-react';

export default function CustomRequestSuccessModal({ onClose }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }} transition={{ type: 'spring', damping: 25 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-sm bg-[#111] border border-[#333] text-center p-8">
        <button onClick={onClose} className="absolute top-4 right-4 text-[#555] hover:text-white">
          <X className="w-4 h-4" />
        </button>
        <div className="w-16 h-16 bg-[#ff8c00]/10 border border-[#ff8c00]/30 flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-8 h-8 text-[#ff8c00]" />
        </div>
        <h2 className="font-tactical text-3xl text-white">Request Sent!</h2>
        <p className="font-mono-ui text-xs text-[#555] mt-2 leading-relaxed">
          Your custom gear request has been received.<br />
          We'll reach out within 24–48 hours.
        </p>
        <button onClick={onClose}
          className="btn-glow-orange w-full py-3 font-mono-ui text-xs tracking-widest uppercase mt-6">
          Close
        </button>
      </motion.div>
    </motion.div>
  );
}