import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import CPLogo from './CPLogo';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useCart } from '@/hooks/useCart';

export default function StickyHeader({ cartCount = 0, onCartClick }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navLinks = [
    { label: 'No-Gi', href: '#no-gi' },
    { label: 'Gi', href: '#gi' },
    { label: 'Lifestyle', href: '#lifestyle' },
    { label: 'Custom', href: '#custom' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-[#333]' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Nav Left */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.slice(0, 2).map(l => (
            <a key={l.label} href={l.href}
              className="font-mono-ui text-[11px] text-[#888] hover:text-white tracking-widest uppercase transition-colors">
              {l.label}
            </a>
          ))}
        </nav>

        {/* Center Logo */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <Link to={createPageUrl('Home')}>
            <CPLogo size={36} variant="white" />
          </Link>
        </div>

        {/* Nav Right */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.slice(2).map(l => (
            <a key={l.label} href={l.href}
              className="font-mono-ui text-[11px] text-[#888] hover:text-white tracking-widest uppercase transition-colors">
              {l.label}
            </a>
          ))}
          <button onClick={onCartClick} className="relative text-[#888] hover:text-white transition-colors">
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#ff8c00] text-black text-[10px] font-bold rounded-full flex items-center justify-center font-mono-ui">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Mobile */}
        <div className="md:hidden flex items-center gap-3">
          <button onClick={onCartClick} className="relative text-[#888] hover:text-white">
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#ff8c00] text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-[#888] hover:text-white">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#0a0a0a] border-t border-[#333] px-4 py-4 space-y-3">
          {navLinks.map(l => (
            <a key={l.label} href={l.href}
              onClick={() => setMenuOpen(false)}
              className="block font-mono-ui text-[11px] text-[#888] hover:text-white tracking-widest uppercase py-2 border-b border-[#1a1a1a]">
              {l.label}
            </a>
          ))}
          <Link to={createPageUrl('Staff')}
            className="block font-mono-ui text-[10px] text-[#444] hover:text-[#666] tracking-widest uppercase py-2">
            Staff Portal
          </Link>
        </div>
      )}
    </header>
  );
}