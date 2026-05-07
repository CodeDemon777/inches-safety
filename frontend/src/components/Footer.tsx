import { Link } from 'react-router-dom';
import { Leaf, Heart, Shield, TreePine } from 'lucide-react';

const Footer = () => (
  <footer className="border-t bg-card">
    <div className="container mx-auto px-4 py-12">
      <div className="grid gap-10 md:grid-cols-4">
        <div>
          <h4 className="font-display text-lg font-bold text-foreground">Inches Eco Pads</h4>
          <p className="mt-2 text-sm text-muted-foreground">
            Soft on You, Gentle on Earth. 100% biodegradable sanitary pads made with bamboo fiber.
          </p>
        </div>
        <div>
          <h4 className="font-display font-bold text-foreground">Shop</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/shop" className="hover:text-primary">XL Pads</Link></li>
            <li><Link to="/shop" className="hover:text-primary">XXL Pads</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display font-bold text-foreground">Company</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-primary">About Us</Link></li>
            <li><Link to="/about" className="hover:text-primary">Our Mission</Link></li>
            <li><Link to="/about" className="hover:text-primary">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display font-bold text-foreground">Our Promise</h4>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><Leaf className="h-4 w-4 text-primary" /> Eco-Friendly</span>
            <span className="flex items-center gap-1.5"><Heart className="h-4 w-4 text-primary" /> Chemical-Free</span>
            <span className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-primary" /> Rash-Free</span>
            <span className="flex items-center gap-1.5"><TreePine className="h-4 w-4 text-primary" /> Biodegradable</span>
          </div>
        </div>
      </div>
    </div>
    <div className="border-t py-6 text-center text-sm text-muted-foreground">
      © 2026 Inches Eco Pads. All rights reserved.
    </div>
  </footer>
);

export default Footer;
