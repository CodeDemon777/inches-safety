import { Leaf, Shield, Heart, TreePine } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  { icon: Leaf, title: '100% Biodegradable', desc: 'Returns to earth naturally' },
  { icon: Shield, title: 'Rash-Free', desc: 'Dermatologist tested' },
  { icon: Heart, title: 'Chemical-Free', desc: 'Pure & safe ingredients' },
  { icon: TreePine, title: 'Bamboo Fiber', desc: 'Sustainably sourced' },
];

const FeaturesSection = () => (
  <section className="border-b bg-card py-16">
    <div className="container mx-auto grid grid-cols-2 gap-8 px-4 md:grid-cols-4">
      {features.map((f, i) => (
        <motion.div
          key={f.title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          className="flex flex-col items-center text-center"
        >
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-accent">
            <f.icon className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-display text-sm font-bold text-foreground">{f.title}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{f.desc}</p>
        </motion.div>
      ))}
    </div>
  </section>
);

export default FeaturesSection;
