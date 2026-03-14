import React from 'react';
import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';

export default function ProductCard({ product, onOrder, onPreview }) {
  const isSoldOut = product.stock_limit > 0 && product.total_ordered >= product.stock_limit;
  const stockLeft = product.stock_limit > 0 ? product.stock_limit - (product.total_ordered || 0) : null;
  const isLowStock = stockLeft !== null && stockLeft <= 5 && stockLeft > 0;

  return (
    <div className="card-tactical group overflow-hidden">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-[#0d0d0d]">
        {product.images?.[0] ?
        <img src={product.images[0]} alt={product.name}
        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" /> :

        <div className="w-full h-full flex items-center justify-center">
            <span className="font-tactical text-6xl text-[#222]">CP</span>
          </div>
        }
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />

        {product.is_preorder && !isSoldOut &&
        <span className="absolute top-3 left-3 font-mono-ui text-[10px] tracking-widest uppercase px-2 py-1 bg-[#ff8c00] text-black font-bold">
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

      {/* Info */}
      <div className="p-4">
        <p className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest">{product.category_name || 'Fightwear'}</p>
        <h3 className="font-tactical text-xl text-white mt-0.5 leading-tight">{product.name}</h3>
        <p className="font-mono-ui text-base text-[#ff8c00] mt-2">₱{Number(product.price).toLocaleString()}</p>

        <button
          onClick={() => !isSoldOut && onOrder(product)}
          disabled={isSoldOut} className="bg-slate-50 mt-4 py-3 text-xs font-mono-ui uppercase tracking-[0.2em] w-full transition-all duration-200 btn-glow-orange">





          {isSoldOut ? 'Sold Out' : product.is_preorder ? 'Pre-order Now' : 'Add to Bag'}
        </button>
      </div>
    </div>);

}