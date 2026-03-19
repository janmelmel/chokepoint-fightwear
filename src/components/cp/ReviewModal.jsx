import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import StarRating from './StarRating';

export default function ReviewModal({ order, onClose, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (!rating) return;
    setSubmitting(true);
    await base44.entities.Review.create({
      product_id: order.product_id,
      product_name: order.product_name,
      order_id: order.id,
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      rating,
      comment: comment.trim() || undefined,
    });
    setDone(true);
    setSubmitting(false);
    setTimeout(() => {
      onSubmitted && onSubmitted();
      onClose();
    }, 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-sm bg-[#111] border border-[#333]"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#222]">
          <div>
            <p className="font-mono-ui text-[9px] text-[#555] uppercase tracking-widest">Rate Your Purchase</p>
            <h2 className="font-tactical text-xl text-white">{order.product_name}</h2>
          </div>
          <button onClick={onClose} className="text-[#555] hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        {done ? (
          <div className="p-8 text-center">
            <p className="font-tactical text-2xl text-[#ff6b00] mb-1">Thank You!</p>
            <p className="font-mono-ui text-xs text-[#555]">Your review has been submitted.</p>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <div>
              <p className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest mb-3">Your Rating *</p>
              <StarRating value={rating} onChange={setRating} size={7} />
            </div>
            <div>
              <p className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest mb-1">Comment (optional)</p>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={3}
                placeholder="How was the quality, fit, delivery?"
                className="w-full bg-[#0a0a0a] border border-[#333] text-white font-mono-ui text-sm px-3 py-2.5 focus:outline-none focus:border-[#ff8c00]/60 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={onClose} style={{ background: '#2a2a2a', border: '1px solid #555', color: '#e0e0e0' }}
                className="flex-1 py-3 font-mono-ui text-xs uppercase tracking-widest hover:border-white transition-colors">
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={!rating || submitting}
                style={rating ? { background: '#ff6b00', border: '1px solid #ff6b00', color: '#fff', fontWeight: 700 }
                  : { background: '#1a1a1a', border: '1px solid #222', color: '#444', cursor: 'not-allowed' }}
                className="flex-1 py-3 font-mono-ui text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50">
                <Send className="w-3.5 h-3.5" />
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}