import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, ShoppingBag, Check } from 'lucide-react';
import { addToCart } from '@/lib/cartStore';

export default function ProductCard({ product, onOrder, onPreview }) {
  const [selectedSize, setSelectedSize] = useState('');
  const [added, setAdded] = useState(false);
  const isSoldOut = product.stock_limit > 0 && product.total_ordered >= product.stock_limit;
  const stockLeft = product.stock_limit > 0 ? product.stock_limit - (product.total_ordered || 0) : null;
  const isLowStock = stockLeft !== null && stockLeft <= 5 && stockLeft > 0;
  const sizes = product.sizes?.length ? product.sizes : [];

  return (
    <div className="card-tactical group overflow-hidden">
      {/* Image — click to open detail */}
      <div className="relative aspect-square overflow-hidden bg-[#0d0d0d] cursor-pointer" onClick={() => onPreview && onPreview(product)}>
        {product.images?.[0] ?
        <img src={product.images[0]} alt={product.name}
        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" /> :

        <div className="w-full h-full flex items-center justify-center">
            <span className="font-tactical text-6xl text-[#222]">CP</span>
          </div>
        }
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />

        {product.is_preorder && !isSoldOut &&
        <span className="absolute top-3 left-3 font-mono-ui text-[10px] tracking-widest uppercase px-2 py-1 bg-[#ff6b00] text-white font-bold">
            PRE-ORDER
          </span>
        }
        {isSoldOut &&
        <span className="absolute top-3 left-3 font-mono-ui text-[10px] tracking-widest uppercase px-2 py-1 bg-[#ff0000]/80 text-white">
            SOLD OUT
          </span>
        }
        {isLowStock &&
        <span className="absolute top-3 right-3 font-mono-ui text-[10px] tracking-widest uppercase px-2 py-1 border border-[#ff0000]/50 text-[#ff0000]">
            {stockLeft} LEFT
          </span>
        }

        {onPreview &&
        <button onClick={() => onPreview(product)}
        className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-[#111]/80 border border-[#333] text-[#888] hover:text-white">
            <Eye className="w-4 h-4" />
          </button>
        }
      </div>

      {/* Size selector — above the Add to Bag button, overlaid at bottom of image */}
      {sizes.length > 0 && !isSoldOut && (
        <div className="px-4 pt-3 pb-0">
          <div className="flex gap-1.5 overflow-x-auto scrollbar-tactical pb-1" style={{ scrollbarWidth: 'thin' }}>
            {sizes.map((s) => (
              <button key={s} onClick={() => setSelectedSize(s)}
                className={`flex-shrink-0 px-2.5 py-1 font-mono-ui text-[10px] border transition-all ${
                  selectedSize === s
                    ? 'border-[#ff6b00] bg-[#ff6b00] text-white font-bold'
                    : 'border-[#444] text-[#aaa] hover:border-[#888] hover:text-white'
                }`}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="p-4 pt-3">
        <p className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest">{product.category_name || 'Fightwear'}</p>
        <h3 className="font-tactical text-xl text-white mt-0.5 leading-tight">{product.name}</h3>
        <p className="font-mono-ui text-base text-[#ff6b00] mt-2 font-bold">₱{Number(product.price).toLocaleString()}</p>

        <button
          onClick={() => {
            if (isSoldOut) return;
            const sizeToUse = selectedSize || (sizes.length === 0 ? 'One Size' : null);
            if (!sizeToUse) return;
            addToCart(product, sizeToUse);
            setAdded(true);
            setTimeout(() => setAdded(false), 1800);
          }}
          disabled={isSoldOut || (sizes.length > 0 && !selectedSize)}
          className="mt-4 py-3 font-mono-ui text-xs uppercase tracking-[0.2em] w-full flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed" style={{background:'#ff6b00', border:'1px solid #ff6b00', color:'#fff', fontWeight:700, cursor:'pointer'}}>
          {isSoldOut ? 'Sold Out' : added ? (
            <><Check className="w-3.5 h-3.5" /> Added!</>
          ) : (
            <><ShoppingBag className="w-3.5 h-3.5" /> {product.is_preorder ? 'Pre-order' : 'Add to Bag'}</>
          )}
        </button>
      </div>
    </div>);

}