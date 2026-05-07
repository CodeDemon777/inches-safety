import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import { useProducts } from '@/hooks/useProducts';

const BestSellersSection = () => {
  const { data: products, isLoading } = useProducts();
  const topProducts = (products ?? []).slice(0, 3);

  return (
    <section className="bg-background py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="font-display text-4xl font-bold text-foreground">Our Best Sellers</h2>
          <p className="mt-2 text-muted-foreground">Trusted by thousands of women across India</p>
        </motion.div>

        {isLoading ? (
          <div className="grid gap-8 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[400px] animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-3">
            {topProducts.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="h-full"
              >
                <ProductCard product={p} />
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Button asChild size="lg" className="gap-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
            <Link to="/shop">
              View All Products <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BestSellersSection;
