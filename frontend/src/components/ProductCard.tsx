import { useState, useRef } from 'react';
import { ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';
import { resolveImageUrl } from '@/lib/api';

export interface Product {
  id: string;
  _id?: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  image_url: string;
  image_urls?: string[];
  category: string;
  sale_type?: string;
  tags: string[];
  stock: number;
}

const ProductCard = ({ product }: { product: any }) => {
  const addItem = useCartStore((s) => s.addItem);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollLeft, clientWidth } = containerRef.current;
    if (clientWidth > 0) {
      const index = Math.round(scrollLeft / clientWidth);
      setActiveIdx(index);
    }
  };

  const scrollToImage = (index: number) => {
    if (!containerRef.current) return;
    const { clientWidth } = containerRef.current;
    containerRef.current.scrollTo({
      left: index * clientWidth,
      behavior: 'smooth'
    });
    setActiveIdx(index);
  };

  const handleAdd = () => {
    if (product.stock <= 0) {
      toast.error('Out of stock');
      return;
    }
    addItem({
      id: product._id || product.id,
      name: product.name,
      price: product.price,
      image: product.image_url || '',
      category: product.category,
      sale_type: product.sale_type,
    });
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-md relative">
      {(product.sale_type === 'Wholesale' || product.sale_type === 'Both') && (
        <span className="absolute right-3 top-3 z-10 rounded-full bg-blue-100 px-2 py-1 text-[10px] font-bold text-blue-800 border border-blue-200 shadow-sm">
          Wholesale Available
        </span>
      )}
      <div className="relative aspect-square bg-accent/50 overflow-hidden">
        <span className="absolute left-3 top-3 z-20 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-sm">
          {product.category}
        </span>
        {product.image_urls && product.image_urls.length > 0 ? (
          <div className="relative w-full h-full group/carousel">
            <div 
              ref={containerRef}
              onScroll={handleScroll}
              className="flex w-full h-full overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative"
            >
              {product.image_urls.map((url: string, idx: number) => (
                <div key={idx} className="relative min-w-full h-full snap-center">
                  <img 
                    src={resolveImageUrl(url)} 
                    alt={`${product.name} - ${idx + 1}`} 
                    loading="lazy" 
                    className="h-full w-full object-cover" 
                  />
                </div>
              ))}
            </div>
            {product.image_urls.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    scrollToImage((activeIdx - 1 + product.image_urls.length) % product.image_urls.length);
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/85 text-foreground shadow-md transition-opacity duration-200 md:opacity-0 md:group-hover/carousel:opacity-100 border border-black/5 hover:bg-white z-10"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    scrollToImage((activeIdx + 1) % product.image_urls.length);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/85 text-foreground shadow-md transition-opacity duration-200 md:opacity-0 md:group-hover/carousel:opacity-100 border border-black/5 hover:bg-white z-10"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
                  {product.image_urls.map((_: any, i: number) => (
                    <button
                      key={i}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        scrollToImage(i);
                      }}
                      className={`h-1.5 rounded-full transition-all duration-300 border border-black/10 ${
                        activeIdx === i ? 'bg-primary w-3' : 'bg-white/80 w-1.5'
                      }`}
                      aria-label={`Go to image ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : product.image_url ? (
          <img src={resolveImageUrl(product.image_url)} alt={product.name} loading="lazy" width={400} height={400} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-4xl text-muted-foreground/30">🌿</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-bold text-foreground">{product.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{product.description}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {(product.tags || []).map((t: string) => (
            <span key={t} className="rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground">{t}</span>
          ))}
        </div>
        <div className="mt-auto pt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-display text-xl font-bold text-foreground">₹{product.price}</span>
            {product.original_price && product.original_price > product.price && (
              <span className="text-sm text-muted-foreground line-through">₹{product.original_price}</span>
            )}
          </div>
          <Button
            size="sm"
            onClick={handleAdd}
            disabled={product.stock <= 0}
            className="gap-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            <ShoppingCart className="h-4 w-4" /> {product.stock <= 0 ? 'Out of Stock' : 'Add'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
