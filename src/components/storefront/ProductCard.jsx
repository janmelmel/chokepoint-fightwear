import React from 'react';

const EDITION_STYLE = {
  Limited: 'bg-[#8b0000] text-white',
  Rare: 'bg-white text-[#050505]',
  Standard: 'bg-transparent text-white/40 border border-white/20',
};

export default function ProductCard({ product, onOrder }) {
  return (
    <div className="border border-white/10 bg-[#0a0a0a] overflow-hidden group hover:border-[#8b0000]/50 transition-colors duration-300">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-[#111]">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />

        {product.edition !== 'Standard' && (
          <span className={`absolute top-3 left-3 text-[10px] font-inter font-semibold tracking-widest uppercase px-2 py-1 ${EDITION_STYLE[product.edition]}`}>
            {product.edition}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="font-inter text-[10px] text-white/40 uppercase tracking-widest">
          {product.subtitle}
        </p>
        <h3 className="font-inter text-base font-semibold text-white mt-0.5">
          {product.name}
        </h3>

        <button
          onClick={() => onOrder(product)}
          className="mt-4 w-full py-3 font-inter text-xs tracking-[0.2em] uppercase bg-[#8b0000] text-white hover:bg-[#a80000] transition-colors duration-200"
        >
          Pre-order
        </button>
      </div>
    </div>
  );
}