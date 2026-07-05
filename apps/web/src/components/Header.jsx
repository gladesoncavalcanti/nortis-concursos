import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, LogOut, Shield } from 'lucide-react';
import { useCart } from '@/hooks/useCart.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button.jsx';

const Header = ({ setIsCartOpen }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { cartItems } = useCart();
  const { isAuthenticated, user, logout } = useAuth();

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/apostilas', label: 'Apostilas' },
    { path: '/sedes-df-2026', label: 'SEDES-DF 2026' },
    { path: '/materiais-gratuitos', label: 'Materiais Gratuitos' },
    { path: '/sobre', label: 'Sobre' },
    { path: '/contato', label: 'Contato' }
  ];

  const isActivePath = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[hsl(var(--primary))] text-[hsl(var(--background))] shadow-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <img
              src="/nortis-emblema-n.jpeg"
              alt="Nortis Concursos"
              className="h-10 w-10 md:h-11 md:w-11 rounded-full object-cover ring-1 ring-[hsl(var(--accent))]/40 transition-transform duration-300 group-hover:scale-105"
            />
            <span className="hidden sm:flex flex-col leading-none font-heading">
              <span className="text-base md:text-lg font-bold text-white tracking-[0.08em]">NORTIS</span>
              <span className="text-[10px] md:text-xs font-medium text-[hsl(var(--accent))] tracking-[0.28em]">CONCURSOS</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-4 py-2 text-sm font-medium transition-colors duration-200 after:absolute after:left-4 after:right-4 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-[hsl(var(--accent))] after:transition-opacity after:duration-200 ${
                  isActivePath(link.path)
                    ? 'text-white after:opacity-100'
                    : 'text-white/70 hover:text-white after:opacity-0 hover:after:opacity-40'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            <Link to="/login" className="text-[hsl(var(--background))]/50 hover:text-[hsl(var(--accent))] transition-colors" title="Admin Login">
              <Shield className="w-4 h-4" />
            </Link>
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Link to="/minha-conta">
                  <Button variant="ghost" size="sm" className="text-[hsl(var(--background))] hover:text-[hsl(var(--accent))] hover:bg-[hsl(var(--background))]/5">
                    <User className="w-4 h-4 mr-2" />
                    Minha Conta
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout}
                  className="text-[hsl(var(--background))] hover:text-destructive hover:bg-[hsl(var(--background))]/5"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-[hsl(var(--background))] hover:text-[hsl(var(--accent))] hover:bg-[hsl(var(--background))]/5">
                  <User className="w-4 h-4 mr-2" />
                  Login
                </Button>
              </Link>
            )}
            
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 rounded-md text-[hsl(var(--background))] hover:text-[hsl(var(--accent))] hover:bg-[hsl(var(--background))]/5 transition-all duration-200"
              aria-label="Carrinho de compras"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-4 lg:hidden">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-[hsl(var(--background))] hover:text-[hsl(var(--accent))] transition-colors duration-200"
              aria-label="Carrinho de compras"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>
            
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-[hsl(var(--background))] hover:text-[hsl(var(--accent))] transition-colors duration-200"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Content */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-[hsl(var(--accent))]/20">
            <nav className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-md text-base font-medium transition-colors duration-200 ${
                    isActivePath(link.path)
                      ? 'text-[hsl(var(--accent))] bg-[hsl(var(--background))]/5'
                      : 'text-[hsl(var(--background))]/80 hover:text-[hsl(var(--accent))] hover:bg-[hsl(var(--background))]/5'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              
              <div className="pt-4 mt-2 border-t border-[hsl(var(--accent))]/20 space-y-1">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/minha-conta"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center px-4 py-3 rounded-md text-base font-medium text-[hsl(var(--background))]/80 hover:text-[hsl(var(--accent))] hover:bg-[hsl(var(--background))]/5 transition-colors duration-200"
                    >
                      <User className="w-5 h-5 mr-3" />
                      Minha Conta
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-3 rounded-md text-base font-medium text-[hsl(var(--background))]/80 hover:text-destructive hover:bg-[hsl(var(--background))]/5 transition-colors duration-200"
                    >
                      <LogOut className="w-5 h-5 mr-3" />
                      Sair
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center px-4 py-3 rounded-md text-base font-medium text-[hsl(var(--accent))] hover:bg-[hsl(var(--background))]/5 transition-colors duration-200"
                  >
                    <User className="w-5 h-5 mr-3" />
                    Login
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;