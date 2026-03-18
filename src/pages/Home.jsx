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
import HeroSlideshow from '@/components/cp/HeroSlideshow';
import FeaturedProducts from '@/components/cp/FeaturedProducts';
import CPLogo from '@/components/cp/CPLogo';
import CustomGearForm from '@/components/cp/CustomGearForm';
import AboutSection from '@/components/cp/AboutSection';
import FooterLinks from '@/components/cp/FooterLinks';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [detailProduct, setDetailProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [customSent, setCustomSent] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [prods, cats, bans] = await Promise.all([
    base44.entities.Product.filter({ status: 'Live', is_archived: false }),
    base44.entities.Category.filter({ is_active: true }),
    base44.entities.HeroBanner.filter({ is_active: true }, 'sort_order', 10)]
    );
    const catMap = Object.fromEntries(cats.map((c) => [c.id, c.name]));
    setProducts(prods.map((p) => ({ ...p, category_name: catMap[p.category_id] || '' })));
    setCategories(cats);
    setBanners(bans);
    setLoading(false);
  };

  // Build two-level hierarchy: parents → subcategories → products
  const parentCats = categories.filter((c) => !c.parent_id);
  const childCats = categories.filter((c) => !!c.parent_id);

  const grouped = parentCats.reduce((acc, parent) => {
    const subs = childCats.filter((c) => c.parent_id === parent.id);
    if (subs.length) {
      // Has subcategories — group products under each sub
      const subGroups = subs.reduce((sa, sub) => {
        const items = products.filter((p) => p.category_id === sub.id);
        if (items.length) sa.push({ sub, items });
        return sa;
      }, []);
      // Also grab products directly under parent (no sub)
      const directItems = products.filter((p) => p.category_id === parent.id);
      if (subGroups.length || directItems.length) acc.push({ cat: parent, subGroups, directItems });
    } else {
      // No subcategories — flat list
      const items = products.filter((p) => p.category_id === parent.id);
      if (items.length) acc.push({ cat: parent, subGroups: [], directItems: items });
    }
    return acc;
  }, []);

  const uncategorized = products.filter((p) => !p.category_id || !categories.find((c) => c.id === p.category_id));
  if (uncategorized.length) grouped.push({ cat: { id: 'misc', name: 'All Gear', slug: 'misc' }, subGroups: [], directItems: uncategorized });

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <StickyHeader onCartClick={() => setCartOpen(true)} />

      <HeroSlideshow banners={banners} />

      {/* FEATURED */}
      <FeaturedProducts products={products.filter((p) => p.is_featured)} onPreview={setDetailProduct} />

      {/* PRODUCTS */}
      <main id="gear" className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
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

        grouped.map(({ cat, subGroups, directItems }) => {
          const totalItems = directItems.length + subGroups.reduce((s, sg) => s + sg.items.length, 0);
          return (
            <section key={cat.id} id={cat.slug || cat.id} className="mb-20">
              {/* Parent header */}
              <div className="flex items-center gap-4 mb-8">
                <div>
                  <p className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest">Collection</p>
                  <h2 className="font-tactical text-4xl sm:text-5xl text-white">{cat.name}</h2>
                </div>
                <div className="flex-1 h-px bg-[#1a1a1a]" />
                <span className="font-mono-ui text-[11px] text-[#444]">{totalItems} items</span>
              </div>

              {/* Subcategory groups */}
              {subGroups.map(({ sub, items }) =>
              <div key={sub.id} id={sub.slug || sub.id} className="mb-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-1 h-5 bg-[#ff6b00]" />
                    <h3 className="font-tactical text-2xl text-[#ccc] uppercase">{sub.name}</h3>
                    <div className="flex-1 h-px bg-[#1a1a1a]" />
                    <span className="font-mono-ui text-[10px] text-[#444]">{items.length}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-stretch">
                    {items.map((p, i) =>
                  <motion.div key={p.id} className="flex flex-col" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
                        <ProductCard product={p} onPreview={setDetailProduct} />
                      </motion.div>
                  )}
                  </div>
                </div>
              )}

              {/* Direct items under parent (no sub) */}
              {directItems.length > 0 &&
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-stretch">
                  {directItems.map((p, i) =>
                <motion.div key={p.id} className="flex flex-col" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
                      <ProductCard product={p} onPreview={setDetailProduct} />
                    </motion.div>
                )}
                </div>
              }
            </section>);

        })
        }

        {/* CUSTOM GEAR */}
        <section id="custom" className="border-t border-[#1a1a1a] pt-16 max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <p className="font-mono-ui text-[10px] text-[#ff6b00] uppercase tracking-widest mb-2">Bespoke</p>
            <h2 className="font-tactical text-4xl sm:text-5xl text-white">Custom Gear</h2>
            <div className="w-12 h-px bg-[#333] mx-auto mt-4 mb-4" />
            <p className="font-inter text-sm text-[#666]">Team kits, custom patches, academy sets.</p>
          </div>
          <CustomGearForm onSuccess={() => setCustomSent(true)} />
        </section>
      </main>

      {/* ABOUT SECTION */}
      <AboutSection />

      {/* FOOTER */}
      <FooterLinks />

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      <AnimatePresence>
        {detailProduct &&
        <ProductDetailModal product={detailProduct}
        onClose={() => setDetailProduct(null)}
        onOrder={(p) => {setDetailProduct(null);setCartOpen(true);}} />
        }
        {customSent &&
        <CustomRequestSuccessModal onClose={() => setCustomSent(false)} />
        }
      </AnimatePresence>
    </div>);

}