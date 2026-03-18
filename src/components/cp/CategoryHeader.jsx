import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ChevronDown } from 'lucide-react';

export default function CategoryHeader() {
  const [categories, setCategories] = useState([]);
  const [openCat, setOpenCat] = useState(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    (async () => {
      const cats = await base44.entities.Category.filter({ is_active: true }, 'sort_order');
      setCategories(cats);
    })();
  }, []);

  const parents = categories.filter(c => !c.parent_id);
  const getChildren = (parentId) => categories.filter(c => c.parent_id === parentId);

  const handleMouseEnter = (catId) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpenCat(catId);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setOpenCat(null), 150);
  };

  return (
    <nav className="hidden md:flex items-center gap-1">
      {parents.map(cat => {
        const children = getChildren(cat.id);
        const hasChildren = children.length > 0;
        
        return (
          <div
            key={cat.id}
            className="relative"
            onMouseEnter={() => handleMouseEnter(cat.id)}
            onMouseLeave={handleMouseLeave}
          >
            <Link
              to={`/category/${cat.slug || cat.id}`}
              className="flex items-center gap-1 px-3 py-2 font-mono-ui text-[11px] text-[#888] hover:text-white tracking-widest uppercase transition-colors"
            >
              {cat.name}
              {hasChildren && <ChevronDown className="w-3 h-3" />}
            </Link>

            {hasChildren && openCat === cat.id && (
              <div
                className="absolute top-full left-0 min-w-[180px] bg-[#0d0d0d] border border-[#333] shadow-xl z-50"
                onMouseEnter={() => handleMouseEnter(cat.id)}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  to={`/category/${cat.slug || cat.id}`}
                  className="block px-4 py-2.5 font-mono-ui text-[10px] text-[#ff8c00] hover:bg-[#1a1a1a] uppercase tracking-widest border-b border-[#222]"
                >
                  View All {cat.name}
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
  );
}