import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { Leaf, Heart, Shield, TreePine } from 'lucide-react';
import inchesLogo from '@/assets/inches-logo.png';

const About = () => (
  <div className="min-h-screen">
    <Navbar />
    <section className="bg-hero py-20">
      <div className="container mx-auto grid items-center gap-12 px-4 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="font-display text-5xl font-bold text-foreground">Our Story</h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            At Inches, we believe that every woman deserves comfort without compromising the planet.
            Our journey started with a simple idea — create sanitary pads that are as gentle on the
            earth as they are on your body.
          </p>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            Made from 100% bamboo fiber, our pads are biodegradable, chemical-free, and dermatologist
            tested. We're committed to sustainability at every step of our production process.
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }} className="flex justify-center">
          <img src={inchesLogo} alt="Inches Eco Pads" width={400} height={400} className="h-80 w-80 object-contain" />
        </motion.div>
      </div>
    </section>

    <section className="py-20">
      <div className="container mx-auto grid gap-8 px-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Leaf, title: 'Eco-Friendly', desc: 'Every pad biodegrades completely within 6 months.' },
          { icon: Heart, title: 'Skin-Safe', desc: 'Chemical-free and hypoallergenic for sensitive skin.' },
          { icon: Shield, title: 'Leak-Proof', desc: 'Advanced absorption technology with bamboo core.' },
          { icon: TreePine, title: 'Sustainable', desc: 'Bamboo grows rapidly without pesticides or chemicals.' },
        ].map((v, i) => (
          <motion.div
            key={v.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="rounded-xl border bg-card p-6 text-center"
          >
            <v.icon className="mx-auto h-8 w-8 text-primary" />
            <h3 className="mt-4 font-display font-bold text-foreground">{v.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{v.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
    <Footer />
  </div>
);

export default About;
