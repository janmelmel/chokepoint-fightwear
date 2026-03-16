import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import StickyHeader from '@/components/cp/StickyHeader';
import ProductCard from '@/components/cp/ProductCard';
import ProductDetailModal from '@/components/cp/ProductDetailModal';
import CustomRequestSuccessModal from '@/components/cp/CustomRequestSuccessModal';
import CartDrawer from '@/components/cp/CartDrawer';
import CPLogo from '@/components/cp/CPLogo';
import { ChevronDown } from 'lucide-react';
import CustomGearForm from '@/components/cp/CustomGearForm';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailProduct, setDetailProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [customSent, setCustomSent] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadData();
  }, [refreshKey]);

  const loadData = async () => {
    setLoading(true);
    const [prods, cats] = await Promise.all([
    base44.entities.Product.filter({ status: 'Live', is_archived: false }),
    base44.entities.Category.filter({ is_active: true })]
    );
    const catMap = Object.fromEntries(cats.map((c) => [c.id, c.name]));
    setProducts(prods.map((p) => ({ ...p, category_name: catMap[p.category_id] || '' })));
    setCategories(cats);
    setLoading(false);
  };

  const grouped = categories.reduce((acc, cat) => {
    const items = products.filter((p) => p.category_id === cat.id);
    if (items.length) acc.push({ cat, items });
    return acc;
  }, []);

  const uncategorized = products.filter((p) => !p.category_id || !categories.find((c) => c.id === p.category_id));
  if (uncategorized.length) grouped.push({ cat: { id: 'misc', name: 'All Gear', slug: 'misc' }, items: uncategorized });

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <StickyHeader onCartClick={() => {}} />

      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
        <div className="absolute inset-0"
        style={{ backgroundImage: 'radial-gradient(ellipse at center, #1a0000 0%, #0a0a0a 70%)', opacity: 0.6 }} />
        <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 40px,#fff 40px,#fff 41px),repeating-linear-gradient(90deg,transparent,transparent 40px,#fff 40px,#fff 41px)' }} />

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
        className="relative z-10 text-center">
          <h1 style={{ fontFamily: "'Bitsumishi', sans-serif" }} className="text-6xl sm:text-8xl md:text-9xl text-white mt-6 leading-none uppercase">
            CHOKEPOINT
          </h1>
          <p className="font-mono-ui text-[11px] tracking-[0.5em] text-[#ff0000] uppercase mt-3">
            No Escape From Chokepoint
          </p>
          <div className="w-24 h-px bg-[#ff8c00] mx-auto mt-6 mb-8" />
          <a href="#gear"
          className="btn-glow-orange font-mono-ui text-xs tracking-[0.3em] uppercase px-8 py-4 inline-block">
            Shop the Drop
          </a>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}>
            <ChevronDown className="w-5 h-5 text-[#444]" />
          </motion.div>
        </motion.div>
      </section>

      {/* PRODUCTS */}
      <main id="gear" className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        {loading ?
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) =>
          <div key={i} className="card-tactical aspect-square animate-pulse" />
          )}
          </div> :
        grouped.length === 0 ?
        <div className="text-center py-20">
            <p className="font-mono-ui text-[#444] text-sm">No products live yet. Check back soon.</p>
          </div> :

        grouped.map(({ cat, items }) =>
        <section key={cat.id} id={cat.slug || cat.id} className="mb-16">
              <div className="flex items-center gap-4 mb-8">
                <div>
                  <p className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest">Collection</p>
                  <h2 className="font-tactical text-4xl sm:text-5xl text-white">{cat.name}</h2>
                </div>
                <div className="flex-1 h-px bg-[#1a1a1a]" />
                <span className="font-mono-ui text-[11px] text-[#444]">{items.length} items</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {items.map((p, i) =>
            <motion.div key={p.id}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
                    <ProductCard product={p} onOrder={setSelectedProduct} onPreview={setDetailProduct} />
                  </motion.div>
            )}
              </div>
            </section>
        )
        }

        {/* CUSTOM GEAR */}
        <section id="custom" className="border-t border-[#1a1a1a] pt-16 max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <p className="font-mono-ui text-[10px] text-[#ff8c00] uppercase tracking-widest mb-2">Bespoke</p>
            <h2 className="font-tactical text-4xl sm:text-5xl text-white">Custom Gear</h2>
            <div className="w-12 h-px bg-[#333] mx-auto mt-4 mb-4" />
            <p className="font-inter text-sm text-[#666]">Team kits, custom patches, academy sets.</p>
          </div>
          <CustomGearForm onSuccess={() => setCustomSent(true)} />
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-[#1a1a1a] py-10 px-4 text-center">
        <CPLogo size={32} variant="white" />
        <p className="font-mono-ui text-[10px] text-[#333] tracking-widest uppercase mt-3">
          © 2026 Chokepoint Fightwear
        </p>
        <div className="mt-4">
          <Link to={createPageUrl('Staff')} className="font-mono-ui text-[10px] text-[#222] hover:text-[#555] tracking-widest uppercase transition-colors">
            System Access
          </Link>
        </div>
      </footer>

      <AnimatePresence>
        {detailProduct &&
        <ProductDetailModal product={detailProduct}
        onClose={() => setDetailProduct(null)}
        onOrder={(p) => {setDetailProduct(null);setSelectedProduct(p);}} />
        }
        {selectedProduct &&
        <CheckoutModal product={selectedProduct} onClose={() => setSelectedProduct(null)}
        onOrderPlaced={() => {setSelectedProduct(null);setRefreshKey((k) => k + 1);}} />
        }
        {customSent &&
        <CustomRequestSuccessModal onClose={() => setCustomSent(false)} />
        }
      </AnimatePresence>
    </div>);

}