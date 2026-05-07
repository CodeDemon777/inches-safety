import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';

export interface Product {
  id: string;
  _id?: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  image_url: string;
  category: string;
  sale_type?: string;
  tags: string[];
  stock: number;
}

const ProductCard = ({ product }: { product: any }) => {
  const addItem = useCartStore((s) => s.addItem);

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
      <div className="relative aspect-square bg-accent/50">
        <span className="absolute left-3 top-3 z-10 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
          {product.category}
        </span>
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} loading="lazy" width={400} height={400} className="h-full w-full object-cover" />
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
