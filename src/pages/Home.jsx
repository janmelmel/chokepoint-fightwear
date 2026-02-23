import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import HeroSection from '@/components/storefront/HeroSection';
import ProductSection from '@/components/storefront/ProductSection';
import CustomOrderSection from '@/components/storefront/CustomOrderSection';
import OrderTrackingSection from '@/components/storefront/OrderTrackingSection';
import CheckoutModal from '@/components/storefront/CheckoutModal';
import Footer from '@/components/storefront/Footer';

const PRODUCTS = [
  {
    id: 1,
    name: 'Midnight Strangle Rashguard',
    price: 1899,
    category: 'rashguard',
    status: 'pre-order',
    image: 'https://images.unsplash.com/photo-1517438476312-10d79c077509?w=600&q=80',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    drop: 1
  },
  {
    id: 2,
    name: 'V2 Fight Shorts',
    price: 1499,
    category: 'shorts',
    status: 'available',
    image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&q=80',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    drop: 2
  },
  {
    id: 3,
    name: 'Chokepoint Logo Tee',
    price: 799,
    category: 'apparel',
    status: 'available',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    drop: 2
  }
];

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleBuy = (product, size) => {
    setSelectedProduct(product);
    setSelectedSize(size);
    setIsModalOpen(true);
  };

  const drop1Products = PRODUCTS.filter(p => p.drop === 1);
  const drop2Products = PRODUCTS.filter(p => p.drop === 2);

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=UnifrakturMaguntia&family=Inter:wght@300;400;500;600;700;800;900&display=swap');
          
          .font-blackletter {
            font-family: 'UnifrakturMaguntia', cursive;
          }
          
          .font-body {
            font-family: 'Inter', sans-serif;
          }
          
          .neon-glow {
            text-shadow: 0 0 10px #FF0A0A, 0 0 20px #FF0A0A, 0 0 40px #FF0A0A;
          }
          
          .neon-border {
            box-shadow: 0 0 15px rgba(255, 10, 10, 0.3), inset 0 0 15px rgba(255, 10, 10, 0.1);
          }
          
          .scanline {
            background: repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(255, 10, 10, 0.03) 2px,
              rgba(255, 10, 10, 0.03) 4px
            );
          }
        `}
      </style>

      <div className="scanline fixed inset-0 pointer-events-none z-50" />

      <HeroSection />
      
      <ProductSection 
        title="DROP 01" 
        subtitle="RASHGUARDS"
        products={drop1Products}
        onBuy={handleBuy}
      />
      
      <ProductSection 
        title="DROP 02" 
        subtitle="SHORTS & APPAREL"
        products={drop2Products}
        onBuy={handleBuy}
      />
      
      <CustomOrderSection />
      
      <OrderTrackingSection />
      
      <Footer />

      <AnimatePresence>
        {isModalOpen && (
          <CheckoutModal 
            product={selectedProduct}
            size={selectedSize}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}