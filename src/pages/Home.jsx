import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import StickyHeader from '@/components/cp/StickyHeader';
import ProductDetailModal from '@/components/cp/ProductDetailModal';
import CartDrawer from '@/components/cp/CartDrawer';
import HeroSlideshow from '@/components/cp/HeroSlideshow';
import FeaturedProducts from '@/components/cp/FeaturedProducts';
import BrandHighlights from '@/components/cp/BrandHighlights';
import AthleteRoster from '@/components/cp/AthleteRoster';
import GlobalAthletes from '@/components/cp/GlobalAthletes';
import CustomerReviews from '@/components/cp/CustomerReviews';
import FooterLinks from '@/components/cp/FooterLinks';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [detailProduct, setDetailProduct] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [prods, cats, bans, adjustLogs] = await Promise.all([
    base44.entities.Product.filter({ status: 'Live', is_archived: false }),
    base44.entities.Category.filter({ is_active: true }),
    base44.entities.HeroBanner.filter({ is_active: true }, 'sort_order', 10),
    base44.entities.StockAdjustLog.list('-created_date', 500)]
    );

    const catMap = Object.fromEntries(cats.map((c) => [c.id, c.name]));
    const outsideReasons = [
    'Outside order (Facebook/Messenger)',
    'Outside order (Instagram)',
    'Outside order (Walk-in)',
    'Outside order (Event/Tournament)'];

    const outsideSoldMap = {};
    for (const log of adjustLogs) {
      if (outsideReasons.includes(log.reason)) {
        outsideSoldMap[log.product_id] = (outsideSoldMap[log.product_id] || 0) + Math.abs(log.change_amount || 0);
      }
    }
    setProducts(prods.map((p) => ({
      ...p,
      category_name: catMap[p.category_id] || '',
      sold_count: (p.total_ordered || 0) + (outsideSoldMap[p.id] || 0)
    })));
    setBanners(bans);
  };

  const featured = products.filter((p) => p.is_featured);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <StickyHeader onCartClick={() => setCartOpen(true)} onProductPreview={setDetailProduct} />

      {/* HERO */}
      <HeroSlideshow banners={banners} />

      {/* BRAND HIGHLIGHTS */}
      <BrandHighlights />

      {/* FEATURED PRODUCTS */}
      <section className="border-t border-[#1a1a1a] py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <FeaturedProducts products={featured.length ? featured : products.slice(0, 8)} onPreview={setDetailProduct} />
          <div className="text-center mt-10">
            <Link to="/Search" className="btn-glow-white px-10 py-3 font-mono-ui text-xs uppercase tracking-widest inline-flex items-center gap-2">
              Browse All Products →
            </Link>
          </div>
        </div>
      </section>

      {/* GLOBAL ATHLETES */}
      <GlobalAthletes />

      {/* TEAM ATHLETES */}
      <AthleteRoster />

      {/* CUSTOMER REVIEWS */}
      <CustomerReviews />

      {/* CUSTOM GEAR CTA */}
      <section className="py-20 px-4 border-t border-[#1a1a1a] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] blur-[140px] pointer-events-none opacity-20"
        style={{ background: 'radial-gradient(circle, #2563eb, transparent)' }} />
        <div className="max-w-2xl mx-auto text-center relative z-10">
          
          <h2 className="font-tactical text-4xl sm:text-6xl text-white leading-none mb-4">CUSTOM GEAR</h2>
          <div className="w-12 h-px bg-[#333] mx-auto mb-6" />
          <p className="font-mono-ui text-sm text-[#666] mb-8">
            Team kits, academy sets, custom patches — tell us what you need and we'll build it with you.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/Custom" className="btn-glow-orange px-10 py-4 font-mono-ui text-xs uppercase tracking-widest inline-flex items-center gap-2">
              Request Custom Gear →
            </Link>
            <Link to="/Services" className="btn-glow-white px-10 py-4 font-mono-ui text-xs uppercase tracking-widest inline-flex items-center gap-2">
              See Our Services
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <FooterLinks />

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      <AnimatePresence>
        {detailProduct &&
        <ProductDetailModal
          product={detailProduct}
          onClose={() => setDetailProduct(null)}
          onOrder={() => {setDetailProduct(null);setCartOpen(true);}} />

        }
      </AnimatePresence>
    </div>);

}