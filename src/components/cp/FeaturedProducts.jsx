import React from 'react';
import { motion } from 'framer-motion';
import ProductCard from './ProductCard';

export default function FeaturedProducts({ products, onPreview }) {
  if (!products.length) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-8">
      <div className="flex items-center gap-4 mb-8">
        <div>
          <p className="font-mono-ui text-[10px] text-[#ff8c00] uppercase tracking-widest">Staff Picks</p>
          <h2 className="font-tactical text-4xl sm:text-5xl text-white">Featured</h2>
        </div>
        <div className="flex-1 h-px bg-[#ff8c00]/20" />
        <span className="font-mono-ui text-[11px] text-[#444]">{products.length} items</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map((p, i) => (
          <motion.div key={p.id}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
            <ProductCard product={p} onPreview={onPreview} />
          </motion.div>
        ))}
      </div>
      <div className="border-b border-[#1a1a1a] mt-12" />
    </section>
  );
}