import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const CTASection = () => (
  <section className="bg-cta py-20">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="container mx-auto px-4 text-center"
    >
      <h2 className="font-display text-4xl font-bold text-cta-foreground">Make the Switch Today</h2>
      <p className="mx-auto mt-4 max-w-xl text-cta-foreground/80">
        Join the eco-friendly revolution. Every pad you choose makes a difference for your body and the planet.
      </p>
      <Button
        asChild
        size="lg"
        className="mt-8 gap-2 rounded-full bg-card text-foreground hover:bg-card/90"
      >
        <Link to="/shop">
          Shop Now <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </motion.div>
  </section>
);

export default CTASection;
