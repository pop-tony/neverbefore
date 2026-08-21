import React from 'react'
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSiteContent } from '../hooks/useSiteContent';
import { ShoppingCart, Menu, X, User, LogOut, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from './ThemeToggle';
import logo from '../assets/logo.jpeg';

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { cartCount } = useCart();
  const { user, isAuthenticated, isAdmin, logout, adminStoreModeEnabled, toggleAdminStoreMode } = useAuth();
  const { content } = useSiteContent();
  const navigate = useNavigate();
  const location = useLocation();
  const shopEnabledForCurrentUser = !isAdmin || adminStoreModeEnabled;

  const navLinks = shopEnabledForCurrentUser
    ? [
      { href: "/", label: content?.navigation_home || "Home" },
      { href: "/shop", label: content?.navigation_shop || "Shop" },
      { href: "/orders", label: content?.navigation_orders || "Orders" },
      { href: "/about", label: "About" },
      { href: "/contact", label: content?.navigation_contact || "Contact" },
    ]
    : [];

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
        className={`sticky top-0 z-50 w-full border-b border-zinc-200/70 transition-all duration-300 ${
          scrolled
            ? 'bg-white/85 shadow-[0_1px_0_rgba(24,24,27,0.06)] backdrop-blur-xl dark:border-zinc-800 dark:bg-neutral-950/85'
            : 'bg-white/70 backdrop-blur-md dark:border-zinc-800/80 dark:bg-neutral-950/40'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 text-zinc-900 dark:text-white sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(isAdmin && !adminStoreModeEnabled ? '/admin' : '/')}
            className="group flex items-center gap-3 text-left transition hover:opacity-90"
            aria-label="Go to home"
          >
            <img
              src={content?.logo_url || logo}
              alt="Never Before Cosmetics logo"
              className="h-14 w-14 rounded-full border-2 border-[#C5A059]/35 bg-white object-cover p-1.5 shadow-[0_12px_28px_rgba(197,160,89,0.28)] ring-4 ring-[#C5A059]/10 transition duration-300 group-hover:scale-[1.04] sm:h-16 sm:w-16 lg:h-20 lg:w-20 dark:shadow-none"
            />
            <div>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">
                Never Before
              </span>
              <span className="mt-1 block font-serif text-2xl font-semibold tracking-wide text-[#C5A059] sm:text-[2rem]">
                Cosmetic
              </span>
              <span className="mt-0.5 block text-[11px] text-zinc-500 dark:text-zinc-400">
                Accra atelier
              </span>
            </div>
          </button>

          <div className="hidden items-center justify-center md:flex">
            {navLinks.length > 0 ? (
              <div className="flex items-center gap-1 rounded-full border border-zinc-200 bg-white/80 px-2 py-1.5 shadow-sm shadow-zinc-200/60 dark:border-zinc-800 dark:bg-zinc-900/80 dark:shadow-none">
                {navLinks.map(link => (
                  <button
                    key={link.href}
                    onClick={() => handleLinkClick(link.href)}
                    className={`rounded-full px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] transition ${
                      location.pathname === link.href
                        ? 'bg-[#C5A059] text-white shadow-sm'
                        : 'text-zinc-600 hover:bg-zinc-100 hover:text-[#C5A059] dark:text-zinc-300 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-full border border-zinc-300 bg-zinc-100 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                Dashboard mode
              </div>
            )}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            {isAdmin && (
              <>
                <button
                  onClick={() => navigate('/admin')}
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.18em] transition ${
                    location.pathname === '/admin'
                      ? 'bg-[#C5A059] text-white'
                      : 'border border-[#C5A059]/40 bg-[#C5A059]/5 text-[#C5A059] hover:bg-[#C5A059]/10'
                  }`}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Admin
                </button>
                <button
                  onClick={toggleAdminStoreMode}
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.14em] transition ${
                    adminStoreModeEnabled
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-200'
                      : 'border border-zinc-300 bg-white text-zinc-700 hover:border-[#C5A059] hover:text-[#C5A059] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200'
                  }`}
                >
                  {adminStoreModeEnabled ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  {adminStoreModeEnabled ? 'Store On' : 'Store Off'}
                </button>
              </>
            )}

            {isAuthenticated && shopEnabledForCurrentUser ? (
              <>
                <button
                  onClick={() => handleLinkClick('/profile')}
                  className="flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-700 transition hover:border-[#C5A059] hover:text-[#C5A059] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                >
                  <User className="h-3.5 w-3.5" />
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 transition hover:text-red-500"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Logout
                </button>
              </>
            ) : !isAuthenticated ? (
              <button
                onClick={() => navigate('/auth')}
                className="flex items-center gap-1.5 rounded-full bg-[#C5A059] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[#B08D4F]"
              >
                <User className="h-3.5 w-3.5" />
                Sign In
              </button>
            ) : null}

            {shopEnabledForCurrentUser && (
              <button
                onClick={() => navigate('/cart')}
                className="relative flex items-center justify-center rounded-full bg-[#C5A059] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[#B08D4F]"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                <span className="ml-2">Bag</span>
                {cartCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-[9px] font-bold text-white">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </button>
            )}

            {isAuthenticated && isAdmin && !shopEnabledForCurrentUser && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 transition hover:text-red-500"
              >
                <LogOut className="h-3.5 w-3.5" />
                Logout
              </button>
            )}

            <ThemeToggle />
          </div>

          <div className="flex items-center gap-3 md:hidden">
            {shopEnabledForCurrentUser && (
              <button onClick={() => navigate('/cart')} className="relative flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 transition hover:border-[#C5A059] hover:text-[#C5A059] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
                <ShoppingCart className="h-4 w-4" />
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#C5A059] text-[9px] font-bold text-white">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </button>
            )}

            <ThemeToggle />

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 transition hover:border-[#C5A059] hover:text-[#C5A059] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-white/95 pt-20 dark:bg-neutral-950/95 md:hidden"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mx-auto flex max-w-md flex-col gap-5 px-6 py-8"
            >
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                {navLinks.length > 0 ? (
                  navLinks.map(link => (
                    <button
                      key={link.href}
                      onClick={() => handleLinkClick(link.href)}
                      className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-semibold uppercase tracking-[0.2em] transition ${
                        location.pathname === link.href ? 'bg-[#C5A059]/10 text-[#C5A059]' : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <span>{link.label}</span>
                    </button>
                  ))
                ) : (
                  <p className="rounded-xl bg-zinc-100 px-4 py-3 text-sm text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    Dashboard mode is on. Toggle store view below to browse customer pages.
                  </p>
                )}
              </div>

              {isAdmin && (
                <>
                  <button
                    onClick={() => handleLinkClick('/admin')}
                    className="flex items-center justify-center gap-2 rounded-full border border-[#C5A059]/40 bg-[#C5A059]/5 px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-[#C5A059]"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Admin
                  </button>
                  <button
                    onClick={toggleAdminStoreMode}
                    className={`flex items-center justify-center gap-2 rounded-full px-5 py-3 text-xs font-bold uppercase tracking-[0.17em] transition ${
                      adminStoreModeEnabled
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200'
                        : 'border border-zinc-300 bg-white text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200'
                    }`}
                  >
                    {adminStoreModeEnabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    {adminStoreModeEnabled ? 'Store view on' : 'Store view off'}
                  </button>
                </>
              )}

              {isAuthenticated ? (
                <>
                  <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
                    Signed in as {user?.name || user?.username || user?.email}
                  </p>
                  {shopEnabledForCurrentUser && (
                    <button
                      onClick={() => handleLinkClick('/profile')}
                      className="rounded-full border border-zinc-200 px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-zinc-700 transition hover:border-[#C5A059] hover:text-[#C5A059] dark:border-zinc-700 dark:text-zinc-200"
                    >
                      Profile
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 rounded-full border border-zinc-200 px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 transition hover:border-red-400 hover:text-red-500 dark:border-zinc-700"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleLinkClick('/auth')}
                  className="flex items-center justify-center gap-2 rounded-full bg-[#C5A059] px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white transition hover:bg-[#B08D4F]"
                >
                  <User className="h-4 w-4" />
                  Sign In / Sign Up
                </button>
              )}

              {shopEnabledForCurrentUser && (
                <button
                  onClick={() => handleLinkClick('/cart')}
                  className="rounded-full bg-[#C5A059] px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white transition hover:bg-[#B08D4F]"
                >
                  View Bag {cartCount > 0 && `(${cartCount})`}
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}