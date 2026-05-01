import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import CPLogo from './CPLogo';
import NavSearchBar from './NavSearchBar';
import { ShoppingBag, Menu, X, ChevronDown, UserCircle } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { base44 } from '@/api/base44Client';

function ProfileButton({ authUser, profileOpen, setProfileOpen }) {
  return (
    <>
      {authUser === null ? (
        <button onClick={() => base44.auth.redirectToLogin(window.location.href)}
          title="Login" className="text-[#555] hover:text-white transition-colors">
          <UserCircle className="w-5 h-5" />
        </button>
      ) : authUser?.role === 'admin' ? (
        <Link to="/Staff" title="Staff Portal" className="text-[#ff8c00] hover:text-white transition-colors">
          <UserCircle className="w-5 h-5" />
        </Link>
      ) : authUser ? (
        <div className="relative">
          <button onClick={() => setProfileOpen(o => !o)} title={authUser.email}
            className="text-[#888] hover:text-white transition-colors">
            <UserCircle className="w-5 h-5" />
          </button>
          {profileOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
              <div className="absolute right-0 top-full mt-1 min-w-[160px] bg-[#0d0d0d] border border-[#333] shadow-xl z-50">
                <Link to="/MyOrders" onClick={() => setProfileOpen(false)}
                  className="block px-4 py-2.5 font-mono-ui text-[10px] text-[#888] hover:text-white hover:bg-[#1a1a1a] uppercase tracking-widest transition-colors">
                  My Orders
                </Link>
                <button onClick={() => base44.auth.logout()}
                  className="w-full text-left px-4 py-2.5 font-mono-ui text-[10px] text-[#555] hover:text-[#ff0000] hover:bg-[#1a1a1a] uppercase tracking-widest transition-colors border-t border-[#1a1a1a]">
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      ) : null}
    </>
  );
}

export default function StickyHeader({ onCartClick, onProductPreview }) {
  const { count: cartCount } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [authUser, setAuthUser] = useState(undefined);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

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

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const parents = categories.filter(c => !c.parent_id);
  const getChildren = (parentId) => categories.filter(c => c.parent_id === parentId);

  const isHomePage = location.pathname === '/Home' || location.pathname === '/';
  const isActive = (path) => location.pathname === path;

  const isCategoryActive = (cat) => {
    if (location.pathname === `/category/${cat.slug || cat.id}`) return true;
    return getChildren(cat.id).some(c => location.pathname === `/category/${c.slug || c.id}`);
  };

  const isProductsActive = categories.some(c => isCategoryActive(c));

  // Group categories into named buckets by matching name keywords
  const bucket = (keywords) => parents.filter(p =>
    keywords.some(k => p.name.toLowerCase().includes(k.toLowerCase()))
  );
  const fightwear   = bucket(['fightwear', 'fight wear', 'gi', 'no-gi', 'nogi', 'rashguard', 'shorts', 'singlet']);
  const fightgear   = bucket(['gear', 'glove', 'wrap', 'protector', 'equipment', 'pad']);
  const lifestyle   = bucket(['lifestyle', 'shirt', 'apparel', 'casual', 'streetwear', 'tee']);
  // Anything not matched goes into "other"
  const matched = new Set([...fightwear, ...fightgear, ...lifestyle].map(c => c.id));
  const other   = parents.filter(c => !matched.has(c.id));

  // Build the Products mega-dropdown columns
  const PRODUCT_COLS = [
    { label: 'Fightwear',  cats: fightwear  },
    { label: 'Fight Gear', cats: fightgear  },
    { label: 'Lifestyle',  cats: lifestyle  },
    ...(other.length ? [{ label: 'More', cats: other }] : []),
  ].filter(col => col.cats.length > 0);

  const navLink = (active) =>
    `flex items-center gap-1 px-3 py-2 font-mono-ui text-[11px] tracking-widest uppercase transition-colors border-b-2 ${
      active ? 'text-[#E87722] border-[#E87722]' : 'text-[#888] hover:text-white border-transparent'
    }`;

  const handleSearchResult = (product) => {
    if (onProductPreview) onProductPreview(product);
    else navigate('/Home');
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-[#0a0a0a]/97 backdrop-blur-sm border-b border-[#333]' : 'bg-[#0a0a0a]/90 backdrop-blur-sm'
    }`}>

      {/* ── DESKTOP (lg+) — strict 3-column grid so logo is always centered ── */}
      <div className="hidden lg:grid h-16 px-6 w-full" style={{ gridTemplateColumns: '1fr auto 1fr', alignItems: 'center' }}>
        {/* LEFT: nav links */}
        <nav className="flex items-center gap-0">
          <Link to="/Home" className={navLink(isHomePage)}>Home</Link>

          {/* Products mega-dropdown */}
          <div className="relative"
            onMouseEnter={() => setOpenDropdown('products')}
            onMouseLeave={() => setOpenDropdown(null)}>
            <button className={navLink(isProductsActive)}>
              Products <ChevronDown className="w-3 h-3" />
            </button>
            {openDropdown === 'products' && (
              <div className="absolute top-full left-0 bg-[#0d0d0d] border border-[#333] shadow-2xl z-50"
                style={{ minWidth: `${Math.max(PRODUCT_COLS.length, 2) * 160}px` }}>
                {/* Column header row */}
                <div className={`grid border-b border-[#1a1a1a]`}
                  style={{ gridTemplateColumns: `repeat(${PRODUCT_COLS.length}, 1fr)` }}>
                  {PRODUCT_COLS.map(col => (
                    <div key={col.label} className="px-5 py-3 border-r border-[#1a1a1a] last:border-r-0">
                      <p className="font-mono-ui text-[9px] text-[#ff6b00] uppercase tracking-[0.2em]">{col.label}</p>
                    </div>
                  ))}
                </div>
                {/* Items */}
                <div className={`grid`}
                  style={{ gridTemplateColumns: `repeat(${PRODUCT_COLS.length}, 1fr)` }}>
                  {PRODUCT_COLS.map(col => (
                    <div key={col.label} className="border-r border-[#1a1a1a] last:border-r-0 py-2">
                      {col.cats.map(cat => {
                        const children = getChildren(cat.id);
                        return (
                          <div key={cat.id}>
                            <Link to={`/category/${cat.slug || cat.id}`}
                              onClick={() => setOpenDropdown(null)}
                              className="block px-5 py-2 font-mono-ui text-[11px] text-white hover:text-[#ff8c00] hover:bg-[#111] uppercase tracking-widest transition-colors">
                              {cat.name}
                            </Link>
                            {children.map(child => (
                              <Link key={child.id} to={`/category/${child.slug || child.id}`}
                                onClick={() => setOpenDropdown(null)}
                                className="block px-5 py-1.5 pl-7 font-mono-ui text-[10px] text-[#555] hover:text-white hover:bg-[#111] uppercase tracking-widest transition-colors">
                                — {child.name}
                              </Link>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Link to="/Services" className={navLink(isActive('/Services'))}>Services</Link>
          <Link to="/Custom" className={navLink(isActive('/Custom'))}>Custom</Link>
        </nav>

        {/* CENTER: logo — always pinned to center */}
        <div className="flex justify-center">
          <Link to="/Home"><CPLogo size={36} variant="white" /></Link>
        </div>

        {/* RIGHT: search, track order, FAQ, cart, profile — right-aligned */}
        <div className="flex items-center gap-3 justify-end">
          <NavSearchBar onResultClick={handleSearchResult} />
          <Link to="/TrackOrder" className={navLink(isActive('/TrackOrder'))}>Track Order</Link>
          <Link to="/FAQ" className={navLink(isActive('/FAQ'))}>FAQ</Link>
          <button onClick={onCartClick} className="relative text-[#888] hover:text-white transition-colors">
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#ff6b00] text-white text-[10px] font-bold flex items-center justify-center font-mono-ui">
                {cartCount}
              </span>
            )}
          </button>
          <ProfileButton authUser={authUser} profileOpen={profileOpen} setProfileOpen={setProfileOpen} />
        </div>
      </div>

      {/* ── TABLET (md 768–1023px) ── */}
      <div className="hidden md:flex lg:hidden items-center h-16 px-4 gap-3 w-full">
        <Link to="/Home"><CPLogo size={32} variant="white" /></Link>
        <div className="flex-1" />
        <NavSearchBar onResultClick={handleSearchResult} />
        <button onClick={onCartClick} className="relative text-[#888] hover:text-white">
          <ShoppingBag className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#ff6b00] text-white text-[10px] font-bold flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
        <ProfileButton authUser={authUser} profileOpen={profileOpen} setProfileOpen={setProfileOpen} />
        <button onClick={() => setMenuOpen(!menuOpen)} className="text-[#888] hover:text-white">
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ── MOBILE (<768px) ── */}
      <div className="flex md:hidden items-center h-16 px-4 gap-3 w-full">
        <button onClick={onCartClick} className="relative text-[#888] hover:text-white">
          <ShoppingBag className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#ff6b00] text-white text-[10px] font-bold flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
        <ProfileButton authUser={authUser} profileOpen={profileOpen} setProfileOpen={setProfileOpen} />
        <div className="flex-1 flex justify-center">
          <Link to="/Home"><CPLogo size={30} variant="white" /></Link>
        </div>
        <button onClick={() => setMenuOpen(!menuOpen)} className="text-[#888] hover:text-white">
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ── MOBILE / TABLET MENU ── */}
      {menuOpen && (
        <div className="lg:hidden bg-[#0a0a0a] border-t border-[#333] px-4 py-3 space-y-1 max-h-[80vh] overflow-y-auto">
          <div className="pb-3 border-b border-[#1a1a1a] mb-2">
            <NavSearchBar alwaysOpen onResultClick={(p) => { setMenuOpen(false); handleSearchResult(p); }} />
          </div>
          <Link to="/Home" onClick={() => setMenuOpen(false)}
            className={`block font-mono-ui text-[11px] tracking-widest uppercase py-2.5 border-b border-[#1a1a1a] ${isHomePage ? 'text-[#E87722]' : 'text-white'}`}>
            Home
          </Link>

          {/* Products — grouped by bucket */}
          {PRODUCT_COLS.map(col => (
            <div key={col.label}>
              <p className="font-mono-ui text-[9px] text-[#ff6b00] uppercase tracking-[0.2em] px-1 pt-3 pb-1">{col.label}</p>
              {col.cats.map(cat => {
                const children = getChildren(cat.id);
                return (
                  <div key={cat.id}>
                    <Link to={`/category/${cat.slug || cat.id}`} onClick={() => setMenuOpen(false)}
                      className={`block font-mono-ui text-[11px] tracking-widest uppercase py-2 border-b border-[#1a1a1a] ${isCategoryActive(cat) ? 'text-[#E87722]' : 'text-white'}`}>
                      {cat.name}
                    </Link>
                    {children.map(child => (
                      <Link key={child.id} to={`/category/${child.slug || child.id}`} onClick={() => setMenuOpen(false)}
                        className="block font-mono-ui text-[10px] text-[#555] tracking-widest uppercase py-1.5 pl-4 border-b border-[#111] hover:text-white">
                        — {child.name}
                      </Link>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}

          <Link to="/Services" onClick={() => setMenuOpen(false)}
            className={`block font-mono-ui text-[11px] tracking-widest uppercase py-2.5 border-b border-[#1a1a1a] mt-2 ${isActive('/Services') ? 'text-[#E87722]' : 'text-[#888] hover:text-white'}`}>
            Services
          </Link>
          <Link to="/Custom" onClick={() => setMenuOpen(false)}
            className={`block font-mono-ui text-[11px] tracking-widest uppercase py-2.5 border-b border-[#1a1a1a] ${isActive('/Custom') ? 'text-[#E87722]' : 'text-[#888] hover:text-white'}`}>
            Custom
          </Link>
          <Link to="/TrackOrder" onClick={() => setMenuOpen(false)}
            className={`block font-mono-ui text-[11px] tracking-widest uppercase py-2.5 border-b border-[#1a1a1a] ${isActive('/TrackOrder') ? 'text-[#E87722]' : 'text-[#888] hover:text-white'}`}>
            Track Order
          </Link>
          <Link to="/FAQ" onClick={() => setMenuOpen(false)}
            className={`block font-mono-ui text-[11px] tracking-widest uppercase py-2.5 border-b border-[#1a1a1a] ${isActive('/FAQ') ? 'text-[#E87722]' : 'text-[#888] hover:text-white'}`}>
            FAQ
          </Link>
          {authUser && authUser.role !== 'admin' && (
            <Link to="/MyOrders" onClick={() => setMenuOpen(false)}
              className="block font-mono-ui text-[11px] text-[#ff8c00] hover:text-white tracking-widest uppercase py-2.5 border-b border-[#1a1a1a]">
              My Orders
            </Link>
          )}
          {authUser && (
            <button onClick={() => base44.auth.logout()}
              className="block w-full text-left font-mono-ui text-[11px] text-[#555] hover:text-[#ff0000] tracking-widest uppercase py-2.5">
              Logout
            </button>
          )}
        </div>
      )}
    </header>
  );
}