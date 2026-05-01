import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import StickyHeader from '@/components/cp/StickyHeader';
import ProductCard from '@/components/cp/ProductCard';
import ProductDetailModal from '@/components/cp/ProductDetailModal';
import CartDrawer from '@/components/cp/CartDrawer';
import FooterLinks from '@/components/cp/FooterLinks';
import { Search as SearchIcon, X } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

export default function Search() {
  const params = new URLSearchParams(window.location.search);
  const initialQ = params.get('q') || '';

  const [query, setQuery] = useState(initialQ);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailProduct, setDetailProduct] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const [prods, cats] = await Promise.all([
        base44.entities.Product.filter({ status: 'Live', is_archived: false }),
        base44.entities.Category.filter({ is_active: true }),
      ]);
      setProducts(prods);
      setCategories(cats);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults(products); return; }
    const q = query.toLowerCase();
    const catMap = Object.fromEntries(categories.map(c => [c.id, c.name]));
    setResults(products.filter(p => {
      const catName = catMap[p.category_id] || '';
      return (
        p.name?.toLowerCase().includes(q) ||
        catName.toLowerCase().includes(q) ||
        p.edition?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }));
  }, [query, products, categories]);

  // Sync category names
  const catMap = Object.fromEntries(categories.map(c => [c.id, c.name]));
  const enriched = results.map(p => ({ ...p, category_name: catMap[p.category_id] || '' }));

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <StickyHeader onCartClick={() => setCartOpen(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Search Header */}
        <div className="mb-8">
          <p className="font-mono-ui text-[10px] text-[#ff6b00] uppercase tracking-widest mb-2">Search</p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-lg bg-[#1a1a1a] border border-[#E87722] px-4 h-12" style={{ borderRadius: 4 }}>
              <SearchIcon className="w-4 h-4 text-[#666] flex-shrink-0" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search products..."
                autoFocus
                className="flex-1 bg-transparent text-white font-mono-ui text-sm placeholder-[#555] focus:outline-none"
              />
              {query && (
                <button onClick={() => setQuery('')} className="text-[#555] hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          {!loading && (
            <p className="font-mono-ui text-xs text-[#555] mt-3">
              {query.trim()
                ? `Showing ${enriched.length} result${enriched.length !== 1 ? 's' : ''} for "<span class="text-white">${query}</span>"`
                : `${products.length} products`}
            </p>
          )}
          {!loading && query.trim() && (
            <p className="font-mono-ui text-xs text-[#555] mt-3">
              Showing <span className="text-white">{enriched.length}</span> result{enriched.length !== 1 ? 's' : ''} for "<span className="text-[#E87722]">{query}</span>"
            </p>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <div key={i} className="card-tactical aspect-square animate-pulse" />)}
          </div>
        ) : enriched.length === 0 ? (
          <div className="text-center py-20">
            <SearchIcon className="w-10 h-10 text-[#333] mx-auto mb-4" />
            <p className="font-tactical text-2xl text-[#444] mb-2">No results found</p>
            <p className="font-mono-ui text-xs text-[#555] mb-1">No products found for "<span className="text-white">{query}</span>"</p>
            <p className="font-mono-ui text-[10px] text-[#444] mt-2">Try "rashguard", "kimono", or "no-gi"</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 items-stretch">
            {enriched.map((p, i) => (
              <motion.div key={p.id} className="flex flex-col"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}>
                <ProductCard product={p} onPreview={setDetailProduct} />
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <FooterLinks />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      <AnimatePresence>
        {detailProduct && (
          <ProductDetailModal product={detailProduct}
            onClose={() => setDetailProduct(null)}
            onOrder={() => { setDetailProduct(null); setCartOpen(true); }} />
        )}
      </AnimatePresence>
    </div>
  );
}