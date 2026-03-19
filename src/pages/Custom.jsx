import React, { useState } from 'react';
import StickyHeader from '@/components/cp/StickyHeader';
import FooterLinks from '@/components/cp/FooterLinks';
import CartDrawer from '@/components/cp/CartDrawer';
import CustomGearForm from '@/components/cp/CustomGearForm';
import CustomRequestSuccessModal from '@/components/cp/CustomRequestSuccessModal';
import { AnimatePresence } from 'framer-motion';

export default function Custom() {
  const [cartOpen, setCartOpen] = useState(false);
  const [customSent, setCustomSent] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <StickyHeader onCartClick={() => setCartOpen(true)} />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-28 pb-20">
        <div className="text-center mb-12">
          <p className="font-mono-ui text-[10px] text-[#ff6b00] uppercase tracking-widest mb-2">Bespoke</p>
          <h1 className="font-tactical text-5xl sm:text-6xl text-white">Custom Gear</h1>
          <div className="w-12 h-px bg-[#333] mx-auto mt-4 mb-4" />
          <p className="font-mono-ui text-sm text-[#666]">Team kits, custom patches, academy sets. Tell us what you need.</p>
        </div>

        <CustomGearForm onSuccess={() => setCustomSent(true)} />
      </main>

      <FooterLinks />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      <AnimatePresence>
        {customSent && <CustomRequestSuccessModal onClose={() => setCustomSent(false)} />}
      </AnimatePresence>
    </div>
  );
}