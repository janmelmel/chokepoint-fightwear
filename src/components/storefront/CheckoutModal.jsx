import React from 'react';
import { motion } from 'framer-motion';
import { X, CreditCard, MessageCircle, ShieldCheck } from 'lucide-react';

export default function CheckoutModal({ product, size, onClose }) {
  const formatPrice = (price) => `₱${price.toLocaleString()}`;

  // Pre-filled Messenger message
  const messengerMessage = encodeURIComponent(
    `Hi! I'd like to order:\n\n` +
    `🛒 ${product.name}\n` +
    `📏 Size: ${size}\n` +
    `💰 Price: ${formatPrice(product.price)}\n\n` +
    `Please confirm availability and payment details. Thank you!`
  );

  // Replace with your actual page
  const messengerLink = `https://m.me/yourpage?text=${messengerMessage}`;
  
  // Replace with your actual PayMongo/HitPay link
  const gcashLink = `https://paymongo.page/l/chokepoint-fightwear`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-[#0A0A0A] border border-white/10 overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-white/40 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="p-6 pb-4 border-b border-white/5">
          <h3 className="font-blackletter text-2xl text-white">Checkout</h3>
          <p className="font-body text-xs text-white/40 tracking-wider uppercase mt-1">
            Complete Your Order
          </p>
        </div>

        {/* Order Summary */}
        <div className="p-6 border-b border-white/5">
          <div className="flex gap-4">
            <div className="w-20 h-20 bg-[#111] overflow-hidden flex-shrink-0">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h4 className="font-body text-sm font-medium text-white">
                {product.name}
              </h4>
              <p className="font-body text-xs text-white/40 mt-1">
                Size: {size}
              </p>
              <p className="font-body text-lg font-bold text-[#FF0A0A] mt-2">
                {formatPrice(product.price)}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Options */}
        <div className="p-6 space-y-3">
          <p className="font-body text-xs text-white/40 uppercase tracking-wider mb-4">
            Choose Payment Method
          </p>

          {/* GCash/PayMongo Button */}
          <a
            href={gcashLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full py-4 bg-[#007DFE] text-white font-body text-sm tracking-wider uppercase hover:bg-[#0066cc] transition-colors"
          >
            <CreditCard className="w-5 h-5" />
            Pay via GCash / Card
          </a>

          {/* Messenger Button */}
          <a
            href={messengerLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full py-4 bg-[#0084FF] text-white font-body text-sm tracking-wider uppercase hover:bg-[#006acc] transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            Confirm via Messenger
          </a>
        </div>

        {/* Security Note */}
        <div className="px-6 pb-6">
          <div className="flex items-center gap-2 text-white/30">
            <ShieldCheck className="w-4 h-4" />
            <span className="font-body text-xs">Secure checkout • No data stored</span>
          </div>
        </div>

        {/* Corner Accents */}
        <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-[#FF0A0A]/30" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-[#FF0A0A]/30" />
      </motion.div>
    </motion.div>
  );
}