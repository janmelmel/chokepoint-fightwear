import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import CPLogo from './CPLogo';
import { ShoppingBag, Menu, X, ChevronDown, UserCircle } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { base44 } from '@/api/base44Client';

export default function StickyHeader({ onCartClick }) {
  const { count: cartCount } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [authUser, setAuthUser] = useState(undefined); // undefined=loading, null=guest

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    (async () => {
      const cats = await base44.entities.Category.filter({ is_active: true }, 'sort_order');
      setCategories(cats);
    })();
    base44.auth.me().then(u => setAuthUser(u)).catch(() => setAuthUser(null));
  }, []);

  const parents = categories.filter(c => !c.parent_id);
  const getChildren = (parentId) => categories.filter(c => c.parent_id === parentId);

  const staticLinks = [
    { label: 'Track Order', to: '/TrackOrder' },
    { label: 'FAQ', to: '/FAQ' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-[#333]' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Nav Left - Dynamic Categories */}
        <nav className="hidden md:flex items-center gap-1">
          {parents.slice(0, 3).map(cat => {
            const children = getChildren(cat.id);
            const hasChildren = children.length > 0;
            
            return (
              <div
                key={cat.id}
                className="relative"
                onMouseEnter={() => setOpenDropdown(cat.id)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <Link
                  to={`/category/${cat.slug || cat.id}`}
                  className="flex items-center gap-1 px-3 py-2 font-mono-ui text-[11px] text-[#888] hover:text-white tracking-widest uppercase transition-colors"
                >
                  {cat.name}
                  {hasChildren && <ChevronDown className="w-3 h-3" />}
                </Link>
                {hasChildren && openDropdown === cat.id && (
                  <div className="absolute top-full left-0 min-w-[180px] bg-[#0d0d0d] border border-[#333] shadow-xl">
                    <Link
                      to={`/category/${cat.slug || cat.id}`}
                      className="block px-4 py-2.5 font-mono-ui text-[10px] text-[#ff8c00] hover:bg-[#1a1a1a] uppercase tracking-widest border-b border-[#222]"
                    >
                      View All
                    </Link>
                    {children.map(child => (
                      <Link
                        key={child.id}
                        to={`/category/${child.slug || child.id}`}
                        className="block px-4 py-2.5 font-mono-ui text-[11px] text-[#888] hover:text-white hover:bg-[#1a1a1a] uppercase tracking-widest transition-colors"
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <a href="#custom" className="px-3 py-2 font-mono-ui text-[11px] text-[#888] hover:text-white tracking-widest uppercase transition-colors">
            Custom
          </a>
        </nav>

        {/* Center Logo */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <Link to={createPageUrl('Home')}>
            <CPLogo size={36} variant="white" />
          </Link>
        </div>

        {/* Nav Right */}
        <div className="hidden md:flex items-center gap-4">
          {staticLinks.map(l => (
            <Link key={l.label} to={l.to}
              className="font-mono-ui text-[11px] text-[#888] hover:text-white tracking-widest uppercase transition-colors">
              {l.label}
            </Link>
          ))}
          <button onClick={onCartClick} className="relative text-[#888] hover:text-white transition-colors">
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#ff6b00] text-white text-[10px] font-bold flex items-center justify-center font-mono-ui">
                {cartCount}
              </span>
            )}
          </button>

          {/* Profile / Login button */}
          {authUser === null ? (
            <button onClick={() => base44.auth.redirectToLogin(window.location.href)}
              title="Login"
              className="text-[#555] hover:text-white transition-colors">
              <UserCircle className="w-5 h-5" />
            </button>
          ) : authUser?.role === 'admin' ? (
            <Link to="/Staff" title="Staff Portal"
              className="text-[#ff8c00] hover:text-white transition-colors">
              <UserCircle className="w-5 h-5" />
            </Link>
          ) : authUser ? (
            <button onClick={() => base44.auth.logout(window.location.href)}
              title={authUser.email}
              className="text-[#555] hover:text-[#ff0000] transition-colors">
              <UserCircle className="w-5 h-5" />
            </button>
          ) : null}
        </div>

        {/* Mobile */}
        <div className="md:hidden flex items-center gap-3">
          <button onClick={onCartClick} className="relative text-[#888] hover:text-white">
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#ff6b00] text-white text-[10px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
          {/* Mobile profile/login */}
          {authUser === null ? (
            <button onClick={() => base44.auth.redirectToLogin(window.location.href)} className="text-[#555] hover:text-white">
              <UserCircle className="w-5 h-5" />
            </button>
          ) : authUser?.role === 'admin' ? (
            <Link to="/Staff" className="text-[#ff8c00] hover:text-white">
              <UserCircle className="w-5 h-5" />
            </Link>
          ) : null}
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-[#888] hover:text-white">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#0a0a0a] border-t border-[#333] px-4 py-4 space-y-1 max-h-[70vh] overflow-y-auto">
          {parents.map(cat => {
            const children = getChildren(cat.id);
            return (
              <div key={cat.id}>
                <Link to={`/category/${cat.slug || cat.id}`}
                  onClick={() => setMenuOpen(false)}
                  className="block font-mono-ui text-[11px] text-white tracking-widest uppercase py-2 border-b border-[#1a1a1a]">
                  {cat.name}
                </Link>
                {children.map(child => (
                  <Link key={child.id} to={`/category/${child.slug || child.id}`}
                    onClick={() => setMenuOpen(false)}
                    className="block font-mono-ui text-[10px] text-[#666] tracking-widest uppercase py-2 pl-4 border-b border-[#1a1a1a]">
                    {child.name}
                  </Link>
                ))}
              </div>
            );
          })}
          <a href="#custom" onClick={() => setMenuOpen(false)}
            className="block font-mono-ui text-[11px] text-[#888] hover:text-white tracking-widest uppercase py-2 border-b border-[#1a1a1a]">
            Custom
          </a>
          <Link to="/TrackOrder" onClick={() => setMenuOpen(false)}
            className="block font-mono-ui text-[11px] text-[#888] hover:text-white tracking-widest uppercase py-2 border-b border-[#1a1a1a]">
            Track Order
          </Link>
          <Link to="/FAQ" onClick={() => setMenuOpen(false)}
            className="block font-mono-ui text-[11px] text-[#888] hover:text-white tracking-widest uppercase py-2 border-b border-[#1a1a1a]">
            FAQ
          </Link>
          <Link to={createPageUrl('Staff')} onClick={() => setMenuOpen(false)}
            className="block font-mono-ui text-[10px] text-[#444] hover:text-[#666] tracking-widest uppercase py-2">
            Staff Portal
          </Link>
        </div>
      )}
    </header>
  );
}