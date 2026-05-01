import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import StickyHeader from '@/components/cp/StickyHeader';
import ProductCard from '@/components/cp/ProductCard';
import ProductDetailModal from '@/components/cp/ProductDetailModal';
import CartDrawer from '@/components/cp/CartDrawer';
import { Filter, X } from 'lucide-react';
import FooterLinks from '@/components/cp/FooterLinks';

export default function Category() {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [subCategories, setSubCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState(null);
  const [detailProduct, setDetailProduct] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [slug]);

  const loadData = async () => {
    setLoading(true);
    const [cats, prods, adjustLogs] = await Promise.all([
      base44.entities.Category.filter({ is_active: true }),
      base44.entities.Product.filter({ status: 'Live', is_archived: false }),
      base44.entities.StockAdjustLog.list('-created_date', 500),
    ]);
    
    setAllCategories(cats);
    
    const outsideReasons = [
      'Outside order (Facebook/Messenger)',
      'Outside order (Instagram)',
      'Outside order (Walk-in)',
      'Outside order (Event/Tournament)',
    ];
    const outsideSoldMap = {};
    for (const log of adjustLogs) {
      if (outsideReasons.includes(log.reason)) {
        outsideSoldMap[log.product_id] = (outsideSoldMap[log.product_id] || 0) + Math.abs(log.change_amount || 0);
      }
    }

    // Find the category by slug or id
    const cat = cats.find(c => c.slug === slug || c.id === slug);
    setCategory(cat);
    
    if (cat) {
      const subs = cats.filter(c => c.parent_id === cat.id);
      setSubCategories(subs);
      const catIds = [cat.id, ...subs.map(s => s.id)];
      const catMap = Object.fromEntries(cats.map(c => [c.id, c.name]));
      const filteredProds = prods
        .filter(p => catIds.includes(p.category_id))
        .map(p => ({
          ...p,
          category_name: catMap[p.category_id] || '',
          sold_count: (p.total_ordered || 0) + (outsideSoldMap[p.id] || 0),
        }));
      setProducts(filteredProds);
    }
    
    setSelectedSub(null);
    setLoading(false);
  };

  const filteredProducts = selectedSub
    ? products.filter(p => p.category_id === selectedSub)
    : products;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <StickyHeader onCartClick={() => setCartOpen(true)} onProductPreview={setDetailProduct} />
        <div className="pt-24 px-4 max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-[#1a1a1a]" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-square bg-[#1a1a1a]" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <StickyHeader onCartClick={() => setCartOpen(true)} onProductPreview={setDetailProduct} />
        <div className="pt-24 px-4 max-w-7xl mx-auto text-center">
          <h1 className="font-tactical text-4xl text-white mb-4">Category Not Found</h1>
          <p className="font-mono-ui text-[#666] text-sm">The category you're looking for doesn't exist.</p>
        </div>
        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <StickyHeader onCartClick={() => setCartOpen(true)} onProductPreview={setDetailProduct} />

      {/* Hero */}
      <div className="pt-20 pb-8 px-4 border-b border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto">
          <p className="font-mono-ui text-[10px] text-[#ff8c00] uppercase tracking-widest mb-2">Collection</p>
          <h1 className="font-tactical text-5xl sm:text-6xl text-white">{category.name}</h1>
          {category.description && (
            <p className="font-inter text-sm text-[#666] mt-3 max-w-xl">{category.description}</p>
          )}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Subcategory Filter */}
        {subCategories.length > 0 && (
          <div className="flex items-center gap-3 mb-8 flex-wrap">
            <Filter className="w-4 h-4 text-[#555]" />
            <button
              onClick={() => setSelectedSub(null)}
              className={`px-3 py-1.5 font-mono-ui text-[10px] uppercase tracking-widest border transition-colors ${
                !selectedSub
                  ? 'border-[#ff8c00] bg-[#ff8c00]/10 text-[#ff8c00]'
                  : 'border-[#333] text-[#666] hover:border-[#555] hover:text-white'
              }`}
            >
              All
            </button>
            {subCategories.map(sub => (
              <button
                key={sub.id}
                onClick={() => setSelectedSub(sub.id)}
                className={`px-3 py-1.5 font-mono-ui text-[10px] uppercase tracking-widest border transition-colors ${
                  selectedSub === sub.id
                    ? 'border-[#ff8c00] bg-[#ff8c00]/10 text-[#ff8c00]'
                    : 'border-[#333] text-[#666] hover:border-[#555] hover:text-white'
                }`}
              >
                {sub.name}
              </button>
            ))}
            {selectedSub && (
              <button
                onClick={() => setSelectedSub(null)}
                className="p-1.5 text-[#555] hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Products Grid */}
        <div className="flex items-center justify-between mb-6">
          <span className="font-mono-ui text-[11px] text-[#444]">{filteredProducts.length} products</span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-mono-ui text-[#444] text-sm">No products in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 items-stretch">
            {filteredProducts.map((p, i) => (
              <motion.div
                key={p.id}
                className="flex flex-col"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
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
        <ProductDetailModal
            product={detailProduct}
            onClose={() => setDetailProduct(null)}
            onOrder={() => { setDetailProduct(null); setCartOpen(true); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}