import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import HeroSection from '@/components/storefront/HeroSection';
import ProductGrid from '@/components/storefront/ProductGrid';
import CustomGearSection from '@/components/storefront/CustomGearSection';
import CheckoutModal from '@/components/storefront/CheckoutModal';

const PRODUCTS = [
  {
    id: 1,
    name: 'No Gi SET',
    subtitle: 'Rashguard + Shorts',
    edition: 'Standard',
    fbLink: 'https://m.me/yourpage',
    image: 'https://images.unsplash.com/photo-1517438476312-10d79c077509?w=600&q=80',
  },
  {
    id: 2,
    name: 'Rashguard',
    subtitle: 'Classic Logo',
    edition: 'Standard',
    fbLink: 'https://m.me/yourpage',
    image: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&q=80',
  },
  {
    id: 3,
    name: 'Gi',
    subtitle: 'Heavyweight',
    edition: 'Standard',
    fbLink: 'https://m.me/yourpage',
    image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&q=80',
  },
  {
    id: 4,
    name: 'Pilipinas SET',
    subtitle: 'National Edition',
    edition: 'Limited',
    fbLink: 'https://m.me/yourpage',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
  },
  {
    id: 5,
    name: 'Grimthorn SET',
    subtitle: 'Limited Edition',
    edition: 'Rare',
    fbLink: 'https://m.me/yourpage',
    image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&q=80',
  },
];

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState(null);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-inter">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=UnifrakturMaguntia&family=Inter:wght@300;400;500;600;700;800&display=swap');
        .font-gothic { font-family: 'UnifrakturMaguntia', cursive; }
        .font-inter { font-family: 'Inter', sans-serif; }
        * { box-sizing: border-box; }
      `}</style>

      <HeroSection />
      <ProductGrid products={PRODUCTS} onOrder={setSelectedProduct} />
      <CustomGearSection />

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-4 text-center">
        <p className="font-gothic text-2xl text-[#8b0000] mb-1">Chokepoint</p>
        <p className="text-xs text-white/30 tracking-widest uppercase font-inter">Fightwear</p>
        <div className="mt-6">
          <Link
            to={createPageUrl('Staff')}
            className="text-[10px] text-white/10 hover:text-white/30 transition-colors font-inter tracking-widest uppercase"
          >
            System Access
          </Link>
        </div>
      </footer>

      <AnimatePresence>
        {selectedProduct && (
          <CheckoutModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}