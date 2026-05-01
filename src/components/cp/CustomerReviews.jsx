import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ReviewCard from './ReviewCard';

const DUMMY_REVIEWS = [
  {
    name: 'Erwin C.*',
    location: 'Daet, Camarines Norte',
    product: 'Fatboi Shirt',
    rating: 5,
    text: 'Legit, nakarating na nga ng Warriors MMA Academy, Daet, Camarines Norte (Bicol)',
    avatar: 'EC',
    image: null,
    imageFit: { scale: 1, offsetX: 50, offsetY: 50 },
  },
  {
    name: 'Eid D.*',
    location: 'Philippines',
    product: 'Custom Rashguard',
    rating: 5,
    text: 'As the headcoach of Red Clouds Jiujitsu, one of the best gears out there.',
    avatar: 'ED',
    image: null,
    imageFit: { scale: 1, offsetX: 50, offsetY: 50 },
  },
  {
    name: 'Arnel L.*',
    location: 'Philippines',
    product: 'G-Loc SET',
    rating: 5,
    text: '100% legit.....fair price=quality+comfort',
    avatar: 'AL',
    image: null,
    imageFit: { scale: 1, offsetX: 50, offsetY: 50 },
  },
  {
    name: 'Jojo P.*',
    location: 'Philippines',
    product: 'Customize Design',
    rating: 5,
    text: '100% legit!!! As the head coach of 90/Eight Jiu Jitsu PH I definitely recommend.',
    avatar: 'JP',
    image: null,
    imageFit: { scale: 1, offsetX: 50, offsetY: 50 },
  },
  {
    name: 'Aubrey S.*',
    location: 'Philippines',
    product: 'Fatboi SET',
    rating: 5,
    text: '100% Legit.. Good workmanship and materials..',
    avatar: 'AS',
    image: null,
    imageFit: { scale: 1, offsetX: 50, offsetY: 50 },
  },
  {
    name: 'Elcy D.*',
    location: 'Cebu to Tacloban',
    product: 'Daruma No Gi SET',
    rating: 5,
    text: '100% I\'ll vouch for Chokepoint Fightwear, got my DARUMA gears in 2days time. Great quality rashguards, budget friendly as well.',
    avatar: 'ED',
    image: null,
    imageFit: { scale: 1, offsetX: 50, offsetY: 50 },
  },
];

function Stars({ count = 5 }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className={`w-3.5 h-3.5 ${i < count ? 'text-[#4f8ef7] fill-[#4f8ef7]' : 'text-[#2a2a2a]'}`} />
      ))}
    </div>
  );
}

export default function CustomerReviews() {
  const [reviews, setReviews] = useState(DUMMY_REVIEWS);
  const [page, setPage] = useState(0);

  const updateReview = (idx, updatedReview) => {
    const newReviews = [...reviews];
    newReviews[idx] = updatedReview;
    setReviews(newReviews);
  };

  const perPage = 3;
  const totalPages = Math.ceil(reviews.length / perPage);
  const visible = reviews.slice(page * perPage, page * perPage + perPage);

  return (
    <section className="py-20 px-4 border-t border-[#1a1a1a]">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="font-mono-ui text-xs uppercase tracking-[0.4em] text-[#4f8ef7] mb-2">
              What Fighters Say
            </motion.p>
            <motion.h2 initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-tactical text-4xl sm:text-6xl text-white leading-none">
              REAL REVIEWS
            </motion.h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-tactical text-3xl text-[#6ea8ff]">5.0</p>
              <Stars />
              <p className="font-mono-ui text-[10px] text-[#555] mt-0.5">{reviews.length} verified reviews</p>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={page} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#1a1a1a]">
            {visible.map((r, i) => {
              const actualIdx = page * 3 + i;
              return (
                <ReviewCard
                  key={actualIdx}
                  review={r}
                  onUpdate={(updated) => updateReview(actualIdx, updated)}
                />
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
              className="p-2 border border-[#222] text-[#555] hover:border-[#4f8ef7] hover:text-[#4f8ef7] transition-colors disabled:opacity-30">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex gap-2">
              {[...Array(totalPages)].map((_, i) => (
                <button key={i} onClick={() => setPage(i)}
                  className={`h-1 transition-all ${i === page ? 'w-8 bg-[#4f8ef7]' : 'w-2 bg-[#2a2a2a]'}`} />
              ))}
            </div>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
              className="p-2 border border-[#222] text-[#555] hover:border-[#4f8ef7] hover:text-[#4f8ef7] transition-colors disabled:opacity-30">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}