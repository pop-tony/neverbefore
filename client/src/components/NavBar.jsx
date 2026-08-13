import React from 'react'
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, Menu, X, User, LogOut, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from './ThemeToggle';

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { cartCount } = useCart();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/shop", label: "Atelier" },
    { href: "/orders", label: "Orders" },
    { href: "/about", label: "Rituals" },
    { href: "/contact", label: "Contact" },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (href) => {
    if (href.startsWith('/')) navigate(href);
    setMobileOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setMobileOpen(false);
    if (location.pathname === '/admin') navigate('/');
  };

  useEffect(() => {
    document.body.style.overflow = mobileOpen? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [mobileOpen]);

  return (
    <>
      <nav
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled
           ? 'bg-white/90 backdrop-blur-xl shadow-[0_1px_0_0_#F5EFE6] dark:bg-neutral-950/90'
            : 'bg-white/60 backdrop-blur-md dark:bg-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 text-zinc-900 dark:text-white">
          {/* Logo - Gold + White Luxury */}
          <button
            onClick={() => navigate('/')}
            className="cursor-pointer tracking-[0.2em] transition hover:opacity-80 text-left"
          >
            <span className="block text- font-semibold text-zinc-500 dark:text-zinc-400 leading-none">NEVER BEFORE</span>
            <span className="block -mt-1 font-serif text-2xl font-light text-[#C5A059]">Cosmetic</span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map(link => (
              <button
                key={link.href}
                onClick={() => handleLinkClick(link.href)}
                className={`cursor-pointer text- font-semibold uppercase tracking-[0.2em] transition hover:text-[#C5A059] ${
                  location.pathname === link.href? 'text-[#C5A059]' : 'text-zinc-600 dark:text-zinc-300'
                }`}
              >
                {link.label}
              </button>
            ))}

            <div className="flex items-center gap-2">
              {isAdmin && (
                <button
                  onClick={() => navigate('/admin')}
                  className={`cursor-pointer flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] transition ${
                    location.pathname === '/admin'
                      ? 'bg-[#C5A059] text-white'
                      : 'border border-[#C5A059]/50 text-[#C5A059] hover:bg-[#C5A059]/10'
                  }`}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Admin
                </button>
              )}

              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => handleLinkClick('/orders')}
                    className="cursor-pointer flex items-center gap-1.5 rounded-full border border-zinc-200 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-zinc-600 transition hover:border-[#C5A059] hover:text-[#C5A059] dark:border-zinc-700 dark:text-zinc-300"
                  >
                    <User className="h-3.5 w-3.5" />
                    {user?.name?.split(' ')[0] || user?.username || 'Account'}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="cursor-pointer flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-zinc-500 transition hover:text-red-500"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigate('/auth')}
                  className="cursor-pointer flex items-center gap-1.5 rounded-full bg-[#C5A059] px-5 py-2 text-xs font-bold uppercase tracking-[0.15em] text-white transition hover:bg-[#B08D4F]"
                >
                  <User className="h-3.5 w-3.5" />
                  Sign In
                </button>
              )}
            </div>

            <button
              onClick={() => navigate('/cart')}
              className="cursor-pointer relative rounded-full bg-[#C5A059] px-7 py-3 text- font-bold uppercase tracking-[0.15em] text-white transition hover:bg-[#B08D4F]"
            >
              <ShoppingCart className="mr-2 inline h-3.5 w-3.5" />
              Bag
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-black text- font-bold text-white">
                  {cartCount > 9? '9+' : cartCount}
                </span>
              )}
            </button>

            <ThemeToggle />
          </div>

          {/* Mobile buttons */}
          <div className="flex items-center gap-4 md:hidden">
            <button onClick={() => navigate('/cart')} className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#C5A059] text-xs font-bold text-white">
                  {cartCount > 9? '9+' : cartCount}
                </span>
              )}
            </button>

            <ThemeToggle />

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="text-2xl leading-none"
              aria-label="Toggle menu"
            >
              {mobileOpen? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay - Gold luxury */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-white pt-20 dark:bg-neutral-950 md:hidden"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex flex-col items-center gap-8 p-8 text-zinc-900 dark:text-white"
            >
              {navLinks.map(link => (
                <button
                  key={link.href}
                  onClick={() => handleLinkClick(link.href)}
                  className="font-serif text-2xl font-light tracking-wide transition hover:text-[#C5A059]"
                >
                  {link.label}
                </button>
              ))}

              {isAdmin && (
                <button
                  onClick={() => handleLinkClick('/admin')}
                  className="flex items-center gap-2 font-serif text-2xl font-light tracking-wide text-[#C5A059] transition hover:opacity-80"
                >
                  <ShieldCheck className="h-5 w-5" />
                  Admin
                </button>
              )}

              <div className="h- w-12 bg-[#E8D5B5] my-2"></div>

              {isAuthenticated ? (
                <>
                  <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                    Signed in as {user?.name || user?.username || user?.email}
                  </p>
                  <button
                    onClick={() => handleLinkClick('/orders')}
                    className="rounded-full border border-zinc-200 px-10 py-4 text-xs font-bold uppercase tracking-[0.2em] text-zinc-600 transition hover:border-[#C5A059] hover:text-[#C5A059] dark:border-zinc-700 dark:text-zinc-300"
                  >
                    My Orders
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 rounded-full border border-zinc-200 px-10 py-4 text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 transition hover:border-red-400 hover:text-red-500 dark:border-zinc-700"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { handleLinkClick('/auth'); }}
                  className="flex items-center gap-2 rounded-full bg-[#C5A059] px-10 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white transition hover:bg-[#B08D4F]"
                >
                  <User className="h-4 w-4" />
                  Sign In / Sign Up
                </button>
              )}

              <button
                onClick={() => { handleLinkClick('/cart'); }}
                className="rounded-full bg-[#C5A059] px-10 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white transition hover:bg-[#B08D4F]"
              >
                View Bag {cartCount > 0 && `(${cartCount})`}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}