import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, Recycle, Globe, Sprout, Feather } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import newLogo from '@/assets/new-logo.png';

const HeroSection = () => (
  <section className="bg-hero">
    <div className="container mx-auto grid min-h-[600px] items-center gap-12 px-4 py-16 lg:grid-cols-2">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-badge px-4 py-1.5 text-sm font-medium text-badge-foreground">
          <Leaf className="h-4 w-4" /> 100% Biodegradable
        </span>
        <h1 className="mt-4 font-display text-5xl font-bold leading-tight text-foreground lg:text-6xl">
          Soft on You,
          <br />
          <span className="text-primary">Gentle on Earth</span>
        </h1>
        <p className="mt-6 max-w-lg font-body text-lg text-muted-foreground">
          Eco-friendly sanitary pads crafted from ultra-soft bamboo fiber.
          Chemical-free, rash-free, and completely biodegradable.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Button asChild size="lg" className="gap-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
            <Link to="/shop">
              Shop Now <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full border-foreground/20 text-foreground hover:bg-accent">
            <Link to="/about">Our Story</Link>
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="flex flex-col items-center justify-center gap-8"
      >
        <div className="relative aspect-square w-full max-w-[400px] xl:max-w-[480px]">
          <img
            src={newLogo}
            alt="Inches Eco Pads"
            width={500}
            height={500}
            className="h-full w-full object-contain drop-shadow-2xl"
          />
        </div>
        
        {/* 4 Features Below Logo */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-[480px] sm:grid-cols-4">
          {[
            { icon: <Recycle className="h-6 w-6 text-green-600" />, title: "100% Degradable" },
            { icon: <Globe className="h-6 w-6 text-blue-500" />, title: "Eco-Friendly" },
            { icon: <Sprout className="h-6 w-6 text-emerald-500" />, title: "Bamboo Fibre" },
            { icon: <Feather className="h-6 w-6 text-sky-400" />, title: "Ultra-Soft" }
          ].map((feature, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + (idx * 0.1) }}
              className="flex flex-col items-center text-center p-3 rounded-2xl bg-card border shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-accent/50">
                {feature.icon}
              </div>
              <span className="text-xs font-semibold text-foreground">{feature.title}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  </section>
);

export default HeroSection;
