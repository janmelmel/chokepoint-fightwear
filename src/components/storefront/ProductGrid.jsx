import React from 'react';
import { motion } from 'framer-motion';
import ProductCard from './ProductCard';

export default function ProductGrid({ products, onOrder }) {
  return (
    <section id="gear" className="py-16 px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <p className="font-inter text-[10px] tracking-[0.4em] text-[#8b0000] uppercase mb-2">
          Current Drops
        </p>
        <h2
          className="text-4xl sm:text-5xl text-white"
          style={{ fontFamily: "'UnifrakturMaguntia', cursive" }}
        >
          The Collection
        </h2>
        <div className="w-12 h-px bg-[#8b0000] mx-auto mt-4" />
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.08 }}
          >
            <ProductCard product={product} onOrder={onOrder} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}