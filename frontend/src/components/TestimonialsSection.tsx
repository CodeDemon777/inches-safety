import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

const testimonials = [
  {
    text: '"Finally a pad that doesn\'t irritate my skin. Love that it\'s eco-friendly too!"',
    name: 'Priya S.',
  },
  {
    text: '"The overnight pads are incredible. No leaks, no rashes, and I feel good about the planet."',
    name: 'Anita M.',
  },
  {
    text: '"Switched to Inches 3 months ago. Best decision ever. The bamboo fiber is so soft!"',
    name: 'Divya K.',
  },
];

const TestimonialsSection = () => (
  <section className="bg-testimonial py-20 overflow-hidden">
    <div className="container mx-auto px-4">
      <motion.h2
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, type: 'spring', bounce: 0.4 }}
        className="mb-12 text-center font-display text-4xl font-bold text-foreground"
      >
        What Our Customers Say
      </motion.h2>

      <div className="grid gap-8 md:grid-cols-3">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, x: -50, y: 30 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            whileHover={{ scale: 1.05, y: -5, boxShadow: "0px 10px 30px rgba(0,0,0,0.1)" }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15, duration: 0.5, type: 'spring' }}
            className="rounded-xl bg-card p-6 shadow-sm border"
          >
            <div className="mb-4 flex gap-1">
              {Array.from({ length: 5 }).map((_, j) => (
                <motion.div
                  key={j}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.15 + j * 0.1, type: "spring" }}
                >
                  <Star className="h-5 w-5 fill-star text-star" />
                </motion.div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">{t.text}</p>
            <p className="mt-4 font-display font-bold text-foreground">{t.name}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default TestimonialsSection;
