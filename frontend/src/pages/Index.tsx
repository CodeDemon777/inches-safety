import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import BestSellersSection from '@/components/BestSellersSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';

const Index = () => (
  <div className="min-h-screen">
    <Navbar />
    <HeroSection />
    <BestSellersSection />
    <TestimonialsSection />
    <CTASection />
    <Footer />
  </div>
);

export default Index;
