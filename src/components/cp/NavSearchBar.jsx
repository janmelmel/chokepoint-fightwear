import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

/**
 * Compact icon-first search bar.
 * - expanded=false (default): shows only the 🔍 icon
 * - expanded=true: shows a 220px input with dropdown results
 * Pass `alwaysOpen` to skip the icon-toggle (used inside mobile menu)
 */
export default function NavSearchBar({ onResultClick, alwaysOpen = false }) {
  const [expanded, setExpanded] = useState(alwaysOpen);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();

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

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const q = query.toLowerCase();
    const catMap = Object.fromEntries(allCategories.map(c => [c.id, c.name]));
    setResults(allProducts.filter(p => {
      const catName = catMap[p.category_id] || '';
      return (
        p.name?.toLowerCase().includes(q) ||
        catName.toLowerCase().includes(q) ||
        p.edition?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }));
  }, [query, allProducts, allCategories]);

  // Close on outside click
  useEffect(() => {
    if (alwaysOpen) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        collapse();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [alwaysOpen]);

  const collapse = () => {
    if (alwaysOpen) return;
    setExpanded(false);
    setQuery('');
    setResults([]);
  };

  const open = () => {
    setExpanded(true);
    loadProducts();
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') { collapse(); return; }
    if (e.key === 'Enter' && query.trim()) {
      navigate(`/Search?q=${encodeURIComponent(query.trim())}`);
      collapse();
    }
  };

  const handleResultClick = (product) => {
    collapse();
    onResultClick?.(product);
  };

  const catMap = Object.fromEntries(allCategories.map(c => [c.id, c.name]));
  const shown = results.slice(0, 6);
  const hasMore = results.length > 6;

  // Always-open variant (inside mobile menu)
  if (alwaysOpen) {
    return (
      <div ref={containerRef} className="relative w-full">
        <div className="flex items-center gap-2 h-9 px-3 bg-[#1a1a1a] border border-[#E87722]" style={{ borderRadius: 4 }}>
          <Search className="w-3.5 h-3.5 text-[#666] flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); loadProducts(); }}
            onFocus={loadProducts}
            onKeyDown={handleKeyDown}
            placeholder="Search products..."
            className="flex-1 bg-transparent text-white font-mono-ui text-xs placeholder-[#555] focus:outline-none"
            style={{ fontSize: 13 }}
          />
          {query && (
            <button onClick={() => { setQuery(''); setResults([]); }} className="text-[#555] hover:text-white">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
        {query && (
          <div className="absolute top-full left-0 right-0 mt-0.5 bg-[#111] border border-[#333] shadow-2xl z-[200] overflow-hidden" style={{ borderRadius: '0 0 6px 6px' }}>
            {shown.length === 0 ? (
              <p className="px-4 py-3 font-mono-ui text-[10px] text-[#555]">No results for "{query}"</p>
            ) : (
              <>
                {shown.map(p => (
                  <button key={p.id} onClick={() => handleResultClick(p)}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#1a1a1a] transition-colors text-left">
                    <div className="w-8 h-8 flex-shrink-0 bg-[#0d0d0d] border border-[#222] overflow-hidden">
                      {p.images?.[0] ? <img src={p.images[0]} className="w-full h-full object-cover opacity-80" /> : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono-ui text-xs text-white truncate">{p.name}</p>
                      {catMap[p.category_id] && <p className="font-mono-ui text-[9px] text-[#E87722] truncate">{catMap[p.category_id]}</p>}
                    </div>
                    <p className="font-mono-ui text-[10px] text-white flex-shrink-0">₱{Number(p.price).toLocaleString()}</p>
                  </button>
                ))}
                {hasMore && (
                  <button onClick={() => { navigate(`/Search?q=${encodeURIComponent(query.trim())}`); collapse(); }}
                    className="w-full px-4 py-2 font-mono-ui text-[10px] text-[#E87722] hover:bg-[#1a1a1a] text-center border-t border-[#222] uppercase tracking-widest">
                    See all {results.length} results →
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  // Icon-first collapsible variant (desktop nav)
  return (
    <div ref={containerRef} className="relative flex items-center justify-end">
      <div style={{
        width: expanded ? 220 : 0,
        overflow: 'hidden',
        transition: 'width 0.3s ease',
        marginRight: expanded ? 6 : 0,
      }}>
        <div className="flex items-center gap-2 h-[34px] px-2.5 bg-[#1a1a1a] border border-[#E87722]" style={{ borderRadius: 4, width: 220 }}>
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); }}
            onFocus={loadProducts}
            onKeyDown={handleKeyDown}
            placeholder="Search products..."
            className="flex-1 bg-transparent text-white font-mono-ui placeholder-[#555] focus:outline-none"
            style={{ fontSize: 13, minWidth: 0 }}
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-[#555] hover:text-white flex-shrink-0">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Icon button — toggles expand/collapse */}
      <button
        onClick={expanded ? collapse : open}
        className="text-[#888] hover:text-white transition-colors flex-shrink-0"
        title="Search"
      >
        {expanded ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
      </button>

      {/* Dropdown */}
      {expanded && query && (
        <div className="absolute top-full right-0 mt-1 bg-[#111] border border-[#333] shadow-2xl z-[200] overflow-hidden"
          style={{ width: 220, borderRadius: '0 0 6px 6px' }}>
          {shown.length === 0 ? (
            <p className="px-4 py-3 font-mono-ui text-[10px] text-[#555]">No results for "{query}"</p>
          ) : (
            <>
              {shown.map(p => (
                <button key={p.id} onClick={() => handleResultClick(p)}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#1a1a1a] transition-colors text-left">
                  <div className="w-8 h-8 flex-shrink-0 bg-[#0d0d0d] border border-[#222] overflow-hidden">
                    {p.images?.[0] ? <img src={p.images[0]} className="w-full h-full object-cover opacity-80" /> : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono-ui text-xs text-white truncate">{p.name}</p>
                    {catMap[p.category_id] && <p className="font-mono-ui text-[9px] text-[#E87722] truncate">{catMap[p.category_id]}</p>}
                  </div>
                  <p className="font-mono-ui text-[10px] text-white flex-shrink-0">₱{Number(p.price).toLocaleString()}</p>
                </button>
              ))}
              {hasMore && (
                <button onClick={() => { navigate(`/Search?q=${encodeURIComponent(query.trim())}`); collapse(); }}
                  className="w-full px-4 py-2 font-mono-ui text-[10px] text-[#E87722] hover:bg-[#1a1a1a] text-center border-t border-[#222] uppercase tracking-widest">
                  See all {results.length} results →
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}