import React from 'react';
import { motion } from 'framer-motion';
import { X, MessageCircle, CreditCard } from 'lucide-react';

export default function CheckoutModal({ product, onClose }) {
  const msg = encodeURIComponent(
    `Hi! I want to pre-order:\n\n` +
    `📦 ${product.name} — ${product.subtitle}\n\n` +
    `Please let me know the sizes available and payment details. Thank you!`
  );

  const messengerLink = `${product.fbLink}?text=${msg}`;
  const gcashLink = `https://paymongo.page/l/chokepoint-fightwear`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-sm bg-[#0a0a0a] border border-white/10"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-white/10">
          <div>
            <p className="font-inter text-[10px] text-[#8b0000] uppercase tracking-widest">Pre-order</p>
            <h3
              className="text-2xl text-white mt-0.5"
              style={{ fontFamily: "'UnifrakturMaguntia', cursive" }}
            >
              {product.name}
            </h3>
            <p className="font-inter text-xs text-white/40 mt-0.5">{product.subtitle}</p>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors mt-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-3">
          <p className="font-inter text-xs text-white/50">
            Choose how you'd like to proceed:
          </p>

          <a
            href={messengerLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 w-full px-4 py-4 border border-white/10 text-white font-inter text-sm font-medium hover:border-[#8b0000]/50 hover:bg-[#8b0000]/10 transition-all"
          >
            <MessageCircle className="w-5 h-5 text-[#8b0000] flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">Order via Messenger</p>
              <p className="text-[10px] text-white/40 mt-0.5">Chat with us to confirm your order</p>
            </div>
          </a>

          <a
            href={gcashLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 w-full px-4 py-4 bg-[#8b0000] text-white font-inter text-sm font-medium hover:bg-[#a80000] transition-all"
          >
            <CreditCard className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">Pay with GCash</p>
              <p className="text-[10px] text-white/60 mt-0.5">Secure payment via PayMongo</p>
            </div>
          </a>
        </div>

        <div className="px-5 pb-5">
          <p className="font-inter text-[10px] text-white/20 text-center">
            No data stored · Zero-credit checkout
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}