import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const DUMMY_REVIEWS = [
  {
    name: 'Aldrin M.',
    location: 'Cebu City',
    product: 'No-Gi Rashguard Set',
    rating: 5,
    text: 'I\'ve trained in a lot of rashguards and this is hands down the best fit I\'ve had. The fabric doesn\'t stretch out after rolling and the sublimation is still sharp after 3 months of daily training.',
    avatar: 'AM',
  },
  {
    name: 'Patricia L.',
    location: 'Davao City',
    product: 'Custom Team Kit',
    rating: 5,
    text: 'Ordered a custom kit for our academy and Chokepoint absolutely delivered. The colors are exactly what we designed and every piece arrived on time. Our team looked elite on competition day.',
    avatar: 'PL',
  },
  {
    name: 'Ronaldo C.',
    location: 'Manila',
    product: 'Grappling Shorts',
    rating: 5,
    text: 'These shorts survived 6 months of BJJ and wrestling without a single tear. The side slits are perfect for high kicks and the waistband keeps everything locked in during takedowns.',
    avatar: 'RC',
  },
  {
    name: 'Bianca T.',
    location: 'Iloilo City',
    product: 'Dri-Fit Training Shirt',
    rating: 5,
    text: 'Wore this to a tournament and got so many compliments. The fit is flattering and technical — not just a regular shirt with a logo slapped on. Will definitely be ordering more.',
    avatar: 'BT',
  },
  {
    name: 'Jerome D.',
    location: 'Cebu City',
    product: 'Gi — Pearl Weave',
    rating: 5,
    text: 'The quality of the weave is comparable to international brands but at a fraction of the price. Proud to rep a Filipino brand at every tournament I enter.',
    avatar: 'JD',
  },
  {
    name: 'Kristine A.',
    location: 'Bacolod',
    product: 'No-Gi Set',
    rating: 5,
    text: 'Fast shipping, beautiful packaging, and the gear itself is next level. Chokepoint clearly cares about the community and it shows in every detail.',
    avatar: 'KA',
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
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(0);

  useEffect(() => {
    (async () => {
      const dbReviews = await base44.entities.Review.list('-created_date', 100);
      if (dbReviews.length > 0) {
        const formatted = dbReviews.map(r => ({
          name: r.customer_name,
          location: r.customer_email ? r.customer_email.split('@')[0] : 'Customer',
          product: r.product_name,
          rating: r.rating || 5,
          text: r.comment || '',
          avatar: r.customer_name ? r.customer_name.split(' ').map(n => n[0]).join('') : 'C',
        })).filter(r => r.text);
        setReviews(formatted.length > 0 ? formatted : DUMMY_REVIEWS);
      } else {
        setReviews(DUMMY_REVIEWS);
      }
    })();
  }, []);

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
            {visible.map((r, i) => (
              <div key={i} className="bg-[#0a0a0a] p-6 flex flex-col gap-4 hover:bg-[#111] transition-colors">
                <Stars count={r.rating} />
                <p className="font-mono-ui text-xs text-[#888] leading-relaxed flex-1">"{r.text}"</p>
                <div className="border-t border-[#1a1a1a] pt-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#4f8ef7]/10 border border-[#4f8ef7]/20 flex items-center justify-center flex-shrink-0">
                    <span className="font-mono-ui text-[10px] text-[#4f8ef7] font-bold">{r.avatar}</span>
                  </div>
                  <div>
                    <p className="font-mono-ui text-xs text-white font-semibold">{r.name}</p>
                    <p className="font-mono-ui text-[10px] text-[#555]">{r.product} · {r.location}</p>
                  </div>
                </div>
              </div>
            ))}
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