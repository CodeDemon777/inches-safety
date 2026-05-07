import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { useProducts } from '@/hooks/useProducts';
import { useState } from 'react';

const categories = ['All', 'Regular', 'XL', 'Night'] as const;
const saleTypes = ['Normal', 'Wholesale'] as const;

const Shop = () => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeSaleType, setActiveSaleType] = useState<string>('Normal');
  const { data: products, isLoading } = useProducts(activeCategory);

  const filteredProducts = (products ?? []).filter((p: any) => {
    if (p.sale_type === 'Both') return true;
    if (!p.sale_type && activeSaleType === 'Normal') return true; // fallback for older entries
    return p.sale_type === activeSaleType;
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <h1 className="font-display text-4xl font-bold text-foreground">Shop</h1>
        <p className="mt-2 text-muted-foreground">Browse our range of eco-friendly sanitary pads</p>

        <div className="mt-6 flex gap-2 border-b">
          {saleTypes.map((t) => (
            <button
              key={t}
              onClick={() => setActiveSaleType(t)}
              className={`px-4 py-2 font-medium capitalize transition-colors border-b-2 -mb-px ${
                activeSaleType === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {t} Shop
            </button>
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                activeCategory === c
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-accent text-accent-foreground hover:bg-accent/80'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[400px] animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : (
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((p) => (
              <ProductCard key={p.id || p._id} product={p} />
            ))}
          </div>
        )}

        {!isLoading && (products ?? []).length === 0 && (
          <p className="py-20 text-center text-muted-foreground">No products in this category yet.</p>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Shop;
