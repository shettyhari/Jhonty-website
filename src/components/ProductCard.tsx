import { Heart } from 'lucide-react';
import { formatINR } from '../data/catalog';
import { Product } from '../types';
import { ResilientImage } from './ResilientImage';

interface ProductCardProps {
  product: Product;
  isWishlisted: boolean;
  onOpenProduct: (id: number) => void;
  onQuickView: (product: Product) => void;
  onToggleWishlist: (id: number) => void;
  onAddToBag: (product: Product, size: string) => void;
}

export function ProductCard({
  product,
  isWishlisted,
  onOpenProduct,
  onQuickView,
  onToggleWishlist,
  onAddToBag,
}: ProductCardProps) {
  const discountPct = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  return (
    <article className="group bg-white border border-neutral-200 rounded-lg overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div
        onClick={() => onOpenProduct(product.id)}
        className="relative aspect-[3/4] bg-neutral-100 overflow-hidden cursor-pointer"
      >
        <ResilientImage
          src={product.gallery[0]}
          alt={`${product.brand} ${product.title}`}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product.id);
          }}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
          className={`absolute top-2.5 right-2.5 w-9 h-9 rounded-full bg-white/95 border border-neutral-200 flex items-center justify-center transition-colors ${
            isWishlisted ? 'text-red-600' : 'text-neutral-600 hover:text-neutral-950'
          }`}
        >
          <Heart className="w-4 h-4" fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onQuickView(product);
          }}
          className="absolute inset-x-3 bottom-3 py-2 bg-neutral-950/90 text-white text-xs font-semibold rounded-md opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200"
        >
          Quick View &amp; Sizes
        </button>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between gap-2 text-xs text-neutral-500 mb-1">
          <span className="font-bold uppercase tracking-wider text-neutral-700">{product.brand}</span>
          <span className="tabular-nums font-semibold text-[#d98200]">{discountPct}% OFF</span>
        </div>

        <button
          type="button"
          onClick={() => onOpenProduct(product.id)}
          className="text-left text-[15px] font-semibold text-neutral-950 hover:text-[#d98200] transition-colors line-clamp-2 min-h-[42px] mb-3"
        >
          {product.title}
        </button>

        <div className="flex items-baseline gap-2 mb-3.5 tabular-nums">
          <span className="text-base font-bold text-neutral-950">{formatINR(product.price)}</span>
          <span className="text-xs text-neutral-400 line-through">{formatINR(product.mrp)}</span>
        </div>

        <button
          type="button"
          onClick={() => onAddToBag(product, product.sizes[0])}
          className="mt-auto w-full py-2.5 px-4 border border-neutral-950 bg-white text-neutral-950 hover:bg-[#faa619] hover:border-[#faa619] text-xs font-bold uppercase tracking-wider rounded-md transition-colors"
        >
          Add To Basket
        </button>
      </div>
    </article>
  );
}
