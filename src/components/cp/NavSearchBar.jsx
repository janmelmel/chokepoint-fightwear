import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function NavSearchBar({ onResultClick, placeholder = '🔍 Search products...' }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  // Lazy-load products on first focus
  const loadProducts = async () => {
    if (loaded) return;
    const [prods, cats] = await Promise.all([
      base44.entities.Product.filter({ status: 'Live', is_archived: false }),
      base44.entities.Category.filter({ is_active: true }),
    ]);
    setAllProducts(prods);
    setAllCategories(cats);
    setLoaded(true);
  };

  // Search instantly on every keystroke
  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const q = query.toLowerCase();
    const catMap = Object.fromEntries(allCategories.map(c => [c.id, c.name]));
    const filtered = allProducts.filter(p => {
      const catName = catMap[p.category_id] || '';
      return (
        p.name?.toLowerCase().includes(q) ||
        catName.toLowerCase().includes(q) ||
        p.edition?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    });
    setResults(filtered);
  }, [query, allProducts, allCategories]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') { setQuery(''); setOpen(false); inputRef.current?.blur(); }
    if (e.key === 'Enter' && query.trim()) {
      navigate(`/Search?q=${encodeURIComponent(query.trim())}`);
      setOpen(false);
      setQuery('');
    }
  };

  const handleResultClick = (product) => {
    setOpen(false);
    setQuery('');
    onResultClick?.(product);
  };

  const shown = results.slice(0, 8);
  const hasMore = results.length > 8;
  const catMap = Object.fromEntries(allCategories.map(c => [c.id, c.name]));

  return (
    <div ref={containerRef} className="relative">
      <div className={`flex items-center gap-2 h-9 px-3 bg-[#1a1a1a] border transition-colors ${open || query ? 'border-[#E87722]' : 'border-[#333]'}`}
        style={{ borderRadius: 4, minWidth: 0 }}>
        <Search className="w-3.5 h-3.5 text-[#666] flex-shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => { loadProducts(); setOpen(true); }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-white font-mono-ui text-xs placeholder-[#555] focus:outline-none min-w-0"
          style={{ width: '100%' }}
        />
        {query && (
          <button onClick={() => { setQuery(''); setResults([]); }} className="text-[#555] hover:text-white flex-shrink-0">
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {open && query && (
        <div className="absolute top-full left-0 right-0 mt-0.5 bg-[#111] border border-[#333] shadow-2xl z-[200] overflow-hidden"
          style={{ borderRadius: '0 0 8px 8px', maxHeight: 400, overflowY: 'auto' }}>
          {results.length === 0 ? (
            <div className="px-4 py-5 text-center">
              <p className="font-mono-ui text-xs text-[#555]">No products found for "<span className="text-white">{query}</span>"</p>
              <p className="font-mono-ui text-[10px] text-[#444] mt-1.5">Try "rashguard", "kimono", or "no-gi"</p>
            </div>
          ) : (
            <>
              {shown.map(p => {
                const catName = catMap[p.category_id] || '';
                const img = p.images?.[0];
                return (
                  <button key={p.id} onClick={() => handleResultClick(p)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#1a1a1a] transition-colors text-left">
                    <div className="w-10 h-10 flex-shrink-0 bg-[#0d0d0d] border border-[#222] overflow-hidden" style={{ borderRadius: 3 }}>
                      {img ? <img src={img} className="w-full h-full object-cover opacity-80" alt={p.name} /> : <div className="w-full h-full" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono-ui text-xs text-white font-bold truncate">{p.name}</p>
                      {catName && <p className="font-mono-ui text-[10px] text-[#E87722] truncate">{catName}</p>}
                    </div>
                    <p className="font-mono-ui text-xs text-white flex-shrink-0">₱{Number(p.price).toLocaleString()}</p>
                  </button>
                );
              })}
              {hasMore && (
                <button
                  onClick={() => { navigate(`/Search?q=${encodeURIComponent(query.trim())}`); setOpen(false); setQuery(''); }}
                  className="w-full px-4 py-2.5 font-mono-ui text-[10px] text-[#E87722] hover:bg-[#1a1a1a] text-center border-t border-[#222] uppercase tracking-widest transition-colors">
                  View all {results.length} results →
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}