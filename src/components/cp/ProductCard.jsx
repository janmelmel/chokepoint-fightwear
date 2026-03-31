import React, { useState, useEffect } from 'react';
import { Eye, ShoppingBag, MessageCircle, Star } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function ProductCard({ product, onPreview }) {
  const [avgRating, setAvgRating] = useState(null);
  const [reviewCount, setReviewCount] = useState(0);
  // Note: size selection happens inside the ProductDetailModal

  useEffect(() => {
    if (!product?.id) return;
    base44.entities.Review.filter({ product_id: product.id }).then(rs => {
      if (rs.length) {
        setAvgRating((rs.reduce((s, r) => s + r.rating, 0) / rs.length).toFixed(1));
        setReviewCount(rs.length);
      }
    });
  }, [product?.id]);

  const orderType = product.order_type || (product.is_preorder ? 'preorder' : 'add_to_bag');
  const isContactToOrder = orderType === 'contact_to_order';
  const isSoldOut = !isContactToOrder && product.stock_limit > 0 && product.total_ordered >= product.stock_limit;
  const stockLeft = product.stock_limit > 0 ? product.stock_limit - (product.total_ordered || 0) : null;
  const isLowStock = !isContactToOrder && stockLeft !== null && stockLeft <= 5 && stockLeft > 0;

  return (
    <div className="card-tactical group overflow-hidden flex flex-col h-full">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-[#0d0d0d] cursor-pointer" onClick={() => onPreview && onPreview(product)}>
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.name}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-tactical text-6xl text-[#222]">CP</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />

        {isContactToOrder && (
          <span className="absolute top-3 left-3 font-mono-ui text-[10px] tracking-widest uppercase px-2 py-1 border border-[#ff6b00]/50 text-[#ff6b00] bg-[#0a0a0a]/80">
            INQUIRE
          </span>
        )}
        {!isContactToOrder && orderType === 'preorder' && !isSoldOut && (
          <span className="absolute top-3 left-3 font-mono-ui text-[10px] tracking-widest uppercase px-2 py-1 bg-[#ff6b00] text-white font-bold">
            PRE-ORDER
          </span>
        )}
        {isSoldOut && (
          <span className="absolute top-3 left-3 font-mono-ui text-[10px] tracking-widest uppercase px-2 py-1 bg-[#ff0000]/80 text-white">
            SOLD OUT
          </span>
        )}
        {isLowStock && (
          <span className="absolute top-3 right-3 font-mono-ui text-[10px] tracking-widest uppercase px-2 py-1 border border-[#ff0000]/50 text-[#ff0000]">
            {stockLeft} LEFT
          </span>
        )}
        {onPreview && (
          <button onClick={() => onPreview(product)}
            className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-[#111]/80 border border-[#333] text-[#888] hover:text-white">
            <Eye className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <p className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest">{product.category_name || 'Fightwear'}</p>
        <h3 className="font-tactical text-xl text-white mt-0.5 leading-tight">{product.name}</h3>
        <p className="font-mono-ui text-base text-[#ff6b00] mt-2 font-bold">₱{Number(product.price).toLocaleString()}</p>
        <div className="flex items-center gap-1.5 mt-1">
          {avgRating ? (
            <>
              <Star className="w-3 h-3" style={{ fill: '#ff8c00', color: '#ff8c00' }} />
              <span className="font-mono-ui text-[10px] text-[#ff8c00] font-bold">{avgRating}</span>
              <span className="font-mono-ui text-[10px] text-[#555]">({reviewCount})</span>
            </>
          ) : null}
          {product.total_ordered > 0 && (
            <span className={`font-mono-ui text-[10px] text-[#555] ${avgRating ? 'ml-1' : ''}`}>
              {avgRating ? '· ' : ''}{product.total_ordered} sold
            </span>
          )}
        </div>

        {/* CTA — always opens modal so customer must select size/variant first */}
        {isContactToOrder ? (
          <button onClick={() => onPreview && onPreview(product)}
            className="mt-auto py-3 font-mono-ui text-xs uppercase tracking-[0.2em] w-full flex items-center justify-center gap-2 border border-[#ff6b00]/50 text-[#ff6b00] hover:bg-[#ff6b00]/10 transition-all">
            <MessageCircle className="w-3.5 h-3.5" /> Inquire Now
          </button>
        ) : (
          <button
            style={
              isSoldOut
                ? { background: '#1a1a1a', border: '1px solid #222', color: '#444', cursor: 'not-allowed' }
                : { background: '#ff6b00', border: '1px solid #ff6b00', color: '#fff', fontWeight: 700, cursor: 'pointer' }
            }
            onClick={() => { if (!isSoldOut) onPreview && onPreview(product); }}
            disabled={isSoldOut}
            className="mt-auto py-3 font-mono-ui text-xs uppercase tracking-[0.2em] w-full flex items-center justify-center gap-2">
            {isSoldOut
              ? 'Sold Out'
              : <><ShoppingBag className="w-3.5 h-3.5" /> {orderType === 'preorder' ? 'Pre-Order Now' : 'Add to Bag'}</>
            }
          </button>
        )}
      </div>
    </div>
  );
}