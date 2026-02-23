import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Clock } from 'lucide-react';

export default function ProductCard({ product, onBuy }) {
  const [selectedSize, setSelectedSize] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  const handleBuyClick = () => {
    if (!selectedSize) {
      // Highlight size selector
      return;
    }
    onBuy(product, selectedSize);
  };

  const formatPrice = (price) => {
    return `₱${price.toLocaleString()}`;
  };

  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative bg-[#0A0A0A] border border-white/5 overflow-hidden"
    >
      {/* Status Badge */}
      {product.status === 'pre-order' && (
        <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-[#FF0A0A] text-white text-xs font-body tracking-wider uppercase">
          <Clock className="w-3 h-3" />
          Pre-Order
        </div>
      )}

      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-[#111]">
        <motion.img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
          animate={{ scale: isHovered ? 1.05 : 1 }}
          transition={{ duration: 0.4 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-60" />
        
        {/* Hover Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="absolute inset-0 bg-[#FF0A0A]/10"
        />
      </div>

      {/* Product Info */}
      <div className="p-5 sm:p-6">
        <h3 className="font-body text-lg sm:text-xl font-semibold text-white tracking-tight">
          {product.name}
        </h3>
        <p className="font-body text-2xl text-[#FF0A0A] font-bold mt-2">
          {formatPrice(product.price)}
        </p>

        {/* Size Selector */}
        <div className="mt-5">
          <p className="font-body text-xs text-white/40 uppercase tracking-wider mb-3">
            Select Size
          </p>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`
                  w-10 h-10 font-body text-xs font-medium tracking-wide
                  border transition-all duration-200
                  ${selectedSize === size 
                    ? 'border-[#FF0A0A] bg-[#FF0A0A] text-white' 
                    : 'border-white/20 text-white/60 hover:border-white/40 hover:text-white'
                  }
                `}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Buy Button */}
        <motion.button
          onClick={handleBuyClick}
          disabled={!selectedSize}
          whileTap={{ scale: 0.98 }}
          className={`
            w-full mt-6 py-4 font-body text-sm tracking-widest uppercase
            flex items-center justify-center gap-2 transition-all duration-300
            ${selectedSize 
              ? 'bg-[#FF0A0A] text-white hover:bg-[#cc0808]' 
              : 'bg-white/5 text-white/30 cursor-not-allowed'
            }
          `}
        >
          <ShoppingBag className="w-4 h-4" />
          {product.status === 'pre-order' ? 'Pre-Order Now' : 'Buy Now'}
        </motion.button>
      </div>

      {/* Corner Accent */}
      <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-[#FF0A0A]/20" />
    </motion.div>
  );
}