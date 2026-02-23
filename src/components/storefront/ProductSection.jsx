import React from 'react';
import { motion } from 'framer-motion';
import ProductCard from './ProductCard';

export default function ProductSection({ title, subtitle, products, onBuy }) {
  return (
    <section id="drops" className="relative py-20 px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <span className="font-body text-xs tracking-[0.3em] text-[#FF0A0A] uppercase">
          {title}
        </span>
        <h2 className="font-blackletter text-4xl sm:text-5xl md:text-6xl text-white mt-2">
          {subtitle}
        </h2>
        <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-[#FF0A0A] to-transparent mx-auto mt-6" />
      </motion.div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <ProductCard product={product} onBuy={onBuy} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}