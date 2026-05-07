import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, LogOut, Shield } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuth } from '@/contexts/AuthContext';
import newLogo from '@/assets/new-logo.png';
import { useState } from 'react';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const totalItems = useCartStore((s) => s.totalItems());
  const { user, isAdmin, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Shop' },
    { to: '/about', label: 'About' },
    { to: '/reviews', label: 'Reviews' },
    { to: '/contact', label: 'Contact' },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={newLogo} alt="Inches" width={40} height={40} className="h-10 w-10 object-contain" />
          <span className="font-display text-xl font-bold text-foreground">Inches</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`font-body text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === l.to ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {isAdmin && (
            <Link to="/admin" className="text-primary transition-colors hover:text-primary/80" title="Admin Portal">
              <Shield className="h-5 w-5" />
            </Link>
          )}
          <Link to="/cart" className="relative text-foreground transition-colors hover:text-primary">
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {totalItems}
              </span>
            )}
          </Link>
          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/profile" className="text-foreground transition-colors hover:text-primary">
                <User className="h-5 w-5" />
              </Link>
              <button onClick={handleSignOut} className="text-muted-foreground transition-colors hover:text-destructive">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <Link to="/login" className="text-foreground transition-colors hover:text-primary">
              <User className="h-5 w-5" />
            </Link>
          )}
          <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t bg-card px-4 py-4 md:hidden">
          {navLinks.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)}
              className="block py-2 font-body text-sm font-medium text-foreground hover:text-primary">
              {l.label}
            </Link>
          ))}
          {isAdmin && (
            <Link to="/admin" onClick={() => setMobileOpen(false)}
              className="block py-2 font-body text-sm font-medium text-primary">
              Admin Portal
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
